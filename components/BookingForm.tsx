'use client';

import { useState } from 'react';
import { Event } from '@/lib/googleSheets';
import { config } from '@/lib/config';
import SlotPicker from './SlotPicker';

interface Props {
  event: Event;
  onSuccess: () => void;
  onBack: () => void;
}

function TietosuojaAccordion() {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden text-sm">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      >
        <span className="font-medium text-gray-700">Tietosuojaseloste</span>
        <span className="text-gray-400 text-xs ml-2">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="px-4 py-4 text-gray-600 space-y-3 leading-relaxed border-t border-gray-200">
          <p>
            Tämä tietosuojaseloste on asetuksen (EU) 2016/679 mukainen tiedote
            rekisteröidyille heidän henkilötietojensa käsittelystä.
          </p>

          <div>
            <p className="font-medium text-gray-700">Rekisterinpitäjä</p>
            <p>{config.privacy.controllerName}, {config.privacy.controllerAddress}</p>
            <p>Yhteyshenkilö: {config.privacy.contactName}, {config.privacy.contactEmail}</p>
          </div>

          <div>
            <p className="font-medium text-gray-700">Kerättävät tiedot</p>
            <p>Nimi, sähköpostiosoite, vapaaehtoinen puhelinnumero sekä varattu tapahtuma, päivämäärä ja aikaslotti.</p>
          </div>

          <div>
            <p className="font-medium text-gray-700">Käyttötarkoitus ja oikeusperuste</p>
            <p>
              Tietoja käytetään varauksen hallintaan ja tapahtumien koordinointiin.
              Käsittelyn oikeusperuste on rekisteröidyn suostumus (tietosuoja-asetus, artikla 6.1(a)).
            </p>
            <p className="mt-1">
              Tapahtumapäivänä jokainen osallistuja saa sähköpostitse listan kaikista
              samaan tapahtumaan ilmoittautuneista. Lista sisältää nimet, aikaslotit
              sekä mahdolliset puhelinnumerot. Listaa ei jaeta tapahtuman ulkopuolisille.
            </p>
          </div>

          <div>
            <p className="font-medium text-gray-700">Säilytysaika</p>
            <p>
              Varaukset poistetaan automaattisesti tapahtuman päättymistä seuraavan
              vuorokauden vaihteessa. Tietoja ei säilytetä tämän jälkeen.
            </p>
          </div>

          <div>
            <p className="font-medium text-gray-700">Tietojenkäsittelijät</p>
            <p>
              Tiedot tallennetaan Google LLC:n Google Sheets -palveluun EU:n
              tietosuoja-asetusten mukaisesti. Tietoja ei siirretä ETA-alueen ulkopuolelle.
            </p>
          </div>

          <div>
            <p className="font-medium text-gray-700">Rekisteröidyn oikeudet</p>
            <p>
              Voit tarkastella ja peruuttaa varauksesi sivuston{' '}
              <em>Omat varaukset</em> -toiminnon kautta. Voit myös pyytää
              tietojesi tarkastamista, oikaisua tai poistoa ottamalla yhteyttä
              osoitteeseen reima.kuukka@vihreat.fi.
              Sinulla on myös oikeus tehdä valitus tietosuojavaltuutetulle.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BookingForm({ event, onSuccess, onBack }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [puhelinnumero, setPuhelinnumero] = useState('');
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [tietosuojaHyvaksytty, setTietosuojaHyvaksytty] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (selectedSlots.length === 0) {
      setError('Valitse vähintään yksi aikaslotti.');
      return;
    }

    if (!tietosuojaHyvaksytty) {
      setError('Hyväksy tietosuojaseloste ennen varauksen lähettämistä.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          puhelinnumero,
          eventName: event.name,
          date: event.date,
          selectedSlots,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Varaus epäonnistui.');
      } else {
        onSuccess();
      }
    } catch {
      setError('Verkkovirhe. Tarkista yhteys ja yritä uudelleen.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <button onClick={onBack} className="text-sm text-[var(--color-brand)] mb-5 hover:underline flex items-center gap-1">
        ← Takaisin
      </button>

      <h2 className="text-xl font-semibold text-gray-900 mb-1">{event.name}</h2>
      <p className="text-sm text-gray-500 mb-6">{event.date}</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Valitse ajankohdat
          </label>
          <SlotPicker
            slots={event.slots}
            selected={selectedSlots}
            maxSelect={event.maxSlotsPerBooking}
            onChange={setSelectedSlots}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nimi</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Matti Meikäläinen"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Puhelinnumero <span className="text-gray-400 font-normal">(vapaaehtoinen)</span>
          </label>
          <input
            type="tel"
            value={puhelinnumero}
            onChange={(e) => setPuhelinnumero(e.target.value)}
            placeholder="+358 40 123 4567"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sähköposti</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="matti@esimerkki.fi"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
          />
        </div>

        {/* Tietosuoja */}
        <div className="space-y-3">
          <TietosuojaAccordion />
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={tietosuojaHyvaksytty}
              onChange={(e) => setTietosuojaHyvaksytty(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-[var(--color-brand)] cursor-pointer"
            />
            <span className="text-sm text-gray-700">
              Olen lukenut tietosuojaselosteen ja hyväksyn henkilötietojeni käsittelyn varauksen tekemistä varten.
            </span>
          </label>
        </div>

        {error && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || selectedSlots.length === 0 || !tietosuojaHyvaksytty}
          className="w-full bg-[var(--color-brand)] text-white font-medium py-2.5 rounded-lg hover:bg-[var(--color-brand-dark)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Varataan...' : `Vahvista varaus${selectedSlots.length > 0 ? ` (${selectedSlots.length} slotti${selectedSlots.length !== 1 ? 'a' : ''})` : ''}`}
        </button>
      </form>
    </div>
  );
}
