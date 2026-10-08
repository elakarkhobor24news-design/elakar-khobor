import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    const serverSecret = process.env.ADMIN_SECRET_KEY;

    if (!serverSecret) {
      return NextResponse.json({ success: false, message: 'Key not configured' }, { status: 500 });
    }

    if (password === serverSecret) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false }, { status: 401 });
    }
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}