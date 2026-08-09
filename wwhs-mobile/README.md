# NITH Mobile Community Application

> A members-only, real-time live chat mobile application wrapper for NITH tech enthusiasts.

---

## Features

- **Full-Screen Native Experience**: High-performance WebView container with smooth navigation.
- **Hardware Back Button Handling**: Native Android back button intercepts in-app history navigation.
- **Google Authentication Support**: Seamless OAuth 2.0 authentication flow.
- **Adaptive Launcher Icons**: Custom launcher icon and dark splash screen.
- **Offline Error Screen**: Friendly fallback overlay with retry capability when network drops.

---

## Technology Stack

- **Framework**: Expo SDK 54 + React Native 0.81
- **Language**: TypeScript
- **Container**: React Native WebView (`react-native-webview`)
- **Status Bar**: Expo Status Bar

---

## Getting Started

### Prerequisites

- Node.js (v18+)
- Expo CLI (`npm install -g expo-cli`)
- Android Studio / Android SDK (for Android builds)

### Development

1. **Install dependencies**:
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Start Expo Dev Server**:
   ```bash
   npm start
   ```

3. **Run on Web**:
   ```bash
   npm run web
   ```

### Building Standalone APK

1. **Run Expo Prebuild**:
   ```bash
   npx expo prebuild --platform android --clean
   ```

2. **Assemble Release / Debug APK**:
   ```bash
   cd android
   .\gradlew assembleDebug
   ```

The compiled APK will be generated at `android/app/build/outputs/apk/debug/app-debug.apk`.

---

## License

Licensed under the [MIT License](../LICENSE).
