# Requirements Document

## Introduction

HLL (HommLink Lead), network marketing organizasyonları için geliştirilmiş event-tabanlı bir lead yönetim sistemidir. Sistem, dijital reklam formlarından gelen müşteri adaylarını otomatik olarak temsilcilere dağıtır, her temasın zamanını kaydeder ve liderlere performans raporları sunar. Progressive Web App (PWA) olarak tasarlanmış olup, mobil cihazlar ve bilgisayarlardan tarayıcı üzerinden erişilebilir.

## Glossary

- **HLL System**: HommLink Lead yönetim sistemi
- **Lead**: Dijital reklam formlarından gelen müşteri adayı
- **Representative**: Müşteri adaylarıyla iletişim kuran temsilci kullanıcı
- **Team Leader**: Temsilcileri yöneten ve performanslarını izleyen lider kullanıcı
- **Super Leader**: Tüm ekiplerin performansını izleyen üst düzey yönetici
- **Lead Assignment**: Gelen lead'in otomatik olarak uygun temsilciye atanması süreci
- **Response Time**: Lead'in sisteme girişi ile ilk temas arasında geçen süre
- **Conversion Rate**: Toplam lead sayısına göre satışa dönüşen lead oranı
- **Lead Event**: Lead yaşam döngüsündeki her etkileşimin kaydı (oluşturma, atama, arama, durum değişikliği)
- **Meta Lead Ads**: Facebook/Instagram reklam formları
- **PWA**: Progressive Web App - tarayıcı üzerinden çalışan, kurulum gerektirmeyen uygulama

## Requirements

### Requirement 1

**User Story:** Sistem yöneticisi olarak, Meta Lead Ads formlarından gelen müşteri adaylarının otomatik olarak sisteme kaydedilmesini istiyorum, böylece manuel veri girişi olmadan lead'ler anında işlenebilir.

#### Acceptance Criteria

1. WHEN Meta Lead Ads webhook'u HLL System'e POST isteği gönderdiğinde, THE HLL System SHALL lead bilgilerini (ad, telefon, şehir, form zamanı) veritabanına kaydetmeli
2. WHEN lead kaydedildiğinde, THE HLL System SHALL lead_events tablosuna "created" tipinde event kaydı oluşturmalı
3. IF webhook doğrulama token'ı geçersizse, THEN THE HLL System SHALL isteği reddetmeli ve hata logu oluşturmalı
4. THE HLL System SHALL webhook yanıtını 3 saniye içinde döndürmeli
5. WHEN lead kaydı başarısız olduğunda, THE HLL System SHALL hata detaylarını loglara yazmalı ve webhook'a uygun HTTP hata kodu döndürmeli

### Requirement 2

**User Story:** Sistem yöneticisi olarak, gelen lead'lerin otomatik olarak en uygun temsilciye atanmasını istiyorum, böylece iş yükü dengeli dağıtılır ve hızlı yanıt süresi sağlanır.

#### Acceptance Criteria

1. WHEN yeni bir lead sisteme kaydedildiğinde, THE HLL System SHALL lead'i otomatik olarak bir temsilciye atamalı
2. WHILE temsilci seçimi yapılırken, THE HLL System SHALL en az aktif lead'e sahip temsilciyi önceliklendirmeli
3. WHERE lead'in şehir bilgisi mevcutsa, THE HLL System SHALL aynı bölgedeki temsilcileri önceliklendirmeli
4. WHEN lead atandığında, THE HLL System SHALL lead_events tablosuna "assigned" tipinde event kaydı oluşturmalı
5. WHEN lead atandığında, THE HLL System SHALL atanan temsilciye push notification göndermeli

### Requirement 3

**User Story:** Temsilci olarak, bana atanan lead'leri mobil cihazımdan görüntüleyebilmek istiyorum, böylece her yerden müşteri adaylarıma erişebilirim.

#### Acceptance Criteria

1. WHEN Representative HLL System'e giriş yaptığında, THE HLL System SHALL yalnızca kendisine atanan lead'leri listelemeli
2. THE HLL System SHALL her lead için ad, telefon (maskelenmiş), şehir, atanma zamanı ve durum bilgilerini göstermeli
3. WHILE lead listesi görüntülenirken, THE HLL System SHALL lead'leri atanma zamanına göre en yeniden eskiye sıralı göstermeli
4. THE HLL System SHALL lead listesini 2 saniye içinde yüklemeli
5. WHERE Representative başka bir temsilciye ait lead'i görüntülemeye çalışırsa, THE HLL System SHALL erişimi engellemeli

