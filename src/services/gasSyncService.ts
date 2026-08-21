import { 
  SuratRecord, 
  DataSekolah, 
  DataGuru, 
  DataSiswa, 
  AppSettings 
} from '../types';
import { 
  getSettings, 
  getDataSekolah, 
  getDaftarGuru, 
  getDaftarSiswa, 
  getDaftarSurat, 
  addLog 
} from './storage';

export interface GasResponse {
  status: 'success' | 'error' | 'online';
  message?: string;
  spreadsheetId?: string;
  spreadsheetUrl?: string;
  docsUrl?: string;
  pdfUrl?: string;
  nomorSurat?: string;
  nomorUrut?: number;
  count?: number;
  data?: any;
}

/**
 * Validates if the input URL is a valid Google Apps Script Web App Exec URL
 */
export function validateGasUrl(url: string): { isValid: boolean; isSheetUrl: boolean; message: string } {
  if (!url || url.trim() === '') {
    return { isValid: false, isSheetUrl: false, message: 'URL belum diisi' };
  }

  const cleanUrl = url.trim();

  // Check if user accidentally pasted Google Sheets URL
  if (cleanUrl.includes('docs.google.com/spreadsheets/d/')) {
    return {
      isValid: false,
      isSheetUrl: true,
      message: 'Anda memasukkan link Google Sheets langsung. Harap gunakan URL Web App Google Apps Script (berakhiran /exec).'
    };
  }

  // Check if it's a valid script URL
  if (cleanUrl.includes('script.google.com/macros/s/') && (cleanUrl.includes('/exec') || cleanUrl.includes('/dev'))) {
    return {
      isValid: true,
      isSheetUrl: false,
      message: 'Format URL Web App Google Apps Script valid!'
    };
  }

  return {
    isValid: false,
    isSheetUrl: false,
    message: 'Format URL tidak dikenali. URL harus berupa https://script.google.com/macros/s/.../exec'
  };
}

/**
 * Sends a generic request to Google Apps Script Web App
 * Uses text/plain to prevent CORS preflight blocking in browsers
 */
async function sendToGas(action: string, payload: any): Promise<GasResponse> {
  const settings = getSettings();
  const gasUrl = settings.gasWebAppUrl?.trim();

  if (!gasUrl) {
    return {
      status: 'error',
      message: 'URL Google Apps Script Web App belum dikonfigurasi di Pengaturan.'
    };
  }

  const validation = validateGasUrl(gasUrl);
  if (!validation.isValid) {
    return {
      status: 'error',
      message: validation.message
    };
  }

  try {
    const bodyData = JSON.stringify({
      action,
      payload,
      timestamp: new Date().toISOString(),
    });

    // We use standard fetch with POST. 
    // Sending as text/plain avoids OPTIONS preflight check which Google Apps Script doesn't handle natively.
    const response = await fetch(gasUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: bodyData,
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    const json = await response.json();
    return json;
  } catch (error: any) {
    console.warn('Google Apps Script request error:', error);
    return {
      status: 'error',
      message: `Gagal terhubung ke Google Apps Script: ${error.message || error.toString()}. Pastikan Deployment Web App diatur dengan akses 'Anyone' (Siapa saja).`
    };
  }
}

/**
 * Test Connection & Ping Google Apps Script Backend
 */
export async function testGasConnection(customUrl?: string): Promise<GasResponse> {
  const urlToTest = customUrl || getSettings().gasWebAppUrl;
  if (!urlToTest) {
    return {
      status: 'error',
      message: 'URL Google Apps Script belum diisi.'
    };
  }

  const validation = validateGasUrl(urlToTest);
  if (!validation.isValid) {
    return {
      status: 'error',
      message: validation.message
    };
  }

  try {
    const response = await fetch(urlToTest, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      status: 'success',
      message: 'Koneksi ke Google Apps Script Web App Berhasil & Online!',
      data
    };
  } catch (err: any) {
    // If GET fails due to CORS or redirect, try POST PING
    try {
      const postRes = await fetch(urlToTest, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'PING' }),
      });
      const data = await postRes.json();
      return {
        status: 'success',
        message: 'Koneksi ke Google Apps Script Berhasil (via POST)!',
        data
      };
    } catch (e2: any) {
      return {
        status: 'error',
        message: `Koneksi gagal: ${err.message || err.toString()}. Pastikan Web App di-deploy dengan akses 'Anyone' (Siapa saja).`
      };
    }
  }
}

/**
 * Automatically sends newly created letter to Google Sheets & Google Drive
 */
export async function syncSuratToGas(surat: SuratRecord): Promise<GasResponse> {
  const settings = getSettings();
  if (!settings.gasWebAppUrl) {
    return { status: 'error', message: 'URL Apps Script belum diatur.' };
  }

  const res = await sendToGas('BUAT_SURAT', {
    ...surat,
    namaSekolah: surat.dataSekolahSnapshot.namaSekolah,
    kodeSekolah: surat.dataSekolahSnapshot.kodeSekolah,
    namaKepala: surat.dataSekolahSnapshot.namaKepalaSekolah,
    nipKepala: surat.dataSekolahSnapshot.nipKepalaSekolah,
    alamatSekolah: surat.dataSekolahSnapshot.alamat,
    kabupaten: surat.dataSekolahSnapshot.kabupaten,
    provinsi: surat.dataSekolahSnapshot.provinsi,
    telepon: surat.dataSekolahSnapshot.telepon,
  });

  if (res.status === 'success') {
    addLog(
      'Sinkronisasi Google Sheets',
      `Surat ${surat.nomorSurat} berhasil dicatat ke Google Sheets & Google Drive`,
      'sync'
    );
  }

  return res;
}

/**
 * Sync entire local database to Google Sheets in one click
 */
export async function syncAllDatabaseToGas(): Promise<GasResponse> {
  const payload = {
    sekolah: getDataSekolah(),
    guru: getDaftarGuru(),
    siswa: getDaftarSiswa(),
    surat: getDaftarSurat(),
    settings: getSettings(),
  };

  const res = await sendToGas('SYNC_ALL', payload);
  if (res.status === 'success') {
    addLog(
      'Sinkronisasi Master Database',
      `Berhasil mengekspor ${payload.surat.length} surat, ${payload.guru.length} guru, dan ${payload.siswa.length} siswa ke Google Sheets`,
      'sync'
    );
  }
  return res;
}

/**
 * Trigger Auto Setup in Google Apps Script
 */
export async function triggerGasSetup(): Promise<GasResponse> {
  const res = await sendToGas('SETUP', {});
  if (res.status === 'success') {
    addLog('Setup Google Apps Script', 'Inisialisasi sheet & folder database Google Sheets berhasil dijalankan', 'sync');
  }
  return res;
}
