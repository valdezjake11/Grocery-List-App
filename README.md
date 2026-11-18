# Smart Grocery List

**Student Name:** Jake Valdez  
**Section:** BSINTE-2a  
**Project Type:** Mobile Application  
**Platform:** Android and iOS (Expo / React Native)

## Project Description
Smart Grocery List helps users organize grocery shopping in one place. Users can add grocery products, specify quantities, group products by category, search their list, update item details, and mark products as purchased. The app displays a shopping summary and saves the list locally on the device.

## Features
- Add grocery items with a name, quantity, and category
- Edit and delete grocery items with confirmation
- Mark items as purchased or not purchased
- Search items by name
- Filter by category: Produce, Dairy, Bakery, Meat, Pantry, Drinks, and Other
- View total, remaining, and purchased item counts
- Clear completed items
- Automatically save and reload data using AsyncStorage

## Technologies
- React Native
- Expo
- JavaScript
- AsyncStorage

## Installation and Run
1. Install Node.js LTS from https://nodejs.org/.
2. Clone this repository:
   ```bash
   git clone https://github.com/valdezjake11/Grocery-List-App.git
   cd Grocery-List-App
   ```
3. Download `Smart_Grocery_List_Source.zip` from the repository, then extract its contents into the repository folder. The archive contains the complete Expo app source.
4. Install dependencies:
   ```bash
   npm install
   ```
5. Start Expo:
   ```bash
   npx expo start
   ```
6. Scan the QR code with Expo Go, or press `a` to open an Android emulator.

## Student Information
- **Name:** Jake Valdez
- **Section:** BSINTE-2a

## Data Storage
Grocery items are stored locally on the device using AsyncStorage. Data is not synchronized to an online account or other devices.

**Testing note:** Run the app on Expo Go or an Android emulator and verify all features before final submission.
