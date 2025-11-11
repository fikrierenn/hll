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
  ('lead_viewed', 'Lead Görüntülendi', 'Lead detay sayfası açıldı', 'lead'),
  
  -- User Events
  ('user_created', 'Kullanıcı Oluşturuldu', 'Yeni kullanıcı eklendi', 'user'),
  ('user_updated', 'Kullanıcı Güncellendi', 'Kullanıcı bilgileri güncellendi', 'user'),
  ('user_activated', 'Kullanıcı Aktif Edildi', 'Kullanıcı aktif hale getirildi', 'user'),
  ('user_deactivated', 'Kullanıcı Pasif Edildi', 'Kullanıcı pasif hale getirildi', 'user'),
  ('user_login', 'Giriş Yapıldı', 'Kullanıcı sisteme giriş yaptı', 'user'),
  ('user_logout', 'Çıkış Yapıldı', 'Kullanıcı sistemden çıkış yaptı', 'user'),
  
  -- UI Interaction Events (Performans analizi için)
  ('button_clicked', 'Buton Tıklandı', 'Kullanıcı bir butona tıkladı', 'interaction'),
  ('page_viewed', 'Sayfa Görüntülendi', 'Kullanıcı bir sayfayı açtı', 'interaction'),
  ('form_submitted', 'Form Gönderildi', 'Kullanıcı bir form gönderdi', 'interaction'),
  ('search_performed', 'Arama Yapıldı', 'Kullanıcı arama yaptı', 'interaction'),
  ('filter_applied', 'Filtre Uygulandı', 'Kullanıcı filtre uyguladı', 'interaction'),
  ('export_requested', 'Export İstendi', 'Kullanıcı veri export etti', 'interaction'),
  
  -- Distribution Events
  ('queue_created', 'Sıra Oluşturuldu', 'Günlük dağıtım sırası oluşturuldu', 'distribution'),
  ('deficit_calculated', 'Deficit Hesaplandı', 'Günlük deficit hesaplandı', 'distribution'),
  ('participation_created', 'Katılım Oluşturuldu', 'Haftalık katılım kaydedildi', 'distribution'),
  ('participation_updated', 'Katılım Güncellendi', 'Haftalık katılım güncellendi', 'distribution'),
  
  -- Credit Events (Reklam Hakkı)
  ('credit_purchased', 'Kredi Satın Alındı', 'Temsilci reklam hakkı satın aldı', 'credit'),
  ('credit_added', 'Kredi Eklendi', 'Temsilciye kredi eklendi', 'credit'),
  ('credit_removed', 'Kredi Kaldırıldı', 'Temsilciden kredi kaldırıldı', 'credit'),
  ('credit_used', 'Kredi Kullanıldı', 'Lead atandığında kredi kullanıldı', 'credit'),
  ('credit_expired', 'Kredi Süresi Doldu', 'Kullanılmayan kredi süresi doldu', 'credit'),
  ('credit_refunded', 'Kredi İade Edildi', 'Kredi iade edildi', 'credit'),
  
  -- System Events
  ('webhook_received', 'Webhook Alındı', 'Meta webhook alındı', 'system'),
  ('notification_sent', 'Bildirim Gönderildi', 'Push notification gönderildi', 'system'),
  ('api_call', 'API Çağrısı', 'External API çağrısı yapıldı', 'system'),
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
-- VIEWS - UI Interactions (Kullanıcı Davranışı Analizi)
-- =====================================================
CREATE VIEW ui_interactions AS
SELECT 
  sl.id,
  sl.user_id,
  u.name as user_name,
  u.role_id,
  sl.log_type_id,
  lt.name as interaction_type,
  sl.metadata->>'button_name' as button_name,
  sl.metadata->>'page_name' as page_name,
  sl.metadata->>'form_name' as form_name,
  sl.metadata->>'search_query' as search_query,
  sl.duration_ms,
  sl.ip_address,
  sl.user_agent,
  sl.timestamp
FROM system_logs sl
JOIN log_types lt ON lt.id = sl.log_type_id
LEFT JOIN users u ON u.id = sl.user_id
WHERE lt.category = 'interaction'
ORDER BY sl.timestamp DESC;

COMMENT ON VIEW ui_interactions IS 'Kullanıcı arayüz etkileşimleri (button click, page view, vb.)';

-- =====================================================
-- VIEWS - Button Click Analytics
-- =====================================================
CREATE VIEW button_click_analytics AS
SELECT 
  sl.metadata->>'button_name' as button_name,
  sl.metadata->>'page_name' as page_name,
  u.role_id,
  COUNT(*) as click_count,
  COUNT(DISTINCT sl.user_id) as unique_users,
  AVG(sl.duration_ms) as avg_response_time_ms,
  DATE_TRUNC('day', sl.timestamp) as date
FROM system_logs sl
JOIN log_types lt ON lt.id = sl.log_type_id
LEFT JOIN users u ON u.id = sl.user_id
WHERE lt.id = 'button_clicked'
  AND sl.metadata->>'button_name' IS NOT NULL
