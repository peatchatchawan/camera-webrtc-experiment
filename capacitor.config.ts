import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'camera.webrtc.experiment',
  appName: 'camera-webrtc-experiment',
  webDir: 'dist/camera-webrtc-experiment',
  server: {
    androidScheme: 'https'
  }
};

export default config;
