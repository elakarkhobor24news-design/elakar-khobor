import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { password } = await req.json();
    const cleanPass = String(password || '').trim();

    // 1234 othoba 2026 dilei shathe shathe pass korbe
    if (cleanPass === '1234' || cleanPass === '2026') {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, error: 'Vul password' },
      { status: 401 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}