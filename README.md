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
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const params = e.parameter;
  const action = params.action;

  // 1. "get_sheets": List all sheets (tabs) and their headers
  if (action === "get_sheets") {
    const sheets = ss.getSheets();
    const data = sheets.map((s) => {
      const rows = s.getDataRange().getValues();
      return {
        name: s.getName(),
        headers: rows.length > 0 ? rows[0] : [],
      };
    });
    return ContentService.createTextOutput(
      JSON.stringify({ status: "success", data: data })
    ).setMimeType(ContentService.MimeType.JSON);
  }

  // 2. "read": Read data from a specific sheet
  if (action === "read") {
    const sheetName = params.sheet;
    if (!sheetName)
      return ContentService.createTextOutput(
        JSON.stringify({ status: "error", message: "Missing sheet name" })
      ).setMimeType(ContentService.MimeType.JSON);

    const sheet = ss.getSheetByName(sheetName);
    if (!sheet)
      return ContentService.createTextOutput(
        JSON.stringify({ status: "error", message: "Sheet not found" })
      ).setMimeType(ContentService.MimeType.JSON);

    const data = sheet.getDataRange().getValues();
    if (data.length < 2)
      return ContentService.createTextOutput(
        JSON.stringify({ status: "success", data: [] })
      ).setMimeType(ContentService.MimeType.JSON);

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

  return ContentService.createTextOutput(
    JSON.stringify({ status: "error", message: "Invalid action" })
  ).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const json = JSON.parse(e.postData.contents);
  const action = json.action;

  // 3. "add": Add a row to a specific sheet
  if (action === "add") {
    const sheetName = json.sheet;
    const item = json.data;
    const sheet = ss.getSheetByName(sheetName);

    if (!sheet)
      return ContentService.createTextOutput(
        JSON.stringify({ status: "error", message: "Sheet not found" })
      ).setMimeType(ContentService.MimeType.JSON);

    const headers = sheet
      .getRange(1, 1, 1, sheet.getLastColumn())
      .getValues()[0];
    const row = headers.map((h) => item[h] || "");

    sheet.appendRow(row);
    return ContentService.createTextOutput(
      JSON.stringify({ status: "success" })
    ).setMimeType(ContentService.MimeType.JSON);
  }

  // 4. "create_sheet": Create a new tab
  if (action === "create_sheet") {
    const name = json.name;
    const headers = json.headers;

    if (ss.getSheetByName(name))
      return ContentService.createTextOutput(
        JSON.stringify({ status: "error", message: "Sheet already exists" })
      ).setMimeType(ContentService.MimeType.JSON);

    const newSheet = ss.insertSheet(name);
    newSheet.appendRow(headers);
    newSheet.setFrozenRows(1);

    return ContentService.createTextOutput(
      JSON.stringify({ status: "success" })
    ).setMimeType(ContentService.MimeType.JSON);
  }

  // 5. "update": Update a row by ID
  if (action === "update") {
    const sheetName = json.sheet;
    const item = json.data;
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet)
      return ContentService.createTextOutput(
        JSON.stringify({ status: "error", message: "Sheet not found" })
      ).setMimeType(ContentService.MimeType.JSON);

    const data = sheet.getDataRange().getValues();
    const headers = data[0];

    // CASE-INSENSITIVE ID LOOKUP
    const idIndex = headers.findIndex(
      (h) => h.toString().toLowerCase() === "id"
    );

    if (idIndex === -1)
      return ContentService.createTextOutput(
        JSON.stringify({ status: "error", message: "No 'id' column found" })
      ).setMimeType(ContentService.MimeType.JSON);

    let rowIndex = -1;
    // Find row match
    const targetId = String(item.id || item.ID || item.Id);

    for (let i = 1; i < data.length; i++) {
      if (String(data[i][idIndex]) === targetId) {
        rowIndex = i + 1;
        break;
      }
    }

    if (rowIndex === -1)
      return ContentService.createTextOutput(
        JSON.stringify({ status: "error", message: "ID not found" })
      ).setMimeType(ContentService.MimeType.JSON);

    const newRow = headers.map((h) => item[h] || "");
    sheet.getRange(rowIndex, 1, 1, headers.length).setValues([newRow]);

    return ContentService.createTextOutput(
      JSON.stringify({ status: "success" })
    ).setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(
    JSON.stringify({ status: "error", message: "Invalid action" })
  ).setMimeType(ContentService.MimeType.JSON);
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
