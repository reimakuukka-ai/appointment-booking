// ============================================================
// Ajanvaraustyökalun Apps Script -backend
// Kopioi tämä koodi Google Sheetsin Apps Scriptiin:
//   Extensions → Apps Script → korvaa kaikki tämällä → tallenna
// ============================================================

function generateSlots(startTime, endTime, durationMin) {
  var slots = [];
  var parts = startTime.split(':');
  var current = parseInt(parts[0]) * 60 + parseInt(parts[1]);
  var eParts = endTime.split(':');
  var end = parseInt(eParts[0]) * 60 + parseInt(eParts[1]);
  while (current + durationMin <= end) {
    var h = String(Math.floor(current / 60)).padStart(2, '0');
    var m = String(current % 60).padStart(2, '0');
    slots.push(h + ':' + m);
    current += durationMin;
  }
  return slots;
}

function slotEndTime(startTime, durationMin) {
  var parts = startTime.split(':');
  var total = parseInt(parts[0]) * 60 + parseInt(parts[1]) + durationMin;
  return String(Math.floor(total / 60)).padStart(2, '0') + ':' + String(total % 60).padStart(2, '0');
}

function doGet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var eventSheet = ss.getSheetByName('Tapahtumat');
  var bookingSheet = ss.getSheetByName('Varaukset');

  var eventData = eventSheet.getDataRange().getValues();
  var bookingData = bookingSheet.getDataRange().getValues();

  // Skip header row
  var eventRows = eventData.slice(1);
  var bookingRows = bookingData.slice(1);

  // Count bookings per (eventName + slotDateTime)
  var bookingCounts = {};
  for (var i = 0; i < bookingRows.length; i++) {
    var row = bookingRows[i];
    var eventName = String(row[2] || ''); // column C
    var slotDateTime = String(row[3] || ''); // column D e.g. "2026-04-01 09:00"
    if (eventName && slotDateTime) {
      var key = eventName + '||' + slotDateTime;
      bookingCounts[key] = (bookingCounts[key] || 0) + 1;
    }
  }

  var events = [];
  for (var j = 0; j < eventRows.length; j++) {
    var r = eventRows[j];
    if (!r[0]) continue; // skip empty rows

    var name = String(r[0]);
    var rawDate = r[1];
    var date = (rawDate instanceof Date)
      ? Utilities.formatDate(rawDate, Session.getScriptTimeZone(), 'yyyy-MM-dd')
      : String(rawDate);
    var startTime = String(r[2]);
    var endTime = String(r[3]);
    var maxParticipants = parseInt(r[4]) || 1;
    var durationMin = parseInt(r[5]) || 60;
    var maxSlotsPerBooking = parseInt(r[6]) || 1;
    var paikkakunta = String(r[7] || '');
    var osoite = String(r[8] || '');

    var slotStarts = generateSlots(startTime, endTime, durationMin);
    var slots = slotStarts.map(function(st) {
      var key = name + '||' + date + ' ' + st;
      var booked = bookingCounts[key] || 0;
      return {
        startTime: st,
        endTime: slotEndTime(st, durationMin),
        available: Math.max(0, maxParticipants - booked),
        maxParticipants: maxParticipants
      };
    });

    events.push({ name: name, date: date, maxSlotsPerBooking: maxSlotsPerBooking, paikkakunta: paikkakunta, osoite: osoite, slots: slots });
  }

  return ContentService
    .createTextOutput(JSON.stringify({ events: events }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var name = body.name;
    var email = body.email;
    var eventName = body.eventName;
    var date = body.date;
    var selectedSlots = body.selectedSlots;

    if (!name || !email || !eventName || !date || !selectedSlots || selectedSlots.length === 0) {
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'Puuttuvat kentät.' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var bookingSheet = ss.getSheetByName('Varaukset');
    var timestamp = new Date().toISOString();

    for (var i = 0; i < selectedSlots.length; i++) {
      bookingSheet.appendRow([name, email, eventName, date + ' ' + selectedSlots[i], timestamp]);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ message: 'Varaus onnistui!' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: 'Virhe: ' + err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
