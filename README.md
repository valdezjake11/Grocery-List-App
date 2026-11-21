# Smart Grocery List App

**Student:** Jake Valdez  
**Section:** BSINTE-2a  
**Platform:** Android / iOS (React Native + Expo)  
**Language:** JavaScript

## Description

Smart Grocery List helps users organize grocery shopping. Add items, set quantities and categories, search the list, mark items as purchased, edit or delete entries, and save the list locally on the device.

This repository includes the Expo mobile-app source code and a separate browser-based grocery-list demo.

## Features

- Add grocery items with a quantity and category.
- Edit and delete grocery items.
- Mark items as purchased or not purchased.
- Search items by name and filter by category.
- View total and completed item counts.
- Clear completed items.
- Save the mobile app's list locally using AsyncStorage.
- Save the browser demo's list locally using browser localStorage.

## Mobile App: Installation and Run

### Requirements

- Node.js LTS and npm
- Expo Go on an Android/iOS device, or an Android emulator

### Steps

1. Clone or download this repository.
2. Open a terminal in the project folder.
3. Install dependencies:

   `npm install`

4. Start Expo:

   `npx expo start`

5. Scan the QR code with Expo Go, or launch an Android emulator and press `a` in the Expo terminal.

## Browser Demo

Open `grocery.html` in a web browser, or visit the GitHub Pages path:

`https://valdezjake11.github.io/Grocery-List-App/grocery.html`

The browser demo stores its list in that browser's local storage. Its data is separate from the Expo mobile app's AsyncStorage data.

## Project Structure

- `App.js` — main React Native app screen and grocery-list functionality.
- `app.json` — Expo app configuration.
- `package.json` — project dependencies and scripts.
- `babel.config.js` — Babel configuration for Expo.
- `grocery.html` — browser-based grocery-list demo.
- `index.html` — project landing page for GitHub Pages.
- `Smart_Grocery_List_Source.zip` — packaged source files.

## Student Information

**Name:** Jake Valdez  
**Section:** BSINTE-2a

---

Mobile application final project.
