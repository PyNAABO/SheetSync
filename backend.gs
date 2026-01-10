function doGet(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const params = e.parameter;
  const action = params.action;

  // 1. "get_sheets": List all sheets (tabs) and their headers
  if (action === "get_sheets") {
    const sheets = ss.getSheets();
    const data = sheets
      .filter((s) => !s.getName().startsWith("_")) // Hide system sheets
      .map((s) => {
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
    if (data.length < 2) return jsonResponse({ status: "success", data: [] });

    const headers = data[0];
    const rows = data.slice(1);
    const formatted = rows.map((r) => {
      let obj = {};
      headers.forEach((h, i) => (obj[h] = r[i]));
      return obj;
    });

    return jsonResponse({ status: "success", data: formatted });
  }

  // 3. "get_settings": Read app settings from hidden sheet
  if (action === "get_settings") {
    const settingsSheetName = "_SheetSync_Settings";
    let sheet = ss.getSheetByName(settingsSheetName);

    if (!sheet) {
      return jsonResponse({ status: "success", data: {} });
    }

    const data = sheet.getDataRange().getValues();
    const settings = {};

    // Skip header row, parse key-value pairs
    for (let i = 1; i < data.length; i++) {
      const key = data[i][0];
      const value = data[i][1];
      if (key) {
        try {
          settings[key] = JSON.parse(value);
        } catch (e) {
          settings[key] = value;
        }
      }
    }

    return jsonResponse({ status: "success", data: settings });
  }

  return jsonResponse({ status: "error", message: "Invalid action" });
}

function doPost(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const json = JSON.parse(e.postData.contents);
  const action = json.action;

  // Helper: Ensure 'id' column exists and all rows have IDs
  function ensureIdColumn(sheet) {
    const lastCol = sheet.getLastColumn();
    // If empty sheet, just return 0 (col index)
    if (lastCol === 0) return 0;

    // Get headers
    const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    let idIndex = headers.findIndex((h) => String(h).toLowerCase() === "id");

    // If no ID column, add it at the start
    if (idIndex === -1) {
      sheet.insertColumnBefore(1);
      sheet.getRange(1, 1).setValue("id");
      idIndex = 0;
    }

    // Fill missing IDs
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      const idCol = idIndex + 1; // 1-based index
      const range = sheet.getRange(2, idCol, lastRow - 1, 1);
      const values = range.getValues();
      let modified = false;

      for (let i = 0; i < values.length; i++) {
        if (!values[i][0]) {
          // Check for empty cell
          values[i][0] = Utilities.getUuid();
          modified = true;
        }
      }

      if (modified) {
        range.setValues(values);
      }
    }

    return idIndex;
  }

  // 3. "add": Add a row to a specific sheet
  if (action === "add") {
    const sheetName = json.sheet;
    const item = json.data;
    const sheet = ss.getSheetByName(sheetName);

    if (!sheet)
      return jsonResponse({ status: "error", message: "Sheet not found" });

    // Ensure id column exists
    ensureIdColumn(sheet);

    const headers = sheet
      .getRange(1, 1, 1, sheet.getLastColumn())
      .getValues()[0];
    const row = headers.map((h) => item[h] || "");

    sheet.appendRow(row);
    return jsonResponse({ status: "success" });
  }

  // 4. "create_sheet": Create a new tab
  if (action === "create_sheet") {
    const name = json.name;
    const headers = json.headers;

    if (ss.getSheetByName(name)) {
      return jsonResponse({ status: "error", message: "Sheet already exists" });
    }

    const newSheet = ss.insertSheet(name);
    newSheet.appendRow(headers);
    newSheet.setFrozenRows(1);

    return jsonResponse({ status: "success", headers: headers });
  }

  // 5. "update": Update a row by ID (Case-Insensitive)
  if (action === "update") {
    const sheetName = json.sheet;
    const item = json.data;
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet)
      return jsonResponse({ status: "error", message: "Sheet not found" });

    // Ensure id column exists (creates if missing)
    ensureIdColumn(sheet);

    const data = sheet.getDataRange().getValues();
    const headers = data[0];

    // CASE-INSENSITIVE ID LOOKUP
    const idIndex = headers.findIndex(
      (h) => h.toString().toLowerCase() === "id"
    );

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
      return jsonResponse({ status: "error", message: "ID not found" });

    const newRow = headers.map((h) => item[h] || "");
    sheet.getRange(rowIndex, 1, 1, headers.length).setValues([newRow]);

    return jsonResponse({ status: "success" });
  }

  // 6. "delete": Delete a row by ID
  if (action === "delete") {
    const sheetName = json.sheet;
    const id = json.id;
    const sheet = ss.getSheetByName(sheetName);

    if (!sheet)
      return jsonResponse({ status: "error", message: "Sheet not found" });

    // Ensure id column exists (creates if missing)
    ensureIdColumn(sheet);

    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const idIdx = headers.findIndex((h) => h.toString().toLowerCase() === "id");

    if (idIdx === -1)
      return jsonResponse({ status: "error", message: "No ID col" });

    // Find row
    let rowIndex = -1;
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][idIdx]) === String(id)) {
        rowIndex = i + 1;
        break;
      }
    }

    if (rowIndex === -1)
      return jsonResponse({ status: "error", message: "ID not found" });

    sheet.deleteRow(rowIndex);
    return jsonResponse({ status: "success" });
  }

  // 6. "save_settings": Save app settings to hidden sheet
  if (action === "save_settings") {
    const settingsSheetName = "_SheetSync_Settings";
    let sheet = ss.getSheetByName(settingsSheetName);

    // Create sheet if not exists
    if (!sheet) {
      sheet = ss.insertSheet(settingsSheetName);
      sheet.appendRow(["key", "value"]);
      // Hide the settings sheet
      sheet.hideSheet();
    }

    const settings = json.data || {};

    // Clear existing data (keep header)
    if (sheet.getLastRow() > 1) {
      sheet.deleteRows(2, sheet.getLastRow() - 1);
    }

    // Write settings as key-value pairs
    for (const key in settings) {
      const value =
        typeof settings[key] === "object"
          ? JSON.stringify(settings[key])
          : settings[key];
      sheet.appendRow([key, value]);
    }

    return jsonResponse({ status: "success" });
  }

  // 7. "add_column": Add a new header column
  if (action === "add_column") {
    const sheetName = json.sheet;
    const colName = json.name;
    const sheet = ss.getSheetByName(sheetName);

    if (!sheet)
      return jsonResponse({ status: "error", message: "Sheet not found" });
    if (!colName)
      return jsonResponse({ status: "error", message: "Missing column name" });

    // Check if exists
    const lastCol = sheet.getLastColumn();
    const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    if (
      headers
        .map((h) => String(h).toLowerCase())
        .includes(String(colName).toLowerCase())
    ) {
      return jsonResponse({
        status: "error",
        message: "Column already exists",
      });
    }

    sheet.insertColumnAfter(lastCol);
    sheet.getRange(1, lastCol + 1).setValue(colName);
    return jsonResponse({ status: "success" });
  }

  // 8. "delete_column": Delete a header column
  if (action === "delete_column") {
    const sheetName = json.sheet;
    const colName = json.name;
    const sheet = ss.getSheetByName(sheetName);

    if (!sheet)
      return jsonResponse({ status: "error", message: "Sheet not found" });
    if (!colName)
      return jsonResponse({ status: "error", message: "Missing column name" });
    if (String(colName).toLowerCase() === "id")
      return jsonResponse({
        status: "error",
        message: "Cannot delete ID column",
      });

    const lastCol = sheet.getLastColumn();
    const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    const colIndex = headers.findIndex(
      (h) => String(h).toLowerCase() === String(colName).toLowerCase()
    );

    if (colIndex === -1)
      return jsonResponse({ status: "error", message: "Column not found" });

    sheet.deleteColumn(colIndex + 1); // 1-based index
    return jsonResponse({ status: "success" });
  }

  return jsonResponse({ status: "error", message: "Invalid action" });
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(
    ContentService.MimeType.JSON
  );
}
