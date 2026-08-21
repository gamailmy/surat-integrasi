import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Archive, 
  Users, 
  Settings as SettingsIcon 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ActiveTab, 
  SuratRecord, 
  DataSekolah, 
  DataGuru, 
  DataSiswa, 
  AppSettings, 
  LogAktivitas,
  JenisSurat 
} from './types';
import { 
  setupSURATKU,
  getSession, 
  logoutUser, 
  getDataSekolah, 
  saveDataSekolah,
  getDaftarGuru, 
  saveGuru, 
  deleteGuru,
  importGuruList,
  getDaftarSiswa, 
  saveSiswa, 
  deleteSiswa,
  importSiswaList,
  getDaftarSurat, 
  deleteSurat, 
  updateSuratStatus,
  getSettings, 
  saveSettings, 
  getLogs 
} from './services/storage';
import {
  startRealtimeCloudSync,
  registerCloudSyncListener,
  initializeAndBootstrapCloudSync
} from './services/cloudSync';

import { LoginView } from './components/LoginView';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { BuatSuratView } from './components/BuatSuratView';
import { ArsipSuratView } from './components/ArsipSuratView';
import { DataGuruView } from './components/DataGuruView';
import { DataSiswaView } from './components/DataSiswaView';
import { DataSekolahView } from './components/DataSekolahView';
import { PengaturanView } from './components/PengaturanView';
import { ViewLetterModal } from './components/ViewLetterModal';
import { LetterSuccessModal } from './components/LetterSuccessModal';
import { LogoutConfirmationModal } from './components/LogoutConfirmationModal';

