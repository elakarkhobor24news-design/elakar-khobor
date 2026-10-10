import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const reqId = searchParams.get('reqId');

  if (supabase && reqId) {
    await supabase
      .from('secret_requests')
      .update({ status: 'approved' })
      .eq('id', reqId);
  }

  return new Response(
    `<!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>অনুমোদিত</title>
      </head>
      <body style="background:#04060c;color:#10b981;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center;">
        <div style="padding:30px;background:#0f172a;border-radius:20px;border:1px solid #10b981;max-width:320px;">
          <h1 style="font-size:40px;margin:0 0 10px;">✓</h1>
          <h2 style="margin:0;font-size:18px;">অনুমোদন সফল হয়েছে!</h2>
          <p style="color:#94a3b8;font-size:13px;margin-top:8px;">পাঠক এখন তার স্ক্রিনে গোপন প্রতিবেদনটি দেখতে পাচ্ছে।</p>
        </div>
      </body>
    </html>`,
    {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    }
  );
}