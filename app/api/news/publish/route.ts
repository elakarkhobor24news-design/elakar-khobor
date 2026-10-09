import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { adminKey, ...articleData } = body;
    const serverSecret = process.env.ADMIN_SECRET_KEY;

    if (!serverSecret || adminKey !== serverSecret) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabaseServer
      .from('public_news')
      .insert([articleData])
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, article: data[0] });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}