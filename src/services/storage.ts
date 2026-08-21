import { 
  DataSekolah, 
  DataGuru, 
  DataSiswa, 
  SuratRecord, 
  AppSettings, 
  LogAktivitas,
  JenisSurat 
} from '../types';
import { 
  INITIAL_SEKOLAH, 
  INITIAL_GURU, 
  INITIAL_SISWA, 
  INITIAL_SETTINGS, 
  INITIAL_SURAT, 
  INITIAL_LOGS 
} from '../data/initialData';
import { getKodeKlasifikasiDefault } from '../data/klasifikasiSurat';
import {
  syncSuratToCloud,
  deleteSuratFromCloud,
  syncGuruToCloud,
  deleteGuruFromCloud,
  syncSiswaToCloud,
  deleteSiswaFromCloud,
  syncSekolahToCloud,
  syncSettingsToCloud,
  syncLogToCloud,
  batchSyncGurusToCloud,
  batchSyncSiswasToCloud
} from './cloudSync';

const KEYS = {
  SETTINGS: 'SURATKU_SETTINGS',
  SEKOLAH: 'SURATKU_DATA_SEKOLAH',
  GURU: 'SURATKU_GURU',
  SISWA: 'SURATKU_SISWA',
  SURAT: 'SURATKU_SURAT',
  LOGS: 'SURATKU_LOG_AKTIVITAS',
  AUTH: 'SURATKU_SESSION',
};

const ROMAN_MONTHS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
const INDO_MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export function getRomanMonth(date: Date): string {
  return ROMAN_MONTHS[date.getMonth()] || 'VIII';
}

export function getIndonesianMonth(date: Date): string {
  return INDO_MONTHS[date.getMonth()] || 'Agustus';
}

