import React, { useState } from 'react';
import { 
  Key, 
  Code2, 
  Copy, 
  Check, 
  History, 
  RotateCcw, 
  Download, 
  Database,
  ShieldAlert,
  Link2,
  Moon,
  Sun,
  Palette,
  CheckCircle2,
  Sparkles,
  FileSpreadsheet,
  ExternalLink,
  Zap,
  LogOut,
  AlertTriangle,
  RefreshCw,
  Send,
  Globe,
  Cloud
} from 'lucide-react';
import { AppSettings, LogAktivitas } from '../types';
import { GAS_BACKEND_CODE } from '../services/gasCode';
import { setupSURATKU } from '../services/storage';
import { downloadMasterDatabaseSpreadsheet, openGoogleSheetsNew } from '../services/excelService';
import { 
  validateGasUrl, 
  testGasConnection, 
  syncAllDatabaseToGas 
} from '../services/gasSyncService';

interface PengaturanViewProps {
  settings: AppSettings;
  logs: LogAktivitas[];
  onSaveSettings: (settings: AppSettings) => void;
  onRefreshData: () => void;
  onLogoutClick?: () => void;
}

export const PengaturanView: React.FC<PengaturanViewProps> = ({
  settings,
  logs,
  onSaveSettings,
  onRefreshData,
  onLogoutClick,
}) => {
  const [formData, setFormData] = useState<AppSettings>({
    ...settings,
    gasWebAppUrl: settings?.gasWebAppUrl || '',
    googleSpreadsheetUrl: settings?.googleSpreadsheetUrl || '',
    adminUsername: settings?.adminUsername || 'admin',
    adminNama: settings?.adminNama || 'Administrator',
    autoIncrementCounter: settings?.autoIncrementCounter ?? 0,
  });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [themeMsg, setThemeMsg] = useState('');
  const [isGeneratingSheet, setIsGeneratingSheet] = useState(false);
  const [sheetSuccessMsg, setSheetSuccessMsg] = useState('');
  
  // GAS live sync & testing states
  const [isTestingGas, setIsTestingGas] = useState(false);
  const [gasTestResult, setGasTestResult] = useState<{ status: 'success' | 'error'; message: string } | null>(null);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [syncAllResult, setSyncAllResult] = useState<{ status: 'success' | 'error'; message: string } | null>(null);

  const [hasCopiedGasCode, setHasCopiedGasCode] = useState(false);
  const [activeTab, setActiveTab] = useState<'appearance' | 'gas' | 'account' | 'logs' | 'database'>('appearance');

  const handleCopyCode = () => {
    navigator.clipboard.writeText(GAS_BACKEND_CODE);
    setHasCopiedGasCode(true);
    setTimeout(() => setHasCopiedGasCode(false), 2500);
  };

  const handleDownloadMasterSheet = () => {
    setIsGeneratingSheet(true);
    setSheetSuccessMsg('');
    setTimeout(() => {
      downloadMasterDatabaseSpreadsheet({ settings: formData, logs });
      setIsGeneratingSheet(false);
      setSheetSuccessMsg('Master Spreadsheet (7 Sheet Lengkap) berhasil dibuat secara otomatis!');
      setTimeout(() => setSheetSuccessMsg(''), 4000);
    }, 400);
  };

  const handleToggleTheme = (enableDark: boolean) => {
    const updated: AppSettings = {
      ...formData,
      darkMode: enableDark,
    };
    setFormData(updated);
    onSaveSettings(updated);
    setThemeMsg(`Tema berhasil diubah ke Mode ${enableDark ? 'Gelap (Dark Mode)' : 'Terang (Light Mode)'} dan disimpan ke preferensi Google Sheets.`);
    setTimeout(() => setThemeMsg(''), 3500);
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword) {
      if (newPassword !== confirmPassword) {
        setPasswordMsg('Password baru dan konfirmasi tidak cocok!');
        return;
      }
      formData.adminPasswordHash = newPassword;
    }

    onSaveSettings(formData);
    setPasswordMsg('Pengaturan akun berhasil disimpan!');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordMsg(''), 3000);
  };

  const handleTestGasConnection = async () => {
    setIsTestingGas(true);
    setGasTestResult(null);
    try {
      const res = await testGasConnection(formData.gasWebAppUrl);
      if (res.status === 'success' || res.status === 'online') {
        setGasTestResult({
          status: 'success',
          message: 'Berhasil Terhubung! Google Apps Script Web App aktif & siap menerima data.',
        });
      } else {
        setGasTestResult({
          status: 'error',
          message: res.message || 'Gagal terhubung ke Google Apps Script Web App.',
        });
      }
    } catch (err: any) {
      setGasTestResult({
        status: 'error',
        message: `Koneksi gagal: ${err.message || err.toString()}`,
      });
    } finally {
      setIsTestingGas(false);
    }
  };

  const handleSyncAllToGoogleSheets = async () => {
    setIsSyncingAll(true);
    setSyncAllResult(null);
    try {
      // First save settings so URL is registered
      onSaveSettings(formData);
      const res = await syncAllDatabaseToGas();
      if (res.status === 'success') {
        setSyncAllResult({
          status: 'success',
          message: res.message || 'Seluruh data (Surat, Guru, Siswa, Sekolah) berhasil disinkronkan ke Google Sheets!',
        });
        onRefreshData();
      } else {
        setSyncAllResult({
          status: 'error',
          message: res.message || 'Gagal sinkronisasi data ke Google Sheets.',
        });
      }
    } catch (err: any) {
      setSyncAllResult({
        status: 'error',
        message: `Sinkronisasi gagal: ${err.message || err.toString()}`,
      });
    } finally {
      setIsSyncingAll(false);
    }
  };

  const urlValidation = validateGasUrl(formData.gasWebAppUrl || '');

  const handleResetDatabase = () => {
    if (confirm('PERINGATAN: Apakah Anda yakin ingin mereset seluruh data kembali ke setelan awal (setupSURATKU)? Data kustom akan diganti dengan template awal.')) {
      setupSURATKU(true);
      onRefreshData();
      alert('Database SURATKU berhasil direset ke pengaturan awal.');
    }
  };

  const handleExportBackup = () => {
    const backupObj = {
      settings: localStorage.getItem('SURATKU_SETTINGS'),
      sekolah: localStorage.getItem('SURATKU_DATA_SEKOLAH'),
      guru: localStorage.getItem('SURATKU_GURU'),
      siswa: localStorage.getItem('SURATKU_SISWA'),
      surat: localStorage.getItem('SURATKU_SURAT'),
      logs: localStorage.getItem('SURATKU_LOG_AKTIVITAS'),
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(backupObj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SURATKU_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-3.5 animate-fadeIn max-w-5xl pb-8">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">Pengaturan Sistem & Preferensi</h2>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
          Kelola tema tampilan (Dark Mode), backend Google Apps Script, kredensial login operator, dan database.
        </p>

        {/* Tab Selection */}
        <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            id="settings-tab-appearance"
            onClick={() => setActiveTab('appearance')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'appearance'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Tema & Tampilan (Dark Mode)</span>
          </button>

          <button
            id="settings-tab-gas"
            onClick={() => setActiveTab('gas')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'gas'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Google Apps Script (Code.gs)</span>
          </button>

          <button
            id="settings-tab-account"
            onClick={() => setActiveTab('account')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'account'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Akun & Password</span>
          </button>

          <button
            id="settings-tab-logs"
            onClick={() => setActiveTab('logs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'logs'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Log Aktivitas ({logs.length})</span>
          </button>

          <button
            id="settings-tab-database"
            onClick={() => setActiveTab('database')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'database'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Backup & Reset</span>
          </button>
        </div>
      </div>

      {/* Tab 0: Tampilan & Tema (Dark Mode) */}
      {activeTab === 'appearance' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-4 sm:p-5 space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm flex items-center gap-2">
              <Palette className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Tema Tampilan SURATKU</span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Pilih mode tampilan antarmuka yang nyaman untuk mata saat bekerja seharian di sekolah. Preferensi Anda tersimpan secara otomatis di konfigurasi sistem & Sheet SETTINGS Google Sheets.
            </p>
          </div>

          {themeMsg && (
            <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{themeMsg}</span>
            </div>
          )}

          {/* Mode Selector Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            {/* Light Mode Option */}
            <div
              id="theme-option-light"
              onClick={() => handleToggleTheme(false)}
              className={`p-4 rounded-xl border-2 transition-all cursor-pointer text-left relative flex flex-col justify-between ${
                !formData.darkMode
                  ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-950/20 shadow-xs ring-1 ring-blue-600'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Sun className="w-5 h-5" />
                  </div>
                  {!formData.darkMode && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 px-2 py-0.5 rounded-md">
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>Aktif</span>
                    </span>
                  )}
                </div>
                <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">Mode Terang (Light Mode)</div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Latar belakang putih dan abu-abu terang dengan kontras tinggi standar instansi pendidikan.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-slate-100 border border-slate-300"></div>
                <div className="w-4 h-4 rounded-full bg-blue-600"></div>
                <div className="w-4 h-4 rounded-full bg-white border border-slate-300"></div>
                <span className="text-[10px] text-slate-400 font-mono ml-auto">Clean & Crisp</span>
              </div>
            </div>

            {/* Dark Mode Option */}
            <div
              id="theme-option-dark"
              onClick={() => handleToggleTheme(true)}
              className={`p-4 rounded-xl border-2 transition-all cursor-pointer text-left relative flex flex-col justify-between ${
                formData.darkMode
                  ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-950/20 shadow-xs ring-1 ring-blue-600'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Moon className="w-5 h-5" />
                  </div>
                  {formData.darkMode && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 px-2 py-0.5 rounded-md">
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>Aktif</span>
                    </span>
                  )}
                </div>
                <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">Mode Gelap (Dark Mode)</div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Latar belakang slate gelap yang nyaman dan tidak silau di mata, dengan kartu dokumen yang kontras.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-slate-950 border border-slate-700"></div>
                <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                <div className="w-4 h-4 rounded-full bg-slate-900 border border-slate-700"></div>
                <span className="text-[10px] text-slate-400 font-mono ml-auto">Eye-Friendly</span>
              </div>
            </div>
          </div>

          {/* Information box about Google Sheets persistence */}
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
            <div className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
              <strong>Sinkronisasi Google Sheets:</strong> Status Dark Mode tersimpan di database setting dengan kunci <code className="font-mono bg-white dark:bg-slate-900 px-1 py-0.2 rounded border border-slate-200 dark:border-slate-700 text-[10px]">DARK_MODE</code> (nilai: <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{formData.darkMode ? 'TRUE' : 'FALSE'}</span>), sehingga preferensi tetap terjaga di setiap sesi. Anda juga dapat mengubahnya kapan saja melalui tombol cepat di bilah navigasi atas.
            </div>
          </div>
        </div>
      )}

      {/* Tab 1: Google Apps Script Backend Code & Instructions */}
      {activeTab === 'gas' && (
        <div className="space-y-3.5">
          {/* Automatic Master Spreadsheet Creation Card */}
          <div className="bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 rounded-xl border border-blue-200 dark:border-blue-800 shadow-xs p-4 sm:p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 text-[10px] font-bold">
                  <Zap className="w-3 h-3 text-blue-600 dark:text-blue-400 fill-blue-600" />
                  <span>Pembuatan Sheet Otomatis</span>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base flex items-center gap-2">
                  <span>Buat & Siapkan Database Google Sheets Secara Otomatis</span>
                </h3>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                  Sistem dapat membuat seluruh lembar kerja (7 sheet: <strong>SETTINGS, DATA_SEKOLAH, GURU, SISWA, JENIS_SURAT, SURAT, LOG_AKTIVITAS</strong>) secara otomatis dengan format resmi yang siap langsung digunakan di Google Sheets maupun Microsoft Excel.
                </p>
              </div>

              <div className="flex flex-wrap sm:flex-col gap-2 shrink-0">
                <button
                  id="btn-auto-generate-master-sheet"
                  onClick={handleDownloadMasterSheet}
                  disabled={isGeneratingSheet}
                  className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-lg text-xs shadow-xs transition-all cursor-pointer disabled:opacity-60 active:scale-95"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>{isGeneratingSheet ? 'Membuat Sheet...' : '⚡ Buat Sheet Otomatis (.xlsx)'}</span>
                </button>

                <button
                  id="btn-open-sheets-new"
                  onClick={openGoogleSheetsNew}
                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-semibold rounded-lg text-xs shadow-xs transition-all cursor-pointer active:scale-95"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Buka sheets.new</span>
                </button>
              </div>
            </div>

            {sheetSuccessMsg && (
              <div className="p-2.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{sheetSuccessMsg}</span>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-4 sm:p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm flex items-center gap-2">
                  <span>Backend Google Apps Script: Code.gs</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 px-1.5 py-0.2 rounded font-semibold">
                    Siap Pakai
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Kode backend mandiri lengkap dengan fungsi <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.2 rounded text-[10px]">setupSURATKU()</code> untuk pembuatan sheet di Google Drive akun Anda secara otomatis.
                </p>
              </div>

              <button
                id="gas-copy-code-btn"
                onClick={handleCopyCode}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs shadow-xs transition-all cursor-pointer shrink-0 active:scale-95"
              >
                {hasCopiedGasCode ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Kode Code.gs</span>
                  </>
                )}
              </button>
            </div>

            {/* Step-by-Step Instructions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs">
                <div className="w-5 h-5 rounded-md bg-blue-600 text-white font-bold flex items-center justify-center mb-1 text-[11px]">1</div>
                <div className="font-bold text-slate-900 dark:text-slate-100 text-xs">Buka script.google.com</div>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                  Buka Google Apps Script, buat proyek baru dengan nama <strong>SURATKU Backend</strong>.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs">
                <div className="w-5 h-5 rounded-md bg-blue-600 text-white font-bold flex items-center justify-center mb-1 text-[11px]">2</div>
                <div className="font-bold text-slate-900 dark:text-slate-100 text-xs">Jalankan setupSURATKU()</div>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                  Tempelkan kode di bawah ke <code className="font-mono">Code.gs</code>, pilih fungsi <strong>setupSURATKU</strong> lalu klik <strong>Jalankan</strong> untuk membuat seluruh sheet otomatis.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs">
                <div className="w-5 h-5 rounded-md bg-blue-600 text-white font-bold flex items-center justify-center mb-1 text-[11px]">3</div>
                <div className="font-bold text-slate-900 dark:text-slate-100 text-xs">Terapkan Web App</div>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                  Klik <strong>Deploy &rarr; New Deployment &rarr; Web App</strong>, pilih akses <em>Anyone</em>, lalu salin URL Web App ke form.
                </p>
              </div>
            </div>

            {/* Web App URL & Google Sheets Link Connector */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Koneksi Google Apps Script Web App & Google Sheets</span>
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Hubungkan aplikasi dengan Google Apps Script agar setiap surat baru, guru, dan siswa langsung tersimpan ke Google Sheets & Google Drive akun Anda.
                </p>
              </div>

              {/* 1. Web App Exec URL */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label 
                    htmlFor="gas-url-input"
                    className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
                  >
                    <span>1. URL Google Apps Script Web App (Wajib untuk Sinkronisasi Otomatis)</span>
                  </label>
                  {formData.gasWebAppUrl && (
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      urlValidation.isValid 
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {urlValidation.isValid ? '✓ Format URL Valid' : '⚠️ Perlu Diperiksa'}
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    id="gas-url-input"
                    type="url"
                    value={formData.gasWebAppUrl || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, gasWebAppUrl: e.target.value }))}
                    placeholder="https://script.google.com/macros/s/.../exec"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <div className="flex gap-2 shrink-0">
                    <button
                      id="gas-save-url-btn"
                      type="button"
                      onClick={() => {
                        onSaveSettings(formData);
                        alert('Pengaturan URL berhasil disimpan!');
                      }}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold text-xs rounded-lg shadow-xs cursor-pointer active:scale-95"
                    >
                      Simpan
                    </button>
                    <button
                      id="gas-test-conn-btn"
                      type="button"
                      onClick={handleTestGasConnection}
                      disabled={isTestingGas || !formData.gasWebAppUrl}
                      className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isTestingGas ? 'animate-spin' : ''}`} />
                      <span>{isTestingGas ? 'Menguji...' : 'Test Koneksi'}</span>
                    </button>
                  </div>
                </div>

                {/* Smart Warning if user pasted Spreadsheet URL instead of Web App Exec URL */}
                {urlValidation.isSheetUrl && (
                  <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-xs space-y-1.5 mt-2">
                    <div className="font-bold flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                      <span>Perhatian: Anda Memasukkan Link Google Sheets Langsung</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      Link yang Anda paste adalah link dokumen spreadsheet biasa (<code className="font-mono bg-amber-100 dark:bg-amber-900 px-1 py-0.5 rounded">docs.google.com</code>). Agar aplikasi dapat menulis data ke spreadsheet secara otomatis, ikuti 3 langkah mudah ini:
                    </p>
                    <ol className="list-decimal list-inside text-[11px] space-y-1 pl-1 text-slate-700 dark:text-slate-300">
                      <li>Di spreadsheet Anda, klik menu <strong>Ekstensi (Extensions) &rarr; Apps Script</strong>.</li>
                      <li>Hapus kode bawaan, lalu paste kode <strong>Code.gs</strong> (salin dengan tombol di atas).</li>
                      <li>Klik <strong>Deploy (Terapkan) &rarr; New deployment &rarr; Web app</strong>, atur akses ke <strong>Anyone (Siapa saja)</strong>, lalu copy link Web App yang berakhiran <code className="font-mono bg-amber-100 dark:bg-amber-900 px-1 rounded">/exec</code> ke kotak di atas.</li>
                    </ol>
                  </div>
                )}

                {/* Gas Test Feedback */}
                {gasTestResult && (
                  <div className={`p-3 rounded-lg text-xs font-semibold flex items-start gap-2 mt-2 ${
                    gasTestResult.status === 'success'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200'
                      : 'bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-700 text-rose-900 dark:text-rose-200'
                  }`}>
                    {gasTestResult.status === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <div>{gasTestResult.message}</div>
                  </div>
                )}
              </div>

              {/* 2. Optional Spreadsheet Direct Link */}
              <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-700">
                <label 
                  htmlFor="sheet-direct-url-input"
                  className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
                >
                  <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>2. Link Google Sheets Anda (Opsional - Untuk Akses Cepat)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    id="sheet-direct-url-input"
                    type="url"
                    value={formData.googleSpreadsheetUrl || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, googleSpreadsheetUrl: e.target.value }))}
                    placeholder="https://docs.google.com/spreadsheets/d/.../edit"
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                  {formData.googleSpreadsheetUrl && (
                    <a
                      id="link-open-user-sheet"
                      href={formData.googleSpreadsheetUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-1 shrink-0 transition-all cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Buka Sheet</span>
                    </a>
                  )}
                </div>
              </div>

              {/* 3. Push All Data to Google Sheets Button */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Kirim & Sinkronkan Semua Data Lokal ke Google Sheets</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Ekspor arsip surat, data guru, data siswa, dan data sekolah yang tersimpan saat ini ke Google Sheets dalam 1 klik.
                  </p>
                </div>

                <button
                  id="btn-sync-all-to-gas"
                  type="button"
                  onClick={handleSyncAllToGoogleSheets}
                  disabled={isSyncingAll || !formData.gasWebAppUrl}
                  className="px-4 py-2 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg shadow-xs flex items-center justify-center gap-1.5 shrink-0 transition-all cursor-pointer active:scale-95"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingAll ? 'animate-spin' : ''}`} />
                  <span>{isSyncingAll ? 'Sedang Mengirim Data...' : '⚡ Sinkronkan Sekarang'}</span>
                </button>
              </div>

              {syncAllResult && (
                <div className={`p-3 rounded-lg text-xs font-semibold flex items-start gap-2 ${
                  syncAllResult.status === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200'
                    : 'bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-700 text-rose-900 dark:text-rose-200'
                }`}>
                  {syncAllResult.status === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div>{syncAllResult.message}</div>
                </div>
              )}
            </div>

            {/* Code Box */}
            <div className="relative rounded-lg overflow-hidden border border-slate-800">
              <div className="bg-slate-950 text-slate-400 px-3 py-1.5 text-[11px] font-mono flex items-center justify-between border-b border-slate-800">
                <span>Code.gs &bull; Google Apps Script</span>
                <span>JavaScript / Apps Script V8</span>
              </div>
              <pre className="p-3 bg-slate-900 text-slate-100 font-mono text-[11px] leading-relaxed overflow-x-auto max-h-80">
                <code>{GAS_BACKEND_CODE}</code>
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Kredensial Akun Admin & Penomoran */}
      {activeTab === 'account' && (
        <form onSubmit={handleSaveAccount} className="space-y-3.5">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-4 sm:p-5 space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm flex items-center gap-2">
              <Key className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Kredensial Login Operator</span>
            </h3>

            {passwordMsg && (
              <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 text-xs font-semibold">
                {passwordMsg}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label 
                  htmlFor="settings-username"
                  className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-0.5"
                >
                  Username Operator
                </label>
                <input
                  id="settings-username"
                  type="text"
                  required
                  value={formData.adminUsername || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, adminUsername: e.target.value }))}
                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-900"
                />
              </div>

              <div>
                <label 
                  htmlFor="settings-nama-operator"
                  className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-0.5"
                >
                  Nama Panggilan Operator
                </label>
                <input
                  id="settings-nama-operator"
                  type="text"
                  value={formData.adminNama || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, adminNama: e.target.value }))}
                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div>
                <label 
                  htmlFor="settings-new-pass"
                  className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-0.5"
                >
                  Ganti Password Baru (Kosongkan jika tidak diubah)
                </label>
                <input
                  id="settings-new-pass"
                  type="password"
                  value={newPassword || ''}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Masukkan password baru"
                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-900"
                />
              </div>

              <div>
                <label 
                  htmlFor="settings-confirm-pass"
                  className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-0.5"
                >
                  Ulangi Password Baru
                </label>
                <input
                  id="settings-confirm-pass"
                  type="password"
                  value={confirmPassword || ''}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Konfirmasi password baru"
                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-900"
                />
              </div>
            </div>

            {/* Penomoran Surat Counter */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <label 
                htmlFor="settings-counter"
                className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-0.5"
              >
                Nomor Urut Surat Terakhir (Auto Increment Counter)
              </label>
              <div className="max-w-xs">
                <input
                  id="settings-counter"
                  type="number"
                  min="0"
                  value={formData.autoIncrementCounter ?? 0}
                  onChange={(e) => setFormData(prev => ({ ...prev, autoIncrementCounter: parseInt(e.target.value, 10) || 0 }))}
                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-900"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Surat berikutnya akan menggunakan nomor urut {formData.autoIncrementCounter + 1}.
              </span>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                id="save-account-settings-btn"
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs transition-all cursor-pointer active:scale-95"
              >
                Simpan Perubahan Akun
              </button>
            </div>

            {/* Logout Session Card */}
            {onLogoutClick && (
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="p-3.5 rounded-xl bg-red-50/60 dark:bg-red-950/30 border border-red-200 dark:border-red-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="font-bold text-red-900 dark:text-red-300 text-xs flex items-center gap-1.5">
                      <LogOut className="w-3.5 h-3.5 text-red-600" />
                      <span>Sesi Pengguna Aktif</span>
                    </div>
                    <p className="text-[11px] text-red-700/80 dark:text-red-400/80 mt-0.5">
                      Keluar dari sistem dan hapus sesi login di perangkat ini.
                    </p>
                  </div>
                  <button
                    id="btn-pengaturan-logout"
                    type="button"
                    onClick={onLogoutClick}
                    className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs rounded-lg shadow-xs transition-all cursor-pointer shrink-0 active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Keluar & Hapus Sesi</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </form>
      )}

      {/* Tab 3: Log Aktivitas */}
      {activeTab === 'logs' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm flex items-center gap-2">
              <History className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Sheet: LOG_AKTIVITAS</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">100 aktivitas terakhir</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-2 px-3">Waktu</th>
                  <th className="py-2 px-3">Pengguna</th>
                  <th className="py-2 px-3">Aksi</th>
                  <th className="py-2 px-3">Rincian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-2 px-3 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                      {new Date(log.waktu).toLocaleString('id-ID')}
                    </td>
                    <td className="py-2 px-3 font-semibold text-slate-900 dark:text-slate-100">
                      {log.pengguna}
                    </td>
                    <td className="py-2 px-3">
                      <span className={`inline-flex px-1.5 py-0.2 rounded text-[10px] font-bold ${
                        log.tipe === 'create'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : log.tipe === 'delete'
                          ? 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                          : log.tipe === 'auth'
                          ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                      }`}>
                        {log.aksi}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-600 dark:text-slate-300 text-[11px]">
                      {log.rincian}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Backup & Reset Database */}
      {activeTab === 'database' && (
        <div className="space-y-3.5">
          {/* Cloud Synchronization Section */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-4 sm:p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Sinkronisasi Otomatis Antar-Perangkat (Cloud Real-Time Live)</span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 max-w-2xl">
                  Sinkronisasi berjalan 100% otomatis di latar belakang secara instan tanpa perlu menekan tombol apapun. Semua perubahan data (surat keluar/masuk, data guru, siswa, hingga profil sekolah) langsung terupdate di seluruh laptop, PC, dan smartphone yang membuka aplikasi ini.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  <span>Otomatis Aktif & Real-Time</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
                <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Mode Sinkron</div>
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-0.5 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Otomatis (Zero-Click)</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
                <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Cakupan Data</div>
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-0.5 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-blue-500" />
                  <span>Surat, Guru, Siswa, Sekolah</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
                <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Kecepatan Sync</div>
                <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Instan / Latar Belakang</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-4 sm:p-5 space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Cadangan, Master Spreadsheet & Pemulihan Database</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {/* Auto Master Spreadsheet */}
              <div className="p-3.5 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 space-y-1.5 flex flex-col justify-between">
                <div>
                  <div className="font-bold text-emerald-900 dark:text-emerald-300 text-xs flex items-center gap-1.5">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Master Sheet Otomatis</span>
                  </div>
                  <p className="text-[11px] text-emerald-800/80 dark:text-emerald-400/80 mt-1">
                    Buat file Spreadsheet (.xlsx / Google Sheets) lengkap dengan 7 sheet otomatis (Settings, Profil, Guru, Siswa, Format, Arsip, Log).
                  </p>
                </div>
                <button
                  id="btn-auto-master-sheet-db"
                  type="button"
                  onClick={handleDownloadMasterSheet}
                  disabled={isGeneratingSheet}
                  className="mt-2 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg cursor-pointer shadow-xs active:scale-95 disabled:opacity-60"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>{isGeneratingSheet ? 'Membuat...' : 'Buat Sheet Master (.xlsx)'}</span>
                </button>
              </div>

              {/* Backup */}
              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5 flex flex-col justify-between">
                <div>
                  <div className="font-bold text-slate-900 dark:text-slate-100 text-xs">Download Cadangan (JSON)</div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Simpan salinan data sekolah, guru, siswa, dan seluruh arsip surat ke file JSON di komputer Anda.
                  </p>
                </div>
                <button
                  id="btn-export-backup"
                  type="button"
                  onClick={handleExportBackup}
                  className="mt-2 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg cursor-pointer shadow-xs active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Backup JSON</span>
                </button>
              </div>

              {/* Reset to initial */}
              <div className="p-3.5 rounded-lg bg-red-50/70 dark:bg-red-950/30 border border-red-200 dark:border-red-900/60 space-y-1.5 flex flex-col justify-between">
                <div>
                  <div className="font-bold text-red-900 dark:text-red-300 text-xs flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                    <span>Inisialisasi Ulang (setupSURATKU)</span>
                  </div>
                  <p className="text-[11px] text-red-700/80 dark:text-red-400/80 mt-1">
                    Mereset database dan mengembalikan template awal sekolah, guru, dan siswa percontohan.
                  </p>
                </div>
                <button
                  id="btn-reset-database"
                  type="button"
                  onClick={handleResetDatabase}
                  className="mt-2 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg cursor-pointer shadow-xs active:scale-95"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Database Awal</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
