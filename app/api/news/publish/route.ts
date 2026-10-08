import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      adminKey,
      category,
      tag_bn,
      tag_en,
      title_bn,
      title_en,
      summary_bn,
      summary_en,
      author_bn,
      author_en,
    } = body;

    // Password validation check
    const secret = process.env.ADMIN_SECRET_KEY || '1234';
    if (!adminKey || adminKey !== secret) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin pin vul hoyeche.' },
        { status: 401 }
      );
    }

    if (!title_bn || !title_en || !summary_bn || !summary_en) {
      return NextResponse.json(
        { success: false, error: 'Shob ghor puron kora baddhotamulok.' },
        { status: 400 }
      );
    }

    const newArticle = {
      id: Date.now(),
      category,
      tag_bn,
      tag_en,
      title_bn,
      title_en,
      summary_bn,
      summary_en,
      author_bn: author_bn || 'নিজস্ব প্রতিবেদক',
      author_en: author_en || 'Staff Reporter',
      created_at: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, data: [newArticle] });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}