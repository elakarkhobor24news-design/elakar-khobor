import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    const serverSecret = process.env.ADMIN_SECRET_KEY;

    if (serverSecret && password === serverSecret) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  } catch {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}