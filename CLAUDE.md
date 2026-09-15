@AGENTS.md

# Ajanvaraustyökalu

## Käyttöönotto uudelle organisaatiolle — lue tämä ensin

Tämä repo on alun perin rakennettu Espoon Vihreille, mutta se on tarkoitettu myös muiden
yhdistysten/organisaatioiden käyttöön templaattina. Brändi (nimi, väri) ja tietosuojaselosteen
yhteystiedot luetaan `.env.local`/Vercel-ympäristömuuttujista (ks. `.env.example`,
`lib/config.ts`) — `lib/config.ts`:n lähdekoodi näyttää AINA Espoon Vihreiden oletusarvot,
se ei ole merkki siitä onko projekti jo konfiguroitu jollekin toiselle organisaatiolle.
Tarkista sen sijaan:

- Onko käyttäjä kertonut suoraan haluavansa ottaa työkalun käyttöön omalle organisaatiolleen?
- Onko tässä kansiossa `.env.local`-tiedosto, ja jos on, näyttääkö sen
  `NEXT_PUBLIC_ORG_NAME`/`NEXT_PUBLIC_PRIVACY_CONTROLLER_NAME` joltain muulta kuin Espoon
  Vihreiltä? Jos `.env.local` puuttuu kokonaan, projektia ei ole vielä konfiguroitu kenellekään.
- `apps-script/Code.gs` → `CONFIG.ORGANIZER_EMAIL` on yhä `info@espoonvihreat.fi`?

**Jos mikä tahansa yllä olevista viittaa siihen ettei tätä ole vielä otettu käyttöön (uudelle
tai millekään) organisaatiolle**, älä käytä alla olevaa "Yleiskuvaus"-osiota kontekstina.
Käynnistä sen sijaan ohjattu käyttöönotto:

1. Kysy käyttäjältä ensin: haluaako hän NOPEIMMAN reitin (README.md:n "Deploy with Vercel"
   -nappi — hoitaa forkin, deployn ja env-muuttujien kysymisen kokonaan selaimessa, ei
   terminaalia) vai täyden ohjatun läpikäynnin jossa Claude auttaa jokaisessa vaiheessa
   (`START_HERE.md`). Kummassakin tapauksessa Google Sheets + Apps Script -osuus (VAIHE 4–9)
   pitää tehdä käsin Googlen puolella — se ei riipu valitusta reitistä.
2. Jos käyttäjä valitsee ohjatun läpikäynnin: kysy yksi kysymys kerrallaan, odota vastaus ennen
   seuraavaa. Oleta ettei käyttäjä osaa koodata, ellei toisin ilmene. Selitä lyhyesti jokaisen
   vaiheen alussa mitä tehdään ja miksi.
3. TÄRKEÄÄ jos istunto on avattu suoraan tähän Espoon Vihreiden kansioon eikä käyttäjän omaan
   forkkiin: käyttäjällä ei ole kirjoitusoikeutta tähän git-remoteen. Tarkista `git remote -v` —
   jos se osoittaa `reimakuukka-ai/appointment-booking`, käyttäjän täytyy silti forkata repo
   omalle GitHub-tililleen (START_HERE.md VAIHE 2) ja joko työskennellä uudessa, omaan forkkiinsa
   kloonatussa kansiossa, tai vaihtaa tämän kansion originin osoittamaan omaan forkkiinsa
   (`git remote set-url origin <oma fork-URL>`) ennen kuin mitään committoidaan/pushataan.
   Jos koodi on jo valmiiksi käyttäjän omassa forkissa/kansiossa, "kloonaa repo" -vaihetta
   (VAIHE 3) ei tarvitse enää tehdä — aloita suoraan riippuvuuksien asennuksesta (`npm install`)
   jos `node_modules` puuttuu.
4. Noudata muuten tarkasti tiedoston `START_HERE.md` kysymyksiä (VAIHE 1) ja vaiheita
   (VAIHE 2–13): fork omalle GitHub-tilille, Google Sheets -rakenne, Apps Script CONFIG +
   funktiot + deploy, brändi + tietosuoja + ympäristömuuttujat (`.env.local`, ei koodin
   muokkausta), paikallistestaus, git-committointi/push, Vercel-deploy (importoi OMA fork,
   muista viedä KAIKKI `.env.local`-muuttujat myös Vercelin Environment Variables -kohtaan)
   + `BOOKING_URL`-päivitys + Apps Script-redeploy, lopputesti.
5. `START_HERE.md`:n lopussa on "YLEISIÄ ONGELMIA" -osio (mm. GitHub-autentikointi, Apps Script
   -redeployn unohtuminen) — käytä sitä suoraan jos käyttäjä törmää näihin virheisiin.
6. Kun käyttöönotto on valmis, tarjoa päivittää tämän CLAUDE.md:n "Yleiskuvaus"-osio (ja alla
   olevat Google Sheets-/Apps Script -taulukot) vastaamaan uuden organisaation lopullisia
   arvoja, jotta tuleva Claude-istunto tunnistaa asennuksen valmiiksi eikä käynnistä tätä
   käyttöönotto-ohjausta uudelleen.

Jos konfiguraatio jo osoittaa käyttäjän omaan organisaatioonsa (ei enää Espoon Vihreiden arvoja),
alla oleva kuvaus on ajantasainen tekninen dokumentaatio siitä asennuksesta — käytä sitä normaalisti.

---

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