### Requirement 4

**User Story:** Temsilci olarak, lead ile iletişim kurmak için "Ara" ve "WhatsApp'tan Yaz" butonlarını kullanabilmek istiyorum, böylece hızlıca müşteri adayıyla temas kurabilirim.

#### Acceptance Criteria

1. WHEN Representative lead detay sayfasında "Ara" butonuna tıkladığında, THE HLL System SHALL cihazın telefon uygulamasını lead'in telefon numarasıyla açmalı
2. WHEN Representative "Ara" butonuna tıkladığında, THE HLL System SHALL lead_events tablosuna "called" tipinde event kaydı oluşturmalı
3. WHEN Representative "WhatsApp'tan Yaz" butonuna tıkladığında, THE HLL System SHALL WhatsApp Cloud API üzerinden önceden tanımlı template mesajı göndermeli
4. WHEN WhatsApp mesajı gönderildiğinde, THE HLL System SHALL lead_events tablosuna "whatsapp" tipinde event kaydı oluşturmalı
5. IF WhatsApp mesajı gönderilemezse, THEN THE HLL System SHALL Representative'e hata mesajı göstermeli

### Requirement 5

**User Story:** Temsilci olarak, görüşme sonrası lead durumunu güncelleyebilmek istiyorum, böylece lead'in hangi aşamada olduğu takip edilebilir.

#### Acceptance Criteria

1. WHEN Representative lead detay sayfasında durum değiştirdiğinde, THE HLL System SHALL yeni durumu veritabanına kaydetmeli
2. THE HLL System SHALL durum seçenekleri olarak "new", "contacted", "converted", "lost" değerlerini sunmalı
3. WHEN durum güncellendiğinde, THE HLL System SHALL lead_events tablosuna "status_changed" tipinde event kaydı oluşturmalı
4. THE HLL System SHALL durum güncelleme işlemini 1 saniye içinde tamamlamalı
5. WHEN durum "converted" olarak değiştirildiğinde, THE HLL System SHALL Team Leader'a bildirim göndermeli

### Requirement 6

**User Story:** Lider olarak, ekibimin performansını günlük ve haftalık bazda görüntüleyebilmek istiyorum, böylece ekip verimliliğini takip edebilirim.

#### Acceptance Criteria

1. WHEN Team Leader dashboard'a eriştiğinde, THE HLL System SHALL ekibindeki tüm temsilcilerin performans metriklerini göstermeli
2. THE HLL System SHALL her temsilci için toplam lead sayısı, iletişime geçilen lead sayısı, satışa dönüşen lead sayısı ve ortalama yanıt süresini hesaplamalı
3. WHILE performans verileri görüntülenirken, THE HLL System SHALL tarih aralığı filtreleme (günlük, haftalık, aylık) seçeneği sunmalı
4. THE HLL System SHALL satış oranını (converted / total) yüzde olarak hesaplayıp göstermeli
5. WHERE Team Leader başka bir liderin ekip verilerini görüntülemeye çalışırsa, THE HLL System SHALL erişimi engellemeli

### Requirement 7

**User Story:** Lider olarak, yeni temsilci ekleyebilmek ve mevcut temsilcileri yönetebilmek istiyorum, böylece ekip yapısını dinamik olarak düzenleyebilirim.

#### Acceptance Criteria

1. WHEN Team Leader yeni temsilci eklediğinde, THE HLL System SHALL temsilci bilgilerini (ad, telefon, bölge) veritabanına kaydetmeli
2. THE HLL System SHALL yeni temsilciye otomatik olarak "representative" rolü atamalı
3. WHEN Team Leader temsilciyi pasif ettiğinde, THE HLL System SHALL o temsilciye yeni lead atamasını durdurmalı
4. THE HLL System SHALL temsilci ekleme işlemini 2 saniye içinde tamamlamalı
5. WHEN temsilci eklendiğinde, THE HLL System SHALL temsilciye giriş bilgilerini içeren bildirim göndermeli

### Requirement 8

**User Story:** Üst lider olarak, tüm ekiplerin karşılaştırmalı performans analizini görüntüleyebilmek istiyorum, böylece organizasyon genelinde stratejik kararlar alabilirim.

#### Acceptance Criteria

