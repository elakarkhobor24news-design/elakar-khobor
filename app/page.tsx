'use client';

import React, { useState, useEffect, useRef } from 'react';
import { translations } from '@/lib/translations';

// --- EXPANSIVE 3D MILKY WAY SPIRAL GALAXY ENGINE ---
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
      const color = isCore 
        ? '#ffffff'
        : dist < maxRadius * 0.55 
        ? '#fb7185' 
        : '#e11d48';

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

    const cosmicDust = Array.from({ length: 120 }, () => ({
      x: (Math.random() - 0.5) * w * 1.8,
      y: (Math.random() - 0.5) * h * 1.8,
      z: Math.random() * 800 - 400,
      sz: Math.random() * 1.2 + 0.4,
      alpha: Math.random() * 0.4 + 0.1
    }));

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

      cosmicDust.forEach((dust) => {
        const sc = fov / (fov + dust.z + 500);
        const px = dust.x * sc + cx;
        const py = dust.y * sc + cy;
        ctx.fillStyle = `rgba(255, 255, 255, ${dust.alpha})`;
        ctx.beginPath();
        ctx.arc(px, py, dust.sz * sc, 0, Math.PI * 2);
        ctx.fill();
      });

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
        let y1 = currX * sinY + currY * Math.cos(0);
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

  // Modals
  const [isTipModalOpen, setIsTipModalOpen] = useState(false);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [policyTab, setPolicyTab] = useState<'about' | 'editorial' | 'privacy' | 'contact'>('about');

  // Reader Modal State
  const [selectedArticle, setSelectedArticle] = useState<any | null>(null);

  // Vault states
  const [selectedSecretId, setSelectedSecretId] = useState('');
  const [unlockPin, setUnlockPin] = useState('');
  const [unlockError, setUnlockError] = useState(false);
  const [approvedSecrets, setApprovedSecrets] = useState<string[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [citizenTips, setCitizenTips] = useState<any[]>([]);

  // Admin states
  const [adminPin, setAdminPin] = useState('');
  const [activeSessionKey, setActiveSessionKey] = useState('');
  const [adminPinError, setAdminPinError] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // Visitor Counter State
  const [visitorCount, setVisitorCount] = useState<number>(0);

  // Articles list
  const [publicArticles, setPublicArticles] = useState<any[]>([]);

  // Secret articles
  const [secretArticles, setSecretArticles] = useState<any[]>([
    {
      id: 'sec-01',
      code: 'DOC-2026-X9',
      titleBn: 'পশ্চিম পাড়া খাল দখল ও অবৈধ বালি ভরাট নিয়ে গোপন অনুসন্ধানী প্রতিবেদন',
      titleEn: 'Confidential probe into illegal canal encroachment in Poschim Para',
      summaryBn: 'রাতের আঁধারে সরকারি খালের সংযোগমুখে মাটি ফেলে বন্ধ করার অভিযোগ।',
      summaryEn: 'Leaked records reveal unauthorized land filling over public canal boundary.',
      secretTextBn: 'খালের সরকারি সিএস নকশা অনুযায়ী ৪০ ফুট প্রশস্ততা বর্তমান অবৈধ দখলের কারণে মাত্র ১৫ ফুটে নেমে এসেছে। অবিলম্বে উচ্ছেদ অভিযান পরিচালনা করার সুপারিশ করা হয়েছে।',
      secretTextEn: 'Official CS survey maps record a 40-foot canal width, now reduced to only 15 feet due to illegal sand encroachment. An urgent administrative clearance drive is recommended.',
      pin: 'secure77'
    }
  ]);

  const [isSubmittingNews, setIsSubmittingNews] = useState(false);
  const [isSubmittingSecret, setIsSubmittingSecret] = useState(false);

  // Form states
  const [newCategory, setNewCategory] = useState('durga-mondir');
  const [newTagBn, setNewTagBn] = useState('দুর্গা মন্দির');
  const [newTagEn, setNewTagEn] = useState('Durga Mondir');
  const [newTitleBn, setNewTitleBn] = useState('');
  const [newTitleEn, setNewTitleEn] = useState('');
  const [newSummaryBn, setNewSummaryBn] = useState('');
  const [newSummaryEn, setNewSummaryEn] = useState('');
  const [newAuthorBn, setNewAuthorBn] = useState('নিজস্ব প্রতিবেদক');
  const [newAuthorEn, setNewAuthorEn] = useState('Staff Reporter');
  const [newImageBase64, setNewImageBase64] = useState('');

  // Secret form
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

  // Dynamic leads for hero boxes
  const latestPublic = publicArticles.length > 0 ? publicArticles[0] : null;
  const latestSecret = secretArticles.length > 0 ? secretArticles[0] : null;

  // Visitor Tracking Trigger
  useEffect(() => {
    try {
      fetch('/api/visitors', { method: 'POST' })
        .then(res => res.json())
        .then(data => {
          if (data && typeof data.count === 'number') {
            setVisitorCount(data.count);
          }
        })
        .catch(() => {});
    } catch {}
  }, []);

  // Image Upload Handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert(lang === 'bn' ? 'ছবির সাইজ সর্বোচ্চ 2MB হতে পারবে।' : 'Max image size is 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 900;
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = Math.min(img.width, MAX_WIDTH);
          canvas.height = img.width > MAX_WIDTH ? img.height * scaleSize : img.height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
          setNewImageBase64(compressedDataUrl);
        };
      };
      reader.readAsDataURL(file);
    }
  };

  // Dedicated Facebook Share
  const handleFacebookShare = (articleId: string | number) => {
    if (typeof window === 'undefined') return;
    const postUrl = `${window.location.origin}/?article=${articleId}`;
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`;
    window.open(fbUrl, '_blank', 'noopener,noreferrer,width=620,height=580');
  };

  // Live Fetch Pending Requests with Auto-approval sync
  const fetchPendingRequests = () => {
    fetch('/api/news/secret-requests', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data?.requests && Array.isArray(data.requests)) {
          const formatted = data.requests.map((r: any) => ({
            id: r.id,
            docId: r.doc_id,
            name: r.name,
            reason: r.reason,
            time: r.time,
            status: r.status,
          }));
          setPendingRequests(formatted);

          // Check if my requested document got approved by admin or telegram bot
          try {
            const myLocalReqs = JSON.parse(localStorage.getItem('my_sent_requests') || '[]');
            const approvedDocIds: string[] = [];
            formatted.forEach((req: any) => {
              if (myLocalReqs.includes(req.id) && req.status === 'approved') {
                approvedDocIds.push(req.docId);
              }
            });
            if (approvedDocIds.length > 0) {
              setApprovedSecrets((prev) => {
                const combined = Array.from(new Set([...prev, ...approvedDocIds]));
                localStorage.setItem('elakar_approved_secrets', JSON.stringify(combined));
                return combined;
              });
            }
          } catch {}
        }
      })
      .catch(() => {});
  };

  // Polling hook: fast check every 3.5 seconds for instant reading
  useEffect(() => {
    const pollInterval = setInterval(() => {
      fetchPendingRequests();
    }, 3500);
    return () => clearInterval(pollInterval);
  }, []);

  // Database Loader for Public, Secret Articles & Clearance Requests
  const loadArticles = () => {
    // 1. Load Public News from Server Database
    fetch('/api/news/public', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data?.articles && Array.isArray(data.articles)) {
          setPublicArticles(data.articles);
        }
      })
      .catch(() => {});

    // 2. Load Secret Vault News from Server Database
    fetch('/api/news/secret-list', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data?.secrets && Array.isArray(data.secrets) && data.secrets.length > 0) {
          const formatted = data.secrets.map((d: any) => ({
            id: d.id,
            code: d.code,
            titleBn: d.title_bn,
            titleEn: d.title_en,
            summaryBn: d.summary_bn,
            summaryEn: d.summary_en,
            secretTextBn: d.secret_text_bn,
            secretTextEn: d.secret_text_en,
            pin: d.pin,
          }));
          setSecretArticles(formatted);
        }
      })
      .catch(() => {});

    // 3. Load Pending Clearance Requests
    fetchPendingRequests();
  };

  useEffect(() => {
    loadArticles();

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
      setCitizenTips(JSON.parse(localStorage.getItem('elakar_tips') || '[]'));
    } catch {}

    return () => clearInterval(timer);
  }, [lang]);

  // When Admin Panel opens, live refresh requests automatically
  useEffect(() => {
    if (isAdminPanelOpen) {
      fetchPendingRequests();
    }
  }, [isAdminPanelOpen]);

  // Publish News to Supabase Database
  const handlePublishNews = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingNews(true);

    try {
      const res = await fetch('/api/news/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminKey: activeSessionKey || adminPin || 'admin1090',
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

      const data = await res.json();
      if (data.success && data.article) {
        setPublicArticles(prev => [data.article, ...prev]);
        alert(lang === 'bn' ? 'সংবাদ সফলভাবে প্রকাশিত হয়েছে!' : 'News published successfully!');
        setNewTitleBn('');
        setNewTitleEn('');
        setNewSummaryBn('');
        setNewSummaryEn('');
        setNewImageBase64('');
      } else {
        alert(lang === 'bn' ? 'সংবাদ প্রকাশে সমস্যা হয়েছে।' : 'Failed to publish news.');
      }
    } catch {
      alert(lang === 'bn' ? 'সার্ভার সংযোগ সমস্যা।' : 'Server connection error.');
    } finally {
      setIsSubmittingNews(false);
    }
  };

  // Permanent Delete News Handler (Synced with Supabase)
  const handleDeleteNews = async (id: number | string) => {
    if (!confirm(lang === 'bn' ? 'এই সংবাদটি ডাটাবেস থেকে স্থায়ীভাবে মুছে ফেলতে চান?' : 'Delete this news permanently?')) return;

    try {
      const res = await fetch('/api/news/publish/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminKey: activeSessionKey || adminPin || 'admin1090',
          id: id,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        alert(lang === 'bn' ? 'ডাটাবেস থেকে মুছতে ব্যর্থ হয়েছে।' : 'Failed to delete from database.');
        return;
      }

      setPublicArticles(prev => prev.filter(item => String(item.id) !== String(id)));
      alert(lang === 'bn' ? 'সংবাদটি স্থায়ীভাবে মুছে ফেলা হয়েছে।' : 'News deleted permanently.');
    } catch {
      alert(lang === 'bn' ? 'সার্ভার সমস্যা হয়েছে।' : 'Server error occurred.');
    }
  };

  // Publish Secret News to Supabase Database
  const handlePublishSecretNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSecretCustomPin.trim()) {
      alert(lang === 'bn' ? 'গোপন আনলক পিন নির্ধারণ করুন!' : 'Please set unlock PIN!');
      return;
    }

    setIsSubmittingSecret(true);

    const payload = {
      id: 'sec-' + Date.now(),
      code: newSecretCode,
      title_bn: newSecretTitleBn,
      title_en: newSecretTitleEn,
      summary_bn: newSecretSummaryBn,
      summary_en: newSecretSummaryEn,
      secret_text_bn: newSecretTextBn,
      secret_text_en: newSecretTextEn,
      pin: newSecretCustomPin.trim(),
    };

    try {
      const res = await fetch('/api/news/secret-publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminKey: activeSessionKey || adminPin || 'admin1090',
          ...payload,
        }),
      });

      const data = await res.json();
      if (data.success) {
        const newDoc = {
          id: payload.id,
          code: payload.code,
          titleBn: payload.title_bn,
          titleEn: payload.title_en,
          summaryBn: payload.summary_bn,
          summaryEn: payload.summary_en,
          secretTextBn: payload.secret_text_bn,
          secretTextEn: payload.secret_text_en,
          pin: payload.pin,
        };
        setSecretArticles((prev) => [newDoc, ...prev]);
        alert(lang === 'bn' ? 'গোপন প্রতিবেদন ডাটাবেসে সফলভাবে সংরক্ষিত হয়েছে!' : 'Secret report saved to database!');
        setNewSecretCode('DOC-2026-X' + Math.floor(Math.random() * 90 + 10));
        setNewSecretTitleBn('');
        setNewSecretTitleEn('');
        setNewSecretSummaryBn('');
        setNewSecretSummaryEn('');
        setNewSecretTextBn('');
        setNewSecretTextEn('');
        setNewSecretCustomPin('');
      } else {
        alert(lang === 'bn' ? 'ডাটাবেসে সেভ হতে সমস্যা হয়েছে।' : 'Failed to save to database.');
      }
    } catch {
      alert(lang === 'bn' ? 'সার্ভার সমস্যা।' : 'Server error.');
    } finally {
      setIsSubmittingSecret(false);
    }
  };

  // Direct Unlock via PIN or Admin Approval
  const handleUnlockSecret = (e: React.FormEvent) => {
    e.preventDefault();
    const doc = secretArticles.find(d => d.id === selectedSecretId);
    if (!doc) return;

    if (unlockPin.trim() === doc.pin || (activeSessionKey && unlockPin.trim() === activeSessionKey)) {
      const updated = [...approvedSecrets, doc.id];
      setApprovedSecrets(updated);
      localStorage.setItem('elakar_approved_secrets', JSON.stringify(updated));
      setIsUnlockModalOpen(false);
      setUnlockPin('');
      setUnlockError(false);
    } else {
      setUnlockError(true);
    }
  };

  // Bulletproof Clearance Request Submit (With Telegram Bot Notification Trigger)
  const handleClearanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const requestId = 'req-' + Date.now();
    const reqPayload = {
      id: requestId,
      doc_id: selectedSecretId,
      name: reqName || (lang === 'bn' ? 'বেনামী পাঠক' : 'Anonymous Reader'),
      reason: reqReason || (lang === 'bn' ? 'তদন্তমূলক রিপোর্ট পড়তে চাই' : 'Read Investigative Report'),
      time: new Date().toLocaleTimeString(lang === 'bn' ? 'bn-BD' : 'en-US', { timeZone: 'Asia/Dhaka' })
    };

    try {
      const mySaved = JSON.parse(localStorage.getItem('my_sent_requests') || '[]');
      localStorage.setItem('my_sent_requests', JSON.stringify([...mySaved, requestId]));
    } catch {}

    try {
      const res = await fetch('/api/news/secret-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reqPayload),
      });

      const data = await res.json();
      if (!data.success) {
        alert((lang === 'bn' ? 'সার্ভার সমস্যা: ' : 'Server Error: ') + (data.error || 'ডাটাবেসে সেভ হয়নি'));
        return;
      }

      alert(lang === 'bn' ? 'অনুরোধ সফলভাবে পাঠানো হয়েছে! অ্যাডমিনের অনুমোদন পেলেই স্বয়ংক্রিয়ভাবে খুলে যাবে।' : 'Clearance request submitted! Will unlock as soon as approved.');
      setIsRequestModalOpen(false);
      setReqName('');
      setReqReason('');
    } catch (err: any) {
      alert((lang === 'bn' ? 'নেটওয়ার্ক সমস্যা: ' : 'Network Error: ') + err.message);
    }
  };

  // Approve Secret -> Update status so user can read + remove from pending
  const approveSecret = async (docId: string, reqId: string) => {
    if (!approvedSecrets.includes(docId)) {
      const upDocs = [...approvedSecrets, docId];
      setApprovedSecrets(upDocs);
      localStorage.setItem('elakar_approved_secrets', JSON.stringify(upDocs));
    }

    try {
      await fetch('/api/news/secret-requests', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: reqId, docId }),
      });
      setPendingRequests(prev => prev.filter(r => r.id !== reqId));
      alert(lang === 'bn' ? 'অনুমোদন সফল হয়েছে! পাঠক এখন এটি পড়তে পারবে।' : 'Access granted! The reader can now view this.');
    } catch {
      setPendingRequests(prev => prev.filter(r => r.id !== reqId));
    }
  };

  const handleTipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newTip = {
      id: 'tip-' + Date.now(),
      author: tipAuthor || (lang === 'bn' ? 'বেনামী নাগরিক' : 'Anonymous Citizen'),
      landmark: tipLandmark,
      content: tipContent,
      time: new Date().toLocaleString()
    };

    // ব্যাকগ্রাউন্ডে গোপনে টেলিগ্রামে পাঠিয়ে দেবে
    try {
      await fetch('/api/news/tip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTip),
      });
    } catch {}

    const updated = [newTip, ...citizenTips];
    setCitizenTips(updated);
    localStorage.setItem('elakar_tips', JSON.stringify(updated));
    alert(lang === 'bn' ? 'তথ্য সফলভাবে সংরক্ষিত হয়েছে!' : 'Tip submitted successfully!');
    setIsTipModalOpen(false);
    setTipAuthor('');
    setTipContent('');
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminPinError(false);
    const cleanPass = adminPin.trim();

    try {
      const res = await fetch('/api/admin-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: cleanPass }),
      });
      const data = await res.json();

      if (data.success) {
        setIsAdminLoggedIn(true);
        setActiveSessionKey(cleanPass);
        setIsAdminLoginOpen(false);
        setIsAdminPanelOpen(true);
        setAdminPinError(false);
        setAdminPin('');
        fetchPendingRequests();
      } else {
        setAdminPinError(true);
      }
    } catch {
      setAdminPinError(true);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#04060c] text-slate-100 font-sans selection:bg-rose-600 selection:text-white overflow-x-hidden">
      <Background3D />

      {/* HEADER NAVIGATION */}
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
            <button onClick={() => { setMobileMenuOpen(false); setIsMapModalOpen(true); }} className="block py-2 text-sm font-semibold text-emerald-400">{t.navMap}</button>
            <button onClick={() => setIsTipModalOpen(true)} className="block py-2 text-sm font-bold text-slate-300">{t.navTipBtn}</button>
          </div>
        )}
      </header>

      {/* CONTINUOUS SMOOTH MOVING BREAKING TICKER */}
      <div className="relative z-10 border-y border-white/5 bg-slate-950/50 backdrop-blur-sm flex items-center overflow-hidden">
        <div className="bg-rose-600 text-white text-xs font-black px-4 py-2 shrink-0 uppercase tracking-wider flex items-center gap-2 shadow-lg z-20">
          <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
          {t.tickerBadge}
        </div>
        <div className="flex overflow-hidden whitespace-nowrap w-full">
          <div className="inline-flex shrink-0 animate-marquee text-xs text-slate-200 gap-8 py-2 font-medium">
            <span>★ {latestPublic ? (lang === 'bn' ? (latestPublic.title_bn || latestPublic.title_en) : (latestPublic.title_en || latestPublic.title_bn)) : 'বারুণা পশ্চিম পাড়ার বস্তুনিষ্ঠ ও তাজা সংবাদ'}</span>
            <span>★ [গোপন ভল্ট]: {latestSecret ? (lang === 'bn' ? latestSecret.titleBn : latestSecret.titleEn) : 'অনুসন্ধানী প্রতিবেদন প্রস্তুত'}</span>
            {publicArticles.length > 1 && (
              <span>★ {lang === 'bn' ? (publicArticles[1].title_bn || publicArticles[1].title_en) : (publicArticles[1].title_en || publicArticles[1].title_bn)}</span>
            )}
            <span>★ বারুণা পশ্চিম পাড়া • মুক্তির দোকান • ওয়াপদার মাথা • সার্বক্ষণিক সত্য সংবাদ আপডেট</span>
          </div>
          <div className="inline-flex shrink-0 animate-marquee text-xs text-slate-200 gap-8 py-2 font-medium" aria-hidden="true">
            <span>★ {latestPublic ? (lang === 'bn' ? (latestPublic.title_bn || latestPublic.title_en) : (latestPublic.title_en || latestPublic.title_bn)) : 'বারুণা পশ্চিম পাড়ার বস্তুনিষ্ঠ ও তাজা সংবাদ'}</span>
            <span>★ [গোপন ভল্ট]: {latestSecret ? (lang === 'bn' ? latestSecret.titleBn : latestSecret.titleEn) : 'অনুসন্ধানী প্রতিবেদন প্রস্তুত'}</span>
            {publicArticles.length > 1 && (
              <span>★ {lang === 'bn' ? (publicArticles[1].title_bn || publicArticles[1].title_en) : (publicArticles[1].title_en || publicArticles[1].title_bn)}</span>
            )}
            <span>★ বারুণা পশ্চিম পাড়া • মুক্তির দোকান • ওয়াপদার মাথা • সার্বক্ষণিক সত্য সংবাদ আপডেট</span>
          </div>
        </div>
      </div>

      {/* HERO SECTION */}
      <section id="hero" className="relative z-10 py-10 px-4">
        <div className="max-w-7xl mx-auto flex flex-col items-start">
          <div className="flex flex-wrap items-center justify-between gap-4 w-full mb-3">
            <span className="px-3 py-1 rounded-full border border-rose-500/40 bg-rose-950/20 backdrop-blur-md text-rose-300 text-xs font-bold">
              {t.motto}
            </span>
            <div className="px-3.5 py-1.5 rounded-full bg-slate-900/40 backdrop-blur-md border border-white/10 text-xs flex items-center space-x-2">
              <span className="text-amber-300 font-mono font-bold">{timeStr} {t.timeSuffix}</span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-300">{weatherStr}</span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-rose-500 tracking-tight mb-6 drop-shadow-lg">
            {t.brand}
          </h1>

          <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            
            {/* BOX 1: LATEST PUBLIC NEWS */}
            <div className="w-full bg-white/[0.04] backdrop-blur-[2px] rounded-2xl p-5 border border-white/15 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] hover:border-rose-500/50 transition duration-300 flex flex-col justify-between max-h-[480px]">
              <div className="overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase bg-rose-600 text-white shadow">
                    {lang === 'bn' ? 'সর্বশেষ প্রকাশ্য সংবাদ' : 'Latest Public Story'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {latestPublic ? (lang === 'bn' ? (latestPublic.tag_bn || 'সাধারণ') : (latestPublic.tag_en || 'General')) : ''}
                  </span>
                </div>

                {latestPublic?.image_url && (
                  <div 
                    onClick={() => setSelectedArticle(latestPublic)}
                    className="w-full h-40 sm:h-48 mb-3 rounded-xl overflow-hidden border border-white/10 bg-slate-950/60 cursor-pointer shrink-0"
                  >
                    <img 
                      src={latestPublic.image_url} 
                      alt="Latest Public Cover" 
                      onError={(e) => { (e.currentTarget.parentElement as HTMLElement).style.display = 'none'; }}
                      className="w-full h-full object-cover object-center hover:scale-105 transition duration-500" 
                    />
                  </div>
                )}

                <h2 
                  onClick={() => latestPublic && setSelectedArticle(latestPublic)}
                  className="text-base font-bold text-white mb-2 leading-snug line-clamp-2 cursor-pointer hover:text-rose-400 transition"
                >
                  {latestPublic 
                    ? (lang === 'bn' ? (latestPublic.title_bn || latestPublic.title_en) : (latestPublic.title_en || latestPublic.title_bn))
                    : (lang === 'bn' ? 'বারুণা পশ্চিম পাড়ায় নতুন কোনো প্রকাশ্য সংবাদ নেই।' : 'No public news published yet.')}
                </h2>

                <p className="text-slate-300 text-xs leading-relaxed mb-3 font-light line-clamp-3">
                  {latestPublic 
                    ? (lang === 'bn' ? (latestPublic.summary_bn || latestPublic.summary_en) : (latestPublic.summary_en || latestPublic.summary_bn))
                    : (lang === 'bn' ? 'পোর্টাল অ্যাডমিন ডেস্কে ঢুকে সরাসরি নতুন সংবাদ প্রকাশ করুন।' : 'Login to Admin Desk to post updates.')}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between border-t border-white/10 pt-3 gap-2 text-xs mt-auto">
                <span className="text-slate-400 truncate max-w-[140px]">
                  {latestPublic ? (lang === 'bn' ? (latestPublic.author_bn || 'নিজস্ব প্রতিবেদক') : (latestPublic.author_en || 'Staff Reporter')) : ''}
                </span>
                {latestPublic && (
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleFacebookShare(latestPublic.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1877F2]/20 hover:bg-[#1877F2] text-[#1877F2] hover:text-white border border-[#1877F2]/30 text-xs font-semibold transition cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      {lang === 'bn' ? 'শেয়ার' : 'Share'}
                    </button>
                    <button 
                      onClick={() => setSelectedArticle(latestPublic)}
                      className="px-4 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition shadow cursor-pointer"
                    >
                      {t.leadReadMore}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* BOX 2: LATEST SECRET NEWS VAULT */}
            <div className="w-full bg-white/[0.04] backdrop-blur-[2px] rounded-2xl p-5 border border-amber-500/30 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] hover:border-amber-400/60 transition duration-300 flex flex-col justify-between max-h-[480px]">
              <div className="overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase bg-amber-600/90 text-white shadow font-mono">
                      {lang === 'bn' ? 'গোপন অনুসন্ধান (ভল্ট)' : 'Confidential Vault'}
                    </span>
                  </div>
                  <span className="text-[10px] text-amber-300/80 font-mono">
                    {latestSecret ? latestSecret.code : 'DOC-RESTRICTED'}
                  </span>
                </div>

                <div className="w-full p-3.5 mb-3 rounded-xl bg-slate-950/60 border border-amber-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-base">
                      🔒
                    </div>
                    <div>
                      <div className="text-xs font-bold text-amber-300 font-mono">ENCRYPTED CLASSIFIED</div>
                      <div className="text-[10px] text-slate-400">বারুণা পশ্চিম পাড়া গোপন অনুসন্ধানী নথি</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-500/30">
                    PIN REQUIRED
                  </span>
                </div>

                <h2 
                  onClick={() => latestSecret && (!approvedSecrets.includes(latestSecret.id) ? (setSelectedSecretId(latestSecret.id), setIsUnlockModalOpen(true)) : null)}
                  className="text-base font-bold text-amber-100 mb-2 leading-snug line-clamp-2 cursor-pointer hover:text-amber-300 transition"
                >
                  {latestSecret 
                    ? (lang === 'bn' ? latestSecret.titleBn : latestSecret.titleEn) 
                    : (lang === 'bn' ? 'কোনো গোপন অনুসন্ধানী নথি নেই।' : 'No confidential report in vault.')}
                </h2>

                <div className="relative">
                  <p className="text-slate-300 text-xs leading-relaxed mb-3 font-light line-clamp-4">
                    {latestSecret 
                      ? (approvedSecrets.includes(latestSecret.id) 
                          ? (lang === 'bn' ? latestSecret.secretTextBn : latestSecret.secretTextEn)
                          : (lang === 'bn' ? latestSecret.summaryBn : latestSecret.summaryEn))
                      : (lang === 'bn' ? 'প্রশাসনের বিশেষ যাচাইকৃত নথি এই ভল্টে সংরক্ষিত হয়।' : 'Restricted reports protected.')}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between border-t border-white/10 pt-3 gap-2 text-xs mt-auto">
                <span className="text-amber-400/80 font-mono text-[11px]">
                  {latestSecret ? latestSecret.code : ''}
                </span>
                {latestSecret && !approvedSecrets.includes(latestSecret.id) ? (
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => { setSelectedSecretId(latestSecret.id); setIsRequestModalOpen(true); }}
                      className="px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-amber-300 border border-amber-500/30 text-xs font-semibold transition cursor-pointer"
                    >
                      {t.requestBtn}
                    </button>
                    <button 
                      onClick={() => { setSelectedSecretId(latestSecret.id); setIsUnlockModalOpen(true); }}
                      className="px-4 py-1.5 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white transition shadow shadow-amber-950/40 cursor-pointer"
                    >
                      {t.unlockBtn}
                    </button>
                  </div>
                ) : (
                  <span className="text-emerald-400 font-bold text-xs">✓ আনলক করা হয়েছে</span>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* PUBLIC NEWS GRID WITH ENTERTAINMENT FILTER */}
      <section id="public-news-section" className="relative z-10 max-w-7xl mx-auto px-4 py-10">
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
            <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-900/40 backdrop-blur border border-white/15 text-xs">
              <button onClick={() => setActiveFilter('all')} className={`px-3 py-1 rounded-lg ${activeFilter === 'all' ? 'bg-rose-600 text-white' : 'text-slate-400'}`}>{t.filterAll}</button>
              <button onClick={() => setActiveFilter('binodon')} className={`px-3 py-1 rounded-lg ${activeFilter === 'binodon' ? 'bg-rose-600 text-white' : 'text-slate-400'}`}>{lang === 'bn' ? 'বিনোদন' : 'Entertainment'}</button>
              <button onClick={() => setActiveFilter('muktir-dokan')} className={`px-3 py-1 rounded-lg ${activeFilter === 'muktir-dokan' ? 'bg-rose-600 text-white' : 'text-slate-400'}`}>{t.filterMuktir}</button>
              <button onClick={() => setActiveFilter('wapdar-matha')} className={`px-3 py-1 rounded-lg ${activeFilter === 'wapdar-matha' ? 'bg-rose-600 text-white' : 'text-slate-400'}`}>{t.filterWapda}</button>
              <button onClick={() => setActiveFilter('durga-mondir')} className={`px-3 py-1 rounded-lg ${activeFilter === 'durga-mondir' ? 'bg-rose-600 text-white' : 'text-slate-400'}`}>{t.filterDurga}</button>
            </div>
          </div>
        </div>

        {publicArticles.length === 0 ? (
          <div className="text-center py-20 bg-white/[0.02] border border-white/10 rounded-3xl">
            <p className="text-slate-400 text-sm">
              {lang === 'bn' ? 'বর্তমানে কোনো খবর নেই। নিচের elakar khobor বাটনে চাপ দিয়ে অ্যাডমিন প্যানেল থেকে সংবাদ পোস্ট করুন।' : 'No news published yet. Click elakar khobor below to add news.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {publicArticles
              .filter(item => activeFilter === 'all' || item.category === activeFilter)
              .filter(item => ((lang === 'bn' ? (item.title_bn || item.title_en) : (item.title_en || item.title_bn)) || '').toLowerCase().includes(searchQuery.toLowerCase()))
              .map(item => {
                const currentTag = lang === 'bn' ? (item.tag_bn || 'সাধারণ') : (item.tag_en || 'General');
                const currentTitle = lang === 'bn' ? (item.title_bn || item.title_en) : (item.title_en || item.title_bn);
                const currentSummary = lang === 'bn' ? (item.summary_bn || item.summary_en) : (item.summary_en || item.summary_bn);
                const currentAuthor = lang === 'bn' ? (item.author_bn || 'নিজস্ব প্রতিবেদক') : (item.author_en || 'Staff Reporter');

                return (
                  <div
                    key={item.id}
                    className="bg-white/[0.03] backdrop-blur-[2px] rounded-2xl p-5 border border-white/10 hover:border-rose-500/50 hover:bg-white/[0.06] transition duration-300 flex flex-col justify-between overflow-hidden"
                  >
                    <div>
                      {item.image_url ? (
                        <div 
                          onClick={() => setSelectedArticle(item)}
                          className="w-full h-44 mb-4 rounded-xl overflow-hidden border border-white/10 bg-slate-950 cursor-pointer"
                        >
                          <img 
                            src={item.image_url} 
                            alt="News Cover" 
                            onError={(e) => { (e.currentTarget.parentElement as HTMLElement).style.display = 'none'; }}
                            className="w-full h-full object-cover hover:scale-105 transition duration-500" 
                          />
                        </div>
                      ) : null}
                      
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-slate-900/80 border border-white/10 text-rose-300">
                        {currentTag}
                      </span>

                      <h3 
                        onClick={() => setSelectedArticle(item)}
                        className="text-base font-bold text-white mt-2.5 mb-2 cursor-pointer hover:text-rose-400 transition line-clamp-2 leading-snug"
                      >
                        {currentTitle}
                      </h3>

                      <p className="text-xs text-slate-300/80 leading-relaxed mb-4 line-clamp-3">
                        {currentSummary}
                      </p>
                    </div>
                    
                    <div className="pt-3 border-t border-white/5 space-y-3">
                      <div className="flex justify-between items-center text-xs text-slate-400">
                        <span>{currentAuthor}</span>
                        <div className="flex items-center gap-2">
                          {isAdminLoggedIn && (
                            <button onClick={() => handleDeleteNews(item.id)} className="text-red-400 hover:text-red-300 text-[11px] cursor-pointer">
                              ✕ {lang === 'bn' ? 'মুছুন' : 'Delete'}
                            </button>
                          )}
                          <button 
                            onClick={() => setSelectedArticle(item)}
                            className="text-rose-400 hover:text-rose-300 font-bold cursor-pointer"
                          >
                            {lang === 'bn' ? 'বিস্তারিত →' : 'Read details →'}
                          </button>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => handleFacebookShare(item.id)}
                        className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-[#1877F2]/15 hover:bg-[#1877F2] text-[#1877F2] hover:text-white border border-[#1877F2]/30 text-xs font-bold transition shadow-sm cursor-pointer"
                      >
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                        {lang === 'bn' ? 'ফেসবুকে শেয়ার করুন' : 'Share on Facebook'}
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </section>

      {/* SECRET INVESTIGATIVE VAULT SECTION */}
      <section id="secret-news-section" className="relative z-10 max-w-7xl mx-auto px-4 py-16 border-t border-white/10">
        <div className="bg-white/[0.03] backdrop-blur-[2px] p-6 sm:p-8 rounded-3xl border border-rose-500/30 mb-8 flex justify-between items-center">
          <div>
            <span className="px-2 py-0.5 text-[10px] font-black uppercase bg-rose-600 text-white rounded shadow">{t.secretBadge}</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">{t.secretTitle}</h2>
          </div>
          <div>
            <div className="text-xs text-slate-400">{t.secretClearance}</div>
            <div className="text-sm font-bold text-amber-400">{t.secretClearanceVal}</div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {secretArticles.map(doc => {
            const isUnlocked = approvedSecrets.includes(doc.id) || isAdminLoggedIn;

            return (
              <div
                key={doc.id}
                className="bg-white/[0.03] backdrop-blur-[2px] rounded-2xl p-6 border border-rose-500/30 flex flex-col justify-between"
              >
                <div>
                  <span className="text-xs font-mono text-rose-400">{doc.code}</span>
                  <h3 className="text-lg font-bold text-rose-200 mt-2 mb-3">{lang === 'bn' ? doc.titleBn : doc.titleEn}</h3>
                  {isUnlocked ? (
                    <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-mono leading-relaxed">
                      {lang === 'bn' ? doc.secretTextBn : doc.secretTextEn}
                    </div>
                  ) : (
                    <div className="relative p-4 rounded-xl bg-slate-950/60 border border-white/5 overflow-hidden">
                      <p className="text-xs text-slate-500 filter blur-[4px]">{lang === 'bn' ? doc.summaryBn : doc.summaryEn}</p>
                      <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-rose-300 bg-black/40">
                        🔒 {lang === 'bn' ? 'অনুমতি আবশ্যক (PIN Required)' : 'Authorization Required'}
                      </div>
                    </div>
                  )}
                </div>
                {!isUnlocked && (
                  <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-rose-500/20">
                    <button onClick={() => { setSelectedSecretId(doc.id); setIsUnlockModalOpen(true); }} className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-lg shadow-rose-900/30 cursor-pointer">{t.unlockBtn}</button>
                    <button onClick={() => { setSelectedSecretId(doc.id); setIsRequestModalOpen(true); }} className="py-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-rose-200 border border-rose-500/30 text-xs font-bold transition cursor-pointer">{t.requestBtn}</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* FULL ARTICLE POPUP READER */}
      {selectedArticle && (
        <div 
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          onClick={() => setSelectedArticle(null)}
        >
          <div 
            className="bg-slate-900 border border-rose-500/50 p-6 sm:p-8 rounded-3xl w-full max-w-2xl max-h-[88vh] overflow-y-auto space-y-5 relative shadow-2xl my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedArticle(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white flex items-center justify-center text-sm font-bold transition shadow cursor-pointer"
            >
              ✕
            </button>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-md text-xs font-bold uppercase bg-rose-600 text-white shadow">
                {lang === 'bn' ? (selectedArticle.tag_bn || 'সংবাদ') : (selectedArticle.tag_en || 'News')}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug">
              {lang === 'bn' 
                ? (selectedArticle.title_bn || selectedArticle.title_en) 
                : (selectedArticle.title_en || selectedArticle.title_bn)}
            </h2>

            <div className="flex items-center gap-3 text-xs text-slate-400 border-b border-white/10 pb-3">
              <span>✍️ {lang === 'bn' ? (selectedArticle.author_bn || 'নিজস্ব প্রতিবেদক') : (selectedArticle.author_en || 'Staff Reporter')}</span>
              <span>•</span>
              <span className="text-rose-400 font-semibold">{lang === 'bn' ? 'বারুণা পশ্চিম পাড়া' : 'Baruna Poschim Para'}</span>
            </div>

            {selectedArticle.image_url ? (
              <div className="w-full h-56 sm:h-72 rounded-2xl overflow-hidden border border-white/10 bg-slate-950">
                <img 
                  src={selectedArticle.image_url} 
                  alt="Full Cover" 
                  onError={(e) => { (e.currentTarget.parentElement as HTMLElement).style.display = 'none'; }}
                  className="w-full h-full object-cover object-center" 
                />
              </div>
            ) : null}

            <div className="text-slate-200 text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-light py-2">
              {lang === 'bn' 
                ? (selectedArticle.summary_bn || selectedArticle.summary_en) 
                : (selectedArticle.summary_en || selectedArticle.summary_bn)}
            </div>

            <div className="pt-4 border-t border-white/10 flex flex-wrap justify-between items-center gap-3">
              <button 
                onClick={() => handleFacebookShare(selectedArticle.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1877F2] hover:bg-blue-600 text-white text-xs font-bold transition shadow-md cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                {lang === 'bn' ? 'ফেসবুকে শেয়ার করুন' : 'Share on Facebook'}
              </button>

              <button 
                onClick={() => setSelectedArticle(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer"
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
            <button onClick={() => { setPolicyTab('about'); setIsPolicyModalOpen(true); }} className="hover:text-white transition">{lang === 'bn' ? 'আমাদের সম্পর্কে' : 'About Us'}</button>
            <button onClick={() => { setPolicyTab('editorial'); setIsPolicyModalOpen(true); }} className="hover:text-white transition">{lang === 'bn' ? 'সম্পাদকীয় নীতি' : 'Editorial Policy'}</button>
            <button onClick={() => { setPolicyTab('privacy'); setIsPolicyModalOpen(true); }} className="hover:text-white transition">{lang === 'bn' ? 'গোপনীয়তা' : 'Privacy Policy'}</button>
            <button onClick={() => { setPolicyTab('contact'); setIsPolicyModalOpen(true); }} className="hover:text-white transition text-rose-400 font-semibold">{lang === 'bn' ? 'যোগাযোগ' : 'Contact Us'}</button>
          </div>
          {/* SECURE ADMIN ENTRY: Renamed to elakar khobor so regular users won't notice */}
          <button 
            onClick={() => setIsAdminLoginOpen(true)} 
            className="text-slate-600 hover:text-slate-400 font-mono transition text-xs"
          >
            elakar khobor
          </button>
        </div>
      </footer>

      {/* GOOGLE MAP MODAL */}
      {isMapModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900/90 border border-emerald-500/40 p-5 rounded-3xl w-full max-w-4xl shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
              <h3 className="text-base sm:text-lg font-bold text-white">
                {lang === 'bn' ? 'বারুণা পশ্চিম পাড়া ও স্থানীয় সীমানা ম্যাপ' : 'Baruna Poschim Para Community Map'}
              </h3>
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
              ></iframe>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN LOGIN MODAL */}
      {isAdminLoginOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl w-full max-w-sm text-center relative shadow-2xl">
            <button 
              onClick={() => { setIsAdminLoginOpen(false); setAdminPinError(false); }} 
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg"
            >✕</button>
            <h3 className="text-lg font-bold text-white mb-4">অ্যাডমিন প্রবেশাধিকার</h3>
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <input 
                type="password" 
                placeholder="গোপন পাসওয়ার্ড লিখুন" 
                value={adminPin} 
                onChange={e => setAdminPin(e.target.value)} 
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-center text-sm text-white focus:outline-none focus:border-rose-500" 
              />
              {adminPinError && (
                <div className="text-rose-400 text-xs font-semibold">ভুল পাসওয়ার্ড! প্রবেশাধিকার প্রত্যাখ্যাত।</div>
              )}
              <button 
                type="submit" 
                className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg transition"
              >
                লগইন
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ADMIN OPERATIONS DESK */}
      {isAdminPanelOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/40 p-6 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto space-y-6 relative shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white">{lang === 'bn' ? 'পোর্টাল অ্যাডমিন ডেক্স' : 'Portal Operations Desk'}</h3>
                {/* Traffic / Visitor Stats */}
                <span className="text-[11px] text-emerald-400 font-mono">
                  📊 {lang === 'bn' ? `মোট সাইট ভিজিটর: ${visitorCount}` : `Total Visitors: ${visitorCount}`}
                </span>
              </div>
              <button onClick={() => setIsAdminPanelOpen(false)} className="text-slate-400 hover:text-white text-xl">✕</button>
            </div>

            {/* 1. PUBLIC NEWS FORM (WITH ENTERTAINMENT OPTION) */}
            <div className="bg-slate-950/80 p-5 rounded-2xl border border-rose-500/30">
              <h4 className="text-sm font-bold text-rose-400 mb-4">{lang === 'bn' ? '১. নতুন প্রকাশ্য সংবাদ প্রকাশ করুন (ছবি সহ)' : '1. Publish Public News (With Photo)'}</h4>
              <form onSubmit={handlePublishNews} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] text-slate-400">ক্যাটাগরি / Landmark</label>
                    <select 
                      value={newCategory} 
                      onChange={(e) => {
                        const cat = e.target.value;
                        setNewCategory(cat);
                        if(cat === 'binodon') { setNewTagBn('বিনোদন'); setNewTagEn('Entertainment'); }
                        else if(cat === 'muktir-dokan') { setNewTagBn('মুক্তির দোকান'); setNewTagEn('Muktir Dokan'); }
                        else if(cat === 'wapdar-matha') { setNewTagBn('ওয়াপদার মাথা'); setNewTagEn('Wapdar Matha'); }
                        else if(cat === 'durga-mondir') { setNewTagBn('দুর্গা মন্দির'); setNewTagEn('Durga Mondir'); }
                      }}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-xs text-white"
                    >
                      <option value="durga-mondir">দুর্গা মন্দির / Durga Mondir</option>
                      <option value="binodon">বিনোদন / Entertainment</option>
                      <option value="muktir-dokan">মুক্তির দোকান / Muktir Dokan</option>
                      <option value="wapdar-matha">ওয়াপদার মাথা / Wapdar Matha</option>
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

                <div>
                  <label className="text-[11px] text-rose-400 font-bold mb-1 block">
                    📷 সংবাদের ছবি নির্বাচন করুন (মোবাইল / ল্যাপটপ থেকে)
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
                    <label className="text-[11px] text-slate-400">শিরোনাম (বাংলা - ছোট ও স্পষ্ট)</label>
                    <input 
                      required 
                      type="text" 
                      placeholder="যেমন: বিনোদন জগতের তাজা খবর..." 
                      value={newTitleBn} 
                      onChange={e => setNewTitleBn(e.target.value)} 
                      className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-xs text-white" 
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400">Title (English - Short & Crisp)</label>
                    <input 
                      required 
                      type="text" 
                      placeholder="e.g. Entertainment updates..." 
                      value={newTitleEn} 
                      onChange={e => setNewTitleEn(e.target.value)} 
                      className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-xs text-white" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] text-slate-400">বিস্তারিত সংবাদ (বাংলা)</label>
                    <textarea 
                      required 
                      rows={3} 
                      placeholder="বাংলা পূর্ণ খবর..." 
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
                      placeholder="Full English news story..." 
                      value={newSummaryEn} 
                      onChange={e => setNewSummaryEn(e.target.value)} 
                      className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-xs text-white" 
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmittingNews}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white font-bold text-xs shadow-lg transition cursor-pointer"
                >
                  {isSubmittingNews ? (lang === 'bn' ? 'সংরক্ষণ করা হচ্ছে...' : 'Publishing...') : (lang === 'bn' ? 'ছবিসহ সংবাদ প্রকাশ করুন' : 'Publish News with Photo')}
                </button>
              </form>
            </div>

            {/* 2. SECRET VAULT FORM */}
            <div className="bg-slate-950/80 p-5 rounded-2xl border border-amber-500/30">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-amber-400">
                  {lang === 'bn' ? '২. নতুন গোপন অনুসন্ধানী প্রতিবেদন যোগ করুন (লকড ভল্ট)' : '2. Add Confidential News Report (Restricted Vault)'}
                </h4>
                <span className="text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded font-mono">
                  RESTRICTED VAULT
                </span>
              </div>

              <form onSubmit={handlePublishSecretNews} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] text-slate-400">ডকুমেন্ট কোড</label>
                    <input 
                      type="text" 
                      value={newSecretCode} 
                      onChange={e => setNewSecretCode(e.target.value)} 
                      className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-xs text-amber-300 font-mono" 
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-rose-400 font-bold">🔑 এই খবরের গোপন আনলক পিন</label>
                    <input 
                      required
                      type="text" 
                      placeholder="যেমন: mypin99"
                      value={newSecretCustomPin} 
                      onChange={e => setNewSecretCustomPin(e.target.value)} 
                      className="w-full bg-slate-900 border border-rose-500/40 rounded-xl p-2.5 text-xs text-rose-300 font-mono" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] text-slate-400">শিরোনাম (বাংলা)</label>
                    <input 
                      required 
                      type="text" 
                      placeholder="যেমন: খালের জায়গা ভরাট নিয়ে গোপন তদন্ত..." 
                      value={newSecretTitleBn} 
                      onChange={e => setNewSecretTitleBn(e.target.value)} 
                      className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-xs text-white" 
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400">Title (English)</label>
                    <input 
                      required 
                      type="text" 
                      placeholder="e.g. Confidential probe..." 
                      value={newSecretTitleEn} 
                      onChange={e => setNewSecretTitleEn(e.target.value)} 
                      className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-xs text-white" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] text-slate-400">পাবলিক প্রিভিউ সামারি (ঝাপসা থাকবে)</label>
                    <textarea 
                      required 
                      rows={2} 
                      placeholder="সংক্ষিপ্ত ইঙ্গিত..." 
                      value={newSecretSummaryBn} 
                      onChange={e => setNewSecretSummaryBn(e.target.value)} 
                      className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-xs text-white" 
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400">Public Preview Summary (English)</label>
                    <textarea 
                      required 
                      rows={2} 
                      placeholder="Brief hint..." 
                      value={newSecretSummaryEn} 
                      onChange={e => setNewSecretSummaryEn(e.target.value)} 
                      className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-xs text-white" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] text-emerald-400 font-bold">🔒 আসল গোপন তথ্য (আনলক করার পর যা দেখতে পাবে)</label>
                    <textarea 
                      required 
                      rows={3} 
                      placeholder="পূর্ণ তদন্তমূলক আসল গোপন প্রতিবেদন (বাংলা)..." 
                      value={newSecretTextBn} 
                      onChange={e => setNewSecretTextBn(e.target.value)} 
                      className="w-full bg-slate-900 border border-emerald-500/30 rounded-xl p-2.5 text-xs text-emerald-300 font-mono" 
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-emerald-400 font-bold">🔒 Confidential Text (English)</label>
                    <textarea 
                      required 
                      rows={3} 
                      placeholder="Full confidential report (English)..." 
                      value={newSecretTextEn} 
                      onChange={e => setNewSecretTextEn(e.target.value)} 
                      className="w-full bg-slate-900 border border-emerald-500/30 rounded-xl p-2.5 text-xs text-emerald-300 font-mono" 
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmittingSecret}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 text-white font-bold text-xs shadow-lg transition cursor-pointer"
                >
                  {isSubmittingSecret ? (lang === 'bn' ? 'সংরক্ষণ করা হচ্ছে...' : 'Saving to Database...') : (lang === 'bn' ? 'ডাটাবেস ভল্টে জমা দিন' : 'Commit to Secret Vault')}
                </button>
              </form>
            </div>

            {/* 3. PENDING REQUESTS */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-amber-400">
                  {lang === 'bn' ? '৩. গোপন সংবাদের অনুমোদনের অপেক্ষমাণ তালিকা:' : '3. Pending Clearance Requests:'}
                </h4>
                <button 
                  type="button" 
                  onClick={fetchPendingRequests}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-amber-300 border border-amber-500/30 flex items-center gap-1 cursor-pointer transition"
                >
                  🔄 {lang === 'bn' ? 'তাজা করুন' : 'Refresh'}
                </button>
              </div>
              <div className="space-y-2">
                {pendingRequests.length === 0 ? <p className="text-xs text-slate-500">{lang === 'bn' ? 'কোনো অনুরোধ নেই।' : 'No pending requests.'}</p> : pendingRequests.map(r => (
                  <div key={r.id} className="p-3 bg-slate-950 rounded-xl flex justify-between items-center text-xs border border-white/5">
                    <div>
                      <div className="font-bold text-white">{r.name} <span className="text-slate-400 font-normal">({r.reason})</span></div>
                      <div className="text-rose-400 text-[10px] font-mono">{r.docId} • {r.time}</div>
                    </div>
                    <button onClick={() => approveSecret(r.docId, r.id)} className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 rounded text-white font-bold text-xs transition cursor-pointer">
                      {lang === 'bn' ? 'অনুমোদন দিন' : 'Grant Access'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. CITIZEN TIPS */}
            <div>
              <h4 className="text-xs font-bold text-sky-400 mb-2">{lang === 'bn' ? '৪. পাঠকদের পাঠানো খবরের ইনবক্স:' : '4. Citizen Tips Inbox:'}</h4>
              <div className="space-y-2">
                {citizenTips.length === 0 ? <p className="text-xs text-slate-500">{lang === 'bn' ? 'কোনো খবর জমা নেই।' : 'No tips received.'}</p> : citizenTips.map(t => (
                  <div key={t.id} className="p-3 bg-slate-950 rounded-xl text-xs space-y-1 border border-white/5">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white">{t.author} ({t.landmark})</span>
                      <span className="text-[10px] text-slate-500">{t.time}</span>
                    </div>
                    <p className="text-slate-300">{t.content}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* POLICY MODAL */}
      {isPolicyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl w-full max-w-lg relative">
            <button onClick={() => setIsPolicyModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer">✕</button>
            <div className="flex gap-2 border-b border-white/10 pb-3 mb-4 text-xs font-bold overflow-x-auto">
              <button onClick={() => setPolicyTab('about')} className={policyTab === 'about' ? 'text-rose-500' : 'text-slate-400'}>{lang === 'bn' ? 'আমাদের সম্পর্কে' : 'About Us'}</button>
              <button onClick={() => setPolicyTab('editorial')} className={policyTab === 'editorial' ? 'text-rose-500' : 'text-slate-400'}>{lang === 'bn' ? 'সম্পাদকীয় নীতি' : 'Editorial Policy'}</button>
              <button onClick={() => setPolicyTab('privacy')} className={policyTab === 'privacy' ? 'text-rose-500' : 'text-slate-400'}>{lang === 'bn' ? 'গোপনীয়তা' : 'Privacy Policy'}</button>
              <button onClick={() => setPolicyTab('contact')} className={policyTab === 'contact' ? 'text-rose-500' : 'text-slate-400'}>{lang === 'bn' ? 'যোগাযোগ' : 'Contact Us'}</button>
            </div>
            <div className="text-xs text-slate-300 leading-relaxed">
              {policyTab === 'about' && <p>{lang === 'bn' ? "'এলাকার খবর' একটি ডিজিটাল সংবাদ মাধ্যম। বারুণা পশ্চিম পাড়ার সত্য সংবাদ পরিবেশনই মূল লক্ষ্য।" : "'Elakar Khobor' is a community news platform."}</p>}
              {policyTab === 'editorial' && <p>{lang === 'bn' ? 'প্রতিটি খবর স্থানীয় সত্য তথ্যের ওপর ভিত্তি করে পরিবেশিত।' : 'News verified locally.'}</p>}
              {policyTab === 'privacy' && <p>{lang === 'bn' ? 'নাগরিকদের ব্যক্তিগত তথ্য সুরক্ষিত রাখা হয়।' : 'Privacy protected.'}</p>}
              {policyTab === 'contact' && (
                <div className="space-y-3">
                  <p>{lang === 'bn' ? 'যোগাযোগের ঠিকানা:' : 'Contact:'}</p>
                  <div className="p-3 rounded-xl bg-slate-950 border border-white/10 flex items-center justify-between">
                    <span className="font-mono text-rose-400 select-all font-semibold">elakarkhobor24.news@gmail.com</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* UNLOCK SECRET MODAL */}
      {isUnlockModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/40 p-6 rounded-2xl w-full max-w-sm text-center relative">
            <button onClick={() => setIsUnlockModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer">✕</button>
            <h3 className="text-lg font-bold text-white mb-1">{lang === 'bn' ? 'নথি আনলক করুন' : 'Unlock Document'}</h3>
            <p className="text-xs text-slate-400 mb-4">{lang === 'bn' ? 'এই প্রতিবেদনের নির্ধারিত গোপন পিন প্রদান করুন' : 'Enter designated security PIN'}</p>
            <form onSubmit={handleUnlockSecret} className="space-y-4">
              <input type="password" placeholder="PIN" value={unlockPin} onChange={e => setUnlockPin(e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-center text-sm text-white" />
              {unlockError && <div className="text-rose-400 text-xs">{lang === 'bn' ? 'ভুল পাসওয়ার্ড!' : 'Incorrect PIN!'}</div>}
              <button type="submit" className="w-full py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs cursor-pointer">{lang === 'bn' ? 'আনলক করুন' : 'Unlock'}</button>
            </form>
          </div>
        </div>
      )}

      {/* CLEARANCE REQUEST MODAL */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl w-full max-w-sm relative">
            <button onClick={() => setIsRequestModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer">✕</button>
            <h3 className="text-lg font-bold text-white mb-1">{lang === 'bn' ? 'অনুমতি প্রার্থনা' : 'Request Clearance'}</h3>
            <form onSubmit={handleClearanceSubmit} className="space-y-4 mt-4">
              <input required type="text" placeholder={lang === 'bn' ? 'আপনার নাম' : 'Your Name'} value={reqName} onChange={e => setReqName(e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-xs text-white" />
              <input type="text" placeholder={lang === 'bn' ? 'কারণ' : 'Reason'} value={reqReason} onChange={e => setReqReason(e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-xs text-white" />
              <button type="submit" className="w-full py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs cursor-pointer">{lang === 'bn' ? 'অনুরোধ পাঠান' : 'Submit'}</button>
            </form>
          </div>
        </div>
      )}

      {/* CITIZEN TIP MODAL */}
      {isTipModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl w-full max-w-md relative">
            <button onClick={() => setIsTipModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer">✕</button>
            <h3 className="text-lg font-bold text-white mb-2">{t.navTipBtn}</h3>
            <form onSubmit={handleTipSubmit} className="space-y-4">
              <input type="text" placeholder={lang === 'bn' ? 'আপনার নাম' : 'Your Name'} value={tipAuthor} onChange={e => setTipAuthor(e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-xs text-white" />
              <textarea required rows={4} placeholder={lang === 'bn' ? 'খবরের বিবরণ...' : 'News content...'} value={tipContent} onChange={e => setTipContent(e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-xs text-white" />
              <button type="submit" className="w-full py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs cursor-pointer">{lang === 'bn' ? 'জমা দিন' : 'Submit'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}