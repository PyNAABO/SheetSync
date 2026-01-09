💰 SheetSync - Serverless Expense Tracker

A lightweight, offline-capable Progressive Web App (PWA) that uses Google Sheets as a database. Built for the budget-conscious developer who wants data privacy and zero hosting costs.

Live Demo: [Link to your GitHub Page]

✨ Features

Zero Cost: Hosted on GitHub Pages, backend on Google Apps Script.

Privacy First: Data lives in your personal Google Sheet, not a third-party server.

Offline Mode: PWA capabilities allow it to load without internet (syncs when back online).

Mobile Native Feel: Installable on Android/iOS via "Add to Home Screen".

Visual Dashboard: Real-time calculation of Income, Expense, and Balance.

🛠️ Tech Stack

Frontend: HTML5, Tailwind CSS (CDN), Vanilla JavaScript.

Backend: Google Apps Script (REST API).

Database: Google Sheets.

🚀 How to Deploy (Your Own Version)

1. Database Setup

Create a new Google Sheet.

Rename the tab (sheet) to Sheet1.

In Row 1, add these exact headers:
id | date | type | category | amount | note

2. Backend API

Open your Sheet > Extensions > Apps Script.

Copy the code from backend.gs (provided in this repo's docs or asking the author).

Click Deploy > New Deployment > Select Web App.

Set Who has access to "Anyone" (Required for the app to talk to Google).

Copy the generated Web App URL.

3. Frontend Setup

Fork this repository.

Enable GitHub Pages in your repo settings (Source: main branch).

Open your live site link.

Click the Settings (⚙️) icon.

Paste your Web App URL and click Connect.

📱 Screenshots

(Add screenshots of your app running on the Galaxy M35 here)

📄 License

MIT License - Feel free to fork and modify!
