import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://elakar-khobor24news.vercel.app'),
  title: 'এলাকার খবর | বস্তুনিষ্ঠ স্থানীয় ডিজিটাল সংবাদ মাধ্যম',
  description: 'বারুণা পশ্চিম পাড়ার উন্নয়ন, ইতিহাস, সত্য সংবাদ ও স্থানীয় নাগরিক কণ্ঠস্বর।',
  openGraph: {
    title: 'এলাকার খবর | বস্তুনিষ্ঠ স্থানীয় ডিজিটাল সংবাদ মাধ্যম',
    description: 'বারুণা পশ্চিম পাড়ার উন্নয়ন, ইতিহাস, সত্য সংবাদ ও স্থানীয় নাগরিক কণ্ঠস্বর।',
    url: 'https://elakar-khobor24news.vercel.app',
    siteName: 'এলাকার খবর',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1541888946425-d0fbb1861593?auto=format&fit=crop&w=1200&h=630&q=80',
        width: 1200,
        height: 630,
        alt: 'এলাকার খবর',
      },
    ],
    locale: 'bn_BD',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn">
      <body className={inter.className}>{children}</body>
    </html>
  );
}