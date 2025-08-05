//imports
import { NextRequest, NextResponse } from 'next/server';
import { signIn } from '@/models/user';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    const user = await signIn({ email, password });

    // Create response
    const response = NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          addresses: user.addresses,
        },
      },
      { status: 200 }
    );

    // Set HTTPOnly cookie
    response.cookies.set({
      name: 'ShopWaveToken',
      value: user.token,
      httpOnly: true,
      path: '/',
      maxAge: 86400, // 1 day
    });

    return response;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 401 });
  }
}
