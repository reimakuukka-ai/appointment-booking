# Ajanvaraustyökalu — Google Sheets + Next.js

Ilmainen, helposti pystytettävä ajanvaraustyökalu yhdistyksille ja järjestöille.

## Nopein tapa ottaa käyttöön

Jos haluat vain omat brändivärisi ja yhteystietosi käyttöön ilman koodin muokkaamista tai
terminaalia, tee ensin Google Sheets + Apps Script -osuus (ks. [kohta 2–3](#2-luo-google-sheets--tietokanta)
alla), ja klikkaa sitten:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/reimakuukka-ai/appointment-booking&env=GOOGLE_APPS_SCRIPT_URL,NEXT_PUBLIC_ORG_NAME,NEXT_PUBLIC_SITE_TITLE,NEXT_PUBLIC_SITE_DESCRIPTION,NEXT_PUBLIC_BRAND_COLOR,NEXT_PUBLIC_PRIVACY_CONTROLLER_NAME,NEXT_PUBLIC_PRIVACY_CONTROLLER_ADDRESS,NEXT_PUBLIC_PRIVACY_CONTACT_NAME,NEXT_PUBLIC_PRIVACY_CONTACT_EMAIL&envDescription=Katso%20selitykset%20.env.example-tiedostosta&envLink=https://github.com/reimakuukka-ai/appointment-booking/blob/main/.env.example&project-name=ajanvaraus&repository-name=ajanvaraus)

Tämä tekee kaiken selaimessa: luo oman kopion repositoriosta GitHub-tilillesi, kysyy lomakkeella
brändivärin, organisaation nimen ja tietosuojaselosteen yhteystiedot, ja deployaa suoraan.
**Täytä tietosuojakentät omilla tiedoillasi** — muuten sivustolla näkyy virheellisesti Espoon
Vihreiden yhteystiedot. Kun deploy on valmis, muista vielä päivittää `BOOKING_URL`
Apps Scriptin `CONFIG`-lohkoon (ks. [kohta 3](#3-asenna-apps-script--backend)) ja deployata se
uudelleen.

Jos haluat sen sijaan muokata koodia itse (esim. vaihtaa fonttia) tai käyttää Claudea oppaana
koko prosessin läpi, katso `START_HERE.md` tai jatka alla olevaa manuaalista ohjetta.

**Ominaisuudet:**
- Tapahtumat ja aikaslotit Google Sheetsistä
- Sähköpostivahvistus + .ics-kalenteriliite varaajalle
- Järjestäjä saa kopion jokaisesta varauksesta
- Tapahtumapäivänä automaattinen osallistujalista
- "Omat varaukset" -sivu: tarkastele ja peruuta varauksia sähköpostivarmennuksella
- Varaussivuston suodattimet paikkakunnalla ja päivämäärällä
- Varaajien nimet näkyvät sloteissa (tulevatkin tietävät kenen kanssa päivystävät)
- Google Kalenterin synkronointi
- Automaattinen vanhojen varausten siivous

---

## Vaatimukset

- Google-tili (Gmail + Google Sheets + Google Apps Script)
- [Node.js](https://nodejs.org/) 18+
- [Vercel](https://vercel.com)-tili (ilmainen)
- [GitHub](https://github.com)-tili

---

## Asennus

### 1. Forkkaa ja kloonaa repositorio

Sinulla ei ole kirjoitusoikeutta alkuperäiseen repoon, joten forkkaa se ensin omalle
GitHub-tilillesi ([Fork-painike täällä](https://github.com/reimakuukka-ai/appointment-booking)),
ja kloonaa sitten **oma forkkisi** (korvaa `OMATILI` GitHub-käyttäjätunnuksellasi):

```bash
git clone https://github.com/OMATILI/appointment-booking.git
cd appointment-booking
npm install
```

### 2. Luo Google Sheets -tietokanta

Luo uusi Google Sheets -taulukko ja lisää sille **4 välilehteä** täsmälleen näillä nimillä:

#### `Tapahtumat` — tapahtumatiedot

| Sarake | Otsikko | Esimerkki |
|--------|---------|-----------|
| A | Varaussivusto | `TRUE` (ruksi) |
| B | Kalenteri | `TRUE` (ruksi) |
| C | Nimi | `Kielikerho` |
| D | Päivämäärä | `2.5.2026` |
| E | Alkuaika | `09:00` |
| F | Loppuaika | `13:00` |
| G | Paikkakunta | `Helsinki` |
| H | Osoite | `Mannerheimintie 1` |
| I | Kuvaus | `Vapaaehtoiset tervetuloa!` |
| J | Max osallistujia/slotti | `5` |
| K | Kesto (min) | `60` |
| L | Max slotteja/varaus | `2` |
| M | *(apusarake)* | `=ARRAYFORMULA(IF(C2:C<>"";TEXT(D2:D;"DD.MM.YYYY")&" — "&C2:C;""))` |

> Kirjoita M2-soluun kaava manuaalisesti — se täyttää sarakkeen automaattisesti.

#### `Varaukset` — varaukset kirjautuvat tänne automaattisesti

| A: Nimi | B: Sähköposti | C: Tapahtuma | D: Aika | E: Aikaleima | F: Peruttu | G: Puhelin |
|---------|---------------|--------------|---------|--------------|------------|------------|

> Luo välilehti, ei muuta. Otsikkoriviksi voi kirjoittaa sarakeselitykset.

#### `Koodit` — vahvistuskoodit (hallitaan automaattisesti)

| A: Sähköposti | B: Koodi | C: Vanhenee | D: Lähetetty |
|---------------|----------|-------------|--------------|

#### `Yhteenveto` — luodaan automaattisesti skriptillä

> Jätä tyhjäksi, `setupYhteenveto()`-funktio luo sisällön.

---

### 3. Asenna Apps Script -backend

1. Avaa Google Sheets → **Extensions → Apps Script**
2. Korvaa kaikki olemassaoleva koodi tiedoston `apps-script/Code.gs` sisällöllä
3. **Muokkaa CONFIG-lohkoa** tiedoston alussa:

```javascript
var CONFIG = {
  ORGANIZER_EMAIL: 'sinun@sahkoposti.fi',   // Järjestäjän sähköposti
  BOOKING_URL: 'https://sinun-vercel-url.vercel.app/omat-varaukset',
  CALENDAR_NAME: 'Yhdistyksen tapahtumat',  // Google-kalenterin nimi
  SENDER_NAME: 'Ajanvaraus'                 // Sähköpostien lähettäjänimi
};
```

4. Tallenna (Ctrl+S)

#### Aja nämä funktiot kerran (▶ Run):

| Funktio | Mitä tekee |
|---------|-----------|
| `setupYhteenveto()` | Luo Yhteenveto-välilehden dropdownineen |
| `setupDailyTrigger()` | Asettaa yöllisen muistutuksen (00:00) ja siivouksen (01:00) |
| `setupEditTrigger()` | Kalenterisynkronointi käynnistyy automaattisesti kun laitat rastin |

#### Deployaa web appina:

1. **Deploy → New deployment**
2. Type: **Web app**
3. Execute as: **Me**
4. Who has access: **Anyone**
5. Klikkaa **Deploy**
6. Kopioi URL talteen

---

### 4. Brändi ja tietosuojaseloste

Kaikki brändäys (väri, nimi, otsikko) ja tietosuojaselosteen yhteystiedot luetaan
ympäristömuuttujista — **et tarvitse muokata koodia**. Kopioi `.env.example` → `.env.local`
ja täytä:

```bash
cp .env.example .env.local
```

```
GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/KOPIOIMASI_URL/exec
NEXT_PUBLIC_ORG_NAME=Oma Yhdistys ry
NEXT_PUBLIC_SITE_TITLE=Ajanvaraus
NEXT_PUBLIC_SITE_DESCRIPTION=Varaa paikka tapahtumaan
NEXT_PUBLIC_BRAND_COLOR=#284734
NEXT_PUBLIC_PRIVACY_CONTROLLER_NAME=Oma Yhdistys ry
NEXT_PUBLIC_PRIVACY_CONTROLLER_ADDRESS=Katuosoite 1, 00100 Helsinki
NEXT_PUBLIC_PRIVACY_CONTACT_NAME=Etunimi Sukunimi
NEXT_PUBLIC_PRIVACY_CONTACT_EMAIL=yhteys@omayhdistys.fi
```

Tumma/vaalea/keskisävy lasketaan `NEXT_PUBLIC_BRAND_COLOR`-arvosta automaattisesti
(`lib/color.ts`) — niitä ei tarvitse antaa erikseen.

**Täytä tietosuojakentät aina omilla tiedoillasi.** Jos jätät ne tyhjäksi, sivustolla
näkyy oletuksena Espoon Vihreiden tiedot (nykyisen tuotantoasennuksen takautuvan
yhteensopivuuden vuoksi) — väärän organisaation lakisääteinen yhteystieto varaajille.

Jos haluat silti muokata suoraan koodia (esim. fontin — `app/layout.tsx`,
`IBM_Plex_Sans`-importti), se on yhä mahdollista: `.env`-arvot vain ohittavat
`lib/config.ts`:n oletukset, koodi itsessään toimii samoin kuin ennenkin.

---

### 5. Testaa paikallisesti

```bash
npm run dev
```

Avaa [http://localhost:3000](http://localhost:3000)

---

### 6. Deployaa Verceliin

```bash
git add -A
git commit -m "Oma konfiguraatio"
git push
```

1. Kirjaudu [vercel.com](https://vercel.com)
2. **Add New → Project → Import** oma forkkisi GitHubista (ei alkuperäistä reimakuukka-ai-repoa)
3. **Environment Variables** → lisää kaikki `.env.local`:iin täyttämäsi muuttujat
4. Klikkaa **Deploy**

> Muista päivittää `CONFIG.BOOKING_URL` Code.gs:ssä Vercel-osoitteellesi ja deployata Apps Script uudelleen.

---

## Sheettien oikeudet

Google Sheetsiin ei tarvita erillisiä oikeuksia — Apps Script ajaa skriptin omistajan tunnuksilla.

---

## Tekninen rakenne

```
appointment-booking/
├── app/
│   ├── layout.tsx              # Fontti, metadata
│   ├── page.tsx                # Etusivu, tapahtumalista
│   ├── globals.css             # Brändivärit
│   ├── omat-varaukset/         # Omat varaukset -sivu
│   └── api/
│       ├── events/             # GET tapahtumat
│       ├── bookings/           # POST uusi varaus
│       ├── send-code/          # POST lähetä vahvistuskoodi
│       ├── my-bookings/        # GET omat varaukset
│       └── cancel/             # POST peruuta varaus
├── components/
│   ├── EventList.tsx           # Tapahtumalista suodattimineen
│   ├── BookingForm.tsx         # Varauslomake
│   └── SlotPicker.tsx          # Aikaslottien valinta
├── lib/
│   ├── config.ts               # Frontend-konfiguraatio (lukee .env-muuttujat)
│   ├── color.ts                # Laskee brand-dark/light/mid pääväristä
│   └── googleSheets.ts         # API-kutsut Apps Scriptiin
└── apps-script/
    └── Code.gs                 # Koko backend
```

---

## Lisenssi

MIT — vapaa käyttää, muokata ja jakaa.
