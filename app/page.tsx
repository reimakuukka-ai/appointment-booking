import Link from 'next/link';
import { getEvents } from '@/lib/googleSheets';
import EventList from '@/components/EventList';

// Aiemmin force-dynamic: joka ikinen kävijä odotti live Apps Script -kutsun,
// jonka vasteaika vaihtelee rajusti (havaittu 3-22 s). Lyhyt ISR-välimuisti
// tekee sivusta lähes aina heti valmiin useimmille kävijöille, ja vain
// taustalla tapahtuva uudelleengenerointi (max kerran 20 s:ssa) odottaa
// Apps Scriptiä. Varauksen lähetys tarkistaa saatavuuden silti aina
// tuoreeltaan (ks. app/api/bookings/route.ts), joten tämä ei vaaranna
// varausten oikeellisuutta.
export const revalidate = 20;
// Apps Script -kutsu voi joutua yrittämään uudelleen (ks. lib/googleSheets.ts) —
// annetaan Vercelin funktiolle Hobby-tason oletusta (10 s) enemmän aikaa.
export const maxDuration = 30;

export default async function HomePage() {
  // Ei try/catch: jos Apps Script -kutsu epäonnistuu taustaregeneroinnissa,
  // Next.js säilyttää viimeisimmän onnistuneen cachen sen sijaan että
  // tallentaisi virhetilan cacheen 20 sekunniksi kaikille kävijöille.
  // Ensimmäistä onnistunutta cachea vielä vailla olevaa tilannetta varten
  // ks. app/error.tsx.
  const events = await getEvents();

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-gray-900">Ilmoittautuminen tapahtumiin</h1>
          <Link href="/omat-varaukset" className="text-sm text-[var(--color-brand)] hover:underline">
            Omat varaukset →
          </Link>
        </div>
        <p className="text-gray-500 mb-8">Valitse tapahtuma, haluamasi ajankohdat ja täytä yhteystietosi.</p>

        <EventList events={events} />
      </div>
    </main>
  );
}
