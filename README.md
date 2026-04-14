# Ajanvaraustyökalu — Google Sheets + Next.js

Ilmainen, helposti pystytettävä ajanvaraustyökalu yhdistyksille ja järjestöille.

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

### 1. Kloonaa repositorio

```bash
git clone https://github.com/reimakuukka-ai/appointment-booking.git
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

### 4. Muokkaa brändi

**Värit** — `app/globals.css`:
```css
--color-brand:       #284734;   /* Vaihda omaksi pääväriksesi */
--color-brand-dark:  #1c3325;   /* Tummempi sävy */
--color-brand-light: #eaf0ec;   /* Vaalea tausta */
```

**Fontti** — `app/layout.tsx`:
```typescript
import { IBM_Plex_Sans } from "next/font/google";
// Vaihda haluamaksesi Google Fontiksi
```

**Organisaation nimi ja otsikko** — `lib/config.ts`:
```typescript
export const config = {
  organizationName: 'Oma Yhdistys ry',
  siteTitle: 'Ajanvaraus',
  siteDescription: 'Varaa paikka tapahtumaan',
};
```

---

### 5. Ympäristömuuttujat

Kopioi `.env.example` → `.env.local` ja täytä Apps Script URL:

```bash
cp .env.example .env.local
```

```
GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/KOPIOIMASI_URL/exec
```

---

### 6. Testaa paikallisesti

```bash
npm run dev
```

Avaa [http://localhost:3000](http://localhost:3000)

---

### 7. Deployaa Verceliin

```bash
git add -A
git commit -m "Oma konfiguraatio"
git push
```

1. Kirjaudu [vercel.com](https://vercel.com)
2. **Add New → Project → Import** GitHub-repositorio
3. **Environment Variables** → lisää `GOOGLE_APPS_SCRIPT_URL`
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
│   ├── config.ts               # Frontend-konfiguraatio
│   └── googleSheets.ts         # API-kutsut Apps Scriptiin
└── apps-script/
    └── Code.gs                 # Koko backend
```

---

## Lisenssi

MIT — vapaa käyttää, muokata ja jakaa.
