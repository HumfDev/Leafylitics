# Leafylitics Mobile App

React Native mobile application for iOS and Android, providing instant plant disease detection for hobbyist gardeners and field workers.

## 🎯 Target Users

- **Primary**: Hobbyist Gardeners
- **Secondary**: Extension Agents (field use)

## ✨ Key Features

### MVP (v1)
- **Camera Integration**: Real-time photo capture with quality feedback
- **Image Analysis**: Upload to backend for ML inference
- **Results Visualization**: Display diagnosis with confidence scores
- **Grad-CAM Overlay**: Visual explanation of diseased regions
- **Plant Tracking**: Save plants to "My Garden" for monitoring
- **Offline Support**: Queue images when offline, sync when connected

### v1+ Features
- **On-Device Inference**: TensorFlow Lite for low-latency predictions
- **Recovery Tracking**: Schedule re-checks with reminders
- **Treatment Recommendations**: Actionable care tips per diagnosis
- **Community Support**: Request expert review for low-confidence results

## 🛠️ Tech Stack

- **Framework**: React Native with Expo
- **Camera**: `react-native-vision-camera` or Expo Camera
- **State Management**: Zustand or Redux Toolkit
- **Navigation**: React Navigation
- **Styling**: Styled Components or Tailwind (NativeWind)
- **Networking**: Axios or React Query
- **Local Storage**: AsyncStorage, SQLite (for offline queue)
- **ML (On-Device)**: TensorFlow Lite, ONNX Runtime Mobile

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- iOS: Xcode (Mac only)
- Android: Android Studio

### Installation

```bash
cd mobile_app
npm install
```

### Development

```bash
# Start Metro bundler
npx expo start

# Run on iOS simulator
npx expo run:ios

# Run on Android emulator
npx expo run:android

# Run on physical device
# Scan QR code with Expo Go app
```

### Environment Variables

Create `.env` file:

```bash
API_URL=http://localhost:8000
GOOGLE_API_KEY=your_key_here
```

## 📁 Project Structure

```
mobile_app/
├── src/
│   ├── assets/              # Images, icons, fonts
│   ├── components/          # Reusable UI components
│   ├── navigation/          # Navigation setup
│   ├── screens/             # Main screens
│   │   ├── CameraScreen.tsx
│   │   ├── ResultsScreen.tsx
│   │   ├── MyPlantsScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── services/            # API client, local storage
│   ├── stores/              # State management
│   ├── theme/               # Design system
│   └── utils/               # Helper functions
├── app.json                 # Expo configuration
├── babel.config.js
├── package.json
└── README.md
```

## 🎨 Design System

See `src/theme/` for design tokens:
- Colors: Forest Green, Earth Beige, Deep Blue
- Typography: Inter Bold, Source Sans Pro
- Spacing: 8pt grid system

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# E2E tests (Detox)
npm run test:e2e
```

## 📦 Building for Production

### iOS

```bash
# Build with EAS
eas build --platform ios

# Local build
npx expo run:ios --configuration Release
```

### Android

```bash
# Build with EAS
eas build --platform android

# Local build
npx expo run:android --variant release
```

## 🔧 Configuration

### Expo Configuration (`app.json`)

Key settings:
- **App name**: Leafylitics
- **Bundle ID**: com.leafylitics.app
- **Permissions**: Camera, Photo Library, Location (optional)

### API Integration

See `src/services/api.ts` for backend communication.

## 📱 Screens Overview

### CameraScreen
- Live camera viewfinder
- Quality checks (blur, lighting, leaf presence)
- Capture button with haptic feedback
- Upload from gallery option

### ResultsScreen
- Top diagnosis with confidence
- Grad-CAM overlay (toggle on/off)
- Top-3 predictions
- Care tips and recommendations
- Save to My Garden / Request Review

### MyPlantsScreen
- List of saved plants
- Thumbnail images
- Latest diagnosis per plant
- Recovery timeline

### SettingsScreen
- Privacy settings (data sharing consent)
- Notification preferences
- Account management
- About / Help

## 🌐 Offline Support

1. Images captured offline are stored locally (AsyncStorage)
2. Queued for upload when network detected
3. User notified of sync status
4. Resumable uploads for large images

## 🔐 Security

- API requests use JWT authentication
- Images encrypted before local storage
- User consent required for data sharing
- Opt-in for location tracking

## 📊 Performance Targets

- **App load time**: <2.5s
- **Camera launch**: <1s
- **Image upload**: <8s on 3G
- **On-device inference** (future): <150ms

## 🐛 Troubleshooting

### Common Issues

**Metro bundler not starting**:
```bash
npx expo start --clear
```

**iOS build fails**:
```bash
cd ios && pod install && cd ..
```

**Android emulator issues**:
```bash
adb kill-server && adb start-server
```

## 📚 Resources

- [React Native Docs](https://reactnative.dev/)
- [Expo Docs](https://docs.expo.dev/)
- [Leafylitics API Docs](http://localhost:8000/docs)

---

**Status**: 🚧 In Development
