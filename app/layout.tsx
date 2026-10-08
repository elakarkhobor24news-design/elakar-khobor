import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'এলাকার খবর | বস্তুনিষ্ঠ স্থানীয় ডিজিটাল সংবাদ মাধ্যম',
  description: 'বারুণা পশ্চিম পাড়াসহ স্থানীয় সকল অলিগলির সত্য ও নিরপেক্ষ সংবাদ।',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn" className="dark scroll-smooth">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;600;700&family=Plus+Jakarta+Sans:wght@400;600;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#060913] text-slate-100 font-sans selection:bg-rose-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}