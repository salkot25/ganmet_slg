/**
 * ============================================================================
 * GOOGLE APPS SCRIPT: PLN KWH METER DASHBOARD API (GET & POST)
 * ============================================================================
 * 
 * Target Spreadsheet URL:
 * https://docs.google.com/spreadsheets/d/1YYkRmszbtxTP9tryVjLn6egopDakjYlkdphUIkvRpNc/edit?gid=57517366#gid=57517366
 * 
 * SPREADSHEET ID : 1YYkRmszbtxTP9tryVjLn6egopDakjYlkdphUIkvRpNc
 * SHEET GID      : 57517366
 * ============================================================================
 */

var SPREADSHEET_ID = '1YYkRmszbtxTP9tryVjLn6egopDakjYlkdphUIkvRpNc';
var TARGET_GID = '57517366';

/**
 * Mendapatkan instance Sheet yang dituju
 */
function getTargetSheet() {
  var ss;
  try {
    ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  } catch (err) {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  }

  if (!ss) return null;

  var allSheets = ss.getSheets();
  for (var s = 0; s < allSheets.length; s++) {
    if (String(allSheets[s].getSheetId()) === TARGET_GID) {
      return allSheets[s];
    }
  }
  return allSheets[0];
}

/**
 * 1. GET Request: Membaca seluruh data Spreadsheet
 */
function doGet(e) {
  try {
    var params = e ? e.parameter : {};
    var limit = params.limit ? parseInt(params.limit, 10) : null;
    var filterUnitup = params.unitup ? String(params.unitup).trim() : null;

    var sheet = getTargetSheet();
    if (!sheet) {
      return createJsonResponse({
        status: 'error',
        message: 'Spreadsheet tidak dapat dibuka.'
      });
    }

    var dataRange = sheet.getDataRange();
    var values = dataRange.getValues();

    if (values.length < 2) {
      return createJsonResponse({
        status: 'success',
        total: 0,
        data: []
      });
    }

    var headers = values[0].map(function(h) {
      return String(h).trim();
    });

    var records = [];
    var maxRows = limit ? Math.min(values.length, limit + 1) : values.length;

    for (var i = 1; i < maxRows; i++) {
      var row = values[i];
      if (!row[0] && !row[5]) continue; // Lewati baris kosong

      var rowObj = {};
      for (var j = 0; j < headers.length; j++) {
        var headerKey = headers[j];
        if (!headerKey) continue;

        var cellValue = row[j];

        if (cellValue instanceof Date) {
          rowObj[headerKey] = formatDateDMY(cellValue);
        } else if (cellValue === null || cellValue === undefined) {
          rowObj[headerKey] = '';
        } else {
          rowObj[headerKey] = cellValue;
        }
      }

      if (filterUnitup && String(rowObj['UNITUP']).trim() !== filterUnitup) {
        continue;
      }

      records.push(rowObj);
    }

    return createJsonResponse({
      status: 'success',
      spreadsheetId: SPREADSHEET_ID,
      sheetGid: TARGET_GID,
      total: records.length,
      timestamp: new Date().toISOString(),
      data: records
    });

  } catch (err) {
    return createJsonResponse({
      status: 'error',
      message: err.toString()
    });
  }
}

/**
 * 2. POST Request: Menerima Upload Data Excel / CSV dan Mengupdate Spreadsheet
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return createJsonResponse({
        status: 'error',
        message: 'Tidak ada payload data yang diterima.'
      });
    }

    var payload = JSON.parse(e.postData.contents);
    var action = payload.action || 'append'; // 'append' | 'overwrite'
    var incomingData = payload.data || [];

    if (!Array.isArray(incomingData) || incomingData.length === 0) {
      return createJsonResponse({
        status: 'error',
        message: 'Data yang dikirim kosong atau format salah.'
      });
    }

    var sheet = getTargetSheet();
    if (!sheet) {
      return createJsonResponse({
        status: 'error',
        message: 'Sheet tidak dapat ditemukan.'
      });
    }

    var lastCol = sheet.getLastColumn();
    if (lastCol < 1) {
      return createJsonResponse({
        status: 'error',
        message: 'Header sheet tidak ditemukan.'
      });
    }

    // Ambil header yang ada di baris 1
    var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(function(h) {
      return String(h).trim();
    });

    // Petakan baris data masuk sesuai urutan header kolom
    var rowsToWrite = [];
    for (var i = 0; i < incomingData.length; i++) {
      var item = incomingData[i];
      var newRow = [];

      for (var j = 0; j < headers.length; j++) {
        var hName = headers[j];
        // Cari key dengan pencocokan case-insensitive
        var val = '';
        if (item[hName] !== undefined) {
          val = item[hName];
        } else {
          // Cari kunci case-insensitive
          var lowerH = hName.toLowerCase();
          for (var k in item) {
            if (k.toLowerCase() === lowerH) {
              val = item[k];
              break;
            }
          }
        }
        newRow.push(val !== null && val !== undefined ? val : '');
      }
      rowsToWrite.push(newRow);
    }

    if (action === 'overwrite') {
      // Hapus seluruh baris data lama mulai baris 2 ke bawah
      var lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        sheet.getRange(2, 1, lastRow - 1, lastCol).clearContent();
      }
      // Tulis data baru mulai baris 2
      sheet.getRange(2, 1, rowsToWrite.length, lastCol).setValues(rowsToWrite);
    } else {
      // Append: Tulis di bawah baris terakhir yang terisi
      var nextRow = sheet.getLastRow() + 1;
      sheet.getRange(nextRow, 1, rowsToWrite.length, lastCol).setValues(rowsToWrite);
    }

    // Ambil total baris sekarang
    var totalNow = sheet.getLastRow() - 1;

    return createJsonResponse({
      status: 'success',
      action: action,
      added: rowsToWrite.length,
      totalRows: totalNow,
      message: 'Berhasil mengupdate ' + rowsToWrite.length + ' data ke Google Spreadsheet!'
    });

  } catch (err) {
    return createJsonResponse({
      status: 'error',
      message: err.toString()
    });
  }
}

function formatDateDMY(date) {
  var d = ('0' + date.getDate()).slice(-2);
  var m = ('0' + (date.getMonth() + 1)).slice(-2);
  var y = date.getFullYear();
  return d + '/' + m + '/' + y;
}

function createJsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