export default function App() {
  // Authentication State (Default to false so login screen is shown first)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return getSession() !== null;
  });
  const [operatorName, setOperatorName] = useState<string>(() => {
    const session = getSession();
    return session ? session.nama : 'Operator Sekolah';
  });
  const [currentSession, setCurrentSession] = useState(getSession());
  const [isInitializing, setIsInitializing] = useState<boolean>(false);

  // App Navigation State
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState<boolean>(true);
  const [initialCreateType, setInitialCreateType] = useState<JenisSurat>('Surat Tugas');

  // Database Data States
  const [sekolah, setSekolah] = useState<DataSekolah>(getDataSekolah());
  const [daftarGuru, setDaftarGuru] = useState<DataGuru[]>(getDaftarGuru());
  const [daftarSiswa, setDaftarSiswa] = useState<DataSiswa[]>(getDaftarSiswa());
  const [suratList, setSuratList] = useState<SuratRecord[]>(getDaftarSurat());
  const [settings, setSettingsState] = useState<AppSettings>(getSettings());
  const [logs, setLogs] = useState<LogAktivitas[]>(getLogs());

  // Modals
  const [viewingSurat, setViewingSurat] = useState<SuratRecord | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const [createdSurat, setCreatedSurat] = useState<SuratRecord | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState<boolean>(false);

  // Initialize data on startup and subscribe to Real-Time Cloud Synchronization
  useEffect(() => {
    setupSURATKU();
    initializeAndBootstrapCloudSync().catch((err) => {
      console.warn('Initial cloud sync notice:', err);
    });

    const unsubscribeRealtime = startRealtimeCloudSync();
    const unsubscribeListener = registerCloudSyncListener((type) => {
      if (type === 'surat' || type === 'all') setSuratList(getDaftarSurat());
      if (type === 'guru' || type === 'all') setDaftarGuru(getDaftarGuru());
      if (type === 'siswa' || type === 'all') setDaftarSiswa(getDaftarSiswa());
      if (type === 'sekolah' || type === 'all') setSekolah(getDataSekolah());
      if (type === 'settings' || type === 'all') setSettingsState(getSettings());
      if (type === 'logs' || type === 'all') setLogs(getLogs());
    });

    // Auto-refresh when tab gains focus or returns from sleep
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        refreshAllData();
      }
    };

    window.addEventListener('focus', handleVisibilityOrFocus);
    window.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('storage', handleVisibilityOrFocus);

    return () => {
      unsubscribeRealtime();
      unsubscribeListener();
      window.removeEventListener('focus', handleVisibilityOrFocus);
      window.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('storage', handleVisibilityOrFocus);
    };
  }, []);

  // Sync dark mode class on HTML root element whenever settings.darkMode changes
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  const handleToggleDarkMode = () => {
    const newSettings: AppSettings = {
      ...settings,
      darkMode: !settings.darkMode,
    };
    saveSettings(newSettings);
    setSettingsState(newSettings);
    setLogs(getLogs());
  };

  const refreshAllData = () => {
    setSekolah(getDataSekolah());
    setDaftarGuru(getDaftarGuru());
    setDaftarSiswa(getDaftarSiswa());
    setSuratList(getDaftarSurat());
    setSettingsState(getSettings());
    setLogs(getLogs());
  };

  const handleLoginSuccess = () => {
    const session = getSession();
    setIsAuthenticated(true);
    setCurrentSession(session);
    setOperatorName(session ? session.nama : 'Operator Sekolah');
    refreshAllData();
  };

  const handleOpenLogoutConfirmation = () => {
    setCurrentSession(getSession());
    setIsLogoutModalOpen(true);
  };

  const handleConfirmLogout = () => {
    logoutUser();
    setIsAuthenticated(false);
    setCurrentSession(null);
    setIsLogoutModalOpen(false);
    setIsMobileSidebarOpen(false);
  };

  // Handlers for School Data
  const handleSaveSekolah = (newSekolah: DataSekolah) => {
    saveDataSekolah(newSekolah);
    setSekolah(newSekolah);
    setLogs(getLogs());
  };

  // Handlers for Guru
  const handleSaveGuru = (guru: DataGuru) => {
    saveGuru(guru);
    setDaftarGuru(getDaftarGuru());
    setLogs(getLogs());
  };

  const handleDeleteGuru = (id: string) => {
    deleteGuru(id);
    setDaftarGuru(getDaftarGuru());
    setLogs(getLogs());
  };

  const handleImportGuru = (gurus: DataGuru[], mode: 'merge' | 'replace') => {
    importGuruList(gurus, mode);
    setDaftarGuru(getDaftarGuru());
    setLogs(getLogs());
  };

  // Handlers for Siswa
  const handleSaveSiswa = (siswa: DataSiswa) => {
    saveSiswa(siswa);
    setDaftarSiswa(getDaftarSiswa());
    setLogs(getLogs());
  };

  const handleDeleteSiswa = (id: string) => {
    deleteSiswa(id);
    setDaftarSiswa(getDaftarSiswa());
    setLogs(getLogs());
  };

  const handleImportSiswa = (siswas: DataSiswa[], mode: 'merge' | 'replace') => {
    importSiswaList(siswas, mode);
    setDaftarSiswa(getDaftarSiswa());
    setLogs(getLogs());
  };

  // Handlers for Letters
  const handleSuratCreated = (newSurat: SuratRecord) => {
    setSuratList(getDaftarSurat());
    setSettingsState(getSettings());
    setLogs(getLogs());
    setCreatedSurat(newSurat);
    setIsSuccessModalOpen(true);
  };

  const handleDeleteSurat = (id: string) => {
    deleteSurat(id);
    setSuratList(getDaftarSurat());
    setLogs(getLogs());
  };

  const handleUpdateSuratStatus = (id: string, status: SuratRecord['status']) => {
    updateSuratStatus(id, status);
    setSuratList(getDaftarSurat());
    setLogs(getLogs());
  };

  const handlePreviewSurat = (surat: SuratRecord) => {
    setViewingSurat(surat);
    setIsViewModalOpen(true);
  };

  // Handlers for Navigation
  const handleNavigateToCreate = (type?: JenisSurat) => {
    if (type) {
      setInitialCreateType(type);
    }
    setActiveTab('buat-surat');
  };

  const handleResetCreateAfterSuccess = () => {
    setIsSuccessModalOpen(false);
    setActiveTab('buat-surat');
  };

  const handleNavigateArchiveAfterSuccess = () => {
    setIsSuccessModalOpen(false);
    setActiveTab('arsip-surat');
  };

  // Loading screen before checking session
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold tracking-wide">Memuat SURATKU...</span>
        </div>
      </div>
    );
  }

  // Not authenticated -> Show Login View
  if (!isAuthenticated) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors">
      {/* 1. Sidebar (Supports Mobile Drawer & Desktop Hide/Collapse) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleOpenLogoutConfirmation}
        suratCount={suratList.length}
        guruCount={daftarGuru.length}
        siswaCount={daftarSiswa.length}
        isOpenMobile={isMobileSidebarOpen}
        setIsOpenMobile={setIsMobileSidebarOpen}
        isDesktopOpen={isDesktopSidebarOpen}
        onToggleDesktop={() => setIsDesktopSidebarOpen(prev => !prev)}
      />

      {/* 2. Main Content Container (Smooth transition when sidebar is toggled) */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
        isDesktopSidebarOpen ? 'lg:pl-64' : 'lg:pl-0'
      }`}>
        {/* Top Navbar */}
        <Navbar
          sekolah={sekolah}
          operatorName={operatorName}
          isDarkMode={!!settings.darkMode}
          isSidebarOpen={isDesktopSidebarOpen}
          onToggleDarkMode={handleToggleDarkMode}
          onToggleSidebar={() => {
            if (window.innerWidth < 1024) {
              setIsMobileSidebarOpen(prev => !prev);
            } else {
              setIsDesktopSidebarOpen(prev => !prev);
            }
          }}
          onQuickCreate={() => handleNavigateToCreate()}
          onLogoutClick={handleOpenLogoutConfirmation}
        />

        {/* Dynamic Page Views */}
        <main className="flex-1 p-3 sm:p-4 lg:p-6 pb-20 lg:pb-6 max-w-7xl w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              {activeTab === 'dashboard' && (
                <DashboardView
                  suratList={suratList}
                  sekolah={sekolah}
                  onNavigateCreate={handleNavigateToCreate}
                  onNavigateArchive={() => setActiveTab('arsip-surat')}
                  onNavigateGuru={() => setActiveTab('data-guru')}
                  onNavigateSiswa={() => setActiveTab('data-siswa')}
                  onPreviewSurat={handlePreviewSurat}
                />
              )}

              {activeTab === 'buat-surat' && (
                <BuatSuratView
                  sekolah={sekolah}
                  daftarGuru={daftarGuru}
                  daftarSiswa={daftarSiswa}
                  initialJenisSurat={initialCreateType}
                  onSuratCreated={handleSuratCreated}
                />
              )}

              {activeTab === 'arsip-surat' && (
                <ArsipSuratView
                  suratList={suratList}
                  onPreviewSurat={handlePreviewSurat}
                  onDeleteSurat={handleDeleteSurat}
                  onUpdateStatus={handleUpdateSuratStatus}
                  onNavigateCreate={() => handleNavigateToCreate()}
                />
              )}

              {activeTab === 'data-guru' && (
                <DataGuruView
                  daftarGuru={daftarGuru}
                  onSaveGuru={handleSaveGuru}
                  onDeleteGuru={handleDeleteGuru}
                  onImportGuru={handleImportGuru}
                />
              )}

              {activeTab === 'data-siswa' && (
                <DataSiswaView
                  daftarSiswa={daftarSiswa}
                  onSaveSiswa={handleSaveSiswa}
                  onDeleteSiswa={handleDeleteSiswa}
                  onImportSiswa={handleImportSiswa}
                />
              )}

              {activeTab === 'data-sekolah' && (
                <DataSekolahView
                  sekolah={sekolah}
                  onSaveSekolah={handleSaveSekolah}
                />
              )}

              {activeTab === 'pengaturan' && (
                <PengaturanView
                  settings={settings}
                  logs={logs}
                  onSaveSettings={(newSettings) => {
                    saveSettings(newSettings);
                    setSettingsState(newSettings);
                    setLogs(getLogs());
                  }}
                  onRefreshData={refreshAllData}
                  onLogoutClick={handleOpenLogoutConfirmation}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav 
        id="mobile-bottom-nav"
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 lg:hidden px-2 py-1.5 flex items-center justify-around shadow-lg"
      >
        <button
          id="mobile-nav-dashboard"
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-semibold cursor-pointer transition-colors ${
            activeTab === 'dashboard'
              ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 mb-0.5" />
          <span>Dashboard</span>
        </button>

        <button
          id="mobile-nav-buat"
          onClick={() => handleNavigateToCreate()}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
            activeTab === 'buat-surat'
              ? 'text-white bg-blue-600 shadow-xs'
              : 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800'
          }`}
        >
          <FileText className="w-4 h-4 mb-0.5" />
          <span>+ Buat</span>
        </button>

        <button
          id="mobile-nav-arsip"
          onClick={() => setActiveTab('arsip-surat')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-semibold cursor-pointer transition-colors relative ${
            activeTab === 'arsip-surat'
              ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <Archive className="w-4 h-4 mb-0.5" />
          <span>Arsip ({suratList.length})</span>
        </button>

        <button
          id="mobile-nav-guru-siswa"
          onClick={() => setActiveTab('data-guru')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-semibold cursor-pointer transition-colors ${
            activeTab === 'data-guru' || activeTab === 'data-siswa'
              ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <Users className="w-4 h-4 mb-0.5" />
          <span>Guru/Siswa</span>
        </button>

        <button
          id="mobile-nav-pengaturan"
          onClick={() => setActiveTab('pengaturan')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-semibold cursor-pointer transition-colors ${
            activeTab === 'pengaturan' || activeTab === 'data-sekolah'
              ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <SettingsIcon className="w-4 h-4 mb-0.5" />
          <span>Pengaturan</span>
        </button>
      </nav>

      {/* 3. Modals */}
      <ViewLetterModal
        surat={viewingSurat}
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        onStatusChange={(id, status) => {
          handleUpdateSuratStatus(id, status);
          if (viewingSurat && viewingSurat.id === id) {
            setViewingSurat({ ...viewingSurat, status });
          }
        }}
      />

      <LetterSuccessModal
        surat={createdSurat}
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        onPreview={(surat) => {
          setIsSuccessModalOpen(false);
          handlePreviewSurat(surat);
        }}
        onResetCreate={handleResetCreateAfterSuccess}
        onNavigateArchive={handleNavigateArchiveAfterSuccess}
      />

      {/* Logout Confirmation & Session Termination Modal */}
      <LogoutConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
        session={currentSession}
      />
    </div>
  );
}
