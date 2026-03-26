'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Booking {
  id: number;
  nimi: string;
  eventName: string;
  date: string;
  time: string;
}

type Step = 'email' | 'code' | 'bookings';

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}.${parts[1]}.${parts[0]}`;
}

export default function OmatVarauksetPage() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cancelledIds, setCancelledIds] = useState<number[]>([]);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Koodin lähetys epäonnistui.');
      } else {
        setStep('code');
      }
    } catch {
      setError('Verkkovirhe. Yritä uudelleen.');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(
        `/api/my-bookings?email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}`
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Virheellinen koodi.');
      } else {
        setBookings(data.bookings ?? []);
        setStep('bookings');
      }
    } catch {
      setError('Verkkovirhe. Yritä uudelleen.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel(bookingId: number) {
    if (!confirm('Haluatko varmasti peruuttaa tämän varauksen?')) return;
    setCancellingId(bookingId);
    try {
      const res = await fetch('/api/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, bookingId }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error ?? 'Peruutus epäonnistui.');
      } else {
        setCancelledIds((prev) => [...prev, bookingId]);
      }
    } catch {
      alert('Verkkovirhe. Yritä uudelleen.');
    } finally {
      setCancellingId(null);
    }
  }

  const activeBookings = bookings.filter((b) => !cancelledIds.includes(b.id));

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-sm text-brand hover:underline flex items-center gap-1 mb-6">
          ← Takaisin tapahtumiin
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Omat varaukset</h1>
        <p className="text-gray-500 mb-8">
          Syötä sähköpostiosoitteesi niin lähetämme sinulle vahvistuskoodin.
        </p>

        {/* Vaihe 1: Sähköposti */}
        {step === 'email' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <form onSubmit={handleSendCode} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sähköpostiosoite
                </label>
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
                disabled={loading}
                className="w-full bg-brand text-white font-medium py-2.5 rounded-lg hover:bg-brand-dark disabled:opacity-50 transition-colors"
              >
                {loading ? 'Lähetetään...' : 'Lähetä vahvistuskoodi'}
              </button>
            </form>
          </div>
        )}

        {/* Vaihe 2: Koodi */}
        {step === 'code' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <p className="text-sm text-gray-600 mb-4">
              Lähetimme 6-numeroisen vahvistuskoodin osoitteeseen <strong>{email}</strong>.
              Koodi on voimassa 15 minuuttia.
            </p>
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vahvistuskoodi
                </label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="123456"
                  maxLength={6}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand tracking-widest text-center text-lg"
                />
              </div>
              {error && (
                <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand text-white font-medium py-2.5 rounded-lg hover:bg-brand-dark disabled:opacity-50 transition-colors"
              >
                {loading ? 'Tarkistetaan...' : 'Näytä varaukset'}
              </button>
              <button
                type="button"
                onClick={() => { setStep('email'); setError(''); }}
                className="w-full text-sm text-gray-500 hover:underline"
              >
                ← Vaihda sähköpostia
              </button>
            </form>
          </div>
        )}

        {/* Vaihe 3: Varaukset */}
        {step === 'bookings' && (
          <div className="space-y-4">
            {activeBookings.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm text-center text-gray-500">
                Sinulla ei ole aktiivisia varauksia.
              </div>
            ) : (
              activeBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex items-start justify-between gap-4"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{booking.eventName}</p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {formatDate(booking.date)}{booking.time ? ` klo ${booking.time}` : ''}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCancel(booking.id)}
                    disabled={cancellingId === booking.id}
                    className="text-sm text-red-600 hover:text-red-800 hover:underline disabled:opacity-50 whitespace-nowrap"
                  >
                    {cancellingId === booking.id ? 'Peruutetaan...' : 'Peruuta varaus'}
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </main>
  );
}
