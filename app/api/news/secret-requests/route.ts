import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const payload = {
      id: body.id || 'req-' + Date.now(),
      doc_id: body.doc_id || body.docId || '',
      name: body.name || 'Anonymous',
      reason: body.reason || 'Want to read',
      time: body.time || new Date().toLocaleTimeString('bn-BD', { timeZone: 'Asia/Dhaka' })
    };

    const { data, error } = await supabaseServer
      .from('secret_requests')
      .insert([payload])
      .select();

    if (error) {
      console.error('Request insert error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 200 });
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
      console.error('Request get error:', error);
      return NextResponse.json({ success: false, requests: [] }, { status: 200 });
    }

    return NextResponse.json(
      { success: true, requests: data || [] },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, requests: [] }, { status: 500 });
  }
}

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