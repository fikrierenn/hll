# HLL Lead Management - TODO List

## ✅ Tamamlanan İşler

### 1. Proje Kurulumu
- [x] Next.js 15 + TypeScript kurulumu
- [x] Tailwind CSS yapılandırması
- [x] PWA desteği (next-pwa)
- [x] Capacitor Android kurulumu
- [x] GitHub Actions APK build workflow

### 2. UI/UX Tasarımı
- [x] Login sayfası (Representative & Leader rolleri)
- [x] Representative Panel
  - [x] Lead listesi sayfası
  - [x] Lead detay sayfası
  - [x] Dashboard (performans)
  - [x] Profile sayfası
- [x] Leader Panel
  - [x] Ekip yönetimi sayfası
  - [x] Dashboard (ekip performansı)
  - [x] Settings (ekip ayarları, reklam hakkı yönetimi)
  - [x] Profile sayfası
- [x] Mobile-first responsive tasarım
- [x] Bottom navigation
- [x] Component'ler
  - [x] MobileHeader
  - [x] BottomNav
  - [x] Footer
  - [x] StatCard
  - [x] KPICard
  - [x] LeadCard
  - [x] DonutChart
  - [x] BarChart
  - [x] LineChart

### 3. Mock Data Sistemi
- [x] users.json (Representative & Leader)
- [x] leads.json (25 lead, farklı statusler)
- [x] lead-events.json (20 event)
- [x] performance.json (8 performans kaydı)
- [x] Mock API fonksiyonları (async/await)

### 4. Database Schema
- [x] Supabase migration dosyaları (5 adet)
- [x] Lookup tables (user_roles, lead_statuses, event_types)
- [x] Base tables (users, leads, performance_summary)
- [x] Distribution tables (weekly_distribution, daily_queue)
- [x] RLS policies (role-based access control)
- [x] Unified logging system (logs table + views)

### 5. Algoritma Dokümantasyonu
- [x] Lead dağıtım algoritması (Round-Robin Mixed + Deficit)
- [x] Test senaryoları
- [x] Algoritma implementasyonu (TypeScript)

### 6. Build & Deploy
- [x] Static export yapılandırması
- [x] Dynamic route çözümü (generateStaticParams)
- [x] GitHub Actions workflow
- [x] APK build dokümantasyonu

---

## 🔄 Devam Eden İşler

### 1. APK Güncelleme Sistemi
- [x] Update manager temel yapısı oluşturuldu
- [ ] Capacitor FileSystem entegrasyonu
- [ ] APK download ve install fonksiyonları
- [ ] Update dialog component'i
- [ ] Version check API endpoint'i
- [ ] GitHub Releases entegrasyonu

---

## 📋 Yapılacak İşler

### 1. Supabase Entegrasyonu (Öncelik: Yüksek)
- [ ] Supabase client kurulumu
- [ ] Environment variables (.env.local)
- [ ] Migration'ları Supabase'e uygulama
- [ ] Test verileri ekleme
- [ ] API fonksiyonları (mock'tan gerçek API'ye geçiş)
  - [ ] getLeads()
  - [ ] getLeadById()
  - [ ] updateLeadStatus()
  - [ ] getTeamPerformance()
  - [ ] getDashboardKPIs()
- [ ] RLS policies test

### 2. Authentication (Öncelik: Yüksek)
- [ ] Supabase Auth kurulumu
- [ ] Login sayfası entegrasyonu
- [ ] Logout fonksiyonu
- [ ] Auth context/provider
- [ ] Protected routes (middleware)
- [ ] Role-based redirects
- [ ] Session yönetimi
- [ ] Remember me özelliği

### 3. Lead Dağıtım Algoritması - Edge Function (Öncelik: Orta)
- [ ] Supabase Edge Function oluşturma
- [ ] Algoritma kodunu Edge Function'a taşıma
- [ ] Haftalık dağıtım fonksiyonu
  - [ ] Reklam hakkı kontrolü
  - [ ] Round-Robin Mixed implementasyonu
  - [ ] Deficit hesaplama