export function formatIndonesianDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const day = date.getDate();
  const month = INDO_MONTHS[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

export function setupSURATKU(forceReset: boolean = false): void {
  const isBrandNew = !localStorage.getItem(KEYS.SETTINGS);
  if (forceReset || isBrandNew) {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
    localStorage.setItem(KEYS.SEKOLAH, JSON.stringify(INITIAL_SEKOLAH));
    localStorage.setItem(KEYS.GURU, JSON.stringify(INITIAL_GURU));
    localStorage.setItem(KEYS.SISWA, JSON.stringify(INITIAL_SISWA));
    localStorage.setItem(KEYS.SURAT, JSON.stringify(INITIAL_SURAT));
    localStorage.setItem(KEYS.LOGS, JSON.stringify(INITIAL_LOGS));
  }
}

// Ensure database is initialized on load
if (typeof window !== 'undefined') {
  setupSURATKU();
}

// SETTINGS & SEKOLAH
export function getSettings(): AppSettings {
  const data = localStorage.getItem(KEYS.SETTINGS);
  if (!data) return INITIAL_SETTINGS;
  const parsed = JSON.parse(data);
  return {
    ...INITIAL_SETTINGS,
    ...parsed,
    darkMode: typeof parsed.darkMode === 'boolean' ? parsed.darkMode : false,
  };
}

export function applyTheme(isDark: boolean): void {
  if (typeof document !== 'undefined') {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  applyTheme(!!settings.darkMode);
  addLog('Perbarui Pengaturan', 'Pengaturan aplikasi dan kredensial diperbarui', 'settings');
  syncSettingsToCloud(settings).catch(() => {});
}

export function getDataSekolah(): DataSekolah {
  const data = localStorage.getItem(KEYS.SEKOLAH);
  return data ? JSON.parse(data) : INITIAL_SEKOLAH;
}

export function saveDataSekolah(sekolah: DataSekolah): void {
  localStorage.setItem(KEYS.SEKOLAH, JSON.stringify(sekolah));
  addLog('Perbarui Data Sekolah', `Data profil sekolah ${sekolah.namaSekolah} diperbarui`, 'update');
  syncSekolahToCloud(sekolah).catch(() => {});
}

// DATA GURU
export function getDaftarGuru(): DataGuru[] {
  const data = localStorage.getItem(KEYS.GURU);
  return data ? JSON.parse(data) : INITIAL_GURU;
}

export function saveGuru(guru: DataGuru): void {
  const list = getDaftarGuru();
  const index = list.findIndex(g => g.id === guru.id);
  if (index >= 0) {
    list[index] = guru;
    addLog('Perbarui Guru', `Memperbarui data guru: ${guru.nama}`, 'update');
  } else {
    list.unshift(guru);
    addLog('Tambah Guru', `Menambahkan guru baru: ${guru.nama}`, 'create');
  }
  localStorage.setItem(KEYS.GURU, JSON.stringify(list));
  syncGuruToCloud(guru).catch(() => {});
}

export function deleteGuru(id: string): void {
  const list = getDaftarGuru();
  const target = list.find(g => g.id === id);
  const filtered = list.filter(g => g.id !== id);
  localStorage.setItem(KEYS.GURU, JSON.stringify(filtered));
  if (target) {
    addLog('Hapus Guru', `Menghapus data guru: ${target.nama}`, 'delete');
  }
  deleteGuruFromCloud(id).catch(() => {});
}

export function importGuruList(newGurus: DataGuru[], mode: 'merge' | 'replace' = 'merge'): number {
  if (newGurus.length === 0) return 0;
  let finalList: DataGuru[];
  if (mode === 'replace') {
    finalList = newGurus;
  } else {
    const existing = getDaftarGuru();
    const existingMap = new Map(existing.map(g => [g.nip && g.nip !== '-' ? g.nip : g.nama.toLowerCase(), g]));
    
    newGurus.forEach(newG => {
      const key = newG.nip && newG.nip !== '-' ? newG.nip : newG.nama.toLowerCase();
      if (existingMap.has(key)) {
        const oldG = existingMap.get(key)!;
        existingMap.set(key, { ...oldG, ...newG, id: oldG.id });
      } else {
        existingMap.set(key, newG);
      }
    });
    finalList = Array.from(existingMap.values());
  }
  localStorage.setItem(KEYS.GURU, JSON.stringify(finalList));
  addLog('Import Data Guru', `Berhasil mengimpor ${newGurus.length} data guru dari file Excel`, 'create');
  batchSyncGurusToCloud(finalList).catch(() => {});
  return newGurus.length;
}

// DATA SISWA
export function getDaftarSiswa(): DataSiswa[] {
  const data = localStorage.getItem(KEYS.SISWA);
  return data ? JSON.parse(data) : INITIAL_SISWA;
}

export function saveSiswa(siswa: DataSiswa): void {
  const list = getDaftarSiswa();
  const index = list.findIndex(s => s.id === siswa.id);
  if (index >= 0) {
    list[index] = siswa;
    addLog('Perbarui Siswa', `Memperbarui data siswa: ${siswa.nama}`, 'update');
  } else {
    list.unshift(siswa);
    addLog('Tambah Siswa', `Menambahkan siswa baru: ${siswa.nama}`, 'create');
  }
  localStorage.setItem(KEYS.SISWA, JSON.stringify(list));
  syncSiswaToCloud(siswa).catch(() => {});
}

export function deleteSiswa(id: string): void {
  const list = getDaftarSiswa();
  const target = list.find(s => s.id === id);
  const filtered = list.filter(s => s.id !== id);
  localStorage.setItem(KEYS.SISWA, JSON.stringify(filtered));
  if (target) {
    addLog('Hapus Siswa', `Menghapus data siswa: ${target.nama}`, 'delete');
  }
  deleteSiswaFromCloud(id).catch(() => {});
}

export function importSiswaList(newSiswas: DataSiswa[], mode: 'merge' | 'replace' = 'merge'): number {
  if (newSiswas.length === 0) return 0;
  let finalList: DataSiswa[];
  if (mode === 'replace') {
    finalList = newSiswas;
  } else {
    const existing = getDaftarSiswa();
    const existingMap = new Map(existing.map(s => [s.nis ? s.nis : s.nama.toLowerCase(), s]));
    
    newSiswas.forEach(newS => {
      const key = newS.nis ? newS.nis : newS.nama.toLowerCase();
      if (existingMap.has(key)) {
        const oldS = existingMap.get(key)!;
        existingMap.set(key, { ...oldS, ...newS, id: oldS.id });
      } else {
        existingMap.set(key, newS);
      }
    });
    finalList = Array.from(existingMap.values());
  }
  localStorage.setItem(KEYS.SISWA, JSON.stringify(finalList));
  addLog('Import Data Siswa', `Berhasil mengimpor ${newSiswas.length} data siswa dari file Excel`, 'create');
  batchSyncSiswasToCloud(finalList).catch(() => {});
  return newSiswas.length;
}

// ARSIP SURAT & PENOMORAN OTOMATIS
export function getDaftarSurat(): SuratRecord[] {
  const data = localStorage.getItem(KEYS.SURAT);
  return data ? JSON.parse(data) : INITIAL_SURAT;
}

export function generateNextNomorSurat(
  customDate?: string,
  jenisSurat?: JenisSurat,
  customKlasifikasi?: string
): {
  nomorUrut: number;
  nomorSurat: string;
  kodeKlasifikasi: string;
  bulanRomawi: string;
  bulan: string;
  tahun: number;
} {
  const settings = getSettings();
  const sekolah = getDataSekolah();
  const nextNumber = (settings.autoIncrementCounter || 0) + 1;
  
  const targetDate = customDate ? new Date(customDate) : new Date();
  const safeDate = isNaN(targetDate.getTime()) ? new Date() : targetDate;
  
  const bulanRomawi = getRomanMonth(safeDate);
  const bulan = getIndonesianMonth(safeDate);
  const tahun = safeDate.getFullYear();
  const kode = sekolah.kodeSekolah || 'SDC';
  
  // Determine standard Indonesian classification code (Permendikbud / Permendagri)
  const kodeKlasifikasi = customKlasifikasi || (jenisSurat ? getKodeKlasifikasiDefault(jenisSurat) : '421.2');
  
  // Digit formatting
  const digits = sekolah.digitNomorUrut || 1;
  const noFormatted = digits > 1 ? String(nextNumber).padStart(digits, '0') : nextNumber.toString();
  
  // Format standard: {KLASIFIKASI}/{NO}/{KODE}/{BULAN_ROMAWI}/{TAHUN} (e.g. 800/004/SDC/VIII/2026 or 421.2/4/SDC/VIII/2026)
  let pattern = sekolah.formatPenomoran || '{KLASIFIKASI}/{NO}/{KODE}/{BULAN_ROMAWI}/{TAHUN}';
  
  if (pattern.startsWith('421.2/') && !pattern.includes('{KLASIFIKASI}')) {
    pattern = pattern.replace('421.2/', '{KLASIFIKASI}/');
  }

  const nomorSurat = pattern
    .replace('{KLASIFIKASI}', kodeKlasifikasi)
    .replace('{NO}', noFormatted)
    .replace('{KODE}', kode)
    .replace('{BULAN_ROMAWI}', bulanRomawi)
    .replace('{TAHUN}', tahun.toString());

  return {
    nomorUrut: nextNumber,
    nomorSurat,
    kodeKlasifikasi,
    bulanRomawi,
    bulan,
    tahun,
  };
}

export function createSurat(
  formData: {
    jenisSurat: JenisSurat;
    tanggalSurat: string;
    namaPenerima: string;
    nisNip: string;
    kelasJabatan: string;
    alamatPenerima: string;
    namaOrangTua?: string;
    keperluan: string;
    tempat?: string;
    tanggalKegiatan?: string;
    keterangan?: string;
    hariTanggal?: string;
    waktu?: string;
    menghadapKepada?: string;
    nomorPengantar?: string;
    kodeKlasifikasi?: string;
    lampiran?: string;
    perihal?: string;
    nomorSurat?: string;
    // SPPD fields
    sertakanSppd?: boolean;
    nomorSppd?: string;
    tingkatBiaya?: string;
    alatAngkut?: string;
    tempatBerangkat?: string;
    tempatTujuan?: string;
    lamaHari?: string;
    tanggalBerangkat?: string;
    tanggalKembali?: string;
    instansiAnggaran?: string;
    mataAnggaran?: string;
    pengikut?: string;
    pangkatGolongan?: string;
    pejabatPemberiPerintah?: string;
    jabatanPejabatPemberiPerintah?: string;
  },
  operatorName: string = 'Operator Sekolah'
): SuratRecord {
  const nextInfo = generateNextNomorSurat(formData.tanggalSurat, formData.jenisSurat, formData.kodeKlasifikasi);
  const sekolah = getDataSekolah();
  const settings = getSettings();

  const customNomor = formData.nomorSurat?.trim();
  const finalNomorSurat = customNomor && customNomor.length > 0 ? customNomor : nextInfo.nomorSurat;

  const newRecord: SuratRecord = {
    id: `surat-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    nomorUrut: nextInfo.nomorUrut,
    nomorSurat: finalNomorSurat,
    kodeKlasifikasi: nextInfo.kodeKlasifikasi,
    jenisSurat: formData.jenisSurat,
    tanggalSurat: formData.tanggalSurat || new Date().toISOString().split('T')[0],
    namaPenerima: formData.namaPenerima || '',
    nisNip: formData.nisNip || '-',
    kelasJabatan: formData.kelasJabatan || '',
    alamatPenerima: formData.alamatPenerima || '',
    namaOrangTua: formData.namaOrangTua || '',
    keperluan: formData.keperluan || '',
    tempat: formData.tempat || '',
    tanggalKegiatan: formData.tanggalKegiatan || '',
    keterangan: formData.keterangan || '',
    hariTanggal: formData.hariTanggal || '',
    waktu: formData.waktu || '',
    menghadapKepada: formData.menghadapKepada || '',
    nomorPengantar: formData.nomorPengantar || '',
    lampiran: formData.lampiran || '',
    perihal: formData.perihal || '',
    // SPPD data
    sertakanSppd: formData.sertakanSppd ?? (formData.jenisSurat === 'Surat Perintah Perjalanan Dinas (SPPD)'),
    nomorSppd: formData.nomorSppd || nextInfo.nomorSurat,
    tingkatBiaya: formData.tingkatBiaya || 'Tingkat C',
    alatAngkut: formData.alatAngkut || 'Kendaraan Umum / Angkutan Darat',
    tempatBerangkat: formData.tempatBerangkat || sekolah.namaSekolah,
    tempatTujuan: formData.tempatTujuan || formData.tempat || 'Dinas Pendidikan',
    lamaHari: formData.lamaHari || '1 (Satu) Hari',
    tanggalBerangkat: formData.tanggalBerangkat || formData.tanggalSurat || new Date().toISOString().split('T')[0],
    tanggalKembali: formData.tanggalKembali || formData.tanggalSurat || new Date().toISOString().split('T')[0],
    instansiAnggaran: formData.instansiAnggaran || `Dana BOS ${sekolah.namaSekolah}`,
    mataAnggaran: formData.mataAnggaran || '5.1.02.04.01.0001 (Belanja Perjalanan Dinas Biasa)',
    pengikut: formData.pengikut || '-',
    pangkatGolongan: formData.pangkatGolongan || 'Penata Muda / III a',
    pejabatPemberiPerintah: formData.pejabatPemberiPerintah || sekolah.namaKepalaSekolah,
    jabatanPejabatPemberiPerintah: formData.jabatanPejabatPemberiPerintah || `Kepala ${sekolah.namaSekolah}`,
    dataSekolahSnapshot: sekolah,
    status: 'Tercatat',
    dibuatOleh: operatorName,
    waktuDibuat: new Date().toISOString(),
    tahun: nextInfo.tahun,
    bulan: nextInfo.bulan,
    bulanRomawi: nextInfo.bulanRomawi,
    driveFolder: `${settings.googleDriveFolderName}/${nextInfo.tahun}/${nextInfo.bulan}/${formData.jenisSurat}`,
  };

  // 1. Save record
  const currentList = getDaftarSurat();
  currentList.unshift(newRecord);
  localStorage.setItem(KEYS.SURAT, JSON.stringify(currentList));

  // 2. Increment counter safely
  settings.autoIncrementCounter = nextInfo.nomorUrut;
  localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));

  // 3. Log activity
  addLog(
    'Buat Surat Baru',
    `Membuat ${newRecord.jenisSurat} No: ${newRecord.nomorSurat} (${nextInfo.kodeKlasifikasi}) untuk ${newRecord.namaPenerima}`,
    'create'
  );

  // 4. Push to Cloud in background
  syncSuratToCloud(newRecord).catch(() => {});
  syncSettingsToCloud(settings).catch(() => {});

  return newRecord;
}

export function updateSuratStatus(id: string, status: SuratRecord['status']): void {
  const list = getDaftarSurat();
  const item = list.find(s => s.id === id);
  if (item) {
    item.status = status;
    localStorage.setItem(KEYS.SURAT, JSON.stringify(list));
    addLog('Perbarui Status Surat', `Surat ${item.nomorSurat} diubah status menjadi ${status}`, 'update');
    syncSuratToCloud(item).catch(() => {});
  }
}

export function deleteSurat(id: string): void {
  const list = getDaftarSurat();
  const target = list.find(s => s.id === id);
  const filtered = list.filter(s => s.id !== id);
  localStorage.setItem(KEYS.SURAT, JSON.stringify(filtered));
  if (target) {
    addLog('Hapus Arsip Surat', `Menghapus surat ${target.nomorSurat}`, 'delete');
  }
  deleteSuratFromCloud(id).catch(() => {});
}

// LOGS
export function getLogs(): LogAktivitas[] {
  const data = localStorage.getItem(KEYS.LOGS);
  return data ? JSON.parse(data) : INITIAL_LOGS;
}

export function addLog(aksi: string, rincian: string, tipe: LogAktivitas['tipe']): void {
  const logs = getLogs();
  const session = getSession();
  const newLog: LogAktivitas = {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    waktu: new Date().toISOString(),
    aksi,
    rincian,
    pengguna: session ? session.username : 'admin',
    tipe,
  };
  logs.unshift(newLog);
  // Keep last 100 logs
  if (logs.length > 100) logs.pop();
  localStorage.setItem(KEYS.LOGS, JSON.stringify(logs));
  syncLogToCloud(newLog).catch(() => {});
}

// AUTH
export interface UserSession {
  username: string;
  nama: string;
  loggedInAt: string;
}

export function getSession(): UserSession | null {
  const data = localStorage.getItem(KEYS.AUTH);
  return data ? JSON.parse(data) : null;
}

export function loginUser(username: string, passwordPlain: string): { success: boolean; message?: string } {
  const settings = getSettings();
  if (username.trim().toLowerCase() === settings.adminUsername.toLowerCase() && passwordPlain === settings.adminPasswordHash) {
    const session: UserSession = {
      username: settings.adminUsername,
      nama: settings.adminNama || 'Operator Sekolah',
      loggedInAt: new Date().toISOString(),
    };
    localStorage.setItem(KEYS.AUTH, JSON.stringify(session));
    addLog('Login Berhasil', `Operator ${session.nama} berhasil masuk ke aplikasi`, 'auth');
    return { success: true };
  }
  return { success: false, message: 'Username atau Password salah. Gunakan admin / admin123' };
}

export function logoutUser(): void {
  const session = getSession();
  if (session) {
    addLog('Keluar Sistem', `Operator ${session.nama} (${session.username}) mengakhiri sesi dan keluar dari aplikasi`, 'auth');
  }
  localStorage.removeItem(KEYS.AUTH);
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.clear();
  }
}
