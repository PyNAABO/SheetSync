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

  // 5. "update": Update a row by ID
  if (action === "update") {
    const sheetName = json.sheet;
    const item = json.data;
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet)
      return jsonResponse({ status: "error", message: "Sheet not found" });

    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const idIndex = headers.indexOf("id");

    if (idIndex === -1)
      return jsonResponse({ status: "error", message: "No 'id' column found" });

    // Find row with matching ID
    let rowIndex = -1;
    // data[0] is headers. data[1] is row 2.
    for (let i = 1; i < data.length; i++) {
      // Ensure string comparison
      if (String(data[i][idIndex]) === String(item.id)) {
        rowIndex = i + 1; // 1-based index for getRange
        break;
      }
    }

    if (rowIndex === -1)
      return jsonResponse({ status: "error", message: "ID not found" });

    // Construct new row based on headers order
    const newRow = headers.map((h) => item[h] || "");

    // Write the row
    sheet.getRange(rowIndex, 1, 1, headers.length).setValues([newRow]);
    return jsonResponse({ status: "success" });
  }

  return jsonResponse({ status: "error", message: "Invalid action" });
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(
    ContentService.MimeType.JSON
  );
}