GROUP BY 
  sl.metadata->>'button_name',
  sl.metadata->>'page_name',
  u.role_id,
  DATE_TRUNC('day', sl.timestamp)
ORDER BY date DESC, click_count DESC;

COMMENT ON VIEW button_click_analytics IS 'Buton tıklama istatistikleri (hangi buton ne kadar tıklanıyor)';

-- =====================================================
-- VIEWS - User Journey (Kullanıcı Yolculuğu)
-- =====================================================
CREATE VIEW user_journey AS
SELECT 
  sl.user_id,
  u.name as user_name,
  u.role_id,
  sl.log_type_id,
  lt.name as event_name,
  sl.metadata->>'page_name' as page_name,
  sl.metadata->>'button_name' as button_name,
  sl.lead_id,
  sl.timestamp,
  LAG(sl.timestamp) OVER (PARTITION BY sl.user_id ORDER BY sl.timestamp) as previous_event_time,
  EXTRACT(EPOCH FROM (sl.timestamp - LAG(sl.timestamp) OVER (PARTITION BY sl.user_id ORDER BY sl.timestamp))) as seconds_since_last_event
FROM system_logs sl
JOIN log_types lt ON lt.id = sl.log_type_id
LEFT JOIN users u ON u.id = sl.user_id
WHERE lt.category IN ('interaction', 'lead', 'user')
ORDER BY sl.user_id, sl.timestamp DESC;

COMMENT ON VIEW user_journey IS 'Kullanıcı yolculuğu (hangi sayfadan hangi sayfaya gitti, ne kadar süre harcadı)';

-- =====================================================
-- VIEWS - Lead Response Time Analytics
-- =====================================================
CREATE VIEW lead_response_time_analytics AS
WITH lead_timeline AS (
  SELECT 
    sl.lead_id,
    MIN(CASE WHEN sl.log_type_id = 'lead_assigned' THEN sl.timestamp END) as assigned_at,
    MIN(CASE WHEN sl.log_type_id = 'lead_viewed' THEN sl.timestamp END) as first_viewed_at,
    MIN(CASE WHEN sl.log_type_id = 'lead_called' THEN sl.timestamp END) as first_called_at,
    MIN(CASE WHEN sl.log_type_id = 'lead_whatsapp' THEN sl.timestamp END) as first_whatsapp_at,
    MIN(CASE WHEN sl.log_type_id = 'lead_status_changed' 
             AND sl.metadata->>'new_status' = 'contacted' THEN sl.timestamp END) as contacted_at
  FROM system_logs sl
  WHERE sl.lead_id IS NOT NULL
  GROUP BY sl.lead_id
)
SELECT 
  lt.lead_id,
  l.full_name,
  l.assigned_to,
  u.name as representative_name,
  lt.assigned_at,
  lt.first_viewed_at,
  lt.first_called_at,
  lt.first_whatsapp_at,
  lt.contacted_at,
  EXTRACT(EPOCH FROM (lt.first_viewed_at - lt.assigned_at)) / 60 as minutes_to_view,
  EXTRACT(EPOCH FROM (lt.first_called_at - lt.assigned_at)) / 60 as minutes_to_call,
  EXTRACT(EPOCH FROM (lt.first_whatsapp_at - lt.assigned_at)) / 60 as minutes_to_whatsapp,
  EXTRACT(EPOCH FROM (lt.contacted_at - lt.assigned_at)) / 60 as minutes_to_contact
FROM lead_timeline lt
LEFT JOIN leads l ON l.id = lt.lead_id
LEFT JOIN users u ON u.id = l.assigned_to
ORDER BY lt.assigned_at DESC;

COMMENT ON VIEW lead_response_time_analytics IS 'Lead yanıt süresi analizi (atandıktan sonra ne kadar sürede görüntülendi/arandı/iletişime geçildi)';

-- =====================================================
-- VIEWS - Credit History (Kredi Geçmişi)
-- =====================================================
CREATE VIEW credit_history AS
SELECT 
  sl.id,
  sl.user_id,
  u.name as user_name,
  u.role_id,
  sl.log_type_id,
  lt.name as transaction_type,
  (sl.metadata->>'old_credits')::INTEGER as old_credits,
  (sl.metadata->>'new_credits')::INTEGER as new_credits,
  (sl.metadata->>'change_amount')::INTEGER as change_amount,
  sl.metadata->>'reason' as reason,
  sl.metadata->>'changed_by' as changed_by,
  sl.metadata->>'week_start' as week_start,
  sl.lead_id, -- Eğer lead atandığında kullanıldıysa
  sl.message,
  sl.timestamp
FROM system_logs sl
JOIN log_types lt ON lt.id = sl.log_type_id
LEFT JOIN users u ON u.id = sl.user_id
WHERE lt.category = 'credit'
ORDER BY sl.timestamp DESC;

COMMENT ON VIEW credit_history IS 'Reklam hakkı (kredi) değişiklik geçmişi';

