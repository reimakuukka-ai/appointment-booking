import { NextResponse } from 'next/server';
import { getEvents } from '@/lib/googleSheets';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const events = await getEvents();
    return NextResponse.json({ events });
  } catch (error) {
    console.error('Failed to fetch events:', error);
    return NextResponse.json(
      { error: 'Tapahtumien lataaminen epäonnistui. Yritä uudelleen.' },
      { status: 500 }
    );
  }
}
