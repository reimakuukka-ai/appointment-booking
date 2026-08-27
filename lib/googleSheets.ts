const APPS_SCRIPT_URL = process.env.GOOGLE_APPS_SCRIPT_URL!;

export interface EventSlot {
  startTime: string;
  endTime: string;
  available: number;
  maxParticipants: number;
  bookedNames: string[];
}

export interface Event {
  name: string;
  date: string;
  maxSlotsPerBooking: number;
  paikkakunta?: string;
  osoite?: string;
  slots: EventSlot[];
}

export interface BookingRequest {
  name: string;
  email: string;
  puhelinnumero?: string;
  eventName: string;
  date: string;
  selectedSlots: string[];
  paikkakunta?: string;
  osoite?: string;
  slotDetails?: { startTime: string; endTime: string }[];
}

function formatDate(raw: string): string {
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Apps Script -web app on ajoittain hidas (cold start / Googlen omat viiveet, jopa 20+ s).
// Yritetään uudelleen ennen luovutusta, ettei satunnainen hitaus näy käyttäjälle virheenä.
async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries = 1,
  timeoutMs = 13000
): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeout);
      return res;
    } catch (err) {
      clearTimeout(timeout);
      lastError = err;
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
      }
    }
  }
  throw lastError;
}

export async function getEvents(): Promise<Event[]> {
  const res = await fetchWithRetry(APPS_SCRIPT_URL, {
    cache: 'no-store',
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`Apps Script GET failed: ${res.status}`);
  const data = await res.json();
  const events: Event[] = data.events ?? [];
  const today = new Date().toISOString().slice(0, 10);
  return events
    .map((e) => ({ ...e, date: formatDate(e.date) }))
    .filter((e) => e.date >= today);
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

export async function sendVerificationCode(email: string): Promise<void> {
  const res = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({ action: 'sendCode', email }),
    redirect: 'follow',
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
}

export interface Booking {
  id: number;
  nimi: string;
  eventName: string;
  date: string;
  time: string;
  timestamp: string;
}

export async function getMyBookings(email: string, code: string): Promise<Booking[]> {
  const url = `${APPS_SCRIPT_URL}?action=getBookings&email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}`;
  const res = await fetch(url, { cache: 'no-store', redirect: 'follow' });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.bookings ?? [];
}

export async function cancelBooking(email: string, code: string, bookingId: number): Promise<void> {
  const res = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({ action: 'cancel', email, code, bookingId }),
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
