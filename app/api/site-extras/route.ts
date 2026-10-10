import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    if (!supabase) return NextResponse.json({ extras: {} });
    const { data } = await supabase.from('site_extras').select('*');
    const result: Record<string, string> = {};
    data?.forEach((item: any) => {
      result[item.key] = item.value;
    });
    return NextResponse.json({ extras: result });
  } catch {
    return NextResponse.json({ extras: {} });
  }
}

export async function POST(req: Request) {
  try {
    const { key, value } = await req.json();
    if (supabase && key) {
      await supabase.from('site_extras').upsert({ key, value }, { onConflict: 'key' });
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}