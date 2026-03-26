import { NextRequest, NextResponse } from 'next/server';
import { getMyBookings } from '@/lib/googleSheets';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const code = searchParams.get('code');

    if (!email || !code) {
      return NextResponse.json({ error: 'Sähköposti ja koodi vaaditaan.' }, { status: 400 });
    }

    const bookings = await getMyBookings(email, code);
    return NextResponse.json({ bookings });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Virhe';
    if (message.includes('Virheellinen')) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    return NextResponse.json({ error: 'Varausten haku epäonnistui.' }, { status: 500 });
  }
}
