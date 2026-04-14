# Aloita tästä

Kopioi alla oleva teksti ja liitä se Claudelle (claude.ai).
Claude ohjaa sinut läpi koko asennuksen — ei koodauskokemusta tarvita.

---

## Kopioi tämä Claudelle:

Haluan rakentaa ilmaisen ajanvaraustyökalun yhdistykselleni.
Käytän valmista pohjaa: https://github.com/reimakuukka-ai/appointment-booking

Noudata näitä sääntöjä koko asennuksen ajan:
- Käsittele yksi askel kerrallaan
- Kysy minulta yksi kysymys kerrallaan
- Odota vastaustani ennen kuin jatkat seuraavaan
- Selitä joka vaiheen alussa lyhyesti mitä tehdään ja miksi
- Jos tulee virheilmoitus, auta selvittämään se ennen kuin jatketaan
- Oleta että en osaa koodata

---

Aloita tästä. Kysy minulta ensin nämä tiedot — yksi kysymys kerrallaan:

Kysymys 1: Mikä käyttöjärjestelmä sinulla on? (Windows / Mac / Linux)

Kysymys 2: Onko Node.js asennettuna?
→ Tarkista avaamalla Terminal (Mac/Linux) tai Komentokehote (Windows) ja kirjoittamalla: node --version
→ Jos tulee versionumero, on asennettu. Jos tulee virhe, ei ole.

Kysymys 3: Onko Git asennettuna?
→ Tarkista samalla tavalla: git --version

Kysymys 4: Onko sinulla GitHub-tili? (github.com)

Kysymys 5: Onko sinulla Vercel-tili? (vercel.com)

Kysymys 6: Mikä on yhdistyksesi nimi?

Kysymys 7: Mikä sähköpostiosoite vastaanottaa kopiot varauksista ja tapahtumapäivän muistutukset?

Kysymys 8: Mikä on yhdistyksesi brändiväri HEX-koodina?
→ Esimerkiksi #284734. Jos et tiedä, kirjoita "ei ole" niin käytän vihreää oletuksena.

Kysymys 9: Onko sinulla Google-kalenteri johon tapahtumat synkronoidaan?
→ Jos on, mikä on sen nimi täsmälleen? Jos ei ole, sano "ei ole".

---

Kun olet saanut vastaukset kaikkiin kysymyksiin, etene näiden vaiheiden mukaan:

VAIHE 1: ESIVALMISTELUT
Jos Node.js, Git tai tilit puuttuvat, neuvo asentamaan/luomaan ne.
Odota vahvistus ennen etenemistä.

VAIHE 2: LATAA KOODI
Neuvo avaamaan Terminal ja ajamaan:
  git clone https://github.com/reimakuukka-ai/appointment-booking.git
  cd appointment-booking
  npm install
Odota vahvistus että onnistui.

VAIHE 3: GOOGLE SHEETS — TAPAHTUMAT-VÄLILEHTI
Neuvo luomaan uusi Google Sheets -taulukko.
Lisää ensimmäinen välilehti nimeltä "Tapahtumat" ja luo nämä sarakkeet:
A: Varaussivusto | B: Kalenteri | C: Nimi | D: Päivämäärä | E: Alkuaika | F: Loppuaika
G: Paikkakunta | H: Osoite | I: Kuvaus | J: Max osallistujia/slotti | K: Kesto (min) | L: Max slotteja/varaus
M: (kirjoita soluun M2 kaava: =ARRAYFORMULA(IF(C2:C<>"";TEXT(D2:D;"DD.MM.YYYY")&" — "&C2:C;"")))
Lisää yksi testirivi jotta voi myöhemmin testata.
Odota vahvistus.

VAIHE 4: GOOGLE SHEETS — MUUT VÄLILEHDET
Neuvo lisäämään kolme välilehteä lisää: "Varaukset", "Koodit", "Yhteenveto"
Nämä jätetään tyhjiksi — skripti täyttää ne.
Odota vahvistus.

VAIHE 5: APPS SCRIPT — KOODI
Neuvo avaamaan Apps Script: Sheetsistä Extensions → Apps Script
Neuvo kopioimaan tiedoston apps-script/Code.gs koko sisältö sinne.
(Tiedosto löytyy ladatusta kansiosta)
Odota vahvistus.

VAIHE 6: APPS SCRIPT — KONFIGURAATIO
Neuvo muokkaamaan CONFIG-lohkoa tiedoston alussa käyttäjän tiedoilla:
  ORGANIZER_EMAIL → käyttäjän sähköposti (kysymys 7)
  BOOKING_URL → jätetään toistaiseksi, täydennetään myöhemmin
  CALENDAR_NAME → kalenterin nimi (kysymys 9) tai tyhjä
  SENDER_NAME → yhdistyksen nimi (kysymys 6)
Odota vahvistus.

VAIHE 7: APPS SCRIPT — FUNKTIOT
Neuvo ajamaan nämä funktiot yksi kerrallaan valitsemalla funktio valikosta ja painamalla ▶ Run:
  1. setupYhteenveto
  2. setupDailyTrigger
  3. setupEditTrigger
Odota vahvistus jokaisen jälkeen.

VAIHE 8: APPS SCRIPT — DEPLOY
Neuvo deployaamaan web appina:
  Deploy → New deployment → Type: Web app
  Execute as: Me | Who has access: Anyone → Deploy
Neuvo kopioimaan URL talteen.
Odota vahvistus ja URL.

VAIHE 9: BRÄNDI
Neuvo muuttamaan brändiväri tiedostossa app/globals.css (rivi --color-brand)
käyttäjän antamaksi väriksi (kysymys 8).
Neuvo muuttamaan organisaation nimi tiedostossa lib/config.ts.
Odota vahvistus.

VAIHE 10: YMPÄRISTÖMUUTTUJA
Neuvo kopioimaan tiedosto .env.example nimellä .env.local
ja lisäämään Apps Script URL GOOGLE_APPS_SCRIPT_URL-kohtaan.
Odota vahvistus.

VAIHE 11: TESTAA PAIKALLISESTI
Neuvo ajamaan: npm run dev
Neuvo avaamaan selaimessa: http://localhost:3000
Tarkista että Tapahtumat-sheetin testirivi näkyy sivulla.
Odota vahvistus.

VAIHE 12: VERCEL-DEPLOY
Neuvo luomaan Vercel-tili jos ei ole olemassa.
Neuvo yhdistämään GitHub-repositorio Verceliin ja lisäämään
GOOGLE_APPS_SCRIPT_URL ympäristömuuttujaksi Vercel-dashboardissa.
Kun Vercel-osoite tiedetään, muistuta päivittämään BOOKING_URL Code.gs:n CONFIG-lohkoon
ja deployaamaan Apps Script uudelleen (Deploy → Manage deployments → uusi versio).
Odota vahvistus.

VAIHE 13: LOPPUTESTI
Pyydä käyttäjää tekemään koevaraus nettisivulla ja tarkistamaan:
✓ Sähköpostivahvistus tuli varaajalle
✓ Kopio tuli järjestäjälle
✓ Varaus näkyy Varaukset-sheetissä
✓ Omat varaukset -sivu toimii (/omat-varaukset)

Jos kaikki toimii — onnittelut, työkalu on valmis!
