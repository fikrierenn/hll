# 📱 Android APK Oluşturma Rehberi

## 🚀 Otomatik Build (GitHub Actions)

### APK İndirme:

1. GitHub reposuna git: https://github.com/fikrierenn/hll
2. **Actions** sekmesine tıkla
3. En son **Android APK Build** workflow'unu seç
4. **Artifacts** bölümünden **app-debug** indir
5. ZIP'i aç, APK'yı telefonuna yükle

### Manuel Tetikleme:

1. GitHub → Actions → Android APK Build
2. **Run workflow** butonuna tıkla
3. **Run workflow** onayla
4. Build tamamlanınca APK'yı indir

---

## 🛠️ Lokal Build (Bilgisayarında)

### Gereksinimler:

- Node.js 20+
- Java JDK 17+
- Android SDK (veya Android Studio)

### Adımlar:

```bash
# 1. Dependencies kur
npm install

# 2. Next.js build
npm run build

# 3. Capacitor sync
npx cap sync android

# 4. APK oluştur
cd android
./gradlew assembleDebug  # Mac/Linux
.\gradlew.bat assembleDebug  # Windows

# APK konumu:
# android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 📦 Release APK (İmzalı)

### Keystore Oluştur:

```bash
keytool -genkey -v -keystore hll-release.keystore -alias hll -keyalg RSA -keysize 2048 -validity 10000
```

### android/app/build.gradle Düzenle:

```gradle
android {
    ...
    signingConfigs {
        release {
            storeFile file("../../hll-release.keystore")
            storePassword "your-password"
            keyAlias "hll"
            keyPassword "your-password"
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

### Release Build:

```bash
cd android
./gradlew assembleRelease

# APK konumu:
# android/app/build/outputs/apk/release/app-release.apk
```

---

## 🌐 PWA Olarak Kullan (APK Gerekmez)

### Netlify/Vercel Deploy:

```bash
# Build
npm run build

# Deploy (Netlify)
netlify deploy --prod --dir=out

# Deploy (Vercel)
vercel --prod
```

### Mobil Kullanım:

1. Tarayıcıdan siteyi aç
2. Menü → **Ana ekrana ekle**
3. App gibi çalışır!

---

## 🔧 Sorun Giderme

### Java Bulunamadı:

```bash
# Java JDK 17 indir:
# https://adoptium.net/

# JAVA_HOME ayarla (Windows):
setx JAVA_HOME "C:\Program Files\Eclipse Adoptium\jdk-17.0.x"

# JAVA_HOME ayarla (Mac/Linux):
export JAVA_HOME=/Library/Java/JavaVirtualMachines/temurin-17.jdk/Contents/Home
```

### Gradle Hatası:

```bash
# Gradle cache temizle
cd android
./gradlew clean

# Tekrar dene
./gradlew assembleDebug
```

### Build Hatası:

```bash
# Node modules temizle
rm -rf node_modules
npm install

# Next.js cache temizle
rm -rf .next out

# Tekrar build
npm run build
npx cap sync android
```

---

## 📱 APK Yükleme (Android)

1. APK'yı telefona aktar
2. **Ayarlar** → **Güvenlik** → **Bilinmeyen kaynaklardan yükleme** aktif et
3. APK'ya tıkla ve yükle
4. Uygulama hazır!

---

## 🎯 Hızlı Komutlar

```bash
# Tam build süreci
npm install && npm run build && npx cap sync android && cd android && ./gradlew assembleDebug

# Sadece APK oluştur (build zaten yapıldıysa)
cd android && ./gradlew assembleDebug

# APK'yı bul
find android -name "*.apk"
```

---

## 📊 Build Boyutları

- **Debug APK:** ~15-20 MB
- **Release APK (minified):** ~8-12 MB
- **PWA (cache):** ~2-3 MB

---

## 🔗 Faydalı Linkler

- [Capacitor Docs](https://capacitorjs.com/docs)
- [Android Studio](https://developer.android.com/studio)
- [Java JDK](https://adoptium.net/)
- [GitHub Actions](https://github.com/fikrierenn/hll/actions)
