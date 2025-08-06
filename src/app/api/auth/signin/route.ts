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
          name: user.name,
          email: user.email,
          role: user.role,
          addresses: user.addresses,
        },
        addresses: user.addresses, // Include addresses separately for localStorage
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

    response.cookies.set({
      name: 'ShopWaveUserId',
      value: user.id,
      httpOnly: true,
      path: '/',
      maxAge: 86400, // 1 day
    });

    response.cookies.set({
      name: 'ShopWaveUserName',
      value: user.name,
      httpOnly: true,
      path: '/',
      maxAge: 86400, // 1 day
    });

    response.cookies.set({
      name: 'ShopWaveUserEmail',
      value: user.email,
      httpOnly: true,
      path: '/',
      maxAge: 86400, // 1 day
    });

    response.cookies.set({
      name: 'ShopWaveUserRole',
      value: user.role,
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
