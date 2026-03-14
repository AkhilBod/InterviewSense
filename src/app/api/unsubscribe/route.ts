import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/unsubscribe?token=<base64email>
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 });
  }

  try {
    const email = Buffer.from(token, 'base64').toString('utf-8');

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ email, alreadyUnsubscribed: user.emailUnsubscribed });
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
  }
}

// POST /api/unsubscribe
export async function POST(req: Request) {
  const { token } = await req.json();

  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 });
  }

  try {
    const email = Buffer.from(token, 'base64').toString('utf-8');

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await prisma.user.update({
      where: { email },
      data: { emailUnsubscribed: true },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
  }
}
