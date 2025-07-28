import { NextRequest, NextResponse } from 'next/server';
import { loginUser } from '@/models/user';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    const user = await loginUser({ email, password });
    // Set HTTPOnly cookie using NextResponse
    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        addresses: user.addresses,
      }
    });
    response.headers.set('Set-Cookie', `token=${user.token}; HttpOnly; Path=/; Max-Age=86400`);
    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
