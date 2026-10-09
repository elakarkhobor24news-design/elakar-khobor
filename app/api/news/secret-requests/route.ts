import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const payload = {
      id: body.id || 'req-' + Date.now(),
      doc_id: body.doc_id || body.docId || '',
      name: body.name || 'বেনামী পাঠক',
      reason: body.reason || 'তদন্তমূলক রিপোর্ট পড়তে চাই',
      time: body.time || new Date().toLocaleTimeString('bn-BD', { timeZone: 'Asia/Dhaka' }),
      status: 'pending'
    };

    const { data, error } = await supabaseServer
      .from('secret_requests')
      .insert([payload])
      .select();

    if (error) {
      console.error('Supabase secret_requests insert error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, request: data ? data[0] : payload });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from('secret_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase secret_requests get error:', error);
      return NextResponse.json({ success: false, error: error.message, requests: [] }, { status: 200 });
    }

    return NextResponse.json(
      { success: true, requests: data || [] },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message, requests: [] }, { status: 200 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    const { error } = await supabaseServer
      .from('secret_requests')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}