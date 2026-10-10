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
        const [, reqId, docId] = callbackData.split(':');

        if (supabase && reqId) {
          await supabase
            .from('secret_requests')
            .update({ status: 'approved' })
            .eq('id', reqId);
        }

        // 1. Telegram alert popup (No browser redirect)
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            callback_query_id: callbackId,
            text: '✓ Anumodon shofol hoyeche! Pathok ekhon secret document porte parbe.',
            show_alert: true,
          }),
        });

        // 2. Message-ti instantly update kore deya
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
                      text: '✅ Approved (Anumodito)',
                      callback_data: 'done',
                    },
                  ],
                ],
              },
            }),
          });
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}