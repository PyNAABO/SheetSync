# ⚡ SheetSync OS

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-active-green.svg)
![PWA](https://img.shields.io/badge/PWA-Ready-orange.svg)

**SheetSync OS** is a versatile, serverless personal OS that turns **Google Sheets** into a powerful database for your life. Whether you're tracking finances, habits, workouts, or journals, SheetSync OS adapts to your needs without relying on third-party servers.

## ✨ Features

- **🛡️ Privacy First**: Your data lives in your own Google Sheet. You own it completely.
- **♾️ Infinite Possibilities**: Create any tracker you want:
  - **Finance**: Income, Expenses, Balance (Auto-analyzed).
  - **Habits**: Daily check-ins with toggle support (✅/❌).
  - **Health**: Workout logs, weight tracking, sleep journals.
  - **Inventory**: Store item lists, serial numbers, locations.
- **💸 Zero Cost**: 100% Free. Hosted on GitHub Pages & Google Apps Script.
- **📶 Offline First**: Works offline and syncs automatically when online.
- **📱 Native Feel**: Installable PWA with smooth animations and haptic feedback.

## 🛠️ How It Works

SheetSync OS reads the headers of your Google Sheet to determine how to display data:

- **Finance Mode**: If headers include `amount`, `type`, and `category`, it automatically shows income/expense stats.
- **Habit Mode**: If you use toggle columns (checkboxes), it tracks your completion streaks.
- **Generic Lists**: For everything else, it renders a clean, searchable list card.

---

## 🚀 Deployment Guide

### 1. Database Setup (Google Sheets)

1. Create a new [Google Sheet](https://sheets.new).
2. Create tabs (sheets) for each tracker you want (e.g., `Finance`, `Habits`, `Gym`).
3. Add headers in **Row 1**.
   - _Example (Finance)_: `id | date | type | category | amount | note`
   - _Example (Habits)_: `id | date | Read Book | Meditate | Water`
   - _Example (Gym)_: `id | date | Exercise | Weight | Reps`

### 2. Backend API (Google Apps Script)

1. In your Google Sheet, go to **Extensions > Apps Script**.
2. Copy the code from `backend.gs` in this repo.
3. Click **Deploy > New Deployment**.
4. Select **Web App**.
5. Set permission to **"Anyone"** (Required for the app to write to your sheet).
6. Copy the **Web App URL**.

### 3. Frontend Setup

1. **Fork** this repository.
2. Go to `Settings > Pages`, enable GitHub Pages from `main`.
3. Open your deployed URL.
4. Click **Settings ⚙️** in the app, paste your Web App URL, and hit **Connect**.

---

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests to add new "apps" (sheet templates) or features.

## 📄 License

MIT License.
