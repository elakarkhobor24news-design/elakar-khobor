import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

// পাঠক যখন অনুমতি চাইবে (POST)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { data, error } = await supabaseServer
      .from('secret_requests')
      .insert([body])
      .select();

    if (error) throw error;
    return NextResponse.json({ success: true, request: data[0] });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// অ্যাডমিন ডেস্কে তালিকা লোড করতে (GET)
export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from('secret_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ success: true, requests: data || [] }, {
      headers: { 'Cache-Control': 'no-store, max-age=0' }
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, requests: [] }, { status: 200 });
  }
}

// অ্যাডমিন অনুমোদন দেওয়ার পর তালিকা থেকে মুছতে (DELETE)
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