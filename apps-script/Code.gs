/**
 * Navora Overseas Education — enquiry logger
 *
 * Writes one row per form submission into:
 * https://docs.google.com/spreadsheets/d/1kORq_GdTGKmle2pjRyBWx43umELZl8PFTBXGIHgsQqE/edit?gid=0#gid=0
 *
 * Deploy: Extensions → Apps Script → paste this file → Deploy → New deployment
 *   Type: Web app
 *   Execute as: Me
 *   Who has access: Anyone
 * Copy the URL that ends in /exec into sheetWebAppUrl in index.html.
 *
 * In the spreadsheet: File → Settings → Time zone → (GMT+05:30) India.
 * The timestamp is also written as India time (Asia/Kolkata) so the cell
 * stays correct even if that setting is missed.
 */
var SHEET_ID = "1kORq_GdTGKmle2pjRyBWx43umELZl8PFTBXGIHgsQqE";
var HEADERS = [
  "Timestamp (IST)",
  "Name",
  "Phone",
  "Email",
  "City",
  "Country",
  "Intake",
  "Course",
  "Message",
  "Source",
];

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var data = readData_(e);
    if (!data.name || !data.phone) {
      return json_({ ok: false, error: "Name and phone are required." });
    }
    var sheet = targetSheet_();
    ensureHeaders_(sheet);
    append_(sheet, data);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}

function doGet() {
  return ContentService.createTextOutput("Navora enquiry endpoint is running.");
}

function readData_(e) {
  var data = {};
  if (e && e.parameter) data = e.parameter;
  if (e && e.postData && e.postData.contents) {
    try {
      var parsed = JSON.parse(e.postData.contents);
      if (parsed && typeof parsed === "object") {
        for (var key in parsed) {
          if (Object.prototype.hasOwnProperty.call(parsed, key)) data[key] = parsed[key];
        }
      }
    } catch (ignore) {}
  }
  return data;
}

function targetSheet_() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheets = ss.getSheets();
  for (var i = 0; i < sheets.length; i++) {
    if (sheets[i].getSheetId() === 0) return sheets[i];
  }
  return sheets[0];
}

function ensureHeaders_(sheet) {
  if (sheet.getLastRow() > 0) return;
  sheet.appendRow(HEADERS);
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
  sheet.setColumnWidth(1, 170);
  sheet.setColumnWidth(9, 280);
}

function append_(sheet, data) {
  var width = Math.max(sheet.getLastColumn(), HEADERS.length);
  var header = sheet.getRange(1, 1, 1, width).getValues()[0];
  var fields = {
    "Timestamp (IST)": Utilities.formatDate(new Date(), "Asia/Kolkata", "yyyy-MM-dd HH:mm:ss"),
    Name: clip_(data.name, 120),
    Phone: clip_(data.phone, 24),
    Email: clip_(data.email, 160),
    City: clip_(data.city, 80),
    Country: clip_(data.country, 80),
    Intake: clip_(data.intake, 40),
    Course: clip_(data.course, 160),
    Message: clip_(data.message, 2000),
    Source: "Website",
  };
  var rowIndex = sheet.getLastRow() + 1;
  var named = header.indexOf("Name") !== -1 && header.indexOf("Phone") !== -1;
  if (named) {
    var row = [];
    for (var c = 0; c < header.length; c++) {
      var key = header[c];
      row.push(Object.prototype.hasOwnProperty.call(fields, key) ? fields[key] : "");
    }
    var phoneCol = header.indexOf("Phone") + 1;
    if (phoneCol > 0) sheet.getRange(rowIndex, phoneCol).setNumberFormat("@");
    sheet.getRange(rowIndex, 1, 1, row.length).setValues([row]);
    return;
  }
  var values = HEADERS.map(function (key) {
    return fields[key];
  });
  sheet.getRange(rowIndex, 3).setNumberFormat("@");
  sheet.getRange(rowIndex, 1, 1, values.length).setValues([values]);
}

function clip_(value, max) {
  var text = String(value || "").replace(/^\s+|\s+$/g, "");
  return text.length > max ? text.slice(0, max) : text;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
