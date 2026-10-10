import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '';

export async function GET() {
  try {
    if (!supabase) return NextResponse.json({ requests: [] });
    const { data, error } = await supabase
      .from('secret_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ requests: data || [] });
  } catch (err: any) {
    return NextResponse.json({ requests: [], error: err.message });
  }
}

export async function POST(req: Request) {
  try {
    const { id, doc_id, name, reason, time } = await req.json();

    if (supabase) {
      await supabase.from('secret_requests').insert([
        {
          id,
          doc_id,
          name,
          reason,
          time,
          status: 'pending',
        },
      ]);
    }

    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
      const approveLink = `https://elakar-khobor.netlify.app/api/news/approve?reqId=${id}`;
      const text = `🔐 *অনুমতির নতুন অনুরোধ এসেছে!*\n\n👤 *পাঠক:* ${name}\n📄 *নথি কোড:* ${doc_id}\n📝 *কারণ:* ${reason}\n⏰ *সময়:* ${time}\n\n👉 *অনুমোদন দিতে নিচের লিংকে চাপুন:*\n${approveLink}`;

      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: text,
          parse_mode: 'Markdown',
        }),
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    if (supabase) {
      await supabase
        .from('secret_requests')
        .update({ status: 'approved' })
        .eq('id', id);
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}