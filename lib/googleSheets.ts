const APPS_SCRIPT_URL = process.env.GOOGLE_APPS_SCRIPT_URL!;

export interface EventSlot {
  startTime: string;
  endTime: string;
  available: number;
  maxParticipants: number;
}

export interface Event {
  name: string;
  date: string;
  maxSlotsPerBooking: number;
  slots: EventSlot[];
}

export interface BookingRequest {
  name: string;
  email: string;
  eventName: string;
  date: string;
  selectedSlots: string[];
}

export async function getEvents(): Promise<Event[]> {
  const res = await fetch(APPS_SCRIPT_URL, {
    cache: 'no-store',
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`Apps Script GET failed: ${res.status}`);
  const data = await res.json();
  return data.events ?? [];
}

export async function addBookings(booking: BookingRequest): Promise<void> {
  const res = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' }, // Apps Script vaatii text/plain POST:ille
    body: JSON.stringify(booking),
    redirect: 'follow',
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
}

export async function areSlotsAvailable(
  eventName: string,
  date: string,
  selectedSlots: string[]
): Promise<{ available: boolean; fullSlot?: string }> {
  const events = await getEvents();
  const event = events.find((e) => e.name === eventName && e.date === date);
  if (!event) return { available: false, fullSlot: 'Tapahtumaa ei löydy' };

  for (const slotStart of selectedSlots) {
    const slot = event.slots.find((s) => s.startTime === slotStart);
    if (!slot || slot.available <= 0) {
      return { available: false, fullSlot: slotStart };
    }
  }
  return { available: true };
}