1. WHEN Super Leader dashboard'a eriştiğinde, THE HLL System SHALL tüm ekiplerin özet performans metriklerini göstermeli
2. THE HLL System SHALL ekipler arası karşılaştırmalı grafikler (bar chart, line chart) sunmalı
3. THE HLL System SHALL en yüksek satış oranına sahip ekibi, en hızlı yanıt veren temsilciyi ve en verimli bölgeyi vurgulamalı
4. WHILE analiz verileri görüntülenirken, THE HLL System SHALL tarih aralığı ve bölge bazlı filtreleme seçenekleri sunmalı
5. THE HLL System SHALL dashboard verilerini 5 saniye içinde yüklemeli

### Requirement 9

**User Story:** Temsilci olarak, yeni lead atandığında anında bildirim almak istiyorum, böylece hızlı şekilde müşteri adayıyla iletişim kurabilirim.

#### Acceptance Criteria

1. WHEN Representative'e yeni lead atandığında, THE HLL System SHALL push notification göndermeli
2. THE HLL System SHALL bildirimde lead'in adını ve şehrini içermeli
3. WHEN Representative bildirime tıkladığında, THE HLL System SHALL doğrudan lead detay sayfasını açmalı
4. THE HLL System SHALL bildirimi lead atanmasından 5 saniye içinde gönderimeli
5. WHERE Representative bildirim izni vermemişse, THE HLL System SHALL uygulama içi banner mesajı göstermeli

### Requirement 10

**User Story:** Kullanıcı olarak, uygulamayı PWA olarak mobil cihazıma yükleyebilmek istiyorum, böylece native app gibi kullanabilir ve offline erişim sağlayabilirim.

#### Acceptance Criteria

1. THE HLL System SHALL manifest.json dosyası ile PWA standartlarına uygun olmalı
2. THE HLL System SHALL service worker ile temel cache stratejisi uygulamalı
3. WHEN kullanıcı "Ana Ekrana Ekle" seçeneğini kullandığında, THE HLL System SHALL cihazda uygulama ikonu oluşturmalı
4. WHILE offline modda, THE HLL System SHALL daha önce yüklenmiş lead listesini gösterebilmeli
5. WHEN internet bağlantısı kesildiğinde, THE HLL System SHALL kullanıcıya offline durumu bildirmeli

### Requirement 11

**User Story:** Sistem yöneticisi olarak, kullanıcı verilerinin güvenli şekilde saklanmasını ve yalnızca yetkili kişilerce erişilmesini istiyorum, böylece KVKK/GDPR uyumluluğu sağlanır.

#### Acceptance Criteria

1. THE HLL System SHALL Supabase Row Level Security (RLS) politikalarını tüm tablolarda uygulamalı
2. WHEN Representative lead verilerine eriştiğinde, THE HLL System SHALL yalnızca kendisine atanan lead'leri göstermeli
3. WHEN Team Leader verilere eriştiğinde, THE HLL System SHALL yalnızca kendi ekibine ait verileri göstermeli
4. THE HLL System SHALL telefon numaralarını maskelenmiş formatta (05xx *** 67 89) göstermeli
5. THE HLL System SHALL kullanıcı kimlik doğrulamasını email ve OTP ile yapmalı

### Requirement 12

**User Story:** Sistem yöneticisi olarak, lead yaşam döngüsündeki tüm etkileşimlerin kaydedilmesini istiyorum, böylece detaylı analiz ve raporlama yapılabilir.

#### Acceptance Criteria

1. WHEN lead ile ilgili herhangi bir işlem yapıldığında, THE HLL System SHALL lead_events tablosuna event kaydı oluşturmalı
2. THE HLL System SHALL her event için tip (created, assigned, called, whatsapp, status_changed), zaman damgası ve işlemi yapan kullanıcı bilgisini kaydetmeli
3. THE HLL System SHALL event kayıtlarını 500 milisaniye içinde oluşturmalı
4. THE HLL System SHALL event verilerini 90 gün boyunca saklamalı
5. WHEN performans raporları oluşturulduğunda, THE HLL System SHALL event verilerini kullanarak ortalama yanıt süresini hesaplamalı

### Requirement 13

**User Story:** Lider olarak, ekip performans verilerinin otomatik olarak günlük bazda özetlenmesini istiyorum, böylece raporlar hızlı şekilde yüklenebilir.

#### Acceptance Criteria

1. THE HLL System SHALL her gece 00:00'da otomatik olarak performans özet verilerini hesaplamalı
2. THE HLL System SHALL performance_summary tablosuna günlük bazda toplam lead, iletişime geçilen, satışa dönüşen, ortalama yanıt süresi ve satış oranı verilerini kaydetmeli
3. WHEN özet veriler oluşturulduğunda, THE HLL System SHALL işlemi 5 dakika içinde tamamlamalı
4. THE HLL System SHALL özet verileri 365 gün boyunca saklamalı
5. IF özet oluşturma işlemi başarısız olursa, THEN THE HLL System SHALL sistem yöneticisine hata bildirimi gönderimeli

