-- =====================================================
-- HLL Lead Management System - Unified Logs & Views
-- Migration: 20250111000005
-- Description: Tek log tablosu ve view'ler
-- =====================================================

-- =====================================================
-- LOG_TYPES TABLE
-- =====================================================
CREATE TABLE log_types (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'lead', 'user', 'system', 'distribution'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO log_types (id, name, description, category) VALUES
  -- Lead Events
  ('lead_created', 'Lead Oluşturuldu', 'Yeni lead sisteme kaydedildi', 'lead'),
  ('lead_assigned', 'Lead Atandı', 'Lead temsilciye atandı', 'lead'),
  ('lead_called', 'Lead Arandı', 'Temsilci lead''i aradı', 'lead'),
  ('lead_whatsapp', 'WhatsApp Gönderildi', 'Lead''e WhatsApp mesajı gönderildi', 'lead'),
  ('lead_status_changed', 'Durum Değişti', 'Lead durumu güncellendi', 'lead'),
  
  -- User Events
  ('user_created', 'Kullanıcı Oluşturuldu', 'Yeni kullanıcı eklendi', 'user'),
  ('user_updated', 'Kullanıcı Güncellendi', 'Kullanıcı bilgileri güncellendi', 'user'),
  ('user_activated', 'Kullanıcı Aktif Edildi', 'Kullanıcı aktif hale getirildi', 'user'),
  ('user_deactivated', 'Kullanıcı Pasif Edildi', 'Kullanıcı pasif hale getirildi', 'user'),
  ('user_login', 'Giriş Yapıldı', 'Kullanıcı sisteme giriş yaptı', 'user'),
  
  -- Distribution Events
  ('queue_created', 'Sıra Oluşturuldu', 'Günlük dağıtım sırası oluşturuldu', 'distribution'),
  ('deficit_calculated', 'Deficit Hesaplandı', 'Günlük deficit hesaplandı', 'distribution'),
  ('participation_created', 'Katılım Oluşturuldu', 'Haftalık katılım kaydedildi', 'distribution'),
  
  -- System Events
  ('webhook_received', 'Webhook Alındı', 'Meta webhook alındı', 'system'),
  ('notification_sent', 'Bildirim Gönderildi', 'Push notification gönderildi', 'system'),
  ('error_occurred', 'Hata Oluştu', 'Sistem hatası', 'system');

-- =====================================================
-- SYSTEM_LOGS TABLE (Unified Log Table)
-- =====================================================
CREATE TABLE system_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  log_type_id TEXT NOT NULL REFERENCES log_types(id),
  
  -- İlgili kayıtlar (nullable, log tipine göre dolu olur)
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  actor_id UUID REFERENCES users(id) ON DELETE SET NULL, -- İşlemi yapan
  
  -- Log detayları
  message TEXT,
  metadata JSONB, -- Ek bilgiler
  
  -- Performans ve hata takibi
  duration_ms INTEGER, -- İşlem süresi (milisaniye)
  error_message TEXT,
  stack_trace TEXT,
  
  -- IP ve cihaz bilgisi
  ip_address INET,
  user_agent TEXT,
  
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_system_logs_log_type_id ON system_logs(log_type_id);
CREATE INDEX idx_system_logs_user_id ON system_logs(user_id);
CREATE INDEX idx_system_logs_lead_id ON system_logs(lead_id);
CREATE INDEX idx_system_logs_actor_id ON system_logs(actor_id);
CREATE INDEX idx_system_logs_timestamp ON system_logs(timestamp DESC);
CREATE INDEX idx_system_logs_category ON system_logs(log_type_id) 
  WHERE log_type_id IN (SELECT id FROM log_types WHERE category = 'lead');

-- Partitioning için (opsiyonel, büyük veri için)
-- CREATE INDEX idx_system_logs_timestamp_brin ON system_logs USING BRIN(timestamp);

-- =====================================================
-- VIEWS - Lead Events
-- =====================================================
CREATE VIEW lead_events AS
SELECT 
  sl.id,
  sl.lead_id,
  sl.log_type_id as event_type_id,
  lt.name as event_type_name,
  sl.actor_id,
  sl.metadata,
  sl.timestamp
FROM system_logs sl
JOIN log_types lt ON lt.id = sl.log_type_id
WHERE lt.category = 'lead'
ORDER BY sl.timestamp DESC;

COMMENT ON VIEW lead_events IS 'Lead ile ilgili tüm olaylar';

-- =====================================================
-- VIEWS - User Activity
-- =====================================================
CREATE VIEW user_activity_log AS
SELECT 
  sl.id,
  sl.user_id,
  sl.actor_id,
  sl.log_type_id,
  lt.name as activity_name,
  sl.message,
  sl.metadata,
  sl.ip_address,
  sl.user_agent,
  sl.timestamp
FROM system_logs sl
JOIN log_types lt ON lt.id = sl.log_type_id
WHERE lt.category = 'user'
ORDER BY sl.timestamp DESC;

COMMENT ON VIEW user_activity_log IS 'Kullanıcı aktiviteleri';

-- =====================================================
-- VIEWS - Distribution Logs
-- =====================================================
CREATE VIEW distribution_log AS
SELECT 
  sl.id,
  sl.log_type_id,
  lt.name as event_name,
  sl.user_id,
  sl.lead_id,
  sl.message,
  sl.metadata,
  sl.duration_ms,
  sl.timestamp
FROM system_logs sl
JOIN log_types lt ON lt.id = sl.log_type_id
WHERE lt.category = 'distribution'
ORDER BY sl.timestamp DESC;

COMMENT ON VIEW distribution_log IS 'Lead dağıtım algoritması logları';

-- =====================================================
-- VIEWS - System Errors
-- =====================================================
CREATE VIEW system_errors AS
SELECT 
  sl.id,
  sl.log_type_id,
  lt.name as error_type,
  sl.user_id,
  sl.lead_id,
  sl.message,
  sl.error_message,
  sl.stack_trace,
  sl.metadata,
  sl.timestamp
FROM system_logs sl
JOIN log_types lt ON lt.id = sl.log_type_id
WHERE sl.error_message IS NOT NULL
   OR lt.id = 'error_occurred'
ORDER BY sl.timestamp DESC;

COMMENT ON VIEW system_errors IS 'Sistem hataları';

-- =====================================================
-- VIEWS - Performance Metrics
-- =====================================================
CREATE VIEW performance_metrics AS
SELECT 
  sl.log_type_id,
  lt.name as operation_name,
  lt.category,
  COUNT(*) as total_count,
  AVG(sl.duration_ms) as avg_duration_ms,
  MIN(sl.duration_ms) as min_duration_ms,
  MAX(sl.duration_ms) as max_duration_ms,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY sl.duration_ms) as p95_duration_ms,
  COUNT(*) FILTER (WHERE sl.error_message IS NOT NULL) as error_count,
  DATE_TRUNC('hour', sl.timestamp) as hour
