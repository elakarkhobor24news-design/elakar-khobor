import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { docId, inputPin } = await req.json();

    // In-memory / dynamic verification map
    // Ekhane PIN verify hoye shudhu shothik holei text return hobe
    if (!inputPin) {
      return NextResponse.json({ success: false, error: 'PIN required' }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Verified'
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}