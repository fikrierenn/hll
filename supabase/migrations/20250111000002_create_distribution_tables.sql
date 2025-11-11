-- =====================================================
-- HLL Lead Management System - Lead Distribution Tables
-- Migration: 20250111000002
-- Description: Lead dağıtım algoritması için tablolar
-- =====================================================

-- =====================================================
-- WEEKLY_PARTICIPATION TABLE
-- =====================================================
CREATE TABLE weekly_participation (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  credits INTEGER NOT NULL,
  total_credits INTEGER NOT NULL, -- Haftalık toplam kredi
  target_share NUMERIC(5,4) NOT NULL, -- credits / total_credits
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, week_start)
);

-- Indexes
CREATE INDEX idx_weekly_participation_user_id ON weekly_participation(user_id);
CREATE INDEX idx_weekly_participation_week_start ON weekly_participation(week_start DESC);

-- =====================================================
-- DAILY_DISTRIBUTION_QUEUE TABLE
-- =====================================================
CREATE TABLE daily_distribution_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  credits INTEGER NOT NULL,
  slots_in_queue INTEGER NOT NULL, -- Kaç slot'a sahip
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, position)
);

-- Indexes
CREATE INDEX idx_daily_queue_date ON daily_distribution_queue(date);
CREATE INDEX idx_daily_queue_user_id ON daily_distribution_queue(user_id);
CREATE INDEX idx_daily_queue_position ON daily_distribution_queue(date, position);

-- =====================================================
-- LEAD_ASSIGNMENTS TABLE
-- =====================================================
CREATE TABLE lead_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  week_start DATE NOT NULL,
  date DATE NOT NULL
);

-- Indexes
CREATE INDEX idx_lead_assignments_lead_id ON lead_assignments(lead_id);
CREATE INDEX idx_lead_assignments_user_id ON lead_assignments(user_id);
CREATE INDEX idx_lead_assignments_week_start ON lead_assignments(week_start);
CREATE INDEX idx_lead_assignments_date ON lead_assignments(date);

-- =====================================================
-- DAILY_DEFICIT_LOG TABLE
-- =====================================================
CREATE TABLE daily_deficit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  target_leads NUMERIC(10,2) NOT NULL,
  actual_leads INTEGER NOT NULL,
  deficit NUMERIC(10,2) NOT NULL, -- target - actual
  cumulative_deficit NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Indexes
CREATE INDEX idx_daily_deficit_user_id ON daily_deficit_log(user_id);
CREATE INDEX idx_daily_deficit_date ON daily_deficit_log(date DESC);

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE weekly_participation IS 'Haftalık kredi katılımları';
COMMENT ON TABLE daily_distribution_queue IS 'Günlük lead dağıtım sırası (Round-Robin Karışık)';
COMMENT ON TABLE lead_assignments IS 'Lead atama kayıtları';
COMMENT ON TABLE daily_deficit_log IS 'Günlük deficit takibi (telafi mekanizması için)';

COMMENT ON COLUMN weekly_participation.target_share IS 'Temsilcinin haftalık hedef payı (0-1 arası)';
COMMENT ON COLUMN daily_distribution_queue.position IS 'Sıradaki pozisyon (0''dan başlar)';
COMMENT ON COLUMN daily_deficit_log.cumulative_deficit IS 'Kümülatif deficit (önceki günlerden gelen)';
