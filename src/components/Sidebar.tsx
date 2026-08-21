import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Archive, 
  Users, 
  GraduationCap, 
  Building2, 
  Settings, 
  LogOut,
  Mail,
  Sparkles,
  PanelLeftClose
} from 'lucide-react';
import { ActiveTab } from '../types';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onLogout: () => void;
  suratCount: number;
  guruCount: number;
  siswaCount: number;
  isOpenMobile: boolean;
  setIsOpenMobile: (isOpen: boolean) => void;
  isDesktopOpen: boolean;
  onToggleDesktop: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onLogout,
  suratCount,
  guruCount,
  siswaCount,
  isOpenMobile,
  setIsOpenMobile,
  isDesktopOpen,
  onToggleDesktop,
}) => {
  const menuItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'buat-surat' as ActiveTab,
      label: 'Buat Surat',
      icon: FileText,
      badge: 'Baru',
      highlight: true,
    },
    {
      id: 'arsip-surat' as ActiveTab,
      label: 'Arsip Surat',
      icon: Archive,
      count: suratCount,
    },
    {
      id: 'data-guru' as ActiveTab,
      label: 'Data Guru',
      icon: Users,
      count: guruCount,
    },
    {
      id: 'data-siswa' as ActiveTab,
      label: 'Data Siswa',
      icon: GraduationCap,
      count: siswaCount,
    },
    {
      id: 'data-sekolah' as ActiveTab,
      label: 'Data Sekolah',
      icon: Building2,
    },
    {
      id: 'pengaturan' as ActiveTab,
      label: 'Pengaturan',
      icon: Settings,
    },
  ];

  const handleNavClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (isOpenMobile) {
      setIsOpenMobile(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          id="sidebar-mobile-backdrop"
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        id="main-sidebar"
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-slate-900 text-slate-100 flex flex-col transition-all duration-300 ease-in-out border-r border-slate-800 ${
          isOpenMobile 
            ? 'translate-x-0' 
            : isDesktopOpen 
              ? '-translate-x-full lg:translate-x-0' 
              : '-translate-x-full'
        }`}
      >
        {/* Brand Header & Desktop Hide Button */}
        <div className="px-4 py-3.5 border-b border-slate-800/90 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-xs text-white">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-bold text-base tracking-tight text-white">SURATKU</span>
                <span className="text-[9px] uppercase font-mono font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30 px-1 py-0.2 rounded">v1.0</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium truncate max-w-[120px] mt-0.5">
                Surat Sekolah Otomatis
              </p>
            </div>
          </div>

          {/* Hide Sidebar Button on Desktop & Close on Mobile */}
          <button
            id="sidebar-hide-btn"
            onClick={() => {
              if (window.innerWidth < 1024) {
                setIsOpenMobile(false);
              } else {
                onToggleDesktop();
              }
            }}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Sembunyikan Sidebar"
            aria-label="Sembunyikan Sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
          <div className="px-2.5 pb-1.5 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            Menu Utama
          </div>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all group cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : item.highlight
                    ? 'text-sky-300 hover:bg-slate-800 hover:text-white bg-slate-800/40 border border-sky-500/20'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${
                    isActive ? 'text-white' : item.highlight ? 'text-sky-400' : 'text-slate-400 group-hover:text-white'
                  }`} />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 border border-sky-400/30">
                    {item.badge}
                  </span>
                )}

                {typeof item.count === 'number' && (
                  <span className={`text-[10px] font-mono font-medium px-1.5 py-0.2 rounded ${
                    isActive ? 'bg-blue-700 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Help Card */}
        <div className="p-2.5 mx-2 mb-2 rounded-lg bg-slate-800/60 border border-slate-700/60">
          <div className="flex items-start gap-2">
            <div className="p-1 rounded bg-blue-500/20 text-blue-400 mt-0.5 shrink-0">
              <Sparkles className="w-3 h-3" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-200">Google Workspace</div>
              <div className="text-[10px] text-slate-400 leading-tight mt-0.5">
                Otomatisasi Docs, Sheets & Drive.
              </div>
            </div>
          </div>
        </div>

        {/* Bottom User & Logout */}
        <div className="p-2 border-t border-slate-800/80 bg-slate-950/50">
          <button
            id="sidebar-logout-btn"
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-2.5 py-2 text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/15 rounded-lg transition-all cursor-pointer active:scale-98"
            title="Keluar dari Sistem"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>
    </>
  );
};
