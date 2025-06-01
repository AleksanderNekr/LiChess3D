import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { access_token } = await req.json();
  if (!access_token) {
    return NextResponse.json({ error: 'Missing access_token' }, { status: 400 });
  }
  // Set cookie for 7 days, Secure, HttpOnly, SameSite=Lax
  const response = NextResponse.json({ ok: true });
  response.cookies.set('lichess_access_token', access_token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
