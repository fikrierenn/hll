-- =====================================================
-- HLL Lead Management System - Base Tables
-- Migration: 20250111000001
-- Description: Temel tablolar (users, leads, lead_events, performance_summary)
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USERS TABLE
-- =====================================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  role_id TEXT NOT NULL REFERENCES user_roles(id),
  leader_id UUID REFERENCES users(id) ON DELETE SET NULL,
  region TEXT,
  is_active BOOLEAN DEFAULT true,
  fcm_token TEXT, -- Firebase Cloud Messaging token
  ad_credits INTEGER DEFAULT 0, -- Haftalık reklam hakkı
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for users
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_users_leader_id ON users(leader_id);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_email ON users(email);

-- Updated_at trigger for users
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- LEADS TABLE
-- =====================================================
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  city TEXT,
  form_time TIMESTAMPTZ NOT NULL,
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  status_id TEXT NOT NULL DEFAULT 'new' REFERENCES lead_statuses(id),
  assigned_at TIMESTAMPTZ,
  meta_lead_id TEXT UNIQUE, -- Meta'dan gelen lead ID
  form_data JSONB, -- Ek form verileri
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for leads
CREATE INDEX idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX idx_leads_status_id ON leads(status_id);
CREATE INDEX idx_leads_assigned_at ON leads(assigned_at);
CREATE INDEX idx_leads_city ON leads(city);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX idx_leads_form_time ON leads(form_time DESC);

-- Updated_at trigger for leads
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- PERFORMANCE_SUMMARY TABLE
-- =====================================================
CREATE TABLE performance_summary (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_leads INTEGER DEFAULT 0,
  contacted_leads INTEGER DEFAULT 0,
  converted_leads INTEGER DEFAULT 0,
  lost_leads INTEGER DEFAULT 0,
  avg_response_minutes NUMERIC(10, 2), -- Ortalama yanıt süresi (dakika)
  sales_ratio NUMERIC(5, 2), -- Satış oranı (%)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Indexes for performance_summary
CREATE INDEX idx_performance_summary_user_id ON performance_summary(user_id);
CREATE INDEX idx_performance_summary_date ON performance_summary(date DESC);

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE users IS 'Sistem kullanıcıları (representative, leader, super_leader)';
COMMENT ON TABLE leads IS 'Müşteri adayları (Meta Lead Ads''den gelen)';
COMMENT ON TABLE performance_summary IS 'Günlük performans özet verileri';

COMMENT ON COLUMN users.ad_credits IS 'Haftalık reklam hakkı (lead dağıtım algoritmasında kullanılır)';
COMMENT ON COLUMN leads.meta_lead_id IS 'Meta Lead Ads API''den gelen benzersiz lead ID';
COMMENT ON COLUMN lead_events.metadata IS 'Event''e özel ek bilgiler (JSON formatında)';
