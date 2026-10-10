import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '';

// 1. GET: Fetch pending requests
export async function GET() {
  try {
    if (!supabase) {
      return NextResponse.json({ requests: [] });
    }
    const { data, error } = await supabase
      .from('secret_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ requests: [] });
    }
    return NextResponse.json({ requests: data || [] });
  } catch {
    return NextResponse.json({ requests: [] });
  }
}

// 2. POST: Reader submits request -> Save to DB & Send to Telegram
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, doc_id, name, reason, time } = body;

    if (supabase) {
      await supabase.from('secret_requests').insert([
        {
          id,
          doc_id,
          name,
          reason,
          time,
          status: 'pending'
        }
      ]);
    }

    // Send Instant Alert to Telegram
    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
      const text = `🔔 *নতুন সিক্রেট রিপোর্ট রিকোয়েস্ট!*\n\n👤 *নাম:* ${name}\n📝 *কারণ:* ${reason}\n📁 *ডকুমেন্ট:* \`${doc_id}\`\n⏰ *সময়:* ${time}`;

      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: text,
          parse_mode: 'Markdown'
        })
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// 3. DELETE / APPROVE: Mark as approved or clear
export async function DELETE(req: Request) {
  try {
    const { id, docId } = await req.json();

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