# Mobile Release and OTA Guide

This Expo app is configured for:

- installable Android APK builds through EAS Build
- production store builds
- over-the-air updates through Expo Updates and EAS Update

## 1. One-time setup

Install EAS CLI globally if you use it often:

```bash
npm install -g eas-cli
```

You can also skip the global install and use the project scripts, which run EAS through `npm exec`.

Log in to Expo:

```bash
eas login
```

For CI or any non-interactive machine, set `EXPO_TOKEN` instead of logging in manually.

Initialize the Expo project on EAS if you have not done it already:

```bash
eas project:init
```

Copy the generated project ID into `mobile/.env`:

```env
EXPO_PUBLIC_EAS_PROJECT_ID=your-project-id
```

## 2. Environment variables

Create `mobile/.env` from `mobile/.env.example` and fill in:

```env
EXPO_PUBLIC_API_BASE_URL=https://your-api.example.com/api
EXPO_PUBLIC_APP_ENV=production
EXPO_PUBLIC_EAS_PROJECT_ID=your-project-id
EXPO_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
EXPO_PUBLIC_GOOGLE_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=
APP_VERSION=1.0.0
ANDROID_VERSION_CODE=1
IOS_BUILD_NUMBER=1
```

### Google Sign-In setup for Android APKs

If the app shows "Google sign-in is not configured", the APK was built without a
real Android OAuth client ID. For this project, create the Android credential
for:

- package name: `com.produceordering.app`
- current local release keystore SHA1: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`

Then copy the generated client ID into:

```env
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
```

You can also set:

```env
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
```

After updating `mobile/.env`, rebuild and reinstall the APK. Expo environment
variables are bundled into the native app at build time, so changing `.env`
alone will not fix an already installed APK.

## 3. Build an installable APK

For a production-like APK that installs directly on Android devices:

```bash
npx eas build -p android --profile production-apk
```

You can also use:

```bash
npm run build:apk
```

For internal preview APKs:

```bash
npm run build:preview-apk
```

## 4. Build a production Android app bundle

For Play Store submission:

```bash
npx eas build -p android --profile production
```

Or:

```bash
npm run build:android
```

## 5. Push OTA updates

Push an update to preview testers:

```bash
npx eas update --channel preview --message "Fix checkout totals"
```

Push an update to production users:

```bash
npx eas update --channel production --message "Improve order tracking"
```

Important:

- An already-built APK cannot be converted into an OTA-enabled app after installation.
- Set `EXPO_PUBLIC_EAS_PROJECT_ID` before building the APK, then rebuild and reinstall once.
- After that, future JS/UI changes can ship through `eas update` as long as the runtime version matches.

## 6. Versioning rules

- Bump `APP_VERSION` when you ship a new native release.
- Keep `runtimeVersion.policy` on `appVersion`.
- OTA updates work only for builds with the same runtime version.
- EAS Build is configured with remote app version management and `autoIncrement` for production profiles.

## 7. OTA behavior in the app

The app now:

- checks for updates at startup
- downloads available updates in the background
- automatically reloads into the new update after download
- falls back to the currently running version if the update fails

## 8. Local verification

Check the resolved Expo config:

```bash
npx expo config --type public
```

Create a release-style export:

```bash
npx expo export --platform web
```

Verify the scripted EAS command path without installing `eas-cli` locally:

```bash
npm exec --yes --package eas-cli@18.8.1 eas -- --version
```
