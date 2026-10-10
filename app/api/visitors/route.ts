import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST() {
  try {
    if (!supabase) return NextResponse.json({ count: 1 });
    
    const { data } = await supabase
      .from('site_analytics')
      .select('count')
      .eq('id', 'total_views')
      .maybeSingle();

    const currentCount = data?.count ? Number(data.count) : 0;
    const newCount = currentCount + 1;

    await supabase
      .from('site_analytics')
      .upsert({ id: 'total_views', count: newCount }, { onConflict: 'id' });

    return NextResponse.json({ count: newCount });
  } catch (err: any) {
    return NextResponse.json({ count: 1 });
  }
}

export async function GET() {
  try {
    if (!supabase) return NextResponse.json({ count: 1 });
    const { data } = await supabase
      .from('site_analytics')
      .select('count')
      .eq('id', 'total_views')
      .maybeSingle();

    return NextResponse.json({ count: data?.count || 1 });
  } catch {
    return NextResponse.json({ count: 1 });
  }
}