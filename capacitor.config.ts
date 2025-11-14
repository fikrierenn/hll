import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.hll.leadmanagement',
  appName: 'HLL Lead Management',
  webDir: 'out', // Static export output
  server: {
    androidScheme: 'https'
  }
};

export default config;
