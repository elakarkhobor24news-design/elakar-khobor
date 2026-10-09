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
      console.error('SUPABASE_ERROR_DETAILS:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 200 });
    }

    return NextResponse.json({ success: true, secret: data ? data[0] : docData });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}