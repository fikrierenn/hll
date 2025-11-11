-- Lead Dağıtım Sistemi için Veritabanı Tabloları
-- Hibrit Algoritma: Round-Robin Karışık + Günlük Deficit Telafisi

-- 1. weekly_participation: Haftalık kredi katılımları
CREATE TABLE IF NOT EXISTS weekly_participation (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  credits INTEGER NOT NULL CHECK (credits > 0),
  total_credits INTEGER NOT NULL,
  target_share DECIMAL(5,4) NOT NULL CHECK (target_share >= 0 AND target_share <= 1),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, week_start)
);

-- Index'ler
CREATE INDEX idx_weekly_participation_user_id ON weekly_participation(user_id);
CREATE INDEX idx_weekly_participation_week_start ON weekly_participation(week_start DESC);
CREATE INDEX idx_weekly_participation_active ON weekly_participation(week_start, week_end) 
  WHERE week_end >= CURRENT_DATE;

COMMENT ON TABLE weekly_participation IS 'Temsilcilerin haftalık kredi katılımları';
COMMENT ON COLUMN weekly_participation.credits IS 'Temsilcinin bu hafta için aldığı kredi sayısı';
COMMENT ON COLUMN weekly_participation.total_credits IS 'Bu haftanın toplam kredi sayısı (tüm katılımcılar)';
COMMENT ON COLUMN weekly_participation.target_share IS 'Temsilcinin hedef payı (credits / total_credits)';

-- 2. daily_distribution_queue: Günlük dağıtım sırası
CREATE TABLE IF NOT EXISTS daily_distribution_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  position INTEGER NOT NULL CHECK (position >= 0),
  credits INTEGER NOT NULL,
  slots_in_queue INTEGER NOT NULL CHECK (slots_in_queue > 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, position)
);

-- Index'ler
CREATE INDEX idx_daily_queue_date ON daily_distribution_queue(date DESC);
CREATE INDEX idx_daily_queue_user_id ON daily_distribution_queue(user_id);
CREATE INDEX idx_daily_queue_position ON daily_distribution_queue(date, position);

COMMENT ON TABLE daily_distribution_queue IS 'Günlük lead dağıtım sırası (Round-Robin Karışık)';
COMMENT ON COLUMN daily_distribution_queue.position IS 'Sıradaki pozisyon (0-based)';
COMMENT ON COLUMN daily_distribution_queue.slots_in_queue IS 'Bu temsilcinin sırada kaç slot''u var';

-- 3. lead_assignments: Lead atamaları (mevcut leads tablosuna ek)
CREATE TABLE IF NOT EXISTS lead_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  week_start DATE NOT NULL,
  date DATE NOT NULL,
  algorithm_metadata JSONB,
  UNIQUE(lead_id)
);

-- Index'ler
CREATE INDEX idx_lead_assignments_lead_id ON lead_assignments(lead_id);
CREATE INDEX idx_lead_assignments_user_id ON lead_assignments(user_id);
CREATE INDEX idx_lead_assignments_week_start ON lead_assignments(week_start);
CREATE INDEX idx_lead_assignments_date ON lead_assignments(date DESC);

COMMENT ON TABLE lead_assignments IS 'Lead atama kayıtları (algoritma metadata ile)';
COMMENT ON COLUMN lead_assignments.algorithm_metadata IS 'Algoritma detayları (queue_position, deficit, vb.)';

-- 4. daily_deficit_log: Günlük eksiklik takibi
CREATE TABLE IF NOT EXISTS daily_deficit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  date DATE NOT NULL,
  target_leads DECIMAL(10,2) NOT NULL,
  actual_leads INTEGER NOT NULL DEFAULT 0,
  deficit DECIMAL(10,2) NOT NULL,
  cumulative_deficit DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Index'ler
CREATE INDEX idx_daily_deficit_user_id ON daily_deficit_log(user_id);
CREATE INDEX idx_daily_deficit_date ON daily_deficit_log(date DESC);
CREATE INDEX idx_daily_deficit_cumulative ON daily_deficit_log(user_id, date, cumulative_deficit);

COMMENT ON TABLE daily_deficit_log IS 'Günlük deficit (eksiklik) takibi';
COMMENT ON COLUMN daily_deficit_log.target_leads IS 'Hedef lead sayısı (oran bazlı)';
COMMENT ON COLUMN daily_deficit_log.actual_leads IS 'Gerçekte aldığı lead sayısı';
COMMENT ON COLUMN daily_deficit_log.deficit IS 'Günlük deficit (target - actual)';
COMMENT ON COLUMN daily_deficit_log.cumulative_deficit IS 'Kümülatif deficit (önceki günlerden gelen)';

-- 5. users tablosuna yeni alanlar ekle
ALTER TABLE users ADD COLUMN IF NOT EXISTS ad_credits INTEGER DEFAULT 0 CHECK (ad_credits >= 0);

COMMENT ON COLUMN users.ad_credits IS 'Temsilcinin haftalık reklam hakkı (kredi sayısı)';

-- Trigger: updated_at otomatik güncelleme
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_weekly_participation_updated_at
  BEFORE UPDATE ON weekly_participation
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
