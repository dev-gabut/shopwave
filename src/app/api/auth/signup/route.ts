import { NextRequest, NextResponse } from 'next/server';
import { signup } from '@/server/controllers/authControllers';

export async function POST(req: NextRequest) {
  const body = await req.json();
  try {
    await signup(body);
    return NextResponse.json({ succuess: true }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
