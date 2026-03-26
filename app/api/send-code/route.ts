import { NextRequest, NextResponse } from 'next/server';
import { sendVerificationCode } from '@/lib/googleSheets';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email?.trim()) {
      return NextResponse.json({ error: 'Sähköposti puuttuu.' }, { status: 400 });
    }
    await sendVerificationCode(email.trim());
    return NextResponse.json({ message: 'Koodi lähetetty!' });
  } catch (error) {
    console.error('Send code failed:', error);
    return NextResponse.json({ error: 'Koodin lähetys epäonnistui.' }, { status: 500 });
  }
}
