// ============================================================
// KONFIGURAATIO
//
// Kaikki alla olevat arvot luetaan ympäristömuuttujista (Vercelin
// "Deploy" / Project Settings → Environment Variables), joten uusi
// organisaatio voi ottaa työkalun käyttöön täyttämällä lomakkeen
// eikä muokkaamalla koodia. Oletusarvot alla ovat Espoon Vihreiden
// nykyiset tuotantoarvot — ne pätevät vain jos vastaavaa
// ympäristömuuttujaa ei ole asetettu.
//
// Ks. .env.example kaikkien muuttujien listaus ja selitykset.
// ============================================================

import { brandShades } from './color';

function env(name: string, fallback: string): string {
  const value = process.env[name];
  return value && value.trim() !== '' ? value : fallback;
}

const brandColor = env('NEXT_PUBLIC_BRAND_COLOR', '#284734');

export const config = {
  // Organisaation nimi (varalla, ei tällä hetkellä näkyvissä muualla kuin täällä)
  organizationName: env('NEXT_PUBLIC_ORG_NAME', 'Espoon Vihreat'),

  // Sivun otsikko selaimessa ja metadatassa
  siteTitle: env('NEXT_PUBLIC_SITE_TITLE', 'Ajanvaraus'),

  // Lyhyt kuvaus (näkyy hakukoneiden tuloksissa)
  siteDescription: env('NEXT_PUBLIC_SITE_DESCRIPTION', 'Ilmoittautuminen tapahtumiin'),

  // Brändiväri HEX-muodossa. Tumma/vaalea/keskisävy lasketaan tästä
  // automaattisesti (lib/color.ts) — app/layout.tsx kirjoittaa ne
  // CSS-muuttujiksi, joita app/globals.css ja komponentit käyttävät.
  brandColor,
  brandShades: brandShades(brandColor),

  // Tietosuojaselosteen (GDPR) rekisterinpitäjätiedot. HUOM: nämä ovat
  // lain edellyttämä yhteystieto varaajille — jokaisen uuden
  // organisaation TÄYTYY asettaa nämä omiksi tiedoikseen eikä jättää
  // Espoon Vihreiden oletusarvoja käyttöön.
  privacy: {
    controllerName: env('NEXT_PUBLIC_PRIVACY_CONTROLLER_NAME', 'Espoon Vihreät ry'),
    controllerAddress: env('NEXT_PUBLIC_PRIVACY_CONTROLLER_ADDRESS', 'Mannerheimintie 15b A, 00260 Helsinki'),
    contactName: env('NEXT_PUBLIC_PRIVACY_CONTACT_NAME', 'Reima Kuukka'),
    contactEmail: env('NEXT_PUBLIC_PRIVACY_CONTACT_EMAIL', 'reima.kuukka@vihreat.fi'),
  },
};
