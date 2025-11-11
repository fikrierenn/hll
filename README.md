# 🏠 HommLink Lead (HLL)

Modern, mobil-first lead yönetim sistemi. Network marketing ekipleri için tasarlanmış, Meta Lead Ads entegrasyonu ile otomatik lead dağıtımı ve performans takibi sağlar.

## 📱 Özellikler

### 🎯 Temsilci Paneli
- **Lead Yönetimi**: Atanan lead'leri görüntüleme ve yönetme
- **Hızlı İletişim**: Tek tıkla arama ve WhatsApp mesajı
- **Durum Takibi**: Lead durumlarını güncelleme (Yeni, Görüşüldü, Satış, Kayıp)
- **Performans Dashboard**: Günlük KPI'lar ve istatistikler
- **Lead Detayları**: Müşteri bilgileri ve geçmiş aktiviteler

### 👥 Lider Paneli
- **Ekip Yönetimi**: Temsilci ekleme, aktif/pasif yapma
- **Performans Takibi**: Ekip üyelerinin detaylı performans analizi
- **Karşılaştırmalı Raporlar**: Ekip içi sıralama ve karşılaştırma
- **Gerçek Zamanlı İstatistikler**: Satış oranları, yanıt süreleri
- **Ayarlar**: Ekip ve uygulama yönetimi

### 🔐 Güvenlik
- Rol tabanlı erişim kontrolü (Representative, Leader, Super Leader)
- Telefon numarası maskeleme
- Güvenli veri yönetimi

## 🚀 Teknolojiler

- **Framework**: Next.js 14 (App Router)
- **Dil**: TypeScript
- **Styling**: TailwindCSS
- **UI Components**: Lucide React Icons
- **State Management**: React Hooks
- **Data**: Mock JSON (Prototype aşaması)

## 📦 Kurulum

```bash
# Projeyi klonlayın
git clone https://github.com/fikrierenn/hll.git
cd hll

# Bağımlılıkları yükleyin
npm install

# Geliştirme sunucusunu başlatın
npm run dev
```

Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresini açın.

## 🎨 Demo Kullanımı

Login sayfasında 2 rol seçeneği bulunur:

### 👤 Temsilci
- **Kullanıcı**: Ayşe Yılmaz
- **Özellikler**: Lead listesi, performans dashboard, profil

### 👥 Lider
- **Kullanıcı**: Ali Öztürk
- **Özellikler**: Ekip yönetimi, performans analizi, temsilci ekleme

## 📂 Proje Yapısı

```
hll/
├── app/                          # Next.js App Router
│   ├── login/                    # Login sayfası
│   ├── representative/           # Temsilci paneli
│   │   ├── page.tsx             # Lead listesi
│   │   ├── dashboard/           # Performans dashboard
│   │   ├── profile/             # Profil sayfası
│   │   └── leads/[id]/          # Lead detay sayfası
│   ├── leader/                   # Lider paneli
│   │   ├── page.tsx             # Ekip performansı
│   │   ├── dashboard/           # Performans grafikleri
│   │   ├── profile/             # Profil sayfası
│   │   └── settings/            # Ekip yönetimi ve ayarlar
│   └── super-leader/            # Üst lider paneli (geliştirilme aşamasında)
├── components/                   # Reusable components
│   ├── layout/                  # Layout components
│   │   ├── MobileHeader.tsx    # Mobil header
│   │   └── BottomNav.tsx       # Alt navigasyon
│   └── ui/                      # UI components
│       └── StatCard.tsx        # İstatistik kartı
├── lib/                         # Utilities
│   ├── mock-data/              # Mock data (JSON)
│   │   ├── users.json
│   │   ├── leads.json
│   │   ├── lead-events.json
│   │   └── performance.json
│   └── utils.ts                # Helper functions
├── types/                       # TypeScript types
│   └── index.ts
└── .kiro/                       # Spec dosyaları
    └── specs/hll-lead-management/
        ├── requirements.md      # Gereksinimler
        ├── design.md           # Tasarım dokümanı
        └── tasks.md            # Görev listesi
```

## 🎯 Önemli Özellikler

### Weighted Round Robin Algoritması
Lead dağıtımı için adil ve oransal algoritma:
- Her temsilcinin kredi hakkı var
- Lead'ler oransal olarak dağıtılır
- Gerçek zamanlı deficit hesaplama
- Kimse mağdur olmaz

### Mobil-First Tasarım
- Responsive layout (320px+)
- Touch-friendly UI
- Bottom navigation
- Smooth animations
- Modern, gradient renkler

### Mock Data Sistemi
- Gerçekçi test verileri
- 25+ lead örneği
- 7 kullanıcı (temsilci, lider)
- Performans metrikleri
- Lead event geçmişi

## 🔄 Geliştirme Aşamaları

### ✅ Phase 0: UI Prototype (Tamamlandı)
- [x] Next.js setup
- [x] Mock data
- [x] Login sayfası
- [x] Representative paneli
- [x] Leader paneli
- [x] Layout components
- [x] Temsilci yönetimi

### 🚧 Phase 1: Database & Backend (Planlanan)
- [ ] Supabase entegrasyonu
- [ ] Database schema
- [ ] Row Level Security (RLS)
- [ ] API endpoints

### 🚧 Phase 2: Meta Lead Ads Entegrasyonu (Planlanan)
- [ ] Webhook handler
- [ ] Lead assignment engine
- [ ] Notification service
- [ ] WhatsApp integration

### 🚧 Phase 3: PWA & Production (Planlanan)
- [ ] PWA configuration
- [ ] Offline support
- [ ] Push notifications
- [ ] Production deployment

## 📝 Lisans

Bu proje özel bir projedir.

## 👨‍💻 Geliştirici

**Fikri Eren**
- GitHub: [@fikrierenn](https://github.com/fikrierenn)

---

**Not**: Bu proje şu anda prototype aşamasındadır ve mock data ile çalışmaktadır. Production kullanımı için backend entegrasyonu gereklidir.
