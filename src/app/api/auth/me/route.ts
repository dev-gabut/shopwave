import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';

const SECRET_KEY = process.env.JWT_SECRET!;

export async function GET(req: NextRequest) {
  const token = req.cookies.get('ShopWaveToken')?.value;
  if (!token) return NextResponse.json({ user: null }, { status: 200 });

  try {
    const secret = new TextEncoder().encode(SECRET_KEY);
    const { payload } = await jwtVerify(token, secret);

    // Fetch user from DB to get full info (email, addresses, etc.)
    const user = await prisma.user.findUnique({
      where: { id: Number(payload.sub) },
      include: { addresses: true },
    });

    if (!user) return NextResponse.json({ user: null }, { status: 200 });

    return NextResponse.json({
      user: {
        id: String(user.id),
        email: user.email,
        role: user.role,
        imageUrl: user.imageUrl,
        addresses: user.addresses,
      }
    }, { status: 200 });
  } catch {
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
