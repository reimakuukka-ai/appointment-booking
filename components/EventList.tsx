'use client';

import { useState } from 'react';
import { Event } from '@/lib/googleSheets';
import BookingForm from './BookingForm';

interface Props {
  events: Event[];
}

export default function EventList({ events }: Props) {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [confirmedEvent, setConfirmedEvent] = useState<Event | null>(null);

  if (confirmedEvent) {
    return (
      <div className="rounded-xl bg-brand-light border border-brand p-8 text-center">
        <div className="text-4xl mb-3">✓</div>
        <h2 className="text-xl font-semibold text-brand mb-2">Varaus vahvistettu!</h2>
        <p className="text-brand">
          Paikka tapahtumaan <strong>{confirmedEvent.name}</strong> ({confirmedEvent.date}) on varattu onnistuneesti.
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

  if (events.length === 0) {
    return (
      <p className="text-gray-500 text-center py-10">
        Ei avoimia tapahtumia tällä hetkellä.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event) => {
        const totalAvailable = event.slots.reduce((sum, s) => sum + s.available, 0);
        const totalSlots = event.slots.length;
        const freeSlots = event.slots.filter((s) => s.available > 0).length;

        return (
          <div
            key={`${event.name}-${event.date}`}
            className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{event.name}</h2>
                <p className="text-sm text-gray-500 mt-0.5">{event.date}</p>
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

            {/* Slot overview */}
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
  );
}
