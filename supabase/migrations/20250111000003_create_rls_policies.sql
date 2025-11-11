-- =====================================================
-- HLL Lead Management System - Row Level Security Policies
-- Migration: 20250111000003
-- Description: RLS politikaları (role-based access control)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_participation ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_distribution_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_deficit_log ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- USERS TABLE POLICIES
-- =====================================================

-- Representative: Sadece kendi kaydını görebilir
CREATE POLICY "Representatives can view own record"
  ON users FOR SELECT
  USING (auth.uid() = id AND role_id = 'representative');

-- Leader: Kendi kaydını ve ekibini görebilir
CREATE POLICY "Leaders can view self and team"
  ON users FOR SELECT
  USING (
    (auth.uid() = id AND role_id = 'leader')
    OR
    (role_id = 'representative' AND leader_id = auth.uid())
  );

-- Super Leader: Tüm kullanıcıları görebilir
CREATE POLICY "Super leaders can view all users"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role_id = 'super_leader'
    )
  );

-- Leader: Kendi ekibine temsilci ekleyebilir
CREATE POLICY "Leaders can insert representatives"
  ON users FOR INSERT
  WITH CHECK (
    role_id = 'representative' AND
    leader_id = auth.uid()
  );

-- Leader: Kendi ekibini güncelleyebilir
CREATE POLICY "Leaders can update their team"
  ON users FOR UPDATE
  USING (
    (role_id = 'representative' AND leader_id = auth.uid())
    OR
    (auth.uid() = id AND role_id = 'leader')
  );

-- Representative: Kendi kaydını güncelleyebilir
CREATE POLICY "Representatives can update own record"
  ON users FOR UPDATE
  USING (auth.uid() = id AND role_id = 'representative');

-- =====================================================
-- LEADS TABLE POLICIES
-- =====================================================

-- Representative: Sadece kendine atanan lead'leri görebilir
CREATE POLICY "Representatives can view assigned leads"
  ON leads FOR SELECT
  USING (assigned_to = auth.uid());

-- Representative: Sadece kendi lead'lerini güncelleyebilir
CREATE POLICY "Representatives can update assigned leads"
  ON leads FOR UPDATE
  USING (assigned_to = auth.uid())
  WITH CHECK (assigned_to = auth.uid());

-- Leader: Ekibinin lead'lerini görebilir
CREATE POLICY "Leaders can view team leads"
  ON leads FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = leads.assigned_to
      AND users.leader_id = auth.uid()
    )
  );

-- Super Leader: Tüm lead'leri görebilir
CREATE POLICY "Super leaders can view all leads"
  ON leads FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role_id = 'super_leader'
    )
  );

-- System: Lead oluşturabilir (webhook için)
CREATE POLICY "System can insert leads"
  ON leads FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- PERFORMANCE_SUMMARY TABLE POLICIES
-- =====================================================

-- Representative: Kendi performansını görebilir
CREATE POLICY "Representatives can view own performance"
  ON performance_summary FOR SELECT
  USING (user_id = auth.uid());

-- Leader: Ekibinin performansını görebilir
CREATE POLICY "Leaders can view team performance"
  ON performance_summary FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = performance_summary.user_id
      AND users.leader_id = auth.uid()
    )
  );

-- Super Leader: Tüm performansı görebilir
CREATE POLICY "Super leaders can view all performance"
  ON performance_summary FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'super_leader'
    )
  );

-- System: Performans kaydı oluşturabilir
CREATE POLICY "System can insert performance"
  ON performance_summary FOR INSERT
  WITH CHECK (true);

-- System: Performans kaydı güncelleyebilir
CREATE POLICY "System can update performance"
  ON performance_summary FOR UPDATE
  USING (true);

-- =====================================================
-- DISTRIBUTION TABLES POLICIES
-- =====================================================

-- Representative: Kendi katılımını görebilir
CREATE POLICY "Representatives can view own participation"
  ON weekly_participation FOR SELECT
  USING (user_id = auth.uid());

-- Leader: Ekibinin katılımını görebilir
CREATE POLICY "Leaders can view team participation"
  ON weekly_participation FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = weekly_participation.user_id
      AND users.leader_id = auth.uid()
    )
  );

-- Super Leader: Tüm katılımları görebilir
CREATE POLICY "Super leaders can view all participation"
  ON weekly_participation FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'super_leader'
    )
  );

-- System: Katılım oluşturabilir
CREATE POLICY "System can manage participation"
  ON weekly_participation FOR ALL
  USING (true)
  WITH CHECK (true);

-- System: Queue yönetebilir
CREATE POLICY "System can manage queue"
  ON daily_distribution_queue FOR ALL
  USING (true)
  WITH CHECK (true);

-- System: Assignment oluşturabilir
CREATE POLICY "System can manage assignments"
  ON lead_assignments FOR ALL
  USING (true)
  WITH CHECK (true);

-- System: Deficit log oluşturabilir
CREATE POLICY "System can manage deficit log"
  ON daily_deficit_log FOR ALL
  USING (true)
  WITH CHECK (true);

-- Representative: Kendi deficit'ini görebilir
CREATE POLICY "Representatives can view own deficit"
  ON daily_deficit_log FOR SELECT
  USING (user_id = auth.uid());

-- Leader: Ekibinin deficit'ini görebilir
CREATE POLICY "Leaders can view team deficit"
  ON daily_deficit_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = daily_deficit_log.user_id
      AND users.leader_id = auth.uid()
    )
  );

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON POLICY "Representatives can view own record" ON users IS 'Temsilciler sadece kendi kayıtlarını görebilir';
COMMENT ON POLICY "Leaders can view self and team" ON users IS 'Liderler kendilerini ve ekiplerini görebilir';
COMMENT ON POLICY "Super leaders can view all users" ON users IS 'Üst liderler tüm kullanıcıları görebilir';