-- =====================================================
-- VIEWS - Weekly Credit Summary (Haftalık Kredi Özeti)
-- =====================================================
CREATE VIEW weekly_credit_summary AS
SELECT 
  DATE_TRUNC('week', sl.timestamp)::DATE as week_start,
  sl.user_id,
  u.name as user_name,
  u.role_id,
  COUNT(*) FILTER (WHERE sl.log_type_id = 'credit_purchased') as purchase_count,
  SUM((sl.metadata->>'change_amount')::INTEGER) FILTER (WHERE sl.log_type_id = 'credit_purchased') as total_purchased,
  SUM((sl.metadata->>'change_amount')::INTEGER) FILTER (WHERE sl.log_type_id = 'credit_added') as total_added,
  SUM(ABS((sl.metadata->>'change_amount')::INTEGER)) FILTER (WHERE sl.log_type_id = 'credit_used') as total_used,
  SUM(ABS((sl.metadata->>'change_amount')::INTEGER)) FILTER (WHERE sl.log_type_id = 'credit_removed') as total_removed,
  (
    SELECT (metadata->>'new_credits')::INTEGER 
    FROM system_logs 
    WHERE user_id = sl.user_id 
      AND log_type_id IN ('credit_purchased', 'credit_added', 'credit_removed', 'credit_used')
      AND timestamp >= DATE_TRUNC('week', sl.timestamp)
      AND timestamp < DATE_TRUNC('week', sl.timestamp) + INTERVAL '1 week'
    ORDER BY timestamp DESC 
    LIMIT 1
  ) as week_end_balance
FROM system_logs sl
JOIN log_types lt ON lt.id = sl.log_type_id
LEFT JOIN users u ON u.id = sl.user_id
WHERE lt.category = 'credit'
GROUP BY DATE_TRUNC('week', sl.timestamp), sl.user_id, u.name, u.role_id
ORDER BY week_start DESC, user_name;

COMMENT ON VIEW weekly_credit_summary IS 'Haftalık kredi özeti (satın alma, kullanım, bakiye)';

-- =====================================================
-- VIEWS - Credit Usage Analytics (Kredi Kullanım Analizi)
-- =====================================================
CREATE VIEW credit_usage_analytics AS
WITH credit_stats AS (
  SELECT 
    sl.user_id,
    u.name as user_name,
    DATE_TRUNC('week', sl.timestamp)::DATE as week_start,
    COUNT(*) FILTER (WHERE sl.log_type_id = 'credit_used') as leads_received,
    SUM(ABS((sl.metadata->>'change_amount')::INTEGER)) FILTER (WHERE sl.log_type_id = 'credit_used') as credits_used,
    COUNT(DISTINCT DATE(sl.timestamp)) FILTER (WHERE sl.log_type_id = 'credit_used') as active_days
  FROM system_logs sl
  LEFT JOIN users u ON u.id = sl.user_id
  WHERE sl.log_type_id = 'credit_used'
  GROUP BY sl.user_id, u.name, DATE_TRUNC('week', sl.timestamp)
)
SELECT 
  cs.*,
  CASE 
    WHEN cs.credits_used > 0 THEN ROUND(cs.leads_received::NUMERIC / cs.credits_used::NUMERIC, 2)
    ELSE 0 
  END as leads_per_credit,
  CASE 
    WHEN cs.active_days > 0 THEN ROUND(cs.leads_received::NUMERIC / cs.active_days::NUMERIC, 2)
    ELSE 0 
  END as avg_leads_per_day
FROM credit_stats cs
ORDER BY cs.week_start DESC, cs.leads_received DESC;

COMMENT ON VIEW credit_usage_analytics IS 'Kredi kullanım verimliliği (kaç krediye kaç lead, günlük ortalama)';

-- =====================================================
-- VIEWS - Credit Balance Changes (Kredi Bakiye Değişimleri)
-- =====================================================
CREATE VIEW credit_balance_changes AS
SELECT 
  sl.id,
  sl.timestamp,
  sl.user_id,
  u.name as user_name,
  sl.log_type_id,
  lt.name as change_type,
  (sl.metadata->>'old_credits')::INTEGER as old_balance,
  (sl.metadata->>'new_credits')::INTEGER as new_balance,
  (sl.metadata->>'change_amount')::INTEGER as change_amount,
  CASE 
    WHEN (sl.metadata->>'change_amount')::INTEGER > 0 THEN 'increase'
    WHEN (sl.metadata->>'change_amount')::INTEGER < 0 THEN 'decrease'
    ELSE 'no_change'
  END as change_direction,
  sl.metadata->>'reason' as reason,
  sl.lead_id,
  l.full_name as lead_name
FROM system_logs sl
JOIN log_types lt ON lt.id = sl.log_type_id
LEFT JOIN users u ON u.id = sl.user_id
LEFT JOIN leads l ON l.id = sl.lead_id
WHERE lt.category = 'credit'
  AND sl.metadata->>'old_credits' IS NOT NULL
  AND sl.metadata->>'new_credits' IS NOT NULL
ORDER BY sl.timestamp DESC;

COMMENT ON VIEW credit_balance_changes IS 'Kredi bakiye değişimleri (artış/azalış detayları)';

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
