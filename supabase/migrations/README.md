# Supabase Migration Dosyaları

Bu klasörde HLL Lead Management System için veritabanı migration dosyaları bulunur.

## 📋 Migration Sırası

Migration'lar dosya adındaki numaraya göre sırayla çalıştırılır:

### 1️⃣ `20250111000000_create_lookup_tables.sql`
**Ne yapar:** Enum yerine kullanılacak lookup tabloları oluşturur

**Tablolar:**
- `user_roles` → Kullanıcı rolleri (representative, leader, super_leader)
- `lead_statuses` → Lead durumları (new, contacted, converted, lost)  
- `event_types` → Event tipleri (created, assigned, called, whatsapp, status_changed)

**Neden önemli:** Enum'lar yerine tablo kullanmak daha esnek. Yeni rol/durum eklemek için kod değişikliği gerekmez.

---

### 2️⃣ `20250111000001_create_base_tables.sql`
**Ne yapar:** Ana sistem tablolarını oluşturur

**Tablolar:**
- `users` → Kullanıcılar (temsilci, lider, üst lider)
- `leads` → Müşteri adayları (Meta'dan gelen)
- `performance_summary` → Günlük performans özeti

**İlişkiler:**
- `users.role_id` → `user_roles.id`
- `leads.status_id` → `lead_statuses.id`
- `leads.assigned_to` → `users.id`

---

### 3️⃣ `20250111000002_create_distribution_tables.sql`
**Ne yapar:** Lead dağıtım algoritması için tablolar oluşturur

**Tablolar:**
- `weekly_participation` → Haftalık kredi katılımları
- `daily_distribution_queue` → Günlük dağıtım sırası (Round-Robin Karışık)
- `lead_assignments` → Lead atama kayıtları
- `daily_deficit_log` → Günlük deficit takibi (telafi mekanizması)

**Algoritma:** Hibrit Round-Robin (Round-Robin Karışık + Günlük Deficit Telafisi)

---

### 4️⃣ `20250111000003_create_rls_policies.sql`
**Ne yapar:** Row Level Security (RLS) politikalarını oluşturur

**Güvenlik:**
- Representative → Sadece kendi lead'lerini görebilir
- Leader → Kendi ekibini görebilir
- Super Leader → Her şeyi görebilir

**Tablolar:** users, leads, performance_summary, distribution tabloları

---

### 5️⃣ `20250111000005_create_logs_and_views.sql`
**Ne yapar:** Unified log sistemi ve view'ler oluşturur

**Tablolar:**
- `log_types` → Log tipleri (lead, user, system, distribution)
- `system_logs` → **TEK unified log tablosu** (tüm loglar burada)

**Views (Kolay sorgulama için):**
- `lead_events` → Lead olayları
- `user_activity_log` → Kullanıcı aktiviteleri
- `distribution_log` → Dağıtım logları
- `system_errors` → Sistem hataları
- `performance_metrics` → Performans metrikleri
- `daily_log_summary` → Günlük özet

**Helper Function:**
- `log_event()` → Kolay log kaydı için

---

## 🚀 Nasıl Kullanılır?

### Supabase CLI ile:
```bash
# Tüm migration'ları çalıştır
supabase db push

# Veya tek tek:
supabase db push --file supabase/migrations/20250111000000_create_lookup_tables.sql
```

### Supabase Dashboard'dan:
1. SQL Editor'ü aç
2. Migration dosyalarını sırayla kopyala-yapıştır
3. Run tuşuna bas

---

## 📊 Veritabanı Şeması Özeti

```
┌─────────────────┐
│  user_roles     │ (Lookup)
│  lead_statuses  │ (Lookup)
│  event_types    │ (Lookup)
│  log_types      │ (Lookup)
└─────────────────┘
         ↓
┌─────────────────────────────────────┐
│  users                              │
│  - id, email, name, role_id         │
│  - leader_id, ad_credits            │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│  leads                              │
│  - id, full_name, phone             │
│  - assigned_to, status_id           │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│  system_logs (Unified)              │
│  - log_type_id, user_id, lead_id    │
│  - metadata, timestamp              │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│  Views:                             │
│  - lead_events                      │
│  - user_activity_log                │
│  - distribution_log                 │
│  - system_errors                    │
│  - performance_metrics              │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Distribution Tables:               │
│  - weekly_participation             │
│  - daily_distribution_queue         │
│  - lead_assignments                 │
│  - daily_deficit_log                │
└─────────────────────────────────────┘
```

---

## ⚠️ Önemli Notlar

1. **Sıra önemli!** Migration'lar numaraya göre çalıştırılmalı
2. **RLS aktif!** Tüm tablolarda Row Level Security var
3. **Lookup tables** kullanıyoruz (enum yok)
4. **Tek log tablosu** var (system_logs), view'lerle erişiyoruz
5. **Helper function** var: `log_event()` kullan

---

## 🔧 Örnek Kullanım

### Log kaydı oluştur:
```sql
SELECT log_event(
  'lead_assigned',
  p_lead_id := 'lead-uuid',
  p_user_id := 'user-uuid',
  p_message := 'Lead atandı',
  p_metadata := '{"algorithm": "round_robin_mixed"}'::jsonb
);
```

### Lead event'lerini sorgula:
```sql
SELECT * FROM lead_events 
WHERE lead_id = 'lead-uuid'
ORDER BY timestamp DESC;
```

### Performans metriklerini gör:
```sql
SELECT * FROM performance_metrics
WHERE hour >= NOW() - INTERVAL '24 hours';
```
