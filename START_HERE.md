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

Kysymys 10: Mikä on yhdistyksesi/organisaatiosi VIRALLINEN nimi ja osoite?
→ Nämä näkyvät varaajille tietosuojaselosteessa "rekisterinpitäjänä" (lakisääteinen tieto).
→ Esimerkki: "Oma Yhdistys ry, Esimerkkikatu 1, 00100 Helsinki"

Kysymys 11: Kuka on tietosuoja-asioiden yhteyshenkilö (nimi + sähköposti)?
→ Voi olla sama kuin kysymys 7:n sähköposti, mutta kysy erikseen koska ei aina ole.

---

Kun olet saanut vastaukset kaikkiin kysymyksiin, etene näiden vaiheiden mukaan:

VAIHE 1: ESIVALMISTELUT
Jos Node.js, Git tai tilit puuttuvat, neuvo asentamaan/luomaan ne.
Odota vahvistus ennen etenemistä.

VAIHE 2: FORKKAA OMA KOPIO
TÄRKEÄÄ: käyttäjällä ei ole kirjoitusoikeutta reimakuukka-ai/appointment-booking-repoon, joten
myöhempi "git push" epäonnistuisi ilman tätä vaihetta.
Neuvo käyttäjää:
  1. Avaamaan selaimessa https://github.com/reimakuukka-ai/appointment-booking
  2. Kirjautumaan omalla GitHub-tilillään (kysymys 4)
  3. Painamaan oikean yläkulman "Fork"-painiketta ja luomaan forkin omalle tililleen
Odota vahvistus että fork on luotu käyttäjän omaan GitHub-tiliin.

VAIHE 3: LATAA KOODI
Neuvo avaamaan Terminal ja ajamaan (korvaa OMATILI käyttäjän GitHub-käyttäjätunnuksella):
  git clone https://github.com/OMATILI/appointment-booking.git
  cd appointment-booking
  npm install
Odota vahvistus että onnistui.

VAIHE 4: GOOGLE SHEETS — TAPAHTUMAT-VÄLILEHTI
Neuvo luomaan uusi Google Sheets -taulukko.
Lisää ensimmäinen välilehti nimeltä "Tapahtumat" ja luo nämä sarakkeet:
A: Varaussivusto | B: Kalenteri | C: Nimi | D: Päivämäärä | E: Alkuaika | F: Loppuaika
G: Paikkakunta | H: Osoite | I: Kuvaus | J: Max osallistujia/slotti | K: Kesto (min) | L: Max slotteja/varaus
M: (kirjoita soluun M2 kaava: =ARRAYFORMULA(IF(C2:C<>"";TEXT(D2:D;"DD.MM.YYYY")&" — "&C2:C;"")))
N: (valinnainen) Näytä osallistujat -ruksi. Tyhjänä jättäminen = osallistujien nimet näkyvät
   sivustolla ja kaikki saavat tapahtumapäivänä sähköpostin muista samaan slottiin ilmoittautuneista.
   FALSE = kumpikaan ei tapahdu tälle tapahtumalle. Kerro käyttäjälle että tämä on valinnainen eikä
   sitä tarvitse täyttää jos oletuskäytös (näytä osallistujat) sopii.
Lisää yksi testirivi jotta voi myöhemmin testata.
Odota vahvistus.

VAIHE 5: GOOGLE SHEETS — MUUT VÄLILEHDET
Neuvo lisäämään kolme välilehteä lisää: "Varaukset", "Koodit", "Yhteenveto"
Nämä jätetään tyhjiksi — skripti täyttää ne.
Odota vahvistus.

VAIHE 6: APPS SCRIPT — KOODI
Neuvo avaamaan Apps Script: Sheetsistä Extensions → Apps Script
Neuvo kopioimaan tiedoston apps-script/Code.gs koko sisältö sinne.
(Tiedosto löytyy ladatusta kansiosta)
Odota vahvistus.

VAIHE 7: APPS SCRIPT — KONFIGURAATIO
Neuvo muokkaamaan CONFIG-lohkoa tiedoston alussa käyttäjän tiedoilla:
  ORGANIZER_EMAIL → käyttäjän sähköposti (kysymys 7)
  BOOKING_URL → jätetään toistaiseksi, täydennetään myöhemmin
  CALENDAR_NAME → kalenterin nimi (kysymys 9) tai tyhjä
  SENDER_NAME → yhdistyksen nimi (kysymys 6)
Odota vahvistus.

VAIHE 8: APPS SCRIPT — FUNKTIOT
Neuvo ajamaan nämä funktiot yksi kerrallaan valitsemalla funktio valikosta ja painamalla ▶ Run:
  1. setupYhteenveto
  2. setupDailyTrigger
  3. setupEditTrigger
Odota vahvistus jokaisen jälkeen.

VAIHE 9: APPS SCRIPT — DEPLOY
Neuvo deployaamaan web appina:
  Deploy → New deployment → Type: Web app
  Execute as: Me | Who has access: Anyone → Deploy
