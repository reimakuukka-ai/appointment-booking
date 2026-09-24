'use client';

// Näytetään vain jos onnistunutta ISR-cachea ei vielä ole olemassa
// (esim. juuri tehty ensimmäinen deploy) — normaalisti hetkellinen
// Apps Script -hitaus ei päädy tänne asti, ks. app/page.tsx.
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-red-700 text-sm">
          Tapahtumien lataaminen epäonnistui. Tarkista ympäristömuuttujat ja Google Sheets -yhteys.
        </div>
        <button
          onClick={reset}
          className="mt-4 text-sm text-[var(--color-brand)] hover:underline"
        >
          Yritä uudelleen
        </button>
      </div>
    </main>
  );
}
