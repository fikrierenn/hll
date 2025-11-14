/**
 * APK Update Manager
 * Uygulama güncellemelerini kontrol eder ve yönetir
 */

export interface AppVersion {
  version: string;
  buildNumber: number;
  releaseDate: string;
  downloadUrl: string;
  changelog: string[];
  mandatory: boolean; // Zorunlu güncelleme mi?
  minVersion?: string; // Bu sürümden düşükse zorunlu güncelle
}

export interface UpdateCheckResult {
  hasUpdate: boolean;
  currentVersion: string;
  latestVersion?: AppVersion;
  isMandatory: boolean;
}

const UPDATE_CHECK_URL = process.env.NEXT_PUBLIC_UPDATE_CHECK_URL || 'https://api.hll.com/app/version';
const CURRENT_VERSION = '1.0.0';
const CURRENT_BUILD = 1;

/**
 * Sunucudan en son sürüm bilgisini kontrol et
 */
export async function checkForUpdates(): Promise<UpdateCheckResult> {
  try {
    // Mock data - gerçek API'ye bağlanacak
    const mockLatestVersion: AppVersion = {
      version: '1.0.1',
      buildNumber: 2,
      releaseDate: '2025-01-15',
      downloadUrl: 'https://github.com/fikrierenn/hll/releases/download/v1.0.1/app-release.apk',
      changelog: [
        'Performans iyileştirmeleri',
        'Hata düzeltmeleri',
        'Yeni lead filtreleme özellikleri'
      ],
      mandatory: false,
      minVersion: '1.0.0'
    };

    // Gerçek API çağrısı (şimdilik mock)
    // const response = await fetch(UPDATE_CHECK_URL);
    // const latestVersion: AppVersion = await response.json();
    
    const latestVersion = mockLatestVersion;
    
    // Versiyon karşılaştırması
    const hasUpdate = compareVersions(latestVersion.version, CURRENT_VERSION) > 0;
    const isMandatory = latestVersion.mandatory || 
                        (latestVersion.minVersion && compareVersions(CURRENT_VERSION, latestVersion.minVersion) < 0);
    
    return {
      hasUpdate,
      currentVersion: CURRENT_VERSION,
      latestVersion: hasUpdate ? latestVersion : undefined,
      isMandatory
    };
  } catch (error) {
    console.error('Update check failed:', error);
    return {
      hasUpdate: false,
      currentVersion: CURRENT_VERSION,
      isMandatory: false
    };
  }
}

/**
 * Versiyon karşılaştırma (semantic versioning)
 * @returns 1 if v1 > v2, -1 if v1 < v2, 0 if equal
 */
function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const part1 = parts1[i] || 0;
    const part2 = parts2[i] || 0;
    
    if (part1 > part2) return 1;
    if (part1 < part2) return -1;
  }
  
  return 0;
}

/**
 * APK'yı indir ve yükle (Android)
 */
export async function downloadAndInstallUpdate(downloadUrl: string): Promise<void> {
  try {
    // Capacitor FileSystem ve Browser plugin'leri kullanılacak
    // Şimdilik tarayıcıda aç
    window.open(downloadUrl, '_blank');
    
    // TODO: Native implementation
    // 1. APK'yı indir (Capacitor FileSystem)
    // 2. Download klasörüne kaydet
    // 3. Install intent'i tetikle (Android)
  } catch (error) {
    console.error('Update download failed:', error);
    throw error;
  }
}

/**
 * Son güncelleme kontrolü zamanını kaydet
 */
export function saveLastUpdateCheck(): void {
  localStorage.setItem('last_update_check', new Date().toISOString());
}

/**
 * Son güncelleme kontrolünden beri geçen süreyi kontrol et
 * @returns true if should check for updates
 */
export function shouldCheckForUpdates(): boolean {
  const lastCheck = localStorage.getItem('last_update_check');
  if (!lastCheck) return true;
  
  const lastCheckDate = new Date(lastCheck);
  const now = new Date();
  const hoursSinceLastCheck = (now.getTime() - lastCheckDate.getTime()) / (1000 * 60 * 60);
  
  // 24 saatte bir kontrol et
  return hoursSinceLastCheck >= 24;
}

/**
 * Güncellemeyi atla (bu versiyon için)
 */
export function skipUpdate(version: string): void {
  localStorage.setItem('skipped_update_version', version);
}

/**
 * Bu versiyon daha önce atlandı mı?
 */
export function isUpdateSkipped(version: string): boolean {
  return localStorage.getItem('skipped_update_version') === version;
}
