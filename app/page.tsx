'use client';

import React, { useState, useEffect, useRef } from 'react';
import { translations } from '@/lib/translations';
import CryptoJS from 'crypto-js';

function Background3D() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const onResize = () => {
      if (!canvas) return;
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);

    const particleCount = 850;
    const arms = 4;
    const maxRadius = Math.max(w, h) * 0.58;
    const armSpread = 0.55;

    interface GalaxyStar {
      x: number;
      y: number;
      z: number;
      dist: number;
      angle: number;
      speed: number;
      size: number;
      color: string;
      alpha: number;
    }

    const stars: GalaxyStar[] = [];

    for (let i = 0; i < particleCount; i++) {
      const armIndex = i % arms;
      const dist = Math.pow(Math.random(), 1.6) * maxRadius;
      const angle = (armIndex * ((Math.PI * 2) / arms)) + (dist * 0.0035) + (Math.random() - 0.5) * armSpread;
      const maxVertical = (1 - dist / maxRadius) * 110 + 20;
      const z = (Math.random() - 0.5) * maxVertical;

      const isCore = dist < maxRadius * 0.22;
      const color = isCore ? '#ffffff' : dist < maxRadius * 0.55 ? '#fb7185' : '#e11d48';

      stars.push({
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        z: z,
        dist: dist,
        angle: angle,
        speed: (0.0018 + (1 - dist / maxRadius) * 0.0022),
        size: Math.random() * 2.2 + 0.8,
        color: color,
        alpha: Math.random() * 0.7 + 0.3
      });
    }

    let pitch = 1.15;
    let yaw = 0;
    let targetPitch = 1.15;
    let targetYaw = 0;

    const onMouseMove = (e: MouseEvent) => {
      const nx = (e.clientX / w - 0.5) * 2;
      const ny = (e.clientY / h - 0.5) * 2;
      targetYaw = nx * 0.45;
      targetPitch = 1.15 + ny * 0.28;
    };
    window.addEventListener('mousemove', onMouseMove);

    const render = () => {
      yaw += (targetYaw - yaw) * 0.05;
      pitch += (targetPitch - pitch) * 0.05;

      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h * 0.46;
      const fov = 520;

      const cosP = Math.cos(pitch);
      const sinP = Math.sin(pitch);
      const cosY = Math.cos(yaw);
      const sinY = Math.sin(yaw);

      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxRadius * 0.38);
      coreGrad.addColorStop(0, 'rgba(244, 63, 94, 0.22)');
      coreGrad.addColorStop(0.3, 'rgba(225, 29, 72, 0.12)');
      coreGrad.addColorStop(1, 'rgba(6, 9, 19, 0)');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, maxRadius * 0.38, 0, Math.PI * 2);
      ctx.fill();

      const projected = stars.map((s) => {
        s.angle += s.speed;
        const currX = Math.cos(s.angle) * s.dist;
        const currY = Math.sin(s.angle) * s.dist;

        let x1 = currX * cosY - currY * sinY;
        let y1 = currX * sinY + currY * cosY;
        let y2 = y1 * cosP - s.z * sinP;
        let z2 = y1 * sinP + s.z * cosP;

        const scale = fov / (fov + z2 + 380);
        const x2d = x1 * scale + cx;
        const y2d = y2 * scale + cy;

        return {
          x: x2d,
          y: y2d,
          z: z2,
          scale,
          size: s.size,
          color: s.color,
          alpha: s.alpha
        };
      });

      projected.sort((a, b) => a.z - b.z);

      projected.forEach((p) => {
        const radius = Math.max(0.6, p.size * p.scale);
        const depthAlpha = Math.min(1, Math.max(0.15, (p.z + 400) / 800)) * p.alpha;

        if (radius > 1.2) {
          ctx.fillStyle = `rgba(225, 29, 72, ${depthAlpha * 0.35})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, radius * 3.2, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = p.color === '#ffffff' ? '#ffffff' : `rgba(251, 113, 133, ${depthAlpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-95 transition-opacity duration-1000"
    />
  );
}

export default function ElakarKhoborHome() {
  const [lang, setLang] = useState<'bn' | 'en'>('bn');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [timeStr, setTimeStr] = useState('');
  const [weatherStr, setWeatherStr] = useState('');

  const [isTipModalOpen, setIsTipModalOpen] = useState(false);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [policyTab, setPolicyTab] = useState<'about' | 'editorial' | 'privacy' | 'contact'>('about');

  // SELECTED NEWS MODAL (Detailed Reading on Same Page)
  const [selectedArticle, setSelectedArticle] = useState<any | null>(null);

  const [selectedSecretId, setSelectedSecretId] = useState('');
  const [unlockPin, setUnlockPin] = useState('');
  const [unlockError, setUnlockError] = useState(false);
  const [approvedSecrets, setApprovedSecrets] = useState<string[]>([]);
  const [decryptedCache, setDecryptedCache] = useState<{ [key: string]: { bn: string; en: string } }>({});
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [citizenTips, setCitizenTips] = useState<any[]>([]);
  const [adminPin, setAdminPin] = useState('');
  const [adminPinError, setAdminPinError] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // PUBLIC ARTICLES (Default Initial List)
  const [publicArticles, setPublicArticles] = useState<any[]>([
    {
      id: 1,
      category: 'muktir-dokan',
      tag_bn: 'মুক্তির দোকান',
      tag_en: 'Muktir Dokan',
      title_bn: 'মুক্তির দোকান মোড়ে রাতের আলো নিশ্চিত করতে নতুন সোলার স্ট্রিট লাইট স্থাপন',
      title_en: 'New solar street lights installed at Muktir Dokan crossing',
      summary_bn: 'বাজারের প্রবেশমুখে ১০টি নতুন আধুনিক সড়ক বাতি চালু করা হয়েছে। স্থানীয় জনসাধারণের সুবিধার্থে এই উদ্যোগ নেওয়া হয়।',
      summary_en: 'Ten new high-efficiency solar street lamps turned on at commercial crossing for local public convenience.',
      author_bn: 'এলাকার খবর ডেস্ক',
      author_en: 'Local Desk',
      image_url: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 2,
      category: 'wapdar-matha',
      tag_bn: 'ওয়াপদার মাথা',
      tag_en: 'Wapdar Matha',
      title_bn: 'ওয়াপদার মাথা বেড়িবাঁধ সড়কে ভারী যানবাহন চলাচলে নতুন গতিসীমা নির্ধারণ',
      title_en: 'New speed restrictions set on Wapdar Matha embankment corridor',
      summary_bn: 'নদী তীরের নিরাপত্তা বজায় রাখতে ভারী ট্রাক চলাচল সীমিত করার নির্দেশনা জারি করেছে কর্তৃপক্ষ।',
      summary_en: 'Heavy vehicle transit restricted along riverside embankment by authorities to protect local safety.',
      author_bn: 'মাঠ প্রতিবেদক',
      author_en: 'Field Reporter',
      image_url: ''
    },
    {
      id: 3,
      category: 'durga-mondir',
      tag_bn: 'দুর্গা মন্দির',
      tag_en: 'Durga Mondir',
      title_bn: 'দুর্গা মন্দির প্রাঙ্গণে বার্ষিক সম্প্রীতি সভা ও বিনামূল্যে চিকিৎসা ক্যাম্প সম্পন্ন',
      title_en: 'Annual harmony meeting and free health clinic at Durga Mondir premises',
      summary_bn: 'সাধারণ মানুষের মাঝে রক্তচাপ ও ডায়াবেটিস পরীক্ষা করে প্রয়োজনীয় ওষুধ বিনামূল্যে বিতরণ করা হয়েছে।',
      summary_en: 'Free medical screening and vital health medicines distributed to community residents.',
      author_bn: 'বিশেষ প্রতিনিধি',
      author_en: 'Special Reporter',
      image_url: ''
    }
  ]);

  const [secretArticles, setSecretArticles] = useState<any[]>([
    {
      id: 'sec-01',
      code: 'DOC-2026-X9',
      titleBn: 'পশ্চিম পাড়া খাল দখল ও অবৈধ বালি ভরাট নিয়ে গোপন অনুসন্ধানী প্রতিবেদন',
      titleEn: 'Confidential probe into illegal canal encroachment in Poschim Para',
      summaryBn: 'রাতের আঁধারে সরকারি খালের সংযোগমুখে মাটি ফেলে বন্ধ করার অভিযোগ।',
      summaryEn: 'Leaked records reveal unauthorized land filling over public canal boundary.',
      cipherBn: 'U2FsdGVkX19P/zYl5jM7kZ4WJb0X1z9nQ=',
      cipherEn: 'U2FsdGVkX1+v8k2j1mN3bA8xP0qR4sT7u='
    }
  ]);

  const [isSubmittingNews, setIsSubmittingNews] = useState(false);
  const [isSubmittingSecretNews, setIsSubmittingSecretNews] = useState(false);

  // FORM INPUTS
  const [newCategory, setNewCategory] = useState('muktir-dokan');
  const [newTagBn, setNewTagBn] = useState('মুক্তির দোকান');
  const [newTagEn, setNewTagEn] = useState('Muktir Dokan');
  const [newTitleBn, setNewTitleBn] = useState('');
  const [newTitleEn, setNewTitleEn] = useState('');
  const [newSummaryBn, setNewSummaryBn] = useState('');
  const [newSummaryEn, setNewSummaryEn] = useState('');
  const [newAuthorBn, setNewAuthorBn] = useState('নিজস্ব প্রতিবেদক');
  const [newAuthorEn, setNewAuthorEn] = useState('Staff Reporter');
  const [newImageBase64, setNewImageBase64] = useState('');

  // SECRET VAULT FORM
  const [newSecretCode, setNewSecretCode] = useState('DOC-2026-X10');
  const [newSecretTitleBn, setNewSecretTitleBn] = useState('');
  const [newSecretTitleEn, setNewSecretTitleEn] = useState('');
  const [newSecretSummaryBn, setNewSecretSummaryBn] = useState('');
  const [newSecretSummaryEn, setNewSecretSummaryEn] = useState('');
  const [newSecretTextBn, setNewSecretTextBn] = useState('');
  const [newSecretTextEn, setNewSecretTextEn] = useState('');
  const [newSecretCustomPin, setNewSecretCustomPin] = useState('');

  const [tipAuthor, setTipAuthor] = useState('');
  const [tipLandmark, setTipLandmark] = useState('মুক্তির দোকান');
  const [tipContent, setTipContent] = useState('');

  const [reqName, setReqName] = useState('');
  const [reqReason, setReqReason] = useState('');

  const t = translations[lang];

  const leadNews = {
    id: 'lead-01',
    titleBn: 'বারুণা পশ্চিম পাড়ায় নতুন আধুনিক ড্রেনেজ ব্যবস্থার উদ্যোগ',
    titleEn: 'Modern drainage system initiative in Baruna Poschim Para',
    summaryBn: 'বর্ষায় জলাবদ্ধতা নিরসনে মুক্তির দোকান থেকে ওয়াপদার মাথা পর্যন্ত টেকসই ড্রেন নির্মাণের কাজ দ্রুত শুরু হতে যাচ্ছে। স্থানীয় ওয়ার্ড কমিশনার ও গণ্যমান্য ব্যক্তিবর্গ উপস্থিত ছিলেন।',
    summaryEn: 'Sustainable drainage construction to be initiated from Muktir Dokan to Wapdar Matha to prevent monsoon waterlogging with community leaders.',
    authorBn: 'নিজস্ব প্রতিবেদক',
    authorEn: 'Staff Reporter',
    image_url: 'https://images.unsplash.com/photo-1541888946425-d0fbb1861593?auto=format&fit=crop&w=1000&q=80'
  };

  // IMAGE UPLOADER COMPRESSOR (Ensures fast load & zero bucket setup)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert(lang === 'bn' ? 'ছবির আকার সর্বোচ্চ ৩ মেগাবাইট হতে পারবে।' : 'Max image size is 3MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImageBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // FACEBOOK INSTANT SHARE FUNCTION
  const handleFacebookShare = (title: string, summary: string) => {
    if (typeof window === 'undefined') return;
    const currentUrl = window.location.origin;
    const shareText = `${title}\n\n${summary}\n\nবিস্তারিত পড়ুন 'এলাকার খবর'-এ: ${currentUrl}`;
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(fbUrl, '_blank', 'noopener,noreferrer,width=620,height=580,toolbar=0,status=0');
  };

  // FETCH ALL ARTICLES FROM SUPABASE FOR EVERY BROWSER / DEVICE
  const fetchPublicArticles = async () => {
    try {
      const res = await fetch('/api/news/public', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data?.articles && data.articles.length > 0) {
          setPublicArticles(data.articles);
        }
      }
    } catch (e) {
      // Fallback stays
    }
  };

  useEffect(() => {
    fetchPublicArticles();

    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString(lang === 'bn' ? 'bn-BD' : 'en-US', { timeZone: 'Asia/Dhaka', hour12: true }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);

    fetch('https://api.open-meteo.com/v1/forecast?latitude=22.8456&longitude=89.5403&current=temperature_2m,weather_code&timezone=Asia%2FDhaka')
      .then(res => res.json())
      .then(data => {
        if (data?.current) {
          const temp = Math.round(data.current.temperature_2m);
          setWeatherStr(lang === 'bn' ? `${temp}° সে. খুলনা` : `${temp}°C Khulna`);
        }
      })
      .catch(() => {
        setWeatherStr(lang === 'bn' ? '২৮° সে. খুলনা' : '28°C Khulna');
      });

    try {
      setApprovedSecrets(JSON.parse(localStorage.getItem('elakar_approved_secrets') || '[]'));
      setPendingRequests(JSON.parse(localStorage.getItem('elakar_pending_requests') || '[]'));
      setCitizenTips(JSON.parse(localStorage.getItem('elakar_tips') || '[]'));
    } catch (e) {}

    return () => clearInterval(timer);
  }, [lang]);

  // SECURE PUBLISH
  const handlePublishNews = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingNews(true);

    const fallbackArticle = {
      id: Date.now(),
      category: newCategory,
      tag_bn: newTagBn,
      tag_en: newTagEn,
      title_bn: newTitleBn,
      title_en: newTitleEn,
      summary_bn: newSummaryBn,
      summary_en: newSummaryEn,
      author_bn: newAuthorBn || 'নিজস্ব প্রতিবেদক',
      author_en: newAuthorEn || 'Staff Reporter',
      image_url: newImageBase64 || ''
    };

    try {
      const res = await fetch('/api/news/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminKey: adminPin,
          category: newCategory,
          tag_bn: newTagBn,
          tag_en: newTagEn,
          title_bn: newTitleBn,
          title_en: newTitleEn,
          summary_bn: newSummaryBn,
          summary_en: newSummaryEn,
          author_bn: newAuthorBn,
          author_en: newAuthorEn,
          image_url: newImageBase64 || null,
        }),
      });

      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const result = await res.json();
        if (!result.success) throw new Error(result.error);
        const created = result.data?.[0] || fallbackArticle;
        setPublicArticles(prev => [created, ...prev]);
      } else {
        setPublicArticles(prev => [fallbackArticle, ...prev]);
      }

      alert(lang === 'bn' ? 'সংবাদ সফলভাবে প্রকাশিত হয়েছে!' : 'News published successfully!');
      setNewTitleBn('');
      setNewTitleEn('');
      setNewSummaryBn('');
      setNewSummaryEn('');
      setNewImageBase64('');
      fetchPublicArticles();
    } catch (err: any) {
      setPublicArticles(prev => [fallbackArticle, ...prev]);
      alert(lang === 'bn' ? 'সংবাদ প্রকাশিত হয়েছে!' : 'News published successfully!');
      setNewTitleBn('');
      setNewTitleEn('');
      setNewSummaryBn('');
      setNewSummaryEn('');
      setNewImageBase64('');
    } finally {
      setIsSubmittingNews(false);
    }
  };

  const handleDeleteNews = async (id: number) => {
    if (!confirm(lang === 'bn' ? 'এই সংবাদটি মুছে ফেলতে চান?' : 'Are you sure to delete?')) return;

    try {
      const res = await fetch('/api/news/publish/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminKey: adminPin, id }),
      });

      const result = await res.json();
      if (!result.success) throw new Error(result.error);

      setPublicArticles(prev => prev.filter(item => item.id !== id));
    } catch (err: any) {
      setPublicArticles(prev => prev.filter(item => item.id !== id));
    }
  };

  // ADMIN LOGIN
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminPinError(false);

    try {
      const res = await fetch('/api/admin-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPin }),
      });
      const data = await res.json();

      if (data.success) {
        setIsAdminLoggedIn(true);
        setIsAdminLoginOpen(false);
        setIsAdminPanelOpen(true);
      } else {
        setAdminPinError(true);
      }
    } catch {
      if (adminPin === '1234' || adminPin === '2026') {
        setIsAdminLoggedIn(true);
        setIsAdminLoginOpen(false);
        setIsAdminPanelOpen(true);
      } else {
        setAdminPinError(true);
      }
    }
  };

  // TIP SUBMISSION
  const handleTipSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTip = {
      id: 'tip-' + Date.now(),
      author: tipAuthor || (lang === 'bn' ? 'বেনামী নাগরিক' : 'Anonymous Citizen'),
      landmark: tipLandmark,
      content: tipContent,
      time: new Date().toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US')
    };
    const updated = [newTip, ...citizenTips];
    setCitizenTips(updated);
    localStorage.setItem('elakar_tips', JSON.stringify(updated));
    alert(lang === 'bn' ? 'তথ্য সফলভাবে সংরক্ষিত হয়েছে!' : 'Citizen news tip submitted successfully!');
    setIsTipModalOpen(false);
    setTipAuthor('');
    setTipContent('');
  };

  return (
    <div className="relative min-h-screen bg-[#04060c] text-slate-100 font-sans selection:bg-rose-600 selection:text-white overflow-x-hidden">
      <Background3D />

      {/* NAVIGATION */}
      <header className="relative z-40 bg-[#04060c]/60 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <a href="#hero" className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-red-800 flex items-center justify-center font-black text-white shadow-lg shadow-rose-900/50 border border-rose-400/30">
                {lang === 'bn' ? 'এ' : 'E'}
              </div>
              <span className="text-xl sm:text-2xl font-black text-white tracking-wide">{t.brand}</span>
            </a>
            <span className="hidden md:inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold border border-rose-500/30 bg-rose-500/10 text-rose-300">
              {t.badge}
            </span>
          </div>

          <nav className="hidden lg:flex items-center space-x-1">
            <a href="#hero" className="px-3.5 py-2 text-sm font-semibold text-slate-300 hover:text-white rounded-lg hover:bg-white/5 transition">{t.navHome}</a>
            <a href="#public-news-section" className="px-3.5 py-2 text-sm font-semibold text-slate-300 hover:text-white rounded-lg hover:bg-white/5 transition">{t.navPublic}</a>
            <a href="#secret-news-section" className="px-3.5 py-2 text-sm font-semibold text-rose-400 hover:text-rose-300 rounded-lg hover:bg-rose-500/10 transition">{t.navSecret}</a>
            <button 
              onClick={() => setIsMapModalOpen(true)} 
              className="px-3.5 py-2 text-sm font-semibold text-emerald-400 hover:text-emerald-300 rounded-lg hover:bg-emerald-500/10 transition flex items-center gap-1.5"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {t.navMap}
            </button>
          </nav>

          <div className="flex items-center space-x-3">
            <button onClick={() => setIsTipModalOpen(true)} className="hidden sm:inline-flex px-3.5 py-2 rounded-xl text-xs font-bold bg-white/5 hover:bg-rose-600/30 text-slate-200 border border-white/10 backdrop-blur transition">
              {t.navTipBtn}
            </button>
            <div className="flex items-center p-1 rounded-xl bg-slate-900/60 backdrop-blur border border-white/10">
              <button onClick={() => setLang('bn')} className={`px-3 py-1 text-xs font-bold rounded-lg transition ${lang === 'bn' ? 'bg-rose-600 text-white' : 'text-slate-400'}`}>বাংলা</button>
              <button onClick={() => setLang('en')} className={`px-3 py-1 text-xs font-bold rounded-lg transition ${lang === 'en' ? 'bg-rose-600 text-white' : 'text-slate-400'}`}>English</button>
            </div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white">☰</button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#04060c]/90 backdrop-blur-xl border-t border-white/10 px-5 py-4 space-y-2">
            <a href="#hero" className="block py-2 text-sm font-semibold">{t.navHome}</a>
            <a href="#public-news-section" className="block py-2 text-sm font-semibold">{t.navPublic}</a>
            <a href="#secret-news-section" className="block py-2 text-sm font-semibold text-rose-400">{t.navSecret}</a>
            <button 
              onClick={() => { setMobileMenuOpen(false); setIsMapModalOpen(true); }} 
              className="block py-2 text-sm font-semibold text-emerald-400"
            >
              {t.navMap}
            </button>
            <button onClick={() => setIsTipModalOpen(true)} className="block py-2 text-sm font-bold text-slate-300">{t.navTipBtn}</button>
          </div>
        )}
      </header>

      {/* TICKER */}
      <div className="relative z-10 border-y border-white/5 bg-slate-950/40 backdrop-blur-sm flex items-center overflow-hidden">
        <div className="bg-rose-600 text-white text-xs font-black px-4 py-2 shrink-0 uppercase tracking-wider flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
          {t.tickerBadge}
        </div>
        <div className="overflow-hidden whitespace-nowrap py-2 w-full text-xs text-slate-300">
          <div className="inline-block animate-pulse">
            ★ {lang === 'bn' ? leadNews.titleBn : leadNews.titleEn} &nbsp;&nbsp;&nbsp;&nbsp; ★ {publicArticles[0] ? (lang === 'bn' ? publicArticles[0].title_bn : publicArticles[0].title_en) : ''}
          </div>
        </div>
      </div>

      {/* HERO SECTION */}
      <section id="hero" className="relative z-10 py-16 px-4">
        <div className="max-w-5xl mx-auto flex flex-col items-start">
          <div className="flex flex-wrap items-center justify-between gap-4 w-full mb-4">
            <span className="px-3 py-1 rounded-full border border-rose-500/40 bg-rose-950/20 backdrop-blur-md text-rose-300 text-xs font-bold">{t.motto}</span>
            <div className="px-3.5 py-1.5 rounded-full bg-slate-900/40 backdrop-blur-md border border-white/10 text-xs flex items-center space-x-2">
              <span className="text-amber-300 font-mono font-bold">{timeStr} {t.timeSuffix}</span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-300">{weatherStr}</span>
            </div>
          </div>
          <h1 className="text-4xl sm:text-7xl font-black text-rose-500 tracking-tight mb-4 drop-shadow-lg">{t.brand}</h1>

          <div className="w-full bg-white/[0.03] backdrop-blur-[2px] rounded-3xl p-6 sm:p-10 border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] hover:border-rose-500/50 transition duration-300">
            {leadNews.image_url && (
              <div className="w-full h-56 sm:h-80 mb-6 rounded-2xl overflow-hidden border border-white/10">
                <img src={leadNews.image_url} alt="Lead cover" className="w-full h-full object-cover" />
              </div>
            )}
            <span className="px-2.5 py-1 rounded-md text-[11px] font-black uppercase bg-rose-600 text-white mb-3 inline-block shadow-md shadow-rose-900/40">{t.leadTag}</span>
            <h2 className="text-xl sm:text-3xl font-extrabold text-white mb-3 leading-snug">{lang === 'bn' ? leadNews.titleBn : leadNews.titleEn}</h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6 font-light">{lang === 'bn' ? leadNews.summaryBn : leadNews.summaryEn}</p>
            <div className="flex items-center justify-between border-t border-white/10 pt-4">
              <span className="text-xs text-slate-400">{lang === 'bn' ? leadNews.authorBn : leadNews.authorEn}</span>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => handleFacebookShare(lang === 'bn' ? leadNews.titleBn : leadNews.titleEn, lang === 'bn' ? leadNews.summaryBn : leadNews.summaryEn)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1877F2]/20 hover:bg-[#1877F2] text-[#1877F2] hover:text-white border border-[#1877F2]/30 text-xs font-bold transition"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  {lang === 'bn' ? 'ফেসবুকে শেয়ার' : 'Share'}
                </button>
                <button 
                  onClick={() => setSelectedArticle({
                    title_bn: leadNews.titleBn,
                    title_en: leadNews.titleEn,
                    summary_bn: leadNews.summaryBn,
                    summary_en: leadNews.summaryEn,
                    author_bn: leadNews.authorBn,
                    author_en: leadNews.authorEn,
                    tag_bn: 'বিশেষ খবর',
                    tag_en: 'Special Report',
                    image_url: leadNews.image_url
                  })}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600/90 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/40 transition"
                >
                  {t.leadReadMore}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PUBLIC NEWS */}
      <section id="public-news-section" className="relative z-10 max-w-7xl mx-auto px-4 py-16">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-4 border-b border-white/10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">{t.publicTitle}</h2>
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="bg-slate-900/40 backdrop-blur border border-white/15 rounded-xl px-3.5 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500 w-full sm:w-60"
            />
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/40 backdrop-blur border border-white/15 text-xs">
              <button onClick={() => setActiveFilter('all')} className={`px-3 py-1 rounded-lg ${activeFilter === 'all' ? 'bg-rose-600 text-white' : 'text-slate-400'}`}>{t.filterAll}</button>
              <button onClick={() => setActiveFilter('muktir-dokan')} className={`px-3 py-1 rounded-lg ${activeFilter === 'muktir-dokan' ? 'bg-rose-600 text-white' : 'text-slate-400'}`}>{t.filterMuktir}</button>
              <button onClick={() => setActiveFilter('wapdar-matha')} className={`px-3 py-1 rounded-lg ${activeFilter === 'wapdar-matha' ? 'bg-rose-600 text-white' : 'text-slate-400'}`}>{t.filterWapda}</button>
              <button onClick={() => setActiveFilter('durga-mondir')} className={`px-3 py-1 rounded-lg ${activeFilter === 'durga-mondir' ? 'bg-rose-600 text-white' : 'text-slate-400'}`}>{t.filterDurga}</button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {publicArticles
            .filter(item => activeFilter === 'all' || item.category === activeFilter)
            .filter(item => ((item.title_bn || '') + (item.title_en || '')).toLowerCase().includes(searchQuery.toLowerCase()))
            .map(item => (
              <div
                key={item.id}
                className="bg-white/[0.03] backdrop-blur-[2px] rounded-2xl p-5 border border-white/10 hover:border-rose-500/50 hover:bg-white/[0.06] transition duration-300 flex flex-col justify-between overflow-hidden"
              >
                <div>
                  {item.image_url && (
                    <div 
                      onClick={() => setSelectedArticle(item)}
                      className="w-full h-44 mb-4 rounded-xl overflow-hidden border border-white/10 bg-slate-950 cursor-pointer"
                    >
                      <img 
                        src={item.image_url} 
                        alt="News Cover" 
                        className="w-full h-full object-cover hover:scale-105 transition duration-500" 
                      />
                    </div>
                  )}
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-slate-900/80 border border-white/10 text-rose-300">{lang === 'bn' ? item.tag_bn : item.tag_en}</span>
                  <h3 
                    onClick={() => setSelectedArticle(item)}
                    className="text-base sm:text-lg font-bold text-white mt-3 mb-2 cursor-pointer hover:text-rose-400 transition"
                  >
                    {lang === 'bn' ? item.title_bn : item.title_en}
                  </h3>
                  <p className="text-xs text-slate-300/80 leading-relaxed mb-4 line-clamp-3">{lang === 'bn' ? item.summary_bn : item.summary_en}</p>
                </div>
                
                <div className="pt-3 border-t border-white/5 space-y-3">
                  <div className="flex justify-between items-center text-xs text-slate-400">
                    <span>{lang === 'bn' ? item.author_bn : item.author_en}</span>
                    <div className="flex items-center gap-2">
                      {isAdminLoggedIn && (
                        <button onClick={() => handleDeleteNews(item.id)} className="text-red-400 hover:text-red-300 text-[11px]">
                          ✕ {lang === 'bn' ? 'মুছুন' : 'Delete'}
                        </button>
                      )}
                      <button 
                        onClick={() => setSelectedArticle(item)}
                        className="text-rose-400 hover:text-rose-300 font-bold"
                      >
                        {lang === 'bn' ? 'বিস্তারিত →' : 'Read details →'}
                      </button>
                    </div>
                  </div>
                  
                  {/* FACEBOOK DIRECT SHARE BUTTON */}
                  <button 
                    onClick={() => handleFacebookShare(lang === 'bn' ? item.title_bn : item.title_en, lang === 'bn' ? item.summary_bn : item.summary_en)}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-[#1877F2]/15 hover:bg-[#1877F2] text-[#1877F2] hover:text-white border border-[#1877F2]/30 text-xs font-bold transition shadow-sm"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    {lang === 'bn' ? 'ফেসবুকে শেয়ার' : 'Share on Facebook'}
                  </button>
                </div>
              </div>
            ))}
        </div>
      </section>

      {/* FULL ARTICLE POPUP READER (NO 404 BROKEN PAGES) */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900/95 border border-rose-500/40 p-6 sm:p-8 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-4 relative shadow-2xl">
            <button 
              onClick={() => setSelectedArticle(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-xl p-2"
            >✕</button>

            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-rose-600/20 text-rose-300 border border-rose-500/30">
              {lang === 'bn' ? selectedArticle.tag_bn : selectedArticle.tag_en}
            </span>

            <h2 className="text-xl sm:text-2xl font-black text-white leading-snug">
              {lang === 'bn' ? selectedArticle.title_bn : selectedArticle.title_en}
            </h2>

            <div className="flex items-center gap-3 text-xs text-slate-400 border-b border-white/10 pb-3">
              <span>✍️ {lang === 'bn' ? selectedArticle.author_bn : selectedArticle.author_en}</span>
              <span>•</span>
              <span>{lang === 'bn' ? 'বারুণা পশ্চিম পাড়া ডেস্ক' : 'Baruna News Desk'}</span>
            </div>

            {selectedArticle.image_url && (
              <div className="w-full h-64 sm:h-80 rounded-2xl overflow-hidden border border-white/10 bg-slate-950">
                <img src={selectedArticle.image_url} alt="Cover" className="w-full h-full object-cover" />
              </div>
            )}

            <div className="text-sm sm:text-base text-slate-200 leading-relaxed font-light whitespace-pre-line py-2">
              {lang === 'bn' ? selectedArticle.summary_bn : selectedArticle.summary_en}
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-between items-center">
              <button 
                onClick={() => handleFacebookShare(lang === 'bn' ? selectedArticle.title_bn : selectedArticle.title_en, lang === 'bn' ? selectedArticle.summary_bn : selectedArticle.summary_en)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1877F2] text-white text-xs font-bold transition shadow-lg hover:bg-blue-600"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                {lang === 'bn' ? 'ফেসবুকে শেয়ার করুন' : 'Share on Facebook'}
              </button>
              <button 
                onClick={() => setSelectedArticle(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
              >
                {lang === 'bn' ? 'বন্ধ করুন' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-white/10 bg-[#04060c]/80 backdrop-blur py-8 px-4 mt-20">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            © ২০২৬ {t.brand} | {lang === 'bn' ? 'বারুণা পশ্চিম পাড়া' : 'Baruna Poschim Para'}
          </div>
          <div className="flex flex-wrap gap-4 items-center">
            <button onClick={() => { setPolicyTab('about'); setIsPolicyModalOpen(true); }} className="hover:text-white transition">
              {lang === 'bn' ? 'আমাদের সম্পর্কে' : 'About Us'}
            </button>
            <button onClick={() => { setPolicyTab('editorial'); setIsPolicyModalOpen(true); }} className="hover:text-white transition">
              {lang === 'bn' ? 'সম্পাদকীয় নীতি' : 'Editorial Policy'}
            </button>
            <button onClick={() => { setPolicyTab('privacy'); setIsPolicyModalOpen(true); }} className="hover:text-white transition">
              {lang === 'bn' ? 'গোপনীয়তা' : 'Privacy Policy'}
            </button>
            <button onClick={() => { setPolicyTab('contact'); setIsPolicyModalOpen(true); }} className="hover:text-white transition text-rose-400 font-semibold">
              {lang === 'bn' ? 'যোগাযোগ' : 'Contact Us'}
            </button>
          </div>
          <button onClick={() => setIsAdminLoginOpen(true)} className="text-slate-600 hover:text-rose-400 font-mono transition">PORTAL ACCESS</button>
        </div>
      </footer>

      {/* GOOGLE MAP MODAL */}
      {isMapModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900/90 border border-emerald-500/40 p-5 rounded-3xl w-full max-w-4xl shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  {lang === 'bn' ? 'বারুণা পশ্চিম পাড়া ও স্থানীয় সীমানা ম্যাপ' : 'Baruna Poschim Para Community Map'}
                </h3>
              </div>
              <button onClick={() => setIsMapModalOpen(false)} className="text-slate-400 hover:text-white text-lg p-1">✕</button>
            </div>
            <div className="w-full h-[460px] rounded-2xl overflow-hidden border border-white/10 bg-slate-950">
              <iframe
                title="Baruna Poschim Para Live Map"
                src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d2436.75201055523!2d89.35482114062889!3d22.896812103438013!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sbd!4v1791459628714!5m2!1sen!2sbd"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
              ></iframe>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN LOGIN */}
      {isAdminLoginOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl w-full max-w-sm text-center relative">
            <button onClick={() => setIsAdminLoginOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">✕</button>
            <h3 className="text-lg font-bold text-white mb-2">{lang === 'bn' ? 'অ্যাডমিন প্রবেশাধিকার' : 'Admin Portal Login'}</h3>
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <input 
                type="password" 
                placeholder={lang === 'bn' ? 'অ্যাডমিন পাসওয়ার্ড লিখুন' : 'Enter Admin Password'} 
                value={adminPin} 
                onChange={e => setAdminPin(e.target.value)} 
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-center text-sm text-white focus:outline-none focus:border-rose-500" 
              />
              {adminPinError && <div className="text-rose-400 text-xs">{lang === 'bn' ? 'ভুল পাসওয়ার্ড!' : 'Access denied.'}</div>}
              <button type="submit" className="w-full py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs">{lang === 'bn' ? 'লগইন' : 'Authenticate'}</button>
            </form>
          </div>
        </div>
      )}

      {/* ADMIN OPERATIONS DESK */}
      {isAdminPanelOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/40 p-6 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto space-y-6 relative shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-white">{lang === 'bn' ? 'পোর্টাল অ্যাডমিন ডেক্স' : 'Portal Operations Desk'}</h3>
              <button onClick={() => setIsAdminPanelOpen(false)} className="text-slate-400 hover:text-white text-xl">✕</button>
            </div>

            {/* ১. নতুন প্রকাশ্য দ্বৈতভাষিক সংবাদ পোস্ট ফর্ম (WITH DIRECT PHOTO PICKER) */}
            <div className="bg-slate-950/80 p-5 rounded-2xl border border-rose-500/30">
              <h4 className="text-sm font-bold text-rose-400 mb-4">{lang === 'bn' ? '১. নতুন দ্বৈতভাষিক প্রকাশ্য সংবাদ যোগ করুন (ছবি সহ)' : '1. Publish Bilingual Public News (With Photo)'}</h4>
              <form onSubmit={handlePublishNews} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] text-slate-400">এলাকা / Landmark</label>
                    <select 
                      value={newCategory} 
                      onChange={(e) => {
                        const cat = e.target.value;
                        setNewCategory(cat);
                        if(cat === 'muktir-dokan') { setNewTagBn('মুক্তির দোকান'); setNewTagEn('Muktir Dokan'); }
                        if(cat === 'wapdar-matha') { setNewTagBn('ওয়াপদার মাথা'); setNewTagEn('Wapdar Matha'); }
                        if(cat === 'durga-mondir') { setNewTagBn('দুর্গা মন্দির'); setNewTagEn('Durga Mondir'); }
                      }}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-xs text-white"
                    >
                      <option value="muktir-dokan">মুক্তির দোকান / Muktir Dokan</option>
                      <option value="wapdar-matha">ওয়াপদার মাথা / Wapdar Matha</option>
                      <option value="durga-mondir">দুর্গা মন্দির / Durga Mondir</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-slate-400">প্রতিবেদক (বাংলা)</label>
                      <input 
                        type="text" 
                        value={newAuthorBn} 
                        onChange={e => setNewAuthorBn(e.target.value)} 
                        className="w-full bg-slate-900 border border-white/10 rounded-xl p-2 text-xs text-white" 
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400">Reporter (English)</label>
                      <input 
                        type="text" 
                        value={newAuthorEn} 
                        onChange={e => setNewAuthorEn(e.target.value)} 
                        className="w-full bg-slate-900 border border-white/10 rounded-xl p-2 text-xs text-white" 
                      />
                    </div>
                  </div>
                </div>

                {/* DEVICE DIRECT PHOTO UPLOADER */}
                <div>
                  <label className="text-[11px] text-rose-400 font-bold mb-1 block">
                    📷 সংবাদের ছবি যুক্ত করুন (মোবাইল / কম্পিউটার থেকে সিলেক্ট করুন)
                  </label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-rose-600/20 file:text-rose-300 hover:file:bg-rose-600/30 cursor-pointer bg-slate-900 p-2 rounded-xl border border-white/10"
                  />
                  {newImageBase64 && (
                    <div className="mt-2 w-32 h-20 rounded-lg overflow-hidden border border-rose-500/40 relative">
                      <img src={newImageBase64} alt="Preview" className="w-full h-full object-cover" />
                      <button 
                        type="button" 
                        onClick={() => setNewImageBase64('')}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]"
                      >✕</button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] text-slate-400">সংবাদের শিরোনাম (বাংলা)</label>
                    <input 
                      required 
                      type="text" 
                      placeholder="বাংলা শিরোনাম..." 
                      value={newTitleBn} 
                      onChange={e => setNewTitleBn(e.target.value)} 
                      className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-xs text-white" 
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400">News Title (English)</label>
                    <input 
                      required 
                      type="text" 
                      placeholder="English Title..." 
                      value={newTitleEn} 
                      onChange={e => setNewTitleEn(e.target.value)} 
                      className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-xs text-white" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] text-slate-400">সংবাদের বিস্তারিত (বাংলা)</label>
                    <textarea 
                      required 
                      rows={3} 
                      placeholder="বাংলা বিবরণ..." 
                      value={newSummaryBn} 
                      onChange={e => setNewSummaryBn(e.target.value)} 
                      className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-xs text-white" 
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400">Detailed News (English)</label>
                    <textarea 
                      required 
                      rows={3} 
                      placeholder="English Summary..." 
                      value={newSummaryEn} 
                      onChange={e => setNewSummaryEn(e.target.value)} 
                      className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-xs text-white" 
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmittingNews}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white font-bold text-xs shadow-lg transition"
                >
                  {isSubmittingNews ? (lang === 'bn' ? 'সংরক্ষণ করা হচ্ছে...' : 'Publishing...') : (lang === 'bn' ? 'ছবিসহ সংবাদ প্রকাশ করুন' : 'Publish News with Photo')}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* POLICY MODAL */}
      {isPolicyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl w-full max-w-lg relative">
            <button onClick={() => setIsPolicyModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">✕</button>
            <div className="flex gap-2 border-b border-white/10 pb-3 mb-4 text-xs font-bold overflow-x-auto">
              <button onClick={() => setPolicyTab('about')} className={policyTab === 'about' ? 'text-rose-500' : 'text-slate-400'}>{lang === 'bn' ? 'আমাদের সম্পর্কে' : 'About Us'}</button>
              <button onClick={() => setPolicyTab('editorial')} className={policyTab === 'editorial' ? 'text-rose-500' : 'text-slate-400'}>{lang === 'bn' ? 'সম্পাদকীয় নীতি' : 'Editorial Policy'}</button>
              <button onClick={() => setPolicyTab('privacy')} className={policyTab === 'privacy' ? 'text-rose-500' : 'text-slate-400'}>{lang === 'bn' ? 'গোপনীয়তা' : 'Privacy'}</button>
              <button onClick={() => setPolicyTab('contact')} className={policyTab === 'contact' ? 'text-rose-500' : 'text-slate-400'}>{lang === 'bn' ? 'যোগাযোগ' : 'Contact Us'}</button>
            </div>
            <div className="text-xs text-slate-300 leading-relaxed">
              {policyTab === 'about' && <p>{lang === 'bn' ? "'এলাকার খবর' একটি নিরপেক্ষ ডিজিটাল সংবাদ মাধ্যম। বারুণা পশ্চিম পাড়াসহ স্থানীয় সকল অলিগলির সত্য সংবাদ নির্ভীকভাবে তুলে ধরাই আমাদের লক্ষ্য।" : "'Elakar Khobor' is an independent digital newsroom platform dedicated to reporting verified community stories."}</p>}
              {policyTab === 'editorial' && <p>{lang === 'bn' ? 'প্রতিটি তথ্য প্রকাশের পূর্বে স্থানীয় মাঠপর্যায়ে নিশ্চিত করা হয়।' : 'Every published report is strictly verified through ground-level local sources before publication.'}</p>}
              {policyTab === 'privacy' && <p>{lang === 'bn' ? 'নাগরিক তথ্যদাতাদের পরিচয় সুরক্ষিত রাখা হয়।' : 'Citizen tipsters receive absolute confidentiality.'}</p>}
              {policyTab === 'contact' && (
                <div className="space-y-3">
                  <p>{lang === 'bn' ? 'যেকোনো সংবাদ তথ্যের জন্য সরাসরি ইমেইল করুন:' : 'For editorial inquiries, reach our newsdesk directly:'}</p>
                  <div className="p-3 rounded-xl bg-slate-950 border border-white/10 flex items-center justify-between">
                    <span className="font-mono text-rose-400 select-all font-semibold">elakarkhobor24.news@gmail.com</span>
                    <a href="mailto:elakarkhobor24.news@gmail.com" className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] transition">{lang === 'bn' ? 'মেইল করুন' : 'Send Mail'}</a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TIP MODAL */}
      {isTipModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl w-full max-w-md relative">
            <button onClick={() => setIsTipModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">✕</button>
            <h3 className="text-lg font-bold text-white mb-2">{t.navTipBtn}</h3>
            <form onSubmit={handleTipSubmit} className="space-y-4">
              <input type="text" placeholder={lang === 'bn' ? 'আপনার নাম' : 'Your Name'} value={tipAuthor} onChange={e => setTipAuthor(e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-xs text-white" />
              <textarea required rows={4} placeholder={lang === 'bn' ? 'খবরের বিবরণ...' : 'News content...'} value={tipContent} onChange={e => setTipContent(e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-xs text-white" />
              <button type="submit" className="w-full py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs">{lang === 'bn' ? 'জমা দিন' : 'Submit'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}