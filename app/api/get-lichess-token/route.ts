import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('lichess_access_token')?.value;
  if (!token) {
    return NextResponse.json({ accessToken: null });
  }
  return NextResponse.json({ accessToken: token });
}
