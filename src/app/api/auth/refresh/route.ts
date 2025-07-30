import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'shopwave-secret';

export async function GET(req: NextRequest) {
  try {
    // Ensure Prisma is connected
    await prisma.$connect();

    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'No token found' }, { status: 401 });
    }

    let payload: { id: number; role: string; exp: number };
    try {
      payload = jwt.verify(token, JWT_SECRET) as { id: number; role: string; exp: number };
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      include: { addresses: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: String(user.id),
        email: user.email,
        role: user.role.toLowerCase(),
        addresses: user.addresses.map((address) => ({
          id: String(address.id),
          label: address.label,
          address: address.address,
          city: address.city,
          province: address.province,
          postalCode: address.postalCode,
          isDefault: address.isDefault,
        })),
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `Internal server error: ${errorMessage}` }, { status: 500 });
  } finally {
    // Disconnect Prisma client
    await prisma.$disconnect();
  }
}