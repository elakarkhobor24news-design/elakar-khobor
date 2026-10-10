import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

export async function POST(req: Request) {
  try {
    const update = await req.json();

    if (update.callback_query) {
      const callbackQuery = update.callback_query;
      const callbackData = callbackQuery.data;
      const callbackId = callbackQuery.id;
      const messageId = callbackQuery.message?.message_id;
      const chatId = callbackQuery.message?.chat?.id;

      if (callbackData && callbackData.startsWith('approve:')) {
        const parts = callbackData.split(':');
        const reqId = parts[1];
        const docId = parts[2];

        // 1. Supabase ডাটাবেসে অনুমোদিত মার্ক করা
        if (supabase && reqId) {
          await supabase
            .from('secret_requests')
            .update({ status: 'approved' })
            .eq('id', reqId);
        }

        // 2. টেলিগ্রামে ইনস্ট্যান্ট পপ-আপ মেসেজ দেখানো
        if (TELEGRAM_BOT_TOKEN) {
          await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              callback_query_id: callbackId,
              text: '✅ অনুমোদন সফল হয়েছে! পাঠক এখন দেখতে পাবে।',
              show_alert: true,
            }),
          });

          // 3. বাটনটি বদলে "অনুমোদিত" বানিয়ে দেওয়া
          if (chatId && messageId) {
            await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/editMessageReplyMarkup`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: chatId,
                message_id: messageId,
                reply_markup: {
                  inline_keyboard: [
                    [
                      {
                        text: '✅ অনুমোদিত (Approved)',
                        callback_data: 'none',
                      },
                    ],
                  ],
                },
              }),
            });
          }
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}