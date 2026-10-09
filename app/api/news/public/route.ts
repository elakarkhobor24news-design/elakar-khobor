import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from('public_news')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, articles: [] }, { status: 200 });
    }

    return NextResponse.json(
      { success: true, articles: data || [] },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, articles: [] }, { status: 200 });
  }
}