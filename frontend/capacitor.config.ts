import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.firstfill.app",
  appName: "FirstFill",
  webDir: "dist",
  // Remove server block for production builds — uses bundled dist/
  server: {
    url: "http://localhost:5173",
    cleartext: true,
  },
  ios: {
    contentInset: "always",
  },
  android: {
    allowMixedContent: true,
  },
};

export default config;
