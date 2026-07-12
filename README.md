# Sclear 
A simple web-based inventory and sales tracking app for a store. It lets you manage inventory items, record sales, view dashboard metrics, export reports to Excel, and keep a sell history log.

## Features

- User login and logout
- Add, edit, and delete inventory items
- Sell items with quantity and remark notes
- Track stock quantity and sold quantity
- Dashboard with sales, cost, profit, and stock value summaries
- Sell history view with delete option
- Export inventory data to Excel

## Project Structure

- index.html: Main application layout and views
- css/: Styling for the app
- js/config.js: Firebase configuration and shared app state
- js/auth.js: Login/logout and authentication handling
- js/dashboard.js: Dashboard calculations and updates
- js/inventory.js: Inventory form, selling logic, table rendering, and Excel export
- js/history.js: Sell history display and delete functionality

## Setup

1. Open the project folder in a browser or serve it from a local web server.
2. Make sure Firebase is configured correctly in js/config.js.
3. Ensure your Firestore database has collections named:
   - inventory
   - salesHistory

## Usage

- Log in with your configured Firebase account.
- Add new inventory items from the Inventory view.
- Sell items by entering quantity and an optional remark.
- View recent sales in the Sell History menu.
- Export inventory data using the Export to Excel button.

## Notes

- The app uses Firebase Firestore for data storage.
- The export feature depends on the XLSX library loaded in index.html.
