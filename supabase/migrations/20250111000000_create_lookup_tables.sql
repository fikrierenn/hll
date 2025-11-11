-- =====================================================
-- HLL Lead Management System - Lookup Tables
-- Migration: 20250111000000
-- Description: Enum yerine kullanılacak lookup tabloları
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USER_ROLES TABLE
-- =====================================================
CREATE TABLE user_roles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  level INTEGER NOT NULL, -- Yetki seviyesi (1=representative, 2=leader, 3=super_leader)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO user_roles (id, name, description, level) VALUES
  ('representative', 'Temsilci', 'Müşteri adaylarıyla iletişim kuran temsilci', 1),
  ('leader', 'Lider', 'Temsilcileri yöneten ekip lideri', 2),
  ('super_leader', 'Üst Lider', 'Tüm ekipleri yöneten üst düzey yönetici', 3);

-- =====================================================
-- LEAD_STATUSES TABLE
-- =====================================================
CREATE TABLE lead_statuses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT, -- UI'da kullanılacak renk kodu
  sort_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO lead_statuses (id, name, description, color, sort_order) VALUES
  ('new', 'Yeni', 'Henüz görüşülmemiş lead', '#3b82f6', 1),
  ('contacted', 'Görüşüldü', 'İletişime geçilmiş lead', '#f59e0b', 2),
  ('converted', 'Satış', 'Satışa dönüşmüş lead', '#10b981', 3),
  ('lost', 'Kayıp', 'Satış olmayan lead', '#ef4444', 4);

-- =====================================================
-- EVENT_TYPES TABLE
-- =====================================================
CREATE TABLE event_types (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT, -- UI'da kullanılacak icon adı
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO event_types (id, name, description, icon) VALUES
  ('created', 'Oluşturuldu', 'Lead sisteme kaydedildi', 'plus-circle'),
  ('assigned', 'Atandı', 'Lead temsilciye atandı', 'user-plus'),
  ('called', 'Arandı', 'Temsilci lead''i aradı', 'phone'),
  ('whatsapp', 'WhatsApp', 'WhatsApp mesajı gönderildi', 'message-circle'),
  ('status_changed', 'Durum Değişti', 'Lead durumu güncellendi', 'refresh-cw');

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX idx_user_roles_level ON user_roles(level);
CREATE INDEX idx_lead_statuses_sort_order ON lead_statuses(sort_order);

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE user_roles IS 'Kullanıcı rolleri (representative, leader, super_leader)';
COMMENT ON TABLE lead_statuses IS 'Lead durumları (new, contacted, converted, lost)';
COMMENT ON TABLE event_types IS 'Lead event tipleri (created, assigned, called, whatsapp, status_changed)';

COMMENT ON COLUMN user_roles.level IS 'Yetki seviyesi (1=en düşük, 3=en yüksek)';
COMMENT ON COLUMN lead_statuses.color IS 'Tailwind CSS renk kodu (örn: #10b981)';
COMMENT ON COLUMN lead_statuses.sort_order IS 'Sıralama düzeni (küçükten büyüğe)';