- [ ] Günlük sıra oluşturma fonksiyonu
- [ ] Cron job kurulumu (haftalık/günlük)
- [ ] Test ve debugging

### 4. Real-time Features (Öncelik: Orta)
- [ ] Supabase Realtime kurulumu
- [ ] Yeni lead bildirimleri (real-time)
- [ ] Lead status değişikliği bildirimleri
- [ ] Ekip performansı güncellemeleri
- [ ] Online/offline status

### 5. Push Notifications (Öncelik: Orta)
- [ ] Firebase Cloud Messaging (FCM) kurulumu
- [ ] Capacitor Push Notifications plugin
- [ ] FCM token kaydetme
- [ ] Notification handler
- [ ] Notification types
  - [ ] Yeni lead atandı
  - [ ] Lead durumu değişti
  - [ ] Günlük rapor
  - [ ] Ekip bildirimleri (Leader için)
- [ ] Background notifications
- [ ] Notification permissions

### 6. Analytics & Logging (Öncelik: Düşük)
- [ ] Button click logging
- [ ] Page view tracking
- [ ] Lead interaction logging
- [ ] Performance metrics
- [ ] Error tracking (Sentry?)
- [ ] Analytics dashboard (Leader/Admin için)

### 7. Offline Support (Öncelik: Düşük)
- [ ] Service Worker optimizasyonu
- [ ] Offline data caching
- [ ] Sync queue (offline actions)
- [ ] Conflict resolution
- [ ] Offline indicator UI

### 8. Testing (Öncelik: Düşük)
- [ ] Unit tests (Jest)
- [ ] Component tests (React Testing Library)
- [ ] E2E tests (Playwright)
- [ ] API tests
- [ ] Performance tests

### 9. Optimizasyon (Öncelik: Düşük)
- [ ] Image optimization
- [ ] Code splitting
- [ ] Lazy loading
- [ ] Bundle size optimization
- [ ] Performance monitoring
- [ ] SEO optimization (meta tags)

### 10. Dokümantasyon (Öncelik: Düşük)
- [ ] API dokümantasyonu
- [ ] Component dokümantasyonu
- [ ] Deployment guide
- [ ] User manual (Türkçe)
- [ ] Admin manual

---

## 🎯 Sonraki Sprint (Öncelik Sırası)

1. **Supabase Entegrasyonu** - Mock'tan gerçek API'ye geçiş
2. **Authentication** - Login/logout sistemi
3. **Lead Dağıtım Algoritması** - Edge Function implementasyonu
4. **Push Notifications** - FCM entegrasyonu
5. **APK Güncelleme Sistemi** - OTA updates

---

## 📝 Notlar

### APK Güncelleme Sistemi
- `lib/update-manager.ts` dosyası oluşturuldu
- Versiyon kontrolü ve karşılaştırma fonksiyonları hazır
- Capacitor FileSystem ve Browser plugin'leri kullanılacak
- GitHub Releases ile entegre edilecek
- Zorunlu/opsiyonel güncelleme desteği var

### Super Leader Rolü
- Super leader rolü kaldırıldı
- Sadece Representative ve Leader rolleri kullanılacak
- Database migration'larında hala super_leader referansları var (temizlenecek)

### Static Export
- Next.js static export kullanılıyor
- Dynamic route'lar için generateStaticParams kullanılıyor
- 25 lead static generate ediliyor

---

## 🐛 Bilinen Sorunlar

1. Database migration'larında super_leader referansları temizlenmeli
2. APK build için Java 21 gerekiyor (GitHub Actions'da düzeltildi)
3. Mock data'da bazı type uyumsuzlukları var (as casting ile çözüldü)

---

## 💡 İyileştirme Fikirleri

1. Lead filtreleme ve arama özelliği
2. Lead export (Excel/CSV)
3. Bulk lead import
4. WhatsApp template mesajları
5. Call recording entegrasyonu
6. Lead scoring sistemi
7. Gamification (rozet, liderlik tablosu)
8. Dark mode
9. Multi-language support
10. Voice notes (lead notları için)

---

**Son Güncelleme:** 2025-01-14
**Versiyon:** 1.0.0
