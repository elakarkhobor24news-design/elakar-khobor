import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { adminKey, code, title_bn, title_en, summary_bn, summary_en, cipher_bn, cipher_en } = body;

    if (!adminKey || adminKey !== process.env.ADMIN_SECRET_KEY) {
      return NextResponse.json({ success: false, error: 'Unauthorized: vul admin password.' }, { status: 401 });
    }

    const { data, error } = await supabaseServer.from('secret_news').insert([
      { code, title_bn, title_en, summary_bn, summary_en, cipher_bn, cipher_en }
    ]).select();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}