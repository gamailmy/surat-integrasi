import React, { useState } from 'react';
import { 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  ArrowRight, 
  FileText, 
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { loginUser } from '../services/storage';

interface LoginViewProps {
  onLoginSuccess: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    setTimeout(() => {
      const result = loginUser(username, password);
      setIsLoading(false);
      if (result.success) {
        onLoginSuccess();
      } else {
        setErrorMsg(result.message || 'Login gagal. Periksa username dan password.');
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-3 sm:p-6 lg:p-8 relative overflow-hidden transition-colors selection:bg-blue-500 selection:text-white">
      {/* ========================================================================= */}
      {/* BACKGROUND THEMATIC LETTER & CORRESPONDENCE VECTOR ARTWORK (TRANSPARENT) */}
      {/* ========================================================================= */}
      
      {/* 1. Subtle Paper Grid Texture */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.035] dark:opacity-[0.05]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #1d4ed8 1px, transparent 1px),
            linear-gradient(to bottom, #1d4ed8 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px'
        }}
      />

      {/* 2. Soft Ambient Lighting */}
      <div className="absolute -top-32 -left-32 w-[450px] h-[450px] bg-blue-500/15 dark:bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-[450px] h-[450px] bg-indigo-500/15 dark:bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* 3. Transparent Floating Vector Motifs: Official Letters, Envelopes, Stamps, Seals */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        
        {/* Top-Right: Flying Official Envelope with Letter Sliding Out */}
        <svg 
          className="absolute -top-10 -right-10 w-80 sm:w-96 h-80 sm:h-96 text-blue-900/[0.05] dark:text-blue-400/[0.06] -rotate-12" 
          viewBox="0 0 200 200" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1.5"
        >
          {/* Envelope Body */}
          <rect x="25" y="60" width="150" height="100" rx="8" fill="currentColor" fillOpacity="0.02" />
          {/* Inner Letter Paper Peeking Out */}
          <path d="M45 60 V30 C45 26 48 23 52 23 H148 C152 23 155 26 155 30 V60" strokeDasharray="3 3" />
          <line x1="60" y1="35" x2="140" y2="35" />
          <line x1="60" y1="44" x2="120" y2="44" />
          <line x1="60" y1="52" x2="135" y2="52" />
          {/* Envelope Flap Creases */}
          <path d="M25 60 L100 118 L175 60" />
          <line x1="25" y1="160" x2="85" y2="105" />
          <line x1="175" y1="160" x2="115" y2="105" />
          {/* Stamp on Envelope */}
          <rect x="135" y="70" width="28" height="34" rx="2" strokeDasharray="2 2" />
          <circle cx="149" cy="87" r="7" />
        </svg>

        {/* Top-Left: Floating Stacked Official Letters & Wax Seal */}
        <svg 
          className="absolute top-8 left-6 w-56 sm:w-72 h-56 sm:h-72 text-indigo-900/[0.05] dark:text-indigo-400/[0.06] rotate-6 hidden sm:block" 
          viewBox="0 0 200 200" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1.5"
        >
          {/* Bottom Letter Layer */}
          <rect x="35" y="45" width="105" height="135" rx="6" strokeDasharray="4 4" />
          {/* Top Letter Layer */}
          <rect x="45" y="30" width="110" height="140" rx="6" fill="currentColor" fillOpacity="0.03" />
          {/* Letter Header Bar */}
          <line x1="60" y1="48" x2="140" y2="48" strokeWidth="2.5" />
          <line x1="60" y1="58" x2="115" y2="58" />
          {/* Text Paragraphs */}
          <line x1="60" y1="75" x2="140" y2="75" />
          <line x1="60" y1="87" x2="135" y2="87" />
          <line x1="60" y1="99" x2="140" y2="99" />
          <line x1="60" y1="111" x2="120" y2="111" />
          <line x1="60" y1="123" x2="130" y2="123" />
          {/* Official Seal Stamp */}
          <circle cx="125" cy="142" r="14" />
          <circle cx="125" cy="142" r="10" strokeDasharray="2 2" />
          <path d="M120 142 L123 145 L130 138" />
          {/* Signature Line */}
          <path d="M60 145 Q68 138 75 146 T88 142 T98 145" strokeWidth="1.2" />
        </svg>

        {/* Bottom-Left: Large Postal Dispatch Envelope & Arrow */}
        <svg 
          className="absolute -bottom-14 -left-14 w-80 sm:w-[420px] h-80 sm:h-[420px] text-blue-900/[0.045] dark:text-blue-400/[0.055] rotate-12" 
          viewBox="0 0 240 240" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1.4"
        >
          {/* Big Envelope Box */}
          <rect x="30" y="50" width="180" height="120" rx="10" />
          <path d="M30 50 L120 120 L210 50" />
          <path d="M30 170 L95 108" />
          <path d="M210 170 L145 108" />
          {/* Postage Stamp & Postal Waves */}
          <rect x="165" y="65" width="32" height="40" rx="3" strokeDasharray="3 2" />
          <path d="M110 80 Q130 70 150 80 T190 80" />
          <path d="M110 88 Q130 78 150 88 T190 88" />
          <path d="M110 96 Q130 86 150 96 T190 96" />
        </svg>

        {/* Bottom-Right: Official Letterhead Seal & Ribbons */}
        <svg 
          className="absolute -bottom-10 right-8 w-64 sm:w-80 h-64 sm:h-80 text-indigo-900/[0.04] dark:text-indigo-400/[0.05] -rotate-6 hidden md:block" 
          viewBox="0 0 200 200" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1.3"
        >
          <circle cx="100" cy="90" r="45" strokeDasharray="3 3" />
          <circle cx="100" cy="90" r="35" />
          <circle cx="100" cy="90" r="25" strokeWidth="1" />
          {/* Star Crest */}
          <polygon points="100,75 105,85 116,85 107,92 110,103 100,96 90,103 93,92 84,85 95,85" />
          {/* Ribbon Tails */}
          <path d="M85 125 L75 165 L95 155 L105 165 L100 125" fill="currentColor" fillOpacity="0.04" />
          <path d="M115 125 L125 165 L105 155 L95 165 L100 125" fill="currentColor" fillOpacity="0.04" />
        </svg>

        {/* Center-Floating Mini Envelopes */}
        <svg 
          className="absolute top-1/2 left-16 w-16 h-16 text-blue-700/[0.06] dark:text-blue-300/[0.05] -rotate-12 hidden lg:block" 
          viewBox="0 0 60 60" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1.5"
        >
          <rect x="5" y="12" width="50" height="36" rx="4" />
          <path d="M5 12 L30 32 L55 12" />
        </svg>

        <svg 
          className="absolute top-1/3 right-20 w-20 h-20 text-indigo-700/[0.06] dark:text-indigo-300/[0.05] rotate-15 hidden lg:block" 
          viewBox="0 0 60 60" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1.5"
        >
          <rect x="8" y="10" width="44" height="40" rx="3" />
          <line x1="14" y1="18" x2="38" y2="18" strokeWidth="2" />
          <line x1="14" y1="26" x2="46" y2="26" />
          <line x1="14" y1="34" x2="36" y2="34" />
          <circle cx="38" cy="40" r="5" />
        </svg>
      </div>

      {/* ========================================================================= */}
      {/* MAIN LOGIN CARD CONTAINER (DUAL-COLUMN ARCHITECTURE) */}
      {/* ========================================================================= */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden relative z-10 grid grid-cols-1 md:grid-cols-12"
      >
        {/* LEFT COLUMN: HERO PANEL WITH PROMINENT LETTER ILLUSTRATION */}
        <div className="md:col-span-6 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 p-6 sm:p-8 lg:p-9 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Background Glows */}
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-indigo-900/40 rounded-full blur-2xl pointer-events-none" />

          {/* Top Brand Header */}
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3.5">
              <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-xs">
                <FileText className="w-5 h-5 text-sky-200" />
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/15 text-sky-100 text-[11px] font-medium border border-white/20">
                <Sparkles className="w-3 h-3 text-sky-300" />
                <span>Sistem Persuratan & SPPD Digital</span>
              </div>
            </div>

            <p className="text-white/90 text-sm sm:text-base font-bold tracking-tight">
              Selamat Datang di
            </p>
            <h1 className="text-xl sm:text-2xl font-extrabold text-amber-300 tracking-tight leading-tight uppercase mt-0.5">
              SURATKU PERSURATAN & SPPD SEKOLAH
            </h1>

            <p className="text-sky-100 text-xs sm:text-[13px] mt-1.5 leading-relaxed font-normal">
              Sistem Otomasi Persuratan, Surat Tugas & SPPD Kedinasan Sekolah yang terintegrasi secara real-time antar perangkat dan cloud Google Drive.
            </p>
          </div>

          {/* Center: ENLARGED & FRAMELESS VECTOR ILLUSTRATION (NO OUTER CONTAINER / NO SUBTITLE TEXT) */}
          <div className="relative z-10 my-2 sm:my-3 flex items-center justify-center py-1">
            <svg 
              viewBox="0 0 340 180" 
              className="w-full max-w-[320px] sm:max-w-[360px] h-auto drop-shadow-2xl overflow-visible transition-transform duration-300 hover:scale-105" 
              fill="none"
            >
              <defs>
                <filter id="shadow-letter" x="-15%" y="-15%" width="130%" height="130%">
                  <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#0f172a" floodOpacity="0.3" />
                </filter>
                <filter id="shadow-floating" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#0f172a" floodOpacity="0.25" />
                </filter>
                <linearGradient id="headerGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#2563eb" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
                <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
              </defs>

              {/* Background Back-Letter Layer (Diagonal Stack Effect) */}
              <rect 
                x="45" 
                y="18" 
                width="240" 
                height="145" 
                rx="10" 
                fill="#e2e8f0" 
                fillOpacity="0.35" 
                transform="rotate(-4 165 90)" 
              />

              {/* Main Official Document Sheet */}
              <g filter="url(#shadow-letter)">
                <rect x="52" y="14" width="236" height="152" rx="10" fill="#ffffff" />
                
                {/* Official Letterhead Header Banner */}
                <path d="M52 24 C52 18.477 56.477 14 62 14 H278 C283.523 14 288 18.477 288 24 V44 H52 V24 Z" fill="url(#headerGrad)" />
                
                {/* School Seal / Emblem Icon on Header */}
                <circle cx="78" cy="29" r="7" fill="#fbbf24" />
                <path d="M78 24 L80 27.5 L84 27.5 L81 30 L82 34 L78 31.5 L74 34 L75 30 L72 27.5 L76 27.5 Z" fill="#b45309" />
                
                {/* Letter Header Title & Subtitle Lines */}
                <rect x="92" y="24" width="90" height="4" rx="2" fill="#ffffff" />
                <rect x="92" y="31" width="60" height="2.5" rx="1.25" fill="#bfdbfe" />
                <circle cx="272" cy="29" r="3" fill="#60a5fa" />

                {/* Divider Line under Header */}
                <line x1="52" y1="44" x2="288" y2="44" stroke="#e2e8f0" strokeWidth="1.5" />

                {/* Letter Body Simulated Content Lines */}
                <rect x="70" y="58" width="190" height="4.5" rx="2.25" fill="#94a3b8" />
                <rect x="70" y="69" width="165" height="3.5" rx="1.75" fill="#cbd5e1" />
                <rect x="70" y="78" width="185" height="3.5" rx="1.75" fill="#cbd5e1" />
                <rect x="70" y="87" width="140" height="3.5" rx="1.75" fill="#cbd5e1" />
                <rect x="70" y="96" width="175" height="3.5" rx="1.75" fill="#cbd5e1" />
                <rect x="70" y="105" width="115" height="3.5" rx="1.75" fill="#cbd5e1" />

                {/* Official Red/Blue Verification Stamp */}
                <circle cx="236" cy="132" r="19" fill="#1d4ed8" fillOpacity="0.08" stroke="#2563eb" strokeWidth="2" strokeDasharray="3 3" />
                <circle cx="236" cy="132" r="14" stroke="#1d4ed8" strokeWidth="1.2" />
                <circle cx="236" cy="132" r="10" fill="#2563eb" fillOpacity="0.15" />
                <path d="M230 132 L234 136 L243 127" stroke="#1d4ed8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />

                {/* Headmaster / Official Signature Curve */}
                <path d="M75 136 Q88 122 98 138 T118 132 T132 138" stroke="#0f172a" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                <rect x="75" y="146" width="62" height="2.5" rx="1.25" fill="#64748b" />
                <rect x="75" y="151" width="45" height="2" rx="1" fill="#94a3b8" />
              </g>

              {/* Floating Verified Badge (Top-Right) */}
              <g filter="url(#shadow-floating)">
                <circle cx="282" cy="50" r="21" fill="url(#goldGrad)" />
                <circle cx="282" cy="50" r="18" fill="#fbbf24" stroke="#ffffff" strokeWidth="1.5" />
                <path d="M275 50 L279.5 54.5 L289.5 44.5" stroke="#78350f" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </g>

              {/* Floating SPPD / Dispatch Icon Card (Bottom-Left) */}
              <g filter="url(#shadow-floating)">
                <rect x="18" y="78" width="56" height="56" rx="14" fill="#1e3a8a" stroke="#60a5fa" strokeWidth="2" />
                {/* Outgoing Paper Arrow */}
                <path d="M46 95 L34 107 L40 107 L40 120 L52 120 L52 107 L58 107 Z" fill="#93c5fd" />
                <circle cx="58" cy="88" r="3.5" fill="#38bdf8" />
              </g>
            </svg>
          </div>

          {/* Bottom Quotation Box (Concept from Reference Image) */}
          <div className="relative z-10">
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3.5 sm:p-4 text-white/95 shadow-inner">
              <p className="text-xs leading-relaxed italic text-white/90 font-medium">
                &ldquo;Sistem yang rapi dan tertib administrasi adalah fondasi utama bagi kelancaran tata kelola satuan pendidikan yang akuntabel dan berkelanjutan.&rdquo;
              </p>
              <div className="mt-2.5 flex items-center gap-2 text-[10px] font-bold text-sky-200 uppercase tracking-wider">
                <span className="w-3.5 h-0.5 bg-sky-300 inline-block" />
                <span>TIM PENGEMBANG SURATKU</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CLEAN FORM COMPONENT */}
        <div className="md:col-span-6 p-6 sm:p-8 lg:p-9 flex flex-col justify-center bg-white dark:bg-slate-900">
          <div className="max-w-md w-full mx-auto space-y-4 sm:space-y-5">
            {/* Header */}
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                Login Account
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Silakan masuk menggunakan username dan password Anda.
              </p>
            </div>

            {/* Error Notification */}
            <AnimatePresence>
              {errorMsg && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2 overflow-hidden"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
                  <span className="font-medium">{errorMsg}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Username Input */}
              <div>
                <label 
                  htmlFor="login-username"
                  className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5"
                >
                  USERNAME LOGIN
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="login-username"
                    type="text"
                    required
                    value={username || ''}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Masukkan username"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 text-xs sm:text-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 focus:bg-white dark:focus:bg-slate-900 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label 
                  htmlFor="login-password"
                  className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5"
                >
                  PASSWORD
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password || ''}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 text-xs sm:text-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 focus:bg-white dark:focus:bg-slate-900 transition-all font-medium"
                  />
                  <button
                    type="button"
                    id="toggle-password-visibility-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    title={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Main Submit Button */}
              <button
                id="login-submit-btn"
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-70 mt-2 uppercase tracking-wide"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Memverifikasi...</span>
                  </div>
                ) : (
                  <>
                    <span>MASUK APLIKASI</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Footer watermark */}
            <p className="text-center text-[10px] text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
              &copy; {new Date().getFullYear()} SURATKU &bull; Sistem Administrasi Persuratan Sekolah
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
