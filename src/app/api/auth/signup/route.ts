import { NextRequest, NextResponse } from 'next/server';
import { signup } from '@/server/controllers/authControllers';
import { prisma } from '@/lib/prisma'; 

export async function POST(req: NextRequest) {
  try {
    await prisma.$connect();
    
    const body = await req.json();
    await signup(body);
    
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  } finally {
    await prisma.$disconnect();
  }
}