import { NextResponse } from 'next/server';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '';

export async function POST(req: Request) {
  try {
    const { author, landmark, content, time } = await req.json();

    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
      const text = `📢 *নতুন নাগরিক সংবাদ (Citizen Tip)!*\n\n👤 *প্রেরক:* ${author}\n📍 *এলাকা:* ${landmark}\n⏰ *সময়:* ${time}\n\n📝 *সংবাদ বিবরণ:*\n${content}`;

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