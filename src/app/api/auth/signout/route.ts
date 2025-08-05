import { NextResponse } from 'next/server';

export async function GET() {
  const response = NextResponse.json({
    message: 'Signed out successfully',
  });

  response.cookies.set('ShopWaveToken', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
    expires: new Date(0),
  });

  return response;
}
