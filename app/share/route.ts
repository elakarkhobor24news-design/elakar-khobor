import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  let title = 'এলাকার খবর | বস্তুনিষ্ঠ স্থানীয় ডিজিটাল সংবাদ মাধ্যম';
  let description = 'বারুণা পশ্চিম পাড়ার খবর ও আপডেট।';
  let image = 'https://images.unsplash.com/photo-1541888946425-d0fbb1861593?auto=format&fit=crop&w=1200&h=630&q=80';

  if (id) {
    try {
      const { data } = await supabaseServer
        .from('public_news')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (data) {
        title = data.title_bn || data.title_en || title;
        description = data.summary_bn || data.summary_en || description;
        if (data.image_url) {
          image = data.image_url;
        }
      }
    } catch {}
  }

  const destinationUrl = `https://elakar-khobor24news.vercel.app/?article=${id || ''}`;

  // Facebook crawler-er jonno Open Graph HTML banano
  const html = `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="এলাকার খবর" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${image}" />
  <meta property="og:url" content="https://elakar-khobor24news.vercel.app/share?id=${id || ''}" />
  <meta http-equiv="refresh" content="0;url=${destinationUrl}" />
</head>
<body style="background:#04060c;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;">
  <p>লোড হচ্ছে... অপেক্ষা করুন।</p>
  <script>window.location.href = "${destinationUrl}";</script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}