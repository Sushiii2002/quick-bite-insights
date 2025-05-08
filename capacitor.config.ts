
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.bd2370895cdf466587b84668d0833264',
  appName: 'quick-bite-insights',
  webDir: 'dist',
  server: {
    url: 'https://bd237089-5cdf-4665-87b8-4668d0833264.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
    }
  }
};

export default config;
