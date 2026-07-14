import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'aap1com.lightembassy',
  appName: 'Light Embassy One',
  webDir: 'dist',
  server: {
    url: 'https://55bd5653-424a-4578-b8f3-5ca91a34b86b.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  bundledWebRuntime: false
};

export default config;