Neuvo kopioimaan URL talteen.
Odota vahvistus ja URL.

VAIHE 10: BRÄNDI, TIETOSUOJA JA YMPÄRISTÖMUUTTUJAT
Brändiväri, organisaation nimi ja tietosuojaselosteen yhteystiedot luetaan kaikki
ympäristömuuttujista — koodia ei tarvitse muokata.
Neuvo kopioimaan tiedosto .env.example nimellä .env.local ja täyttämään:
  GOOGLE_APPS_SCRIPT_URL         → VAIHE 9:n Apps Script -URL
  NEXT_PUBLIC_ORG_NAME            → yhdistyksen nimi (kysymys 6)
  NEXT_PUBLIC_SITE_TITLE          → esim. "Ajanvaraus" (kysy haluaako oman)
  NEXT_PUBLIC_SITE_DESCRIPTION    → lyhyt kuvaus, esim. "Ilmoittautuminen tapahtumiin"
  NEXT_PUBLIC_BRAND_COLOR         → brändiväri (kysymys 8). Jos "ei ole", jätä tyhjäksi
                                     (oletus on vihreä #284734).
  NEXT_PUBLIC_PRIVACY_CONTROLLER_NAME    → yhdistyksen virallinen nimi (kysymys 10)
  NEXT_PUBLIC_PRIVACY_CONTROLLER_ADDRESS → osoite (kysymys 10)
  NEXT_PUBLIC_PRIVACY_CONTACT_NAME       → yhteyshenkilön nimi (kysymys 11)
  NEXT_PUBLIC_PRIVACY_CONTACT_EMAIL      → yhteyshenkilön sähköposti (kysymys 11)
TÄRKEÄÄ: muistuta käyttäjää että NEXT_PUBLIC_PRIVACY_* -kentät ovat lakisääteinen
tietosuojatieto varaajille — jos ne jätetään tyhjäksi, sivustolla näkyy oletuksena
Espoon Vihreiden tiedot, mikä on väärin muille organisaatioille. Älä jätä näitä
kysymättä/tyhjäksi ilman että käyttäjä tietoisesti niin päättää.
Tumma/vaalea/keskisävy lasketaan brändiväristä automaattisesti, niitä ei kysytä erikseen.
Odota vahvistus.

VAIHE 11: TESTAA PAIKALLISESTI
Neuvo ajamaan: npm run dev
Neuvo avaamaan selaimessa: http://localhost:3000
Tarkista että Tapahtumat-sheetin testirivi näkyy sivulla.
Odota vahvistus.

VAIHE 12: VERCEL-DEPLOY
Neuvo luomaan Vercel-tili jos ei ole olemassa.
Neuvo yhdistämään Verceliin käyttäjän OMA fork (VAIHE 2:sta, ei alkuperäistä
reimakuukka-ai/appointment-booking-repoa) ja lisäämään KAIKKI VAIHE 10:ssä
.env.local:iin täytetyt muuttujat myös Vercelin Environment Variables -kohtaan
(ei vain GOOGLE_APPS_SCRIPT_URL — myös NEXT_PUBLIC_*-muuttujat, muuten Vercel
palaa Espoon Vihreiden oletusarvoihin).
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

---

YLEISIÄ ONGELMIA

"git push" epäonnistuu virheellä "Invalid username or token" tai "Authentication failed":
GitHubin HTTPS-autentikointi vaatii Personal Access Tokenin (salasana ei enää toimi).
Neuvo käyttäjää jommallakummalla tavalla:
  a) Helpompi: asenna GitHub CLI (gh) ja aja `gh auth login` — hoitaa autentikoinnin automaattisesti.
  b) Manuaalinen: GitHub.com → oikea yläkulma → Settings → Developer settings →
     Personal access tokens → Tokens (classic) → Generate new token, oikeudeksi "repo".
     Aseta se komennolla (korvaa USERNAME ja TOKEN):
       git remote set-url origin https://USERNAME:TOKEN@github.com/USERNAME/REPO.git
     Huomauta käyttäjälle, ettei tokenia kannata liittää mihinkään julkiseen paikkaan ja että
     se kannattaa mitätöidä GitHubista, jos se vahingossa paljastuu (esim. chat-historiaan).

Apps Script -muutokset (esim. Code.gs-korjaukset myöhemmin) eivät näy sivustolla:
Pelkkä `git push`/Vercel-deploy päivittää vain frontendin. Apps Script vaatii AINA erillisen
uuden deployment-version: Apps Script-editori → Deploy → Manage deployments →
kynäkuvake olemassa olevan deploymentin kohdalla → Version: New version → Deploy.

Etusivu ei näytä testitapahtumaa:
Tarkista että Tapahtumat-sheetin A-sarakkeessa (Varaussivusto) on ruksi/TRUE, ja että
päivämäärä (D-sarake) ei ole menneisyydessä — menneet tapahtumat suodatetaan pois automaattisesti.
