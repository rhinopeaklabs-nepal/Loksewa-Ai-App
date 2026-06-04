# Loksewa AI Mobile

This mobile app is Flutter-only. The active source lives in `apps/mobile/lib`, and generated Flutter platform folders such as `android/` and `ios/` should be created inside this directory with Flutter tooling.

## First Setup

```bash
cd apps/mobile
flutter pub get
flutter create --platforms=android,ios .
```

## Run

```bash
flutter run --dart-define=API_URL=http://10.0.2.2:8000
```

## Build APK

```bash
flutter build apk --release --dart-define=API_URL=https://api.yourdomain.com/
```

The root Kotlin Android module is kept only as a legacy opt-in target. Use the Flutter app here for mobile development.
