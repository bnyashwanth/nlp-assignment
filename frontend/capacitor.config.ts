import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ai.linguabridge.app',
  appName: 'LinguaBridge AI',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true, // Allows testing against local IP or HTTP backends during mobile debug
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      releaseType: 'APK',
    },
    allowMixedContent: true,
  },
};

export default config;
