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
    return jsonResponse({ status: "success", data: data });
  }

  // 2. "read": Read data from a specific sheet
  if (action === "read") {
    const sheetName = params.sheet;
    if (!sheetName)
      return jsonResponse({ status: "error", message: "Missing sheet name" });

    const sheet = ss.getSheetByName(sheetName);
    if (!sheet)
      return jsonResponse({ status: "error", message: "Sheet not found" });

    const data = sheet.getDataRange().getValues();
    if (data.length < 2) return jsonResponse({ status: "success", data: [] }); // Empty or just headers

    const headers = data[0];
    const rows = data.slice(1);
    const formatted = rows.map((r) => {
      let obj = {};
      headers.forEach((h, i) => (obj[h] = r[i]));
      return obj;
    });

    return jsonResponse({ status: "success", data: formatted });
  }

  return jsonResponse({ status: "error", message: "Invalid action" });
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
      return jsonResponse({ status: "error", message: "Sheet not found" });

    // Ensure we map data to the correct columns based on headers
    const headers = sheet
      .getRange(1, 1, 1, sheet.getLastColumn())
      .getValues()[0];
    const row = headers.map((h) => item[h] || ""); // Match header key to data value

    sheet.appendRow(row);
    return jsonResponse({ status: "success" });
  }

  // 4. "create_sheet": Create a new tab with specific headers
  if (action === "create_sheet") {
    const name = json.name;
    const headers = json.headers; // Array of strings

    if (ss.getSheetByName(name)) {
      return jsonResponse({ status: "error", message: "Sheet already exists" });
    }

    const newSheet = ss.insertSheet(name);
    newSheet.appendRow(headers);

    // Optional: Freeze header row
    newSheet.setFrozenRows(1);

    return jsonResponse({ status: "success", headers: headers });
  }

  return jsonResponse({ status: "error", message: "Invalid action" });
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(
    ContentService.MimeType.JSON
  );
}
