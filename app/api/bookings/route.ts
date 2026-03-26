import { NextRequest, NextResponse } from 'next/server';
import { addBookings, areSlotsAvailable, getEvents } from '@/lib/googleSheets';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, eventName, date, selectedSlots } = body;

    // Basic validation
    if (!name?.trim() || !email?.trim() || !eventName?.trim() || !date?.trim()) {
      return NextResponse.json(
        { error: 'Nimi, sähköposti, tapahtuma ja päivä ovat pakollisia.' },
        { status: 400 }
      );
    }
    if (!Array.isArray(selectedSlots) || selectedSlots.length === 0) {
      return NextResponse.json(
        { error: 'Valitse vähintään yksi aikaslotti.' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Tarkista sähköpostiosoite.' },
        { status: 400 }
      );
    }

    // Check max slots per booking
    const events = await getEvents();
    const event = events.find((e) => e.name === eventName && e.date === date);
    if (!event) {
      return NextResponse.json({ error: 'Tapahtumaa ei löydy.' }, { status: 404 });
    }
    if (selectedSlots.length > event.maxSlotsPerBooking) {
      return NextResponse.json(
        {
          error: `Voit varata enintään ${event.maxSlotsPerBooking} aikaslotti${event.maxSlotsPerBooking === 1 ? 'a' : 'a'} kerralla.`,
        },
        { status: 400 }
      );
    }

    // Re-check availability (race condition guard)
    const { available, fullSlot } = await areSlotsAvailable(eventName, date, selectedSlots);
    if (!available) {
      return NextResponse.json(
        { error: `Aikaslotti ${fullSlot} on jo täynnä. Valitse toinen aika.` },
        { status: 409 }
      );
    }

    await addBookings({
      name: name.trim(),
      email: email.trim(),
      eventName,
      date,
      selectedSlots,
    });

    return NextResponse.json(
      { message: 'Varaus onnistui! Saat vahvistuksen sähköpostiin.' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Booking failed:', error);
    return NextResponse.json(
      { error: 'Varaus epäonnistui. Yritä uudelleen.' },
      { status: 500 }
    );
  }
}
