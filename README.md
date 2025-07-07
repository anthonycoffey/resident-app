# Resident App

A mobile application for residents to manage their property-related needs, including service requests, profile management, and communication with property management.

## Table of Contents

*   [About The Project](#about-the-project)
*   [Built With](#built-with)
*   [Getting Started](#getting-started)
    *   [Prerequisites](#prerequisites)
    *   [Installation](#installation)
*   [Configuration](#configuration)
*   [Usage](#usage)
*   [Project Structure](#project-structure)
*   [Backend Services](#backend-services)

## About The Project

This is a cross-platform mobile application built with React Native and Expo. It provides residents with a convenient way to submit and track service requests, manage their personal and vehicle information, and stay connected with property management. The app features a clean, modern interface and leverages Firebase for user authentication and data storage, and a custom "Phoenix API" for service request management.

## Built With

*   [React Native](https://reactnative.dev/)
*   [Expo](https://expo.dev/)
*   [TypeScript](https://www.typescriptlang.org/)
*   [Expo Router](https://expo.github.io/router/)
*   [Firebase](https://firebase.google.com/)
*   [Sentry](https://sentry.io/)

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

*   Node.js and npm
*   Expo CLI
    ```sh
    npm install -g expo-cli
    ```
*   Android Studio or Xcode for running on an emulator/simulator.

### Installation

1.  Clone the repo
    ```sh
    git clone <your-repository-url>
    ```
2.  Install NPM packages
    ```sh
    npm install
    ```

## Configuration

This project uses environment variables to configure connections to backend services. Create a `.env` file in the root of the project and add the following variables:

```
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=

# Phoenix API
EXPO_PUBLIC_PHOENIX_API_URL=
```

You will also need to configure `google-services.json` for Android and `GoogleService-Info.plist` for iOS to connect to Firebase.

## Usage

To run the application in development mode:

*   **Start the development server:**
    ```sh
    npm start
    ```
*   **Run on Android:**
    ```sh
    npm run android
    ```
*   **Run on iOS:**
    ```sh
    npm run ios
    ```
*   **Run on Web:**
    ```sh
    npm run web
    ```

## Project Structure

The project follows a standard Expo and React Native structure:

*   `app/`: Contains all the screens and routes of the application, using Expo Router's file-based routing.
    *   `(auth)/`: Authentication-related screens.
    *   `(resident)/`: Screens for the resident portal.
    *   `(service-provider)/`: Screens for the service provider portal.
*   `assets/`: Static assets like images and fonts.
*   `components/`: Reusable UI components.
*   `constants/`: Global constants, such as colors.
*   `lib/`: Core application logic, services, and configuration.
    *   `config/`: Configuration files, like Firebase setup.
    *   `context/`: React context providers.
    *   `providers/`: Higher-level providers, like the `AuthProvider`.
    *   `services/`: Services for interacting with external APIs.

## Backend Services

The application utilizes two main backend systems:

### Firebase

Firebase is used for:

*   **Authentication:** Handling user sign-up, login, and session management.
*   **Firestore:** Storing user profile data, including personal information and vehicle details.
*   **Push Notifications:** Sending notifications to residents' devices.

### Phoenix API

The Phoenix API is a custom backend service that manages:

*   **Service Requests:** Creating, tracking, and managing service requests submitted by residents.
*   **Job Management:** Handling the assignment and status updates of jobs for service providers.

This separation of concerns allows for a robust and scalable architecture, with Firebase handling user-centric features and the Phoenix API managing the core business logic of service requests.
