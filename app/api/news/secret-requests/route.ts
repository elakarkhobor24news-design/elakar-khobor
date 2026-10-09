import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

// Pathok onumoti chaile (POST)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, doc_id, name, reason, time } = body;

    const insertPayload = {
      id: id || 'req-' + Date.now(),
      doc_id: doc_id || '',
      name: name || 'বেনামী পাঠক',
      reason: reason || 'তদন্তমূলক রিপোর্ট পড়তে চাই',
      time: time || new Date().toLocaleTimeString('bn-BD', { timeZone: 'Asia/Dhaka' })
    };

    const { data, error } = await supabaseServer
      .from('secret_requests')
      .insert([insertPayload])
      .select();

    if (error) {
      console.error('Supabase request insert error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 200 });
    }

    return NextResponse.json({ success: true, request: data ? data[0] : insertPayload });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// Admin panel-e request list load korte (GET)
export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from('secret_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, requests: [] }, { status: 200 });
    }

    return NextResponse.json(
      { success: true, requests: data || [] },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  } catch {
    return NextResponse.json({ success: false, requests: [] }, { status: 200 });
  }
}

// Admin onumoti dewar por request delete korte (DELETE)
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    const { error } = await supabaseServer
      .from('secret_requests')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}