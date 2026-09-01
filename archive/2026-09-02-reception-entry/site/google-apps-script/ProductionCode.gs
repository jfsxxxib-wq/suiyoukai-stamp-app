function doPost(event) {
  try {
    const properties = PropertiesService.getScriptProperties();
    const expectedSecret = properties.getProperty('SHEET_WRITE_SECRET');
    const spreadsheetId = properties.getProperty('SPREADSHEET_ID');
    const sheetName = properties.getProperty('SHEET_NAME') || '受付';
    const payload = JSON.parse(event.postData.contents || '{}');

    if (!expectedSecret || payload.secret !== expectedSecret || !spreadsheetId) {
      return jsonResponse({ ok: false, error: 'unauthorized' });
    }

    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    const sheet = spreadsheet.getSheetByName(sheetName);
    if (!sheet) return jsonResponse({ ok: false, error: 'sheet_not_found' });
    if (payload.action === 'health') {
      return jsonResponse({ ok: true, ready: true });
    }

    const receptionCode = String(payload.receptionCode || '').trim();
    const displayName = String(payload.displayName || '').trim();
    const clientRequestId = String(payload.clientRequestId || '').trim();
    const receptionAt = new Date(payload.receptionAt);

    if (!/^20260902-\d{3}$/.test(receptionCode)) {
      return jsonResponse({ ok: false, error: 'invalid_reception_code' });
    }
    if (!displayName || displayName.length > 40 || /[\u0000-\u001f\u007f]/.test(displayName) ||
        !/^[0-9a-f-]{36}$/i.test(clientRequestId) || Number.isNaN(receptionAt.getTime())) {
      return jsonResponse({ ok: false, error: 'invalid_reception_data' });
    }

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const lastRow = sheet.getLastRow();
      if (lastRow >= 2) {
        const existingRows = sheet.getRange(2, 1, lastRow - 1, 4).getDisplayValues();
        if (existingRows.some((row) => row[0] === receptionCode || row[3] === clientRequestId)) {
          return jsonResponse({ ok: true, duplicate: true });
        }
        if (existingRows.some((row) => row[1] === displayName)) {
          return jsonResponse({ ok: false, error: 'duplicate_name' });
        }
      }

      sheet.appendRow([receptionCode, displayName, receptionAt, clientRequestId]);
      SpreadsheetApp.flush();
      return jsonResponse({ ok: true, duplicate: false });
    } finally {
      lock.releaseLock();
    }
  } catch (error) {
    return jsonResponse({ ok: false, error: 'unexpected_error' });
  }
}

function jsonResponse(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}
