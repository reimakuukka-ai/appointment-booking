'use client';

import { useState, useMemo } from 'react';
import { Event } from '@/lib/googleSheets';
import BookingForm from './BookingForm';

interface Props {
  events: Event[];
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

export default function EventList({ events }: Props) {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [confirmedEvent, setConfirmedEvent] = useState<Event | null>(null);
  const [filterPaikkakunta, setFilterPaikkakunta] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const paikkakunnat = useMemo(() => {
    const set = new Set(events.map((e) => e.paikkakunta).filter(Boolean));
    return Array.from(set) as string[];
  }, [events]);

  const dates = useMemo(() => {
    const set = new Set(events.map((e) => e.date));
    return Array.from(set).sort();
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events
      .filter((e) => !filterPaikkakunta || e.paikkakunta === filterPaikkakunta)
      .filter((e) => !filterDate || e.date === filterDate)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [events, filterPaikkakunta, filterDate]);

  const groupedByDate = useMemo(() => {
    const groups: Record<string, Event[]> = {};
    for (const event of filteredEvents) {
      if (!groups[event.date]) groups[event.date] = [];
      groups[event.date].push(event);
    }
    return groups;
  }, [filteredEvents]);

  if (confirmedEvent) {
    return (
      <div className="rounded-xl bg-brand-light border border-brand p-8 text-center">
        <div className="text-4xl mb-3">✓</div>
        <h2 className="text-xl font-semibold text-brand mb-2">Varaus vahvistettu!</h2>
        <p className="text-brand">
          Paikka tapahtumaan <strong>{confirmedEvent.name}</strong> ({formatDate(confirmedEvent.date)}) on varattu onnistuneesti.
        </p>
        <button
          className="mt-5 text-sm text-brand underline"
          onClick={() => {
            setConfirmedEvent(null);
            setSelectedEvent(null);
          }}
        >
          Tee uusi varaus
        </button>
      </div>
    );
  }

  if (selectedEvent) {
    return (
      <BookingForm
        event={selectedEvent}
        onSuccess={() => setConfirmedEvent(selectedEvent)}
        onBack={() => setSelectedEvent(null)}
      />
    );
  }

  return (
    <div>
      {/* Suodattimet */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={filterPaikkakunta}
          onChange={(e) => setFilterPaikkakunta(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand"
        >
          <option value="">Kaikki paikkakunnat</option>
          {paikkakunnat.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        <select
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand"
        >
          <option value="">Kaikki päivämäärät</option>
          {dates.map((d) => (
            <option key={d} value={d}>{formatDate(d)}</option>
          ))}
        </select>

        {(filterPaikkakunta || filterDate) && (
          <button
            onClick={() => { setFilterPaikkakunta(''); setFilterDate(''); }}
            className="text-sm text-brand underline"
          >
            Tyhjennä suodattimet
          </button>
        )}
      </div>

      {/* Tapahtumat ryhmitelty päivämäärän mukaan */}
      {Object.keys(groupedByDate).length === 0 ? (
        <p className="text-gray-500 text-center py-10">
          Ei tapahtumia valituilla suodattimilla.
        </p>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedByDate).map(([date, dateEvents]) => (
            <div key={date}>
              <h2 className="text-base font-semibold text-brand mb-3 pb-1 border-b border-brand-light">
                {formatDate(date)}
              </h2>
              <div className="space-y-4">
                {dateEvents.map((event) => {
                  const totalSlots = event.slots.length;
                  const freeSlots = event.slots.filter((s) => s.available > 0).length;

                  return (
                    <div
                      key={`${event.name}-${event.date}`}
                      className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{event.name}</h3>
                          {(event.paikkakunta || event.osoite) && (
                            <p className="text-sm text-gray-500 mt-0.5">
                              📍 {[event.paikkakunta, event.osoite].filter(Boolean).join(', ')}
                            </p>
                          )}
                          <p className="text-sm text-gray-500 mt-1">
                            {freeSlots}/{totalSlots} aikaslottia vapaana
                          </p>
                          {event.maxSlotsPerBooking > 1 && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              Voit varata enintään {event.maxSlotsPerBooking} slottia kerralla
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => setSelectedEvent(event)}
                          className="shrink-0 bg-brand text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-brand-dark transition-colors"
                        >
                          Varaa paikka
                        </button>
                      </div>

                      {/* Slotit */}
                      <div className="mt-4 flex flex-wrap gap-2">
                        {event.slots.map((slot) => (
                          <span
                            key={slot.startTime}
                            className={`text-xs px-2 py-1 rounded-md ${
                              slot.available === 0
                                ? 'bg-gray-100 text-gray-400'
                                : 'bg-brand-light text-brand'
                            }`}
                          >
                            {slot.startTime}–{slot.endTime}
                            {slot.available === 0 ? ' · täynnä' : ` · ${slot.available} vapaana`}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
