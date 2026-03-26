import { NextRequest, NextResponse } from 'next/server';
import { cancelBooking } from '@/lib/googleSheets';

export async function POST(request: NextRequest) {
  try {
    const { email, code, bookingId } = await request.json();
    if (!email || !code || !bookingId) {
      return NextResponse.json({ error: 'Puuttuvat kentät.' }, { status: 400 });
    }
    await cancelBooking(email, code, bookingId);
    return NextResponse.json({ message: 'Varaus peruutettu.' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Virhe';
    if (message.includes('Virheellinen') || message.includes('oikeuksia')) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    return NextResponse.json({ error: 'Peruutus epäonnistui.' }, { status: 500 });
  }
}
