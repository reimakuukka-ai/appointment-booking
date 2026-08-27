@AGENTS.md

# Espoon Vihreiden ajanvaraustyökalu

## Yleiskuvaus
Ajanvarausjärjestelmä Espoon Vihreiden tapahtumiin. Varaajat valitsevat aikaslotteja tapahtumiin, saavat sähköpostivahvistuksen ja .ics-kalenteriliitteen. Järjestäjä saa kopion varauksista ja tapahtumapäivän osallistujalistan.

## Teknologiat
- **Frontend:** Next.js 14 App Router, TypeScript, Tailwind CSS
- **Backend:** Google Apps Script (web app, doGet/doPost)
- **Tietokanta:** Google Sheets
- **Hosting:** Vercel
- **Koodi:** GitHub (reimakuukka-ai/appointment-booking)

## Brändi
- Fontti: IBM Plex Sans
- Pääväri: #284734 (brand)

## Ympäristömuuttujat (Vercel)
- `GOOGLE_APPS_SCRIPT_URL` — Apps Script web app URL

## Google Sheets -rakenne

### Tapahtumat-välilehti
| Sarake | Sisältö |
|--------|---------|
| A | Varaussivusto-ruksi (näkyy varaussivulla) |
| B | Kalenteri-ruksi (synkronoidaan Google Kalenteriin) |
| C | Tapahtuman nimi |
| D | Päivämäärä |
| E | Alkuaika (HH:MM) |
| F | Loppuaika (HH:MM) |
| G | Paikkakunta |
| H | Osoite |
| I | Kuvaus |
| J | Max osallistujat / slotti |
| K | Kesto minuutteina |
| L | Max slotteja per varaus |
| M | Apusarake: `=ARRAYFORMULA(IF(C2:C<>"";TEXT(D2:D;"DD.MM.YYYY")&" — "&C2:C;""))` (Yhteenveto-dropdownia varten) |
| N | Näytä osallistujat -ruksi. TRUE/tyhjä (oletus) = osallistujien nimet näkyvät nettisivulla ja jokainen osallistuja saa tapahtumapäivänä sähköpostin muista samaan aikaslottiin ilmoittautuneista. FALSE = kumpikaan ei tapahdu tälle tapahtumalle (järjestäjän oma yhteenvetoviesti lähtee silti aina). |

### Varaukset-välilehti
| Sarake | Sisältö |
|--------|---------|
| A | Varaajan nimi |
| B | Sähköposti |
| C | Tapahtuman nimi |
| D | Päivämäärä + aika (muoto: `DD.MM.YYYY HH:MM`) |
| E | Varauksen aikaleima |
| F | Peruttu (TRUE/FALSE) |
| G | Puhelinnumero |

### Koodit-välilehti
Sähköpostivahvistuskoodit "Omat varaukset" -toimintoa varten.
| Sarake | Sisältö |
|--------|---------|
| A | Sähköposti |
| B | 6-numeroinen koodi |
| C | Vanhenemisaika (15 min) |

### Yhteenveto-välilehti
Järjestäjän näkymä varauksiin. Dropdown B1:ssä hakee Tapahtumat!M2:M500.
- B2: `=IF(B1="";"";TRIM(MID(B1;14;100)))` — tapahtuman nimi
- C2: `=IF(B1="";"";LEFT(B1;10))` — päivämäärä DD.MM.YYYY
- A3: QUERY joka hakee varaukset valitulle tapahtumalle

## Apps Script -funktiot
| Funktio | Kuvaus |
|---------|--------|
| `doGet(e)` | Palauttaa tapahtumat + varausten nimet per slotti (piilotetaan jos N-sarake FALSE) |
| `doPost(e)` | Reititys: sendCode / cancel / uusi varaus |
| `sendConfirmationEmail()` | Vahvistus varaajalle + kopio info@espoonvihreat.fi |
| `addToGoogleCalendar()` | Kalenterikutsu info@espoonvihreat.fi:lle (getDefaultCalendar) |
| `sendVerificationCode()` | Lähettää 6-numeroisen koodin "Omat varaukset" -sivulle |
| `getMyBookings()` | Hakee käyttäjän omat varaukset koodilla |
| `cancelBooking()` | Merkitsee varauksen perutuksi (F=TRUE) |
| `sendEventDaySummary()` | Lähettää osallistujalistan järjestäjälle tapahtumapäivän alussa; osallistujille itselleen vain jos N-sarake TRUE/tyhjä |
| `cleanupOldBookings()` | Poistaa menneiden tapahtumien varaukset sheetistä |
| `setupDailyTrigger()` | Asettaa yölliset triggerit (00:00 yhteenveto, 01:00 siivous) |
| `setupEditTrigger()` | Asettaa onEdit-triggerin kalenterisynkronointia varten |
| `syncTapahtumatKalenteriin()` | Synkronoi tapahtumat "Espoon Vihreiden tapahtumat" -kalenteriin |
| `setupYhteenveto()` | Luo/päivittää Yhteenveto-välilehden |

## Tärkeät yksityiskohdat

### Päivämäärämuodot
- Tapahtumat-sheetissä D-sarake: Date-objekti (Google Sheets)
- Varaukset-sheetissä D-sarake: merkkijono `DD.MM.YYYY HH:MM`
- doGet palauttaa päivämäärät muodossa `yyyy-MM-dd`
- bookingCounts-avain: `eventName||yyyy-MM-dd HH:MM`
- Vertailussa Varaukset D muunnetaan DD.MM.YYYY → yyyy-MM-dd

### Google Sheets -kaavat
- Suomalaisessa Sheetssissä käytetään **puolipisteitä** pilkkujen sijaan
- QUERY-kaavat kirjoitetaan manuaalisesti (ei scriptillä)

### Kalenteri
- Kalenterikutsut info@espoonvihreat.fi:lle menevät **henkilökohtaiseen kalenteriin** (`getDefaultCalendar()`), ei jaettuun "Espoon Vihreiden tapahtumat" -kalenteriin
- Varaaja saa .ics-liitteen sähköpostiin

### Varaussivusto
- URL: https://appointment-booking-reimakuukka-ais-projects.vercel.app
- Omat varaukset: /omat-varaukset (sähköposti → 6-numeroinen koodi → varauslista)

## Avauskomennot
```bash
# Code.gs
open /Users/reimakuukka/CLAUDE/appointment-booking/apps-script/Code.gs
```
