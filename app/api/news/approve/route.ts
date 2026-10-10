import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const reqId = searchParams.get('reqId');
  const docId = searchParams.get('docId');

  if (!reqId || !docId) {
    return new Response('Invalid Request', { status: 400 });
  }

  try {
    await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://elakar-khobor.netlify.app'}/api/news/secret-requests`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: reqId, docId }),
    });

    return new Response(`
      <html>
        <body style="background:#090d16;color:#22c55e;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
          <div style="text-align:center;padding:24px;background:#111827;border-radius:16px;border:1px solid #16a34a;">
            <h2>✓ Anumodon Shofol Hoyeche!</h2>
            <p style="color:#e2e8f0;">Pathok ekhon secret document-ti porte parbe.</p>
          </div>
        </body>
      </html>
    `, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  } catch (err: any) {
    return new Response('Error approving request: ' + err.message, { status: 500 });
  }
}