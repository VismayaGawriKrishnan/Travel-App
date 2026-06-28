# Sreechakra Travel App

A cross-platform travel and vehicle booking mobile application built with Expo and React Native. This app streamlines booking, vehicle selection, and owner management with a clean mobile-first UI.

## Key Features

- Authentication and secure login flow
- Booking details collection and trip confirmation
- Vehicle selection screens for Innova, 11-seater, and 17-seater options
- Owner home dashboard for managing bookings and trips
- Supabase integration for backend data storage and authentication
- Expo-managed workflow for Android, iOS, and web development

## Technology Stack

- Expo `~54.0.33`
- React Native `0.81.5`
- React `19.1.0`
- React Navigation
- Supabase JavaScript client
- Async Storage
- React Native Calendars
- Expo Blur, Linear Gradient, Status Bar, and System UI
- DateTime picker and native select dropdowns

## Collaborators 

- Neelakandan Nampoothiri N - Project lead & Full-Stack Developer
- Vismaya Gawri Krishnan - Frontend Developer & UI/UX Designer
- Abhiram J - Backend Developer & Database Administrator 
- Vysakh P - Quality Assurance & Testing


## Repository Structure

- `my-app/` — main Expo application folder
- `my-app/App.js` — app entry point
- `my-app/index.js` — Expo bootstrap file
- `my-app/app.json` — Expo configuration
- `lib/supabase.js` — Supabase client setup
- `screens/` — application screens and navigation flow
- `assets/` — shared assets and images

## Prerequisites

- Node.js installed
- npm or Yarn installed
- Expo CLI (`npm install -g expo-cli`) recommended
- Android Studio or Xcode for native testing

## Installation

From the project root, install dependencies:

```bash
cd Sreechakra_app/my-app
npm install
```

## Running Locally

Start the Expo development server:

```bash
npm start
```

From Expo CLI, choose one of:

- Android emulator or connected device
- iOS simulator or device
- Web browser

Run directly on Android:

```bash
npm run android
```

Run directly on iOS:

```bash
npm run ios
```

## Configuration

Update `lib/supabase.js` with your Supabase project URL and public key before using backend features.

## Notes

- This project uses Expo-managed workflow and is optimized for quick iteration.
- If you add native modules, update the Expo configuration and rebuild the app.
- Test booking and authentication flows on real devices for the best accuracy.

## Contribution

1. Create a feature branch.
2. Make your changes.
3. Test on target platforms.
4. Open a pull request with a summary of your changes.

