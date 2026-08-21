import * as XLSX from 'xlsx';
import { DataGuru, DataSiswa, DataSekolah, SuratRecord, AppSettings, LogAktivitas } from '../types';
import { 
  getDataSekolah, 
  getDaftarGuru, 
  getDaftarSiswa, 
  getDaftarSurat, 
  getSettings, 
  getLogs 
} from './storage';

/**
 * Generate and download Official Complete Master Database (.xlsx / Google Sheets format)
 * Contains all 7 synchronized sheets ready for Google Sheets & Excel
 */
export function downloadMasterDatabaseSpreadsheet(options?: {
  sekolah?: DataSekolah;
  gurus?: DataGuru[];
  siswas?: DataSiswa[];
  surats?: SuratRecord[];
  settings?: AppSettings;
  logs?: LogAktivitas[];
}): void {
  const sekolah = options?.sekolah || getDataSekolah();
  const gurus = options?.gurus || getDaftarGuru();
  const siswas = options?.siswas || getDaftarSiswa();
  const surats = options?.surats || getDaftarSurat();
  const settings = options?.settings || getSettings();
  const logs = options?.logs || getLogs();

  const workbook = XLSX.utils.book_new();

  // 1. Sheet: SETTINGS
  const settingsData = [
    { 'KUNCI': 'ADMIN_USER', 'NILAI': settings.adminUsername || 'admin', 'KETERANGAN': 'Username Login Operator' },
    { 'KUNCI': 'ADMIN_NAMA', 'NILAI': settings.adminNama || 'Operator Sekolah', 'KETERANGAN': 'Nama Panggilan Operator' },
    { 'KUNCI': 'DARK_MODE', 'NILAI': settings.darkMode ? 'TRUE' : 'FALSE', 'KETERANGAN': 'Preferensi Tema Tampilan' },
    { 'KUNCI': 'NOMOR_TERAKHIR', 'NILAI': settings.autoIncrementCounter ?? surats.length, 'KETERANGAN': 'Counter Nomor Surat Otomatis' },
    { 'KUNCI': 'GAS_WEB_APP_URL', 'NILAI': settings.gasWebAppUrl || '', 'KETERANGAN': 'URL Google Apps Script Terpasang' },
    { 'KUNCI': 'VERSI_SISTEM', 'NILAI': 'SURATKU v2.5', 'KETERANGAN': 'Versi Aplikasi Persuratan' },
  ];
  const wsSettings = XLSX.utils.json_to_sheet(settingsData);
  wsSettings['!cols'] = [{ wch: 20 }, { wch: 45 }, { wch: 35 }];
  XLSX.utils.book_append_sheet(workbook, wsSettings, 'SETTINGS');

  // 2. Sheet: DATA_SEKOLAH
  const sekolahData = [
    { 'KUNCI_PROFIL': 'NAMA_SEKOLAH', 'DATA': sekolah.namaSekolah, 'KETERANGAN': 'Nama Resmi Sekolah' },
    { 'KUNCI_PROFIL': 'INSTANSI_ATASAN_1', 'DATA': sekolah.instansiAtasan1, 'KETERANGAN': 'KOP Baris 1 (Pemda / Provinsi)' },
    { 'KUNCI_PROFIL': 'INSTANSI_ATASAN_2', 'DATA': sekolah.instansiAtasan2, 'KETERANGAN': 'KOP Baris 2 (Dinas Pendidikan)' },
    { 'KUNCI_PROFIL': 'NPSN', 'DATA': sekolah.npsn, 'KETERANGAN': 'Nomor Pokok Sekolah Nasional' },
    { 'KUNCI_PROFIL': 'NSS', 'DATA': sekolah.nss, 'KETERANGAN': 'Nomor Statistik Sekolah' },
    { 'KUNCI_PROFIL': 'ALAMAT', 'DATA': sekolah.alamat, 'KETERANGAN': 'Jalan & Nomor Bangunan' },
    { 'KUNCI_PROFIL': 'DESA_KELURAHAN', 'DATA': sekolah.desa, 'KETERANGAN': 'Desa / Kelurahan' },
    { 'KUNCI_PROFIL': 'KECAMATAN', 'DATA': sekolah.kecamatan, 'KETERANGAN': 'Kecamatan' },
    { 'KUNCI_PROFIL': 'KABUPATEN_KOTA', 'DATA': sekolah.kabupaten, 'KETERANGAN': 'Kabupaten / Kota' },
    { 'KUNCI_PROFIL': 'PROVINSI', 'DATA': sekolah.provinsi, 'KETERANGAN': 'Provinsi' },
    { 'KUNCI_PROFIL': 'KODE_POS', 'DATA': sekolah.kodePos, 'KETERANGAN': 'Kode Pos' },
    { 'KUNCI_PROFIL': 'TELEPON', 'DATA': sekolah.telepon, 'KETERANGAN': 'Nomor Kontak / Telepon Sekolah' },
    { 'KUNCI_PROFIL': 'EMAIL', 'DATA': sekolah.email, 'KETERANGAN': 'Email Resmi Sekolah' },
    { 'KUNCI_PROFIL': 'WEBSITE', 'DATA': sekolah.website, 'KETERANGAN': 'Website Resmi Sekolah' },
    { 'KUNCI_PROFIL': 'KEPALA_SEKOLAH', 'DATA': sekolah.namaKepalaSekolah, 'KETERANGAN': 'Nama Lengkap & Gelar Kepala Sekolah' },
    { 'KUNCI_PROFIL': 'NIP_KEPALA_SEKOLAH', 'DATA': sekolah.nipKepalaSekolah, 'KETERANGAN': 'NIP Kepala Sekolah' },
    { 'KUNCI_PROFIL': 'PANGKAT_KEPALA_SEKOLAH', 'DATA': sekolah.pangkatKepalaSekolah || '-', 'KETERANGAN': 'Pangkat / Golongan Kepala Sekolah' },
    { 'KUNCI_PROFIL': 'KODE_SEKOLAH', 'DATA': sekolah.kodeSekolah, 'KETERANGAN': 'Singkatan Surat (misal: SDC / SMPN1)' },
    { 'KUNCI_PROFIL': 'FORMAT_PENOMORAN', 'DATA': sekolah.formatPenomoran, 'KETERANGAN': 'Formula Penomoran Otomatis' },
  ];
  const wsSekolah = XLSX.utils.json_to_sheet(sekolahData);
  wsSekolah['!cols'] = [{ wch: 25 }, { wch: 45 }, { wch: 35 }];
  XLSX.utils.book_append_sheet(workbook, wsSekolah, 'DATA_SEKOLAH');

  // 3. Sheet: GURU
  const guruRows = gurus.map((g, idx) => ({
    'No': idx + 1,
    'Nama Lengkap & Gelar *': g.nama,
    'NIP': g.nip || '-',
    'NUPTK': g.nuptk || '-',
    'Jabatan / Tugas *': g.jabatan,
    'Pangkat / Golongan': g.pangkatGolongan || '-',
    'No Telepon / WA': g.telepon || '-',
    'Status Aktif (Ya/Tidak)': g.statusAktif ? 'Ya' : 'Tidak',
  }));
  const wsGuru = XLSX.utils.json_to_sheet(guruRows.length > 0 ? guruRows : [{ 'No': 1, 'Nama Lengkap & Gelar *': 'Budi Santoso, S.Pd.', 'NIP': '19820415 200801 1 012', 'NUPTK': '3456789012345678', 'Jabatan / Tugas *': 'Guru Kelas VI', 'Pangkat / Golongan': 'Penata / III c', 'No Telepon / WA': '081234567890', 'Status Aktif (Ya/Tidak)': 'Ya' }]);
  wsGuru['!cols'] = [{ wch: 6 }, { wch: 32 }, { wch: 24 }, { wch: 20 }, { wch: 30 }, { wch: 25 }, { wch: 18 }, { wch: 22 }];
  XLSX.utils.book_append_sheet(workbook, wsGuru, 'GURU');

  // 4. Sheet: SISWA
  const siswaRows = siswas.map((s, idx) => ({
    'No': idx + 1,
    'Nama Lengkap Siswa *': s.nama,
    'NIS *': s.nis,
    'NISN': s.nisn || '-',
    'Kelas *': s.kelas,
    'Tempat Lahir': s.tempatLahir || '-',
    'Tanggal Lahir (YYYY-MM-DD)': s.tanggalLahir || '-',
    'Nama Orang Tua / Wali': s.namaOrangTua || '-',
    'Alamat Lengkap': s.alamat || '-',
    'Status Aktif (Ya/Tidak)': s.statusAktif ? 'Ya' : 'Tidak',
  }));
  const wsSiswa = XLSX.utils.json_to_sheet(siswaRows.length > 0 ? siswaRows : [{ 'No': 1, 'Nama Lengkap Siswa *': 'Muhammad Rizky Pratama', 'NIS *': '20230101', 'NISN': '0112345678', 'Kelas *': 'Kelas VI-A', 'Tempat Lahir': 'Jakarta', 'Tanggal Lahir (YYYY-MM-DD)': '2012-05-14', 'Nama Orang Tua / Wali': 'Bambang Pratama', 'Alamat Lengkap': 'Jl. Percetakan Negara No. 12', 'Status Aktif (Ya/Tidak)': 'Ya' }]);
  wsSiswa['!cols'] = [{ wch: 6 }, { wch: 32 }, { wch: 14 }, { wch: 16 }, { wch: 14 }, { wch: 18 }, { wch: 26 }, { wch: 25 }, { wch: 45 }, { wch: 22 }];
  XLSX.utils.book_append_sheet(workbook, wsSiswa, 'SISWA');

  // 5. Sheet: JENIS_SURAT
  const jenisSuratData = [
    { 'NO': 1, 'KODE': '800 / ST', 'JENIS_SURAT': 'Surat Tugas', 'FORMAT_STANDAR': '{KLASIFIKASI}/{NO}/{KODE}/{BULAN_ROMAWI}/{TAHUN}', 'KETERANGAN': 'Surat Tugas dinas resmi guru & tenaga kependidikan' },
    { 'NO': 2, 'KODE': '090 / SPPD', 'JENIS_SURAT': 'Surat Perintah Perjalanan Dinas (SPPD)', 'FORMAT_STANDAR': '{KLASIFIKASI}/{NO}/{KODE}/{BULAN_ROMAWI}/{TAHUN}', 'KETERANGAN': 'Perjalanan dinas beserta lembar visum otomatis' },
    { 'NO': 3, 'KODE': '005 / UND', 'JENIS_SURAT': 'Surat Undangan', 'FORMAT_STANDAR': '{KLASIFIKASI}/{NO}/{KODE}/{BULAN_ROMAWI}/{TAHUN}', 'KETERANGAN': 'Undangan rapat dinas & pertemuan orang tua / wali' },
    { 'NO': 4, 'KODE': '421.2 / SKA', 'JENIS_SURAT': 'Surat Keterangan Aktif Sekolah', 'FORMAT_STANDAR': '{KLASIFIKASI}/{NO}/{KODE}/{BULAN_ROMAWI}/{TAHUN}', 'KETERANGAN': 'Keterangan keaktifan siswa (PIP, beasiswa, lomba)' },
    { 'NO': 5, 'KODE': '421.3 / SPO', 'JENIS_SURAT': 'Surat Panggilan Orang Tua', 'FORMAT_STANDAR': '{KLASIFIKASI}/{NO}/{KODE}/{BULAN_ROMAWI}/{TAHUN}', 'KETERANGAN': 'Panggilan wali murid untuk konseling dan koordinasi' },
    { 'NO': 6, 'KODE': '420 / SP', 'JENIS_SURAT': 'Surat Pengantar', 'FORMAT_STANDAR': '{KLASIFIKASI}/{NO}/{KODE}/{BULAN_ROMAWI}/{TAHUN}', 'KETERANGAN': 'Pengantar berkas / laporan resmi antar instansi' },
  ];
  const wsJenis = XLSX.utils.json_to_sheet(jenisSuratData);
  wsJenis['!cols'] = [{ wch: 6 }, { wch: 14 }, { wch: 40 }, { wch: 45 }, { wch: 55 }];
  XLSX.utils.book_append_sheet(workbook, wsJenis, 'JENIS_SURAT');

  // 6. Sheet: SURAT (Arsip Surat)
  const suratRows = surats.map((st, idx) => ({
    'No': idx + 1,
    'Nomor Urut': st.nomorUrut,
    'Nomor Surat': st.nomorSurat,
    'Kode Klasifikasi': st.kodeKlasifikasi || '-',
    'Jenis Surat': st.jenisSurat,
    'Tanggal Surat': st.tanggalSurat,
    'Nama Penerima': st.namaPenerima,
    'NIS / NIP': st.nisNip,
    'Kelas / Jabatan': st.kelasJabatan,
    'Keperluan / Hal': st.keperluan,
    'Tempat Kegiatan': st.tempat || '-',
    'Tanggal Pelaksanaan': st.tanggalKegiatan || '-',
  }));
  const wsSurat = XLSX.utils.json_to_sheet(suratRows.length > 0 ? suratRows : [{ 'No': 1, 'Nomor Urut': 1, 'Nomor Surat': '800/001/SDC/VIII/2026', 'Kode Klasifikasi': '800', 'Jenis Surat': 'Surat Tugas', 'Tanggal Surat': '2026-08-15', 'Nama Penerima': 'Budi Santoso, S.Pd.', 'NIS / NIP': '19820415 200801 1 012', 'Kelas / Jabatan': 'Guru Kelas VI', 'Keperluan / Hal': 'Mengikuti Pelatihan Kurikulum', 'Tempat Kegiatan': 'Aula Dinas Pendidikan', 'Tanggal Pelaksanaan': '2026-08-20' }]);
  wsSurat['!cols'] = [{ wch: 6 }, { wch: 12 }, { wch: 28 }, { wch: 16 }, { wch: 32 }, { wch: 15 }, { wch: 30 }, { wch: 24 }, { wch: 24 }, { wch: 40 }, { wch: 30 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(workbook, wsSurat, 'SURAT');

  // 7. Sheet: LOG_AKTIVITAS
  const logRows = logs.map((l, idx) => ({
    'No': idx + 1,
    'Waktu': new Date(l.waktu).toLocaleString('id-ID'),
    'Pengguna': l.pengguna,
    'Tipe': l.tipe,
    'Aksi': l.aksi,
    'Rincian Aktivitas': l.rincian,
  }));
  const wsLogs = XLSX.utils.json_to_sheet(logRows.length > 0 ? logRows : [{ 'No': 1, 'Waktu': new Date().toLocaleString('id-ID'), 'Pengguna': 'Admin', 'Tipe': 'init', 'Aksi': 'Setup Otomatis', 'Rincian Aktivitas': 'Database diinisialisasi otomatis' }]);
  wsLogs['!cols'] = [{ wch: 6 }, { wch: 22 }, { wch: 18 }, { wch: 12 }, { wch: 26 }, { wch: 50 }];
  XLSX.utils.book_append_sheet(workbook, wsLogs, 'LOG_AKTIVITAS');

  // Generate and trigger download
  const cleanSchoolName = (sekolah.namaSekolah || 'Sekolah').replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `SURATKU_Database_Master_${cleanSchoolName}_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, filename);
}

/**
 * Open Google Sheets in a new tab helper
 */
export function openGoogleSheetsNew(): void {
  window.open('https://sheets.new', '_blank');
}

/**
 * Generate and download Official Excel Template for Teachers / Staff (.xlsx)
 */
export function downloadGuruTemplateExcel(): void {
  const sampleData = [
    {
      'No': 1,
      'Nama Lengkap & Gelar *': 'Budi Santoso, S.Pd.',
      'NIP': '19820415 200801 1 012',
      'NUPTK': '3456789012345678',
      'Jabatan / Tugas *': 'Guru Kelas VI / Wali Kelas',
      'Pangkat / Golongan': 'Penata / III c',
      'No Telepon / WA': '081234567890',
      'Status Aktif (Ya/Tidak)': 'Ya',
    },
    {
      'No': 2,
      'Nama Lengkap & Gelar *': 'Siti Rahmawati, M.Pd.',
      'NIP': '19870923 201101 2 008',
      'NUPTK': '4567890123456789',
      'Jabatan / Tugas *': 'Guru Pendidikan Agama Islam',
      'Pangkat / Golongan': 'Penata Muda Tk. I / III b',
      'No Telepon / WA': '081298765432',
      'Status Aktif (Ya/Tidak)': 'Ya',
    },
    {
      'No': 3,
      'Nama Lengkap & Gelar *': 'Hendra Wijaya, S.Pd.Jas.',
      'NIP': '19900311 201502 1 004',
      'NUPTK': '5678901234567890',
      'Jabatan / Tugas *': 'Guru PJOK & Pembina Pramuka',
      'Pangkat / Golongan': 'Penata Muda / III a',
      'No Telepon / WA': '081345678901',
      'Status Aktif (Ya/Tidak)': 'Ya',
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  
  // Set column widths for comfortable editing
  worksheet['!cols'] = [
    { wch: 6 },  // No
    { wch: 32 }, // Nama
    { wch: 24 }, // NIP
    { wch: 20 }, // NUPTK
    { wch: 30 }, // Jabatan
    { wch: 25 }, // Pangkat Golongan
    { wch: 18 }, // Telepon
    { wch: 22 }, // Status
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'DATA_GURU');
  XLSX.writeFile(workbook, 'Template_Data_Guru_Format_Resmi.xlsx');
}

export const downloadGuruTemplate = downloadGuruTemplateExcel;

/**
 * Generate and download Official Excel Template for Students (.xlsx)
 */
export function downloadSiswaTemplateExcel(): void {
  const sampleData = [
    {
      'No': 1,
      'Nama Lengkap Siswa *': 'Muhammad Rizky Pratama',
      'NIS *': '20230101',
      'NISN': '0112345678',
      'Kelas *': 'Kelas VI-A',
      'Tempat Lahir': 'Jakarta',
      'Tanggal Lahir (YYYY-MM-DD)': '2012-05-14',
      'Nama Orang Tua / Wali': 'Bambang Pratama',
      'Alamat Lengkap': 'Jl. Percetakan Negara No. 12, Jakarta Pusat',
      'Status Aktif (Ya/Tidak)': 'Ya',
    },
    {
      'No': 2,
      'Nama Lengkap Siswa *': 'Anindya Putri Kirana',
      'NIS *': '20230102',
      'NISN': '0119876543',
      'Kelas *': 'Kelas VI-A',
      'Tempat Lahir': 'Bandung',
      'Tanggal Lahir (YYYY-MM-DD)': '2012-08-22',
      'Nama Orang Tua / Wali': 'Irwan Setiawan',
      'Alamat Lengkap': 'Jl. Cempaka Putih Barat No. 88, Jakarta Pusat',
      'Status Aktif (Ya/Tidak)': 'Ya',
    },
    {
      'No': 3,
      'Nama Lengkap Siswa *': 'Farhan Dwi Cahyo',
      'NIS *': '20240215',
      'NISN': '0123456789',
      'Kelas *': 'Kelas V-B',
      'Tempat Lahir': 'Semarang',
      'Tanggal Lahir (YYYY-MM-DD)': '2013-02-10',
      'Nama Orang Tua / Wali': 'Joko Susanto',
      'Alamat Lengkap': 'Jl. Rawasari Selatan No. 5, Jakarta Pusat',
      'Status Aktif (Ya/Tidak)': 'Ya',
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  
  worksheet['!cols'] = [
    { wch: 6 },  // No
    { wch: 32 }, // Nama
    { wch: 14 }, // NIS
    { wch: 16 }, // NISN
    { wch: 14 }, // Kelas
    { wch: 18 }, // Tempat Lahir
    { wch: 26 }, // Tanggal Lahir
    { wch: 25 }, // Orang Tua
    { wch: 45 }, // Alamat
    { wch: 22 }, // Status
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'DATA_SISWA');
  XLSX.writeFile(workbook, 'Template_Data_Siswa_Format_Resmi.xlsx');
}

export const downloadSiswaTemplate = downloadSiswaTemplateExcel;

/**
 * Export current Guru list to Excel
 */
export function exportGuruToExcel(guruList: DataGuru[]): void {
  const data = guruList.map((g, idx) => ({
    'No': idx + 1,
    'Nama Lengkap & Gelar *': g.nama,
    'NIP': g.nip || '-',
    'NUPTK': g.nuptk || '-',
    'Jabatan / Tugas *': g.jabatan,
    'Pangkat / Golongan': g.pangkatGolongan || '-',
    'No Telepon / WA': g.telepon || '-',
    'Status Aktif (Ya/Tidak)': g.statusAktif ? 'Ya' : 'Tidak',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 32 },
    { wch: 24 },
    { wch: 20 },
    { wch: 30 },
    { wch: 25 },
    { wch: 18 },
    { wch: 22 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'DATA_GURU');
  XLSX.writeFile(workbook, `Data_Guru_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
}

/**
 * Export current Siswa list to Excel
 */
export function exportSiswaToExcel(siswaList: DataSiswa[]): void {
  const data = siswaList.map((s, idx) => ({
    'No': idx + 1,
    'Nama Lengkap Siswa *': s.nama,
    'NIS *': s.nis,
    'NISN': s.nisn || '-',
    'Kelas *': s.kelas,
    'Tempat Lahir': s.tempatLahir || '-',
    'Tanggal Lahir (YYYY-MM-DD)': s.tanggalLahir || '-',
    'Nama Orang Tua / Wali': s.namaOrangTua || '-',
    'Alamat Lengkap': s.alamat || '-',
    'Status Aktif (Ya/Tidak)': s.statusAktif ? 'Ya' : 'Tidak',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 32 },
    { wch: 14 },
    { wch: 16 },
    { wch: 14 },
    { wch: 18 },
    { wch: 26 },
    { wch: 25 },
    { wch: 45 },
    { wch: 22 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'DATA_SISWA');
  XLSX.writeFile(workbook, `Data_Siswa_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
}

/**
 * Parse uploaded Excel file for Guru & Staf
 */
export async function parseGuruExcelFile(file: File): Promise<{ success: boolean; data: DataGuru[]; message: string }> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const buffer = e.target?.result;
        const workbook = XLSX.read(buffer, { type: 'array' });
        
        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) {
          return resolve({ success: false, data: [], message: 'File Excel tidak memiliki lembar kerja (sheet).' });
        }

        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rawJson || rawJson.length === 0) {
          return resolve({ success: false, data: [], message: 'Lembar kerja Excel kosong, tidak ada baris data.' });
        }

        const parsedGurus: DataGuru[] = [];

        rawJson.forEach((row, index) => {
          // Flexible key matching
          const nama = getFieldValue(row, ['Nama Lengkap & Gelar *', 'Nama Lengkap', 'Nama Guru', 'Nama', 'NAMA']);
          if (!nama || nama.trim().length === 0) return;

          const nip = getFieldValue(row, ['NIP', 'NIP / NUPTK', 'Nomor Induk Pegawai', 'nip']) || '-';
          const nuptk = getFieldValue(row, ['NUPTK', 'nuptk']) || '-';
          const jabatan = getFieldValue(row, ['Jabatan / Tugas *', 'Jabatan', 'Tugas', 'JABATAN']) || 'Guru Mata Pelajaran';
          const pangkatGolongan = getFieldValue(row, ['Pangkat / Golongan', 'Pangkat', 'Golongan', 'PANGKAT']) || 'Penata Muda / III a';
          const telepon = getFieldValue(row, ['No Telepon / WA', 'Telepon', 'No HP', 'No Telepon', 'WA', 'HP']) || '';
          const statusStr = getFieldValue(row, ['Status Aktif (Ya/Tidak)', 'Status', 'Status Aktif', 'Aktif']);
          const statusAktif = statusStr ? !['tidak', 'nonaktif', 'non-aktif', 'keluar', 'pensiun', 'false', '0', 'no'].includes(String(statusStr).toLowerCase().trim()) : true;

          parsedGurus.push({
            id: `guru-imp-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 6)}`,
            nama: String(nama).trim(),
            nip: String(nip).trim(),
            nuptk: String(nuptk).trim(),
            jabatan: String(jabatan).trim(),
            pangkatGolongan: String(pangkatGolongan).trim(),
            statusAktif,
            telepon: String(telepon).trim(),
          });
        });

        if (parsedGurus.length === 0) {
          return resolve({
            success: false,
            data: [],
            message: 'Tidak ditemukan baris data guru yang valid. Pastikan kolom "Nama Lengkap" terisi.',
          });
        }

        return resolve({
          success: true,
          data: parsedGurus,
          message: `Berhasil membaca ${parsedGurus.length} data guru dari file Excel.`,
        });
      } catch (err: any) {
        return resolve({
          success: false,
          data: [],
          message: `Gagal memproses file Excel: ${err.message || 'Format file tidak sesuai.'}`,
        });
      }
    };

    reader.onerror = () => {
      resolve({ success: false, data: [], message: 'Gagal membaca berkas.' });
    };

    reader.readAsArrayBuffer(file);
  });
}

/**
 * Parse uploaded Excel file for Siswa
 */
export async function parseSiswaExcelFile(file: File): Promise<{ success: boolean; data: DataSiswa[]; message: string }> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const buffer = e.target?.result;
        const workbook = XLSX.read(buffer, { type: 'array' });
        
        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) {
          return resolve({ success: false, data: [], message: 'File Excel tidak memiliki lembar kerja (sheet).' });
        }

        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rawJson || rawJson.length === 0) {
          return resolve({ success: false, data: [], message: 'Lembar kerja Excel kosong, tidak ada baris data.' });
        }

        const parsedSiswa: DataSiswa[] = [];

        rawJson.forEach((row, index) => {
          const nama = getFieldValue(row, ['Nama Lengkap Siswa *', 'Nama Siswa', 'Nama Lengkap', 'Nama', 'NAMA']);
          if (!nama || nama.trim().length === 0) return;

          const nis = getFieldValue(row, ['NIS *', 'NIS', 'No Induk Siswa', 'nis']) || `2026${String(index + 1).padStart(3, '0')}`;
          const nisn = getFieldValue(row, ['NISN', 'nisn']) || '';
          const kelas = getFieldValue(row, ['Kelas *', 'Kelas', 'Rombel', 'KELAS']) || 'Kelas VI-A';
          const tempatLahir = getFieldValue(row, ['Tempat Lahir', 'TempatLahir', 'Kota Lahir']) || 'Jakarta';
          let tanggalLahir = getFieldValue(row, ['Tanggal Lahir (YYYY-MM-DD)', 'Tanggal Lahir', 'Tgl Lahir', 'TglLahir']) || '2013-01-01';
          
          // Handle potential Excel date serial numbers
          if (typeof tanggalLahir === 'number') {
            const dateObj = new Date((tanggalLahir - (25567 + 2)) * 86400 * 1000);
            tanggalLahir = dateObj.toISOString().split('T')[0];
          }

          const namaOrangTua = getFieldValue(row, ['Nama Orang Tua / Wali', 'Nama Orang Tua', 'Orang Tua', 'Wali', 'Ayah/Ibu']) || '-';
          const alamat = getFieldValue(row, ['Alamat Lengkap', 'Alamat Domisili', 'Alamat', 'ALAMAT']) || '-';
          const statusStr = getFieldValue(row, ['Status Aktif (Ya/Tidak)', 'Status', 'Status Aktif', 'Aktif']);
          const statusAktif = statusStr ? !['tidak', 'nonaktif', 'non-aktif', 'keluar', 'lulus', 'false', '0', 'no'].includes(String(statusStr).toLowerCase().trim()) : true;

          parsedSiswa.push({
            id: `siswa-imp-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 6)}`,
            nama: String(nama).trim(),
            nis: String(nis).trim(),
            nisn: String(nisn).trim(),
            kelas: String(kelas).trim(),
            tempatLahir: String(tempatLahir).trim(),
            tanggalLahir: String(tanggalLahir).trim(),
            namaOrangTua: String(namaOrangTua).trim(),
            alamat: String(alamat).trim(),
            statusAktif,
          });
        });

        if (parsedSiswa.length === 0) {
          return resolve({
            success: false,
            data: [],
            message: 'Tidak ditemukan baris data siswa yang valid. Pastikan kolom "Nama Siswa" terisi.',
          });
        }

        return resolve({
          success: true,
          data: parsedSiswa,
          message: `Berhasil membaca ${parsedSiswa.length} data siswa dari file Excel.`,
        });
      } catch (err: any) {
        return resolve({
          success: false,
          data: [],
          message: `Gagal memproses file Excel: ${err.message || 'Format file tidak sesuai.'}`,
        });
      }
    };

    reader.onerror = () => {
      resolve({ success: false, data: [], message: 'Gagal membaca berkas.' });
    };

    reader.readAsArrayBuffer(file);
  });
}

function getFieldValue(row: any, potentialKeys: string[]): string | undefined {
  for (const key of potentialKeys) {
    if (row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== '') {
      return String(row[key]);
    }
  }
  // Try case-insensitive matching
  const rowKeys = Object.keys(row);
  for (const potential of potentialKeys) {
    const foundKey = rowKeys.find(k => k.toLowerCase().trim() === potential.toLowerCase().trim());
    if (foundKey && row[foundKey] !== undefined && row[foundKey] !== null && String(row[foundKey]).trim() !== '') {
      return String(row[foundKey]);
    }
  }
  return undefined;
}