FROM system_logs sl
JOIN log_types lt ON lt.id = sl.log_type_id
WHERE sl.duration_ms IS NOT NULL
GROUP BY sl.log_type_id, lt.name, lt.category, DATE_TRUNC('hour', sl.timestamp)
ORDER BY hour DESC, avg_duration_ms DESC;

COMMENT ON VIEW performance_metrics IS 'İşlem performans metrikleri (saatlik)';

-- =====================================================
-- VIEWS - Daily Summary
-- =====================================================
CREATE VIEW daily_log_summary AS
SELECT 
  DATE(sl.timestamp) as date,
  lt.category,
  sl.log_type_id,
  lt.name as event_name,
  COUNT(*) as event_count,
  COUNT(DISTINCT sl.user_id) as unique_users,
  COUNT(DISTINCT sl.lead_id) as unique_leads,
  COUNT(*) FILTER (WHERE sl.error_message IS NOT NULL) as error_count
FROM system_logs sl
JOIN log_types lt ON lt.id = sl.log_type_id
GROUP BY DATE(sl.timestamp), lt.category, sl.log_type_id, lt.name
ORDER BY date DESC, event_count DESC;

COMMENT ON VIEW daily_log_summary IS 'Günlük log özeti';

-- =====================================================
-- FUNCTION: Log Helper
-- =====================================================
CREATE OR REPLACE FUNCTION log_event(
  p_log_type_id TEXT,
  p_user_id UUID DEFAULT NULL,
  p_lead_id UUID DEFAULT NULL,
  p_actor_id UUID DEFAULT NULL,
  p_message TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL,
  p_duration_ms INTEGER DEFAULT NULL,
  p_error_message TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO system_logs (
    log_type_id,
    user_id,
    lead_id,
    actor_id,
    message,
    metadata,
    duration_ms,
    error_message,
    timestamp
  ) VALUES (
    p_log_type_id,
    p_user_id,
    p_lead_id,
    p_actor_id,
    p_message,
    p_metadata,
    p_duration_ms,
    p_error_message,
    NOW()
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION log_event IS 'Log kaydı oluşturmak için helper function';

-- =====================================================
-- RLS POLICIES for system_logs
-- =====================================================
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

-- Representative: Kendi lead'leriyle ilgili logları görebilir
CREATE POLICY "Representatives can view own lead logs"
  ON system_logs FOR SELECT
  USING (
    lead_id IN (
      SELECT id FROM leads WHERE assigned_to = auth.uid()
    )
    OR user_id = auth.uid()
  );

-- Leader: Ekibinin loglarını görebilir
CREATE POLICY "Leaders can view team logs"
  ON system_logs FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM users WHERE leader_id = auth.uid()
    )
    OR lead_id IN (
      SELECT l.id FROM leads l
      JOIN users u ON u.id = l.assigned_to
      WHERE u.leader_id = auth.uid()
    )
  );

-- Super Leader: Tüm logları görebilir
CREATE POLICY "Super leaders can view all logs"
  ON system_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role_id = 'super_leader'
    )
  );

-- System: Log oluşturabilir
CREATE POLICY "System can insert logs"
  ON system_logs FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- CLEANUP: Eski lead_events tablosunu kaldır
-- =====================================================
-- NOT: Eğer lead_events tablosu varsa ve veri taşınacaksa:
-- 1. Önce verileri system_logs'a migrate et
-- 2. Sonra lead_events tablosunu drop et
-- 
-- DROP TABLE IF EXISTS lead_events CASCADE;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE system_logs IS 'Tüm sistem logları (unified log table)';
COMMENT ON TABLE log_types IS 'Log tipleri (lead, user, system, distribution)';
COMMENT ON COLUMN system_logs.metadata IS 'Log''a özel ek bilgiler (JSON)';
COMMENT ON COLUMN system_logs.duration_ms IS 'İşlem süresi (milisaniye)';
