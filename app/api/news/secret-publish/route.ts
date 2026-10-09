import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { adminKey, ...docData } = body;

    const serverSecret = process.env.ADMIN_SECRET_KEY || 'admin1090';
    if (!adminKey || String(adminKey).trim() !== serverSecret) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabaseServer
      .from('secret_news')
      .insert([docData])
      .select();

    if (error) {
      console.error("Secret publish db error:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, secret: data[0] });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}