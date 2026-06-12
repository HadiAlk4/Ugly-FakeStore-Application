# FakeStore Project

Welcome to the FakeStore project! This is a complete full-stack mobile e-commerce application consisting of a React Native mobile application and an Express.js backend server.

## Project Structure

The project is divided into two main parts:

- `FakeStore/`: The mobile client application built with React Native and Expo.
- `fake-store-server/`: The backend REST API server built with Node.js, Express, and SQLite.

---

## 1. Backend Server (`fake-store-server`)

The backend is built with Express and uses a SQLite database to store products, users, and orders. It also includes JWT authentication and Swagger documentation.

### Features
- RESTful API endpoints
- SQLite Database (`fake-store.sqlite3`)
- JWT Authentication
- Unit Testing with Jest & Supertest
- API Documentation using Swagger UI

### Getting Started

1. Navigate to the server directory:
   ```bash
   cd fake-store-server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server (uses nodemon):
   ```bash
   npm start
   ```
   *The server typically runs on `http://localhost:3000` (check the console for the exact port).*

4. Run tests:
   ```bash
   npm test
   ```

---

## 2. Mobile App (`FakeStore`)

The client is a cross-platform mobile application built using React Native and Expo. It handles user authentication, product browsing, shopping cart management, and order history.

### Features
- Built with React Native & Expo
- State Management using Redux Toolkit (`react-redux`)
- Navigation using React Navigation (Stack & Bottom Tabs)
- Protected routes (requires login for Cart and Orders)

### Getting Started

1. Navigate to the app directory:
   ```bash
   cd FakeStore
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Expo development server:
   ```bash
   npx expo start
   ```
4. Use the **Expo Go** app on your iOS/Android device to scan the QR code and preview the application, or run it on a local emulator.

---

## Setup Requirements

- **Node.js**: Make sure you have Node.js (version >= 21.0.0 is recommended by the server engine) installed.
- **Expo CLI**: Used for running the React Native app.

## Notes
- Make sure the server (`fake-store-server`) is running before interacting with products or authenticating within the mobile app.
- If you are testing on a physical device via Expo Go, you may need to update the API base URL in the React Native app to point to your computer's local IP address instead of `localhost`.
