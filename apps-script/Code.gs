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

function doGet(e) {
  var params = e ? e.parameter : {};

  // Hae käyttäjän omat varaukset
  if (params.action === 'getBookings' && params.email && params.code) {
    return getMyBookings(params.email, params.code);
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var eventSheet = ss.getSheetByName('Tapahtumat');
  var bookingSheet = ss.getSheetByName('Varaukset');

  var eventData = eventSheet.getDataRange().getValues();
  var bookingData = bookingSheet.getDataRange().getValues();

  var eventRows = eventData.slice(1);
  var bookingRows = bookingData.slice(1);

  // Laske varaukset — ohita perutut (sarake F = indeksi 5)
  var bookingCounts = {};
  for (var i = 0; i < bookingRows.length; i++) {
    var row = bookingRows[i];
    if (row[5] === true) continue; // Peruttu
    var eventName = String(row[2] || '');
    var slotDateTime = String(row[3] || '');
    if (eventName && slotDateTime) {
      var key = eventName + '||' + slotDateTime;
      bookingCounts[key] = (bookingCounts[key] || 0) + 1;
    }
  }

  var events = [];
  for (var j = 0; j < eventRows.length; j++) {
    var r = eventRows[j];
    if (!r[2]) continue;
    if (r[0] !== true) continue; // Varaussivusto-ruksi

    var name = String(r[2]);
    var rawDate = r[3];
    var date = (rawDate instanceof Date)
      ? Utilities.formatDate(rawDate, Session.getScriptTimeZone(), 'yyyy-MM-dd')
      : String(rawDate);
    var startTime = String(r[4]);
    var endTime = String(r[5]);
    var paikkakunta = String(r[6] || '');
    var osoite = String(r[7] || '');
    var kuvaus = String(r[8] || '');
    var maxParticipants = parseInt(r[9]) || 1;
    var durationMin = parseInt(r[10]) || 60;
    var maxSlotsPerBooking = parseInt(r[11]) || 1;

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

    events.push({ name: name, date: date, maxSlotsPerBooking: maxSlotsPerBooking, paikkakunta: paikkakunta, osoite: osoite, kuvaus: kuvaus, slots: slots });
  }

  return ContentService
    .createTextOutput(JSON.stringify({ events: events }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ---- Vahvistuskoodi ----

function isCodeValid(email, code) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var codeSheet = ss.getSheetByName('Koodit');
  var data = codeSheet.getDataRange().getValues();
  var now = new Date();
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (String(row[0]).toLowerCase() === email.toLowerCase() &&
        String(row[1]) === String(code) &&
        row[2] instanceof Date && row[2] > now) {
      return true;
    }
  }
  return false;
}

function sendVerificationCode(email) {
  if (!email) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: 'Sahkoposti puuttuu.' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  var code = String(Math.floor(100000 + Math.random() * 900000));
  var expires = new Date(new Date().getTime() + 15 * 60 * 1000);

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var codeSheet = ss.getSheetByName('Koodit');

  // Poista vanhat koodit tälle sähköpostille
  var data = codeSheet.getDataRange().getValues();
  for (var i = data.length - 1; i >= 1; i--) {
    if (String(data[i][0]).toLowerCase() === email.toLowerCase()) {
      codeSheet.deleteRow(i + 1);
    }
  }

  codeSheet.appendRow([email, code, expires]);

  GmailApp.sendEmail(email, 'Vahvistuskoodi - Omat varaukset',
    'Hei!\n\nVahvistuskoodisi on: ' + code + '\n\nKoodi on voimassa 15 minuuttia.\n\nJos et pyytanyt koodia, voit jattaa taman viestin huomiotta.',
    { name: 'Ajanvaraus' }
  );

  return ContentService
    .createTextOutput(JSON.stringify({ message: 'Koodi lahetetty!' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ---- Omat varaukset ----

function getMyBookings(email, code) {
  if (!isCodeValid(email, code)) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: 'Virheellinen tai vanhentunut koodi.' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var bookingSheet = ss.getSheetByName('Varaukset');
  var data = bookingSheet.getDataRange().getValues();
  var rows = data.slice(1);

  var bookings = [];
  for (var i = 0; i < rows.length; i++) {
    var row = rows[i];
    if (String(row[1]).toLowerCase() === email.toLowerCase() && row[5] !== true) {
      var slotDateTime = String(row[3]);
      var parts = slotDateTime.split(' ');
      var datePart = parts[0] || '';
      var timePart = parts[1] || '';
      bookings.push({
        id: i + 2, // rivinumero sheetissä
        nimi: String(row[0]),
        eventName: String(row[2]),
        date: datePart,
        time: timePart,
        timestamp: String(row[4])
      });
    }
  }

  return ContentService
    .createTextOutput(JSON.stringify({ bookings: bookings }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ---- Peruutus ----

function cancelBooking(email, code, bookingId) {
  if (!isCodeValid(email, code)) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: 'Virheellinen tai vanhentunut koodi.' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var bookingSheet = ss.getSheetByName('Varaukset');
  var row = bookingSheet.getRange(bookingId, 1, 1, 6).getValues()[0];

  if (String(row[1]).toLowerCase() !== email.toLowerCase()) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: 'Ei oikeuksia peruuttaa tata varausta.' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  bookingSheet.getRange(bookingId, 6).setValue(true);

  return ContentService
    .createTextOutput(JSON.stringify({ message: 'Varaus peruutettu.' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ---- iCal ----

function toICalDateTime(dateStr, timeStr) {
  var d = dateStr.replace(/-/g, '');
  var t = timeStr.replace(':', '') + '00';
  return d + 'T' + t + '00';
}

function buildIcal(eventName, date, slots, location) {
  var lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Ajanvaraus//FI',
    'METHOD:REQUEST'
  ];

  for (var i = 0; i < slots.length; i++) {
    var startTime = slots[i].startTime;
    var endTime = slots[i].endTime;
    var uid = eventName + '-' + date + '-' + startTime + '@ajanvaraus';
    lines.push('BEGIN:VEVENT');
    lines.push('UID:' + uid);
    lines.push('DTSTART:' + toICalDateTime(date, startTime));
    lines.push('DTEND:' + toICalDateTime(date, endTime));
    lines.push('SUMMARY:' + eventName);
    if (location) lines.push('LOCATION:' + location);
    lines.push('DESCRIPTION:Varauksesi on vahvistettu. Tervetuloa!');
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

function addToGoogleCalendar(email, eventName, date, slots, location) {
  var calendar = CalendarApp.getCalendarsByName('Espoon Vihreiden tapahtumat')[0] || CalendarApp.getDefaultCalendar();
  var dateParts = date.split('-');

  for (var i = 0; i < slots.length; i++) {
    var startParts = slots[i].startTime.split(':');
    var endParts = slots[i].endTime.split(':');

    var startDate = new Date(
      parseInt(dateParts[0]),
      parseInt(dateParts[1]) - 1,
      parseInt(dateParts[2]),
      parseInt(startParts[0]),
      parseInt(startParts[1])
    );
    var endDate = new Date(
      parseInt(dateParts[0]),
      parseInt(dateParts[1]) - 1,
      parseInt(dateParts[2]),
      parseInt(endParts[0]),
      parseInt(endParts[1])
    );

    calendar.createEvent(eventName, startDate, endDate, {
      description: 'Varauksesi on vahvistettu. Tervetuloa!',
      location: location,
      guests: email,
      sendInvites: true
    });
  }
}

function sendConfirmationEmail(email, name, eventName, date, slots, paikkakunta, osoite) {
  var location = [osoite, paikkakunta].filter(Boolean).join(', ');

  var parts = date.split('-');
  var formattedDate = parts[2] + '.' + parts[1] + '.' + parts[0];

  var slotLines = slots.map(function(s) {
    return '* ' + s.startTime + '-' + s.endTime;
  }).join('\n');

  var subject = 'Varausvahvistus: ' + eventName + ' ' + formattedDate;

  var body = 'Hei ' + name + ',\n\n'
    + 'Varauksesi on vahvistettu!\n\n'
    + 'Tapahtuma: ' + eventName + '\n'
    + 'Paivamaara: ' + formattedDate + '\n'
    + (location ? 'Paikka: ' + location + '\n' : '')
    + 'Varatut ajat:\n' + slotLines + '\n\n'
    + 'Voit tarkastella ja perua varauksesi osoitteessa:\n'
    + 'https://appointment-booking-reimakuukka-ais-projects.vercel.app/omat-varaukset\n\n'
    + 'Kalenterikutsu on liitetty tahan viestiin.\n\n'
    + 'Nahdaan!\n';

  var icalSlots = slots.map(function(s) {
    return { startTime: s.startTime, endTime: s.endTime };
  });
  var icalContent = buildIcal(eventName, date, icalSlots, location);
  var icalBlob = Utilities.newBlob(icalContent, 'text/calendar', 'varaus.ics');

  GmailApp.sendEmail(email, subject, body, {
    attachments: [icalBlob],
    name: 'Ajanvaraus'
  });
}

// ---- Tapahtumapäivän yhteenveto ----

function sendEventDaySummary() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var tapahtumat = ss.getSheetByName('Tapahtumat');
  var varaukset = ss.getSheetByName('Varaukset');

  var today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');

  var tData = tapahtumat.getDataRange().getValues().slice(1);
  var vData = varaukset.getDataRange().getValues().slice(1);

  var todaysEvents = [];
  for (var i = 0; i < tData.length; i++) {
    var r = tData[i];
    if (!r[2]) continue;
    var rawDate = r[3];
    var date = (rawDate instanceof Date)
      ? Utilities.formatDate(rawDate, Session.getScriptTimeZone(), 'yyyy-MM-dd')
      : String(rawDate);
    if (date === today) {
      todaysEvents.push(String(r[2]));
    }
  }

  if (todaysEvents.length === 0) return;

  var organizer = Session.getActiveUser().getEmail();
  var subject = 'Tapahtumapäivän osallistujalista — ' + today;
  var body = 'Hei!\n\nTänään ' + today + ' on seuraavat tapahtumat:\n\n';

  for (var j = 0; j < todaysEvents.length; j++) {
    var eventName = todaysEvents[j];
    body += '=== ' + eventName + ' ===\n';

    var participants = [];
    for (var k = 0; k < vData.length; k++) {
      var row = vData[k];
      if (String(row[2]) === eventName &&
          String(row[3]).startsWith(today) &&
          row[5] !== true) {
        participants.push({
          nimi: String(row[0]),
          puhelin: String(row[6] || '—'),
          aika: String(row[3]).split(' ')[1] || ''
        });
      }
    }

    if (participants.length === 0) {
      body += 'Ei varauksia.\n\n';
    } else {
      participants.sort(function(a, b) { return a.aika.localeCompare(b.aika); });
      for (var p = 0; p < participants.length; p++) {
        body += participants[p].aika + ' — ' + participants[p].nimi + ' | ' + participants[p].puhelin + '\n';
      }
      body += '\nYhteensä: ' + participants.length + ' osallistujaa\n\n';
    }
  }

  GmailApp.sendEmail(organizer, subject, body, { name: 'Ajanvaraus' });
}

function setupDailyTrigger() {
  ScriptApp.getProjectTriggers().forEach(function(t) {
    if (t.getHandlerFunction() === 'sendEventDaySummary') {
      ScriptApp.deleteTrigger(t);
    }
  });
  ScriptApp.newTrigger('sendEventDaySummary')
    .timeBased().everyDays(1).atHour(0).create();
}

// ---- Yhteenveto-välilehti ----

function setupYhteenveto() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var sheet = ss.getSheetByName('Yhteenveto');
  if (!sheet) {
    sheet = ss.insertSheet('Yhteenveto');
  } else {
    sheet.clear();
    sheet.clearDataValidations();
  }

  // Hae tapahtumat Tapahtumat-sheetistä muodossa "DD.MM.YYYY — Tapahtuman nimi"
  var tapahtumat = ss.getSheetByName('Tapahtumat');
  var tData = tapahtumat.getDataRange().getValues().slice(1);
  var eventList = [];
  var seen = {};
  for (var i = 0; i < tData.length; i++) {
    var r = tData[i];
    var name = String(r[2]);
    if (!name) continue;
    var rawDate = r[3];
    var dateStr = (rawDate instanceof Date)
      ? Utilities.formatDate(rawDate, Session.getScriptTimeZone(), 'dd.MM.yyyy')
      : String(rawDate);
    var label = dateStr + ' \u2014 ' + name;
    if (!seen[label]) {
      seen[label] = true;
      eventList.push(label);
    }
  }

  // A1: otsikko, B1: dropdown
  sheet.getRange('A1').setValue('Tapahtuma:').setFontWeight('bold');
  if (eventList.length > 0) {
    var rule = SpreadsheetApp.newDataValidation()
      .requireValueInList(eventList, true)
      .build();
    sheet.getRange('B1').setDataValidation(rule).setValue(eventList[0]);
  }

  // B2: tapahtuman nimi (parsittu B1:stä " — " jälkeen)
  // C2: päivämäärä ISO-muodossa "yyyy-MM-dd" (parsittu "DD.MM.YYYY" alusta)
  var dash = ' \u2014 ';
  sheet.getRange('B2').setFormula(
    "=IF(B1=\"\",\"\",TRIM(MID(B1,FIND(\" \u2014 \",B1)+3,100)))"
  );
  sheet.getRange('C2').setFormula(
    "=IF(B1=\"\",\"\",MID(B1,7,4)&\"-\"&MID(B1,4,2)&\"-\"&LEFT(B1,2))"
  );

  // A3: QUERY suodattaa sekä nimellä (B2) että päivämäärällä (C2)
  sheet.getRange('A3').setFormula(
    "=IFERROR(QUERY(Varaukset!A:G,\"SELECT D, A, G, B WHERE C = '\"&B2&\"' AND D LIKE '\"&C2&\"%' AND (F = false OR F IS NULL) ORDER BY D\",1),\"Ei varauksia\")"
  );

  // Leveydet
  sheet.setColumnWidth(1, 160);
  sheet.setColumnWidth(2, 250);
  sheet.setColumnWidth(3, 130);
  sheet.setColumnWidth(4, 220);

  // Piilota apusolut B2 ja C2 (pieni teksti)
  sheet.getRange('B2:C2').setFontColor('#cccccc').setFontSize(8);
}

// ---- Kalenteri sync ----

function syncTapahtumatKalenteriin() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var eventSheet = ss.getSheetByName('Tapahtumat');
  var data = eventSheet.getDataRange().getValues();
  var rows = data.slice(1);

  var calendar = CalendarApp.getCalendarsByName('Espoon Vihreiden tapahtumat')[0] || CalendarApp.getDefaultCalendar();

  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    if (!r[2]) continue;
    if (r[1] !== true) continue; // Kalenteri-ruksi

    var nimi = String(r[2]);
    var rawDate = r[3];
    var date = (rawDate instanceof Date)
      ? Utilities.formatDate(rawDate, Session.getScriptTimeZone(), 'yyyy-MM-dd')
      : String(rawDate);
    var startTime = String(r[4]);
    var endTime = String(r[5]);
    var paikkakunta = String(r[6] || '');
    var osoite = String(r[7] || '');
    var kuvaus = String(r[8] || '');

    var dateParts = date.split('-');
    var startParts = startTime.split(':');
    var endParts = endTime.split(':');

    var startDate = new Date(
      parseInt(dateParts[0]),
      parseInt(dateParts[1]) - 1,
      parseInt(dateParts[2]),
      parseInt(startParts[0]),
      parseInt(startParts[1])
    );
    var endDate = new Date(
      parseInt(dateParts[0]),
      parseInt(dateParts[1]) - 1,
      parseInt(dateParts[2]),
      parseInt(endParts[0]),
      parseInt(endParts[1])
    );

    var existing = calendar.getEvents(startDate, endDate);
    var found = false;
    for (var j = 0; j < existing.length; j++) {
      if (existing[j].getTitle() === nimi) {
        found = true;
        break;
      }
    }

    if (!found) {
      var desc = (kuvaus ? kuvaus + '\n\n' : '') + 'Ilmoittaudu: https://appointment-booking-reimakuukka-ais-projects.vercel.app';
      calendar.createEvent(nimi, startDate, endDate, {
        location: osoite + ', ' + paikkakunta,
        description: desc
      });
    }
  }
}

// ---- doPost ----

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);

    if (body.action === 'sendCode') {
      return sendVerificationCode(body.email);
    }

    if (body.action === 'cancel') {
      return cancelBooking(body.email, body.code, body.bookingId);
    }

    // Uusi varaus
    var name = body.name;
    var email = body.email;
    var eventName = body.eventName;
    var date = body.date;
    var selectedSlots = body.selectedSlots;
    var paikkakunta = body.paikkakunta || '';
    var osoite = body.osoite || '';
    var slotDetails = body.slotDetails || [];

    if (!name || !email || !eventName || !date || !selectedSlots || selectedSlots.length === 0) {
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'Puuttuvat kentat.' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var bookingSheet = ss.getSheetByName('Varaukset');
    var timestamp = new Date().toISOString();

    var puhelinnumero = body.puhelinnumero || '';
    for (var i = 0; i < selectedSlots.length; i++) {
      bookingSheet.appendRow([name, email, eventName, date + ' ' + selectedSlots[i], timestamp, false, puhelinnumero]);
    }

    sendConfirmationEmail(email, name, eventName, date, slotDetails, paikkakunta, osoite);

    var location = [osoite, paikkakunta].filter(Boolean).join(', ');
    addToGoogleCalendar(email, eventName, date, slotDetails, location);

    return ContentService
      .createTextOutput(JSON.stringify({ message: 'Varaus onnistui!' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: 'Virhe: ' + err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
