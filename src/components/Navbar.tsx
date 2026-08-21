import React from 'react';
import { 
  Menu, 
  Plus, 
  Calendar, 
  ShieldCheck, 
  Sun, 
  Moon, 
  PanelLeftClose, 
  PanelLeft,
  Cloud
} from 'lucide-react';
import { DataSekolah } from '../types';

interface NavbarProps {
  sekolah: DataSekolah;
  operatorName: string;
  isDarkMode: boolean;
  isSidebarOpen: boolean;
  onToggleDarkMode: () => void;
  onToggleSidebar: () => void;
  onQuickCreate: () => void;
  onLogoutClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  sekolah,
  operatorName,
  isDarkMode,
  isSidebarOpen,
  onToggleDarkMode,
  onToggleSidebar,
  onQuickCreate,
  onLogoutClick,
}) => {
  const today = new Date();
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  };
  const dateFormatted = today.toLocaleDateString('id-ID', options);

  return (
    <header 
      id="top-navbar"
      className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs border-b border-slate-200 dark:border-slate-800 px-3 sm:px-6 py-2.5 flex items-center justify-between transition-colors"
    >
      {/* Left: Sidebar Hide/Show trigger & School Profile Brief */}
      <div className="flex items-center gap-2.5">
        <button
          id="navbar-sidebar-toggle"
          onClick={onToggleSidebar}
          className="p-1.5 -ml-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
          title={isSidebarOpen ? 'Sembunyikan Sidebar' : 'Tampilkan Sidebar'}
          aria-label="Toggle Sidebar"
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="w-4 h-4 text-slate-600 dark:text-slate-300 hidden lg:block" />
          ) : (
            <PanelLeft className="w-4 h-4 text-blue-600 dark:text-blue-400 hidden lg:block" />
          )}
          <Menu className="w-4 h-4 lg:hidden" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm leading-tight truncate max-w-[180px] sm:max-w-xs md:max-w-md">
              {sekolah.namaSekolah || 'SURATKU Sekolah'}
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-1.5 py-0.2 rounded">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              NPSN: {sekolah.npsn}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block leading-tight">
            {sekolah.kabupaten}, {sekolah.provinsi} &bull; Kode: <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">{sekolah.kodeSekolah}</span>
          </p>
        </div>
      </div>

      {/* Right: Date, Cloud Sync Status, Dark Mode Toggle, Operator Profile & Quick Action */}
      <div className="flex items-center gap-1.5 sm:gap-3">
        {/* Real-time Cloud Sync Badge */}
        <div 
          className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-[11px] font-medium text-emerald-700 dark:text-emerald-300"
          title="Sinkronisasi Cloud Real-Time Aktif (Semua perangkat otomatis terhubung)"
        >
          <Cloud className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 animate-pulse" />
          <span className="font-semibold">Cloud Sync Aktif</span>
        </div>

        {/* Dark Mode Toggle Button in Header */}
        <button
          id="navbar-dark-mode-toggle"
          onClick={onToggleDarkMode}
          className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer text-xs font-semibold"
          title={isDarkMode ? 'Beralih ke Mode Terang (Light Mode)' : 'Beralih ke Mode Gelap (Dark Mode)'}
          aria-label="Toggle Dark Mode"
        >
          {isDarkMode ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
              <span className="hidden md:inline text-[11px]">Terang</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className="hidden md:inline text-[11px]">Gelap</span>
            </>
          )}
        </button>

        {/* Date display */}
        <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-200/80 dark:border-slate-700">
          <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span className="font-medium text-[11px]">{dateFormatted}</span>
        </div>

        {/* Operator Badge */}
        <div className="flex items-center gap-1.5 sm:gap-2 pl-2 border-l border-slate-200 dark:border-slate-700">
          <div className="w-7 h-7 rounded-md bg-slate-800 dark:bg-blue-600 text-white flex items-center justify-center font-bold text-[11px]">
            OP
          </div>
          <div className="hidden xl:block text-left">
            <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1 leading-none">
              <span>{operatorName || 'Operator'}</span>
              <ShieldCheck className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">Admin Sekolah</div>
          </div>
        </div>

        {/* Primary Action Button */}
        <button
          id="navbar-quick-create-btn"
          onClick={onQuickCreate}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-all cursor-pointer active:scale-95"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span className="hidden sm:inline">Buat Surat</span>
          <span className="sm:hidden">Buat</span>
        </button>
      </div>
    </header>
  );
};
