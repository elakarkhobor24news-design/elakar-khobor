import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { adminKey, code, title_bn, title_en, summary_bn, summary_en, cipher_bn, cipher_en } = body;

    const secret = process.env.ADMIN_SECRET_KEY || '1234';
    if (!adminKey || adminKey !== secret) {
      return NextResponse.json({ success: false, error: 'Unauthorized: ভুল অ্যাডমিন পাসওয়ার্ড।' }, { status: 401 });
    }

    // যদি Supabase কনফিগার করা থাকে তবে ডাটাবেসে যাবে
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { data, error } = await supabaseServer.from('secret_news').insert([
        { code, title_bn, title_en, summary_bn, summary_en, cipher_bn, cipher_en }
      ]).select();

      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }

    // ব্যাকআপ সাকসেস রেসপন্স
    return NextResponse.json({ success: true, data: [{ id: Date.now(), code }] });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}