### Requirement 14

**User Story:** Temsilci olarak, lead detay sayfasında müşteri adayının form bilgilerini ve geçmiş iletişim kayıtlarını görebilmek istiyorum, böylece daha bilinçli görüşme yapabilirim.

#### Acceptance Criteria

1. WHEN Representative lead detay sayfasını açtığında, THE HLL System SHALL lead'in tüm form bilgilerini (ad, telefon, şehir, form zamanı) göstermeli
2. THE HLL System SHALL lead ile ilgili tüm geçmiş etkileşimleri (arama, WhatsApp, durum değişiklikleri) kronolojik sırada listelenmeli
3. THE HLL System SHALL her etkileşim için tarih, saat ve işlem tipini göstermeli
4. THE HLL System SHALL lead detay sayfasını 1 saniye içinde yüklemeli
5. THE HLL System SHALL lead'in mevcut durumunu (new, contacted, converted, lost) belirgin şekilde vurgulamalı

### Requirement 15

**User Story:** Lider olarak, dashboard'da görsel grafikler ve KPI kartları ile ekip performansını hızlıca değerlendirebilmek istiyorum, böylece veri analizi kolaylaşır.

#### Acceptance Criteria

1. THE HLL System SHALL dashboard'da en az 4 KPI kartı göstermeli (Toplam Lead, Ortalama Yanıt Süresi, Satış Oranı, Aktif Temsilci Sayısı)
2. THE HLL System SHALL günlük lead sayısını gösteren line chart sunmalı
3. THE HLL System SHALL lead durum dağılımını gösteren donut chart sunmalı
4. THE HLL System SHALL temsilci bazlı performansı gösteren bar chart sunmalı
5. THE HLL System SHALL tüm grafikleri 3 saniye içinde render etmeli


### Requirement 16

**User Story:** Temsilci olarak, reklam kampanyasına katkı payı koyarak lead alma hakkı satın almak istiyorum, böylece katkım oranında lead alabilirim.

#### Acceptance Criteria

1. THE HLL System SHALL temsilcilerin kredi (hak) satın almasına izin vermeli
2. WHEN temsilci kredi satın aldığında, THE HLL System SHALL kullanıcının credit_balance değerini artırmalı
3. THE HLL System SHALL her kredi satın alma işlemini transactions tablosuna kaydetmeli
4. WHEN temsilciye lead atandığında, THE HLL System SHALL temsilcinin credit_balance değerini 1 azaltmalı
5. WHERE temsilcinin credit_balance 0 ise, THE HLL System SHALL o temsilciye lead atamamalı

### Requirement 17

**User Story:** Sistem yöneticisi olarak, lead'lerin temsilcilere adil ve oransal olarak dağıtılmasını istiyorum, böylece herkes katkısı oranında lead alır.

#### Acceptance Criteria

1. THE HLL System SHALL lead atama algoritmasında Weighted Round Robin yöntemini kullanmalı
2. WHEN yeni lead geldiğinde, THE HLL System SHALL her temsilcinin credit oranını hesaplamalı (credit / total_credits)
3. THE HLL System SHALL her temsilcinin bugün alması gereken lead sayısını hesaplamalı (oran * bugün gelen toplam lead)
4. THE HLL System SHALL her temsilcinin "deficit" değerini hesaplamalı (alması gereken - aldığı)
5. THE HLL System SHALL en yüksek deficit değerine sahip temsilciye lead'i atamalı
6. THE HLL System SHALL bu algoritma ile tüm temsilcilerin katkı oranında lead almasını garanti etmeli

### Requirement 18

**User Story:** Lider olarak, ekip üyelerimin kredi bakiyelerini ve lead alma durumlarını görebilmek istiyorum, böylece ekip performansını takip edebilirim.

#### Acceptance Criteria

1. WHEN Team Leader ekip performans sayfasını açtığında, THE HLL System SHALL her temsilcinin credit_balance değerini göstermeli
2. THE HLL System SHALL her temsilcinin bugün aldığı lead sayısını göstermeli
3. THE HLL System SHALL her temsilcinin "hak ettiği" lead sayısını (oran bazlı) göstermeli
4. THE HLL System SHALL kredi bakiyesi 0 olan temsilcileri vurgulamalı
5. THE HLL System SHALL ekip toplam kredi bakiyesini göstermeli
