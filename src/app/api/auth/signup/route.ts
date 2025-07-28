import { NextRequest, NextResponse } from 'next/server';
import { signup } from '@/server/controllers/authControllers';

export async function POST(req: NextRequest) {
  const body = await req.json();
  try {
    await signup(body);
    return NextResponse.json({ succuess: true }, { status: 201 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}
