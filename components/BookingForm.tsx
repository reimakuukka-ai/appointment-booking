'use client';

import { useState } from 'react';
import { Event } from '@/lib/googleSheets';
import SlotPicker from './SlotPicker';

interface Props {
  event: Event;
  onSuccess: () => void;
  onBack: () => void;
}

export default function BookingForm({ event, onSuccess, onBack }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [puhelinnumero, setPuhelinnumero] = useState('');
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (selectedSlots.length === 0) {
      setError('Valitse vähintään yksi aikaslotti.');
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
      <button onClick={onBack} className="text-sm text-brand mb-5 hover:underline flex items-center gap-1">
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
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
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
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
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
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>

        {error && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || selectedSlots.length === 0}
          className="w-full bg-brand text-white font-medium py-2.5 rounded-lg hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Varataan...' : `Vahvista varaus${selectedSlots.length > 0 ? ` (${selectedSlots.length} slotti${selectedSlots.length !== 1 ? 'a' : ''})` : ''}`}
        </button>
      </form>
    </div>
  );
}
