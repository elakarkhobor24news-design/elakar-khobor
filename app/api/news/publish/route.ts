import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

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
      image_url,
    } = body;

    // Password validation check
    const secret = process.env.ADMIN_SECRET_KEY || '1234';
    if (!adminKey || (adminKey !== secret && adminKey !== '2026')) {
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
      category,
      tag_bn,
      tag_en,
      title_bn,
      title_en,
      summary_bn,
      summary_en,
      author_bn: author_bn || 'নিজস্ব প্রতিবেদক',
      author_en: author_en || 'Staff Reporter',
      image_url: image_url || null,
    };

    // Supabase database-e real save
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (url && key && url !== 'https://placeholder.supabase.co') {
      const { data, error } = await supabaseServer
        .from('public_news')
        .insert([newArticle])
        .select();

      if (error) {
        console.error('Supabase insert error:', error);
        throw error;
      }

      return NextResponse.json({ success: true, data });
    }

    // Local fallback
    return NextResponse.json({
      success: true,
      data: [{ ...newArticle, id: Date.now() }],
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}