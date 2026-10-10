import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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

    if (error) throw error;
    return NextResponse.json({ requests: data || [] });
  } catch (err: any) {
    return NextResponse.json({ requests: [], error: err.message });
  }
}

// 2. POST: Submit a new access clearance request + notify Telegram with instant Callback Button
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

    // Telegram Notification with Direct In-App Callback Button (No external browser popup)
    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
      const text = `🔐 *অনুমতির নতুন অনুরোধ এসেছে!*\n\n👤 *পাঠক:* ${name}\n📄 *নথি কোড:* ${doc_id}\n📝 *কারণ:* ${reason}\n⏰ *সময়:* ${time}`;

      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: text,
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: '✅ অনুমোদন দিন (Approve)',
                  callback_data: `approve:${id}:${doc_id}`,
                },
              ],
            ],
          },
        }),
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