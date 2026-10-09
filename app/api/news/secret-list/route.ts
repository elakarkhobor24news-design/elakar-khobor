import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from('secret_news')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, secrets: [] }, { status: 200 });
    }

    return NextResponse.json(
      { success: true, secrets: data || [] },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  } catch {
    return NextResponse.json({ success: false, secrets: [] }, { status: 200 });
  }
}