import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { password } = await req.json();
    const inputPass = String(password || '').trim();

    // Server env theke nibe, default fallback admin1090
    const correctSecret = process.env.ADMIN_SECRET_KEY || 'admin1090';

    if (inputPass === correctSecret) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}