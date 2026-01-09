# 💰 SheetSync - Serverless Expense Tracker

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-active-green.svg)
![PWA](https://img.shields.io/badge/PWA-Ready-orange.svg)

**SheetSync** is a lightweight, privacy-focused Progressive Web App (PWA) that uses **Google Sheets** as your personal database. It enables you to track income and expenses without relying on third-party servers, ensuring your financial data remains yours.

## ✨ Features

- **🛡️ Privacy First**: Your data lives in your own Google Sheet. No 3rd party databases.
- **💸 Zero Cost**: Hosted for free on GitHub Pages (Frontend) and Google Apps Script (Backend).
- **📶 Offline Capable**: Works offline and syncs automatically when the connection is restored.
- **🔄 Auto-Sync**: Updates in real-time when switching devices or tabs.
- **📱 Mobile Ready**: installable as a native-like app on iOS and Android.
- **📊 Instant Insights**: Real-time calculation of Income, Expense, and Balance.

## 🛠️ Tech Stack

- **Frontend**: HTML5, Vanilla JavaScript, Tailwind CSS (via CDN).
- **Backend API**: Google Apps Script (GAS).
- **Database**: Google Sheets.

---

## 🚀 Deployment Guide (Create Your Own)

Follow these simple steps to deploy your own instance of SheetSync.

### 1. Database Setup (Google Sheets)

1. Create a new [Google Sheet](https://sheets.new).
2. Rename the tab (sheet) to `Sheet1` (Case sensitive).
3. In **Row 1**, add these exact headers:
   ```
   id | date | type | category | amount | note
   ```

### 2. Backend API (Google Apps Script)

1. In your Google Sheet, go to **Extensions > Apps Script**.
2. Copy the code from `backend.gs` (create this file if you haven't, content below).
3. Click **Deploy > New Deployment**.
4. Select **Web App** as the type.
5. **Important**: Set "Who has access" to **"Anyone"**. (This allows your app to write to the sheet).
6. Click **Deploy** and copy the **Web App URL**.

<details>
<summary>Click to view <code>backend.gs</code> code</summary>

```javascript
// backend.gs
function doGet(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet1");
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1);

  const formatted = rows.map((r) => {
    let obj = {};
    headers.forEach((h, i) => (obj[h] = r[i]));
    return obj;
  });

  return ContentService.createTextOutput(
    JSON.stringify({ status: "success", data: formatted })
  ).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet1");
  const json = JSON.parse(e.postData.contents);

  if (json.action === "add") {
    const d = json.data;
    sheet.appendRow([d.id, d.date, d.type, d.category, d.amount, d.note]);
    return ContentService.createTextOutput(
      JSON.stringify({ status: "success" })
    );
  }
}
```

</details>

### 3. Frontend Setup

1. **Fork** this repository.
2. Go to `Settings > Pages` in your repository.
3. Enable GitHub Pages from the `main` branch.
4. Open your live site URL.

### 4. Connect

1. Open your deployed App.
2. Click the **Settings (⚙️)** icon.
3. Paste your **Web App URL** and click **Connect**.

---

## 📲 Installing on Mobile

### Android (Chrome)

1. Open the app in Chrome.
2. Tap the **three dots** menu.
3. Select **"Add to Home Screen"** or **"Install App"**.

### iOS (Safari)

1. Open the app in Safari.
2. Tap the **Share** button (Square with arrow).
3. Scroll down and tap **"Add to Home Screen"**.

---

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## 📄 License

This project is licensed under the [MIT License](LICENSE).
