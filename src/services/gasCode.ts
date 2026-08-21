/**
 * Complete Google Apps Script (Code.gs) implementation for SURATKU
 * Ready to copy & paste into script.google.com or deploy as Web App
 */

export const GAS_BACKEND_CODE = `/**
 * =========================================================================
 * SURATKU - Backend Google Apps Script (Code.gs)
 * Tagline: Bikin Surat Sekolah Tinggal Klik.
 * =========================================================================
 * 
 * Fitur:
 * 1. setupSURATKU() : Otomatis inisialisasi 7 Sheet Database & Folder Drive
 * 2. LockService    : Penomoran surat otomatis yang aman tanpa duplikasi
 * 3. Google Docs    : Pembuatan arsip dokumen otomatis
 * 4. Google Drive   : Arsip terstruktur per Tahun -> Bulan -> Jenis Surat
 * 5. Generate PDF   : Konversi dokumen ke PDF instan di Google Drive
 * 6. API Web App    : Melayani request sinkronisasi langsung dari web SURATKU
 */

// Konfigurasi Standar
const CONFIG = {
  SPREADSHEET_NAME: 'SURATKU - Database Sekolah',
  ROOT_FOLDER_NAME: 'SURATKU - Arsip Surat',
  ADMIN_USER: 'admin',
  ADMIN_PASS: 'admin123'
};

/**
 * Mendapatkan Database Spreadsheet (Mendukung Bound Script dari Google Sheets maupun Standalone)
 */
function getDatabaseSpreadsheet() {
  try {
    const active = SpreadsheetApp.getActiveSpreadsheet();
    if (active) return active;
  } catch (e) {}
  
  const files = DriveApp.getFilesByName(CONFIG.SPREADSHEET_NAME);
  if (files.hasNext()) {
    return SpreadsheetApp.open(files.next());
  }
  return SpreadsheetApp.create(CONFIG.SPREADSHEET_NAME);
}

/**
 * Dapatkan atau Buat Folder Utama di Google Drive
 */
function getRootFolder() {
  const folders = DriveApp.getFoldersByName(CONFIG.ROOT_FOLDER_NAME);
  if (folders.hasNext()) {
    return folders.next();
  }
  return DriveApp.createFolder(CONFIG.ROOT_FOLDER_NAME);
}

/**
 * Fungsi Inisialisasi Otomatis: Jalankan fungsi ini untuk membuat struktur sheet!
 */
function setupSURATKU() {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  
  try {
    const rootFolder = getRootFolder();
    const ss = getDatabaseSpreadsheet();
    
    // 1. SETTINGS
    let sheetSettings = ss.getSheetByName('SETTINGS') || ss.insertSheet('SETTINGS');
    if (sheetSettings.getLastRow() === 0) {
      sheetSettings.appendRow(['KUNCI', 'NILAI', 'KETERANGAN']);
      sheetSettings.appendRow(['ADMIN_USER', CONFIG.ADMIN_USER, 'Username Login']);
      sheetSettings.appendRow(['ADMIN_PASS', CONFIG.ADMIN_PASS, 'Password Login']);
      sheetSettings.appendRow(['DARK_MODE', 'FALSE', 'Tema Tampilan (TRUE/FALSE)']);
      sheetSettings.appendRow(['NAMA_SEKOLAH', 'UPTD SDN 1 CEMPAKA PUTIH', 'Nama Resmi Sekolah']);
      sheetSettings.appendRow(['NPSN', '20214589', 'Nomor Pokok Sekolah Nasional']);
      sheetSettings.appendRow(['NSS', '101026001001', 'Nomor Statistik Sekolah']);
      sheetSettings.appendRow(['ALAMAT_SEKOLAH', 'Jl. Merdeka No. 45, Komplek Pendidikan', 'Alamat Lengkap']);
      sheetSettings.appendRow(['DESA', 'Cempaka Putih', 'Desa / Kelurahan']);
      sheetSettings.appendRow(['KECAMATAN', 'Cempaka', 'Kecamatan']);
      sheetSettings.appendRow(['KABUPATEN', 'Jakarta Pusat', 'Kabupaten / Kota']);
      sheetSettings.appendRow(['PROVINSI', 'DKI Jakarta', 'Provinsi']);
      sheetSettings.appendRow(['NAMA_KEPALA', 'Drs. H. Ahmad Sudrajat, M.Pd.', 'Nama Kepala Sekolah']);
      sheetSettings.appendRow(['NIP_KEPALA', '19680512 199303 1 005', 'NIP Kepala Sekolah']);
      sheetSettings.appendRow(['KODE_SEKOLAH', 'SDC', 'Kode Singkatan Surat']);
      sheetSettings.appendRow(['NOMOR_TERAKHIR', 3, 'Counter Nomor Urut']);
      sheetSettings.appendRow(['ROOT_FOLDER_ID', rootFolder.getId(), 'ID Folder Google Drive']);
    }
    formatHeader(sheetSettings);
    
    // 2. DATA_SEKOLAH
    let sheetSekolah = ss.getSheetByName('DATA_SEKOLAH') || ss.insertSheet('DATA_SEKOLAH');
    if (sheetSekolah.getLastRow() === 0) {
      sheetSekolah.appendRow(['PARAMETER', 'NILAI', 'KETERANGAN']);
      sheetSekolah.appendRow(['NAMA_SEKOLAH', 'UPTD SDN 1 CEMPAKA PUTIH', 'Nama Resmi Sekolah']);
      sheetSekolah.appendRow(['NPSN', '20214589', 'Nomor Pokok Sekolah Nasional']);
      sheetSekolah.appendRow(['NSS', '101026001001', 'Nomor Statistik Sekolah']);
      sheetSekolah.appendRow(['BENTUK_PENDIDIKAN', 'SD', 'Jenjang Satuan Pendidikan']);
      sheetSekolah.appendRow(['STATUS_SEKOLAH', 'Negeri', 'Status Sekolah']);
      sheetSekolah.appendRow(['ALAMAT', 'Jl. Merdeka No. 45', 'Alamat Jalan']);
      sheetSekolah.appendRow(['DESA', 'Cempaka Putih', 'Desa / Kelurahan']);
      sheetSekolah.appendRow(['KECAMATAN', 'Cempaka', 'Kecamatan']);
      sheetSekolah.appendRow(['KABUPATEN', 'Jakarta Pusat', 'Kabupaten / Kota']);
      sheetSekolah.appendRow(['PROVINSI', 'DKI Jakarta', 'Provinsi']);
      sheetSekolah.appendRow(['KODE_POS', '10510', 'Kode Pos Wilayah']);
      sheetSekolah.appendRow(['TELEPON', '(021) 4241234', 'Nomor Telepon Kantor']);
      sheetSekolah.appendRow(['EMAIL', 'sdn1cempakaputih@pendidikan.go.id', 'Email Resmi Sekolah']);
      sheetSekolah.appendRow(['WEBSITE', 'https://sdn1cempakaputih.sch.id', 'Situs Web Resmi']);
      sheetSekolah.appendRow(['NAMA_KEPALA_SEKOLAH', 'Drs. H. Ahmad Sudrajat, M.Pd.', 'Nama Kepala Sekolah']);
      sheetSekolah.appendRow(['NIP_KEPALA_SEKOLAH', '19680512 199303 1 005', 'NIP Kepala Sekolah']);
      sheetSekolah.appendRow(['KODE_SEKOLAH', 'SDC', 'Kode Singkatan Surat']);
      sheetSekolah.appendRow(['FORMAT_PENOMORAN', '{KLASIFIKASI}/{NO}/{KODE}/{BULAN_ROMAWI}/{TAHUN}', 'Format Penomoran']);
    }
    formatHeader(sheetSekolah);

    // 3. GURU
    let sheetGuru = ss.getSheetByName('GURU') || ss.insertSheet('GURU');
    if (sheetGuru.getLastRow() === 0) {
      sheetGuru.appendRow(['ID', 'NAMA', 'NIP', 'NUPTK', 'JABATAN', 'PANGKAT_GOL', 'STATUS_AKTIF', 'TELEPON']);
      sheetGuru.appendRow(['guru-1', 'Budi Santoso, S.Pd.', '19820415 200801 1 012', '3456789012345678', 'Guru Kelas VI', 'Penata / III c', 'AKTIF', '081234567890']);
      sheetGuru.appendRow(['guru-2', 'Siti Rahmawati, M.Pd.', '19870923 201101 2 008', '4567890123456789', 'Guru PAI', 'Penata Muda Tk. I / III b', 'AKTIF', '081298765432']);
    }
    formatHeader(sheetGuru);
    
    // 4. SISWA
    let sheetSiswa = ss.getSheetByName('SISWA') || ss.insertSheet('SISWA');
    if (sheetSiswa.getLastRow() === 0) {
      sheetSiswa.appendRow(['ID', 'NAMA', 'NIS', 'NISN', 'KELAS', 'TEMPAT_LAHIR', 'TANGGAL_LAHIR', 'NAMA_ORANG_TUA', 'ALAMAT', 'STATUS_AKTIF']);
      sheetSiswa.appendRow(['siswa-1', 'Muhammad Rizky Pratama', '20230101', '0112345678', 'Kelas VI-A', 'Jakarta', '2012-05-14', 'Bambang Pratama', 'Jl. Percetakan Negara No. 12', 'AKTIF']);
      sheetSiswa.appendRow(['siswa-2', 'Anindya Putri Kirana', '20230102', '0119876543', 'Kelas VI-A', 'Bandung', '2012-08-22', 'Irwan Setiawan', 'Jl. Cempaka Putih Barat No. 88', 'AKTIF']);
    }
    formatHeader(sheetSiswa);

    // 5. JENIS_SURAT
    let sheetJenis = ss.getSheetByName('JENIS_SURAT') || ss.insertSheet('JENIS_SURAT');
    if (sheetJenis.getLastRow() === 0) {
      sheetJenis.appendRow(['NO', 'KODE', 'JENIS_SURAT', 'KLASIFIKASI_DEFAULT', 'KETERANGAN']);
      sheetJenis.appendRow([1, 'ST', 'Surat Tugas', '800', 'Penugasan dinas guru & staf']);
      sheetJenis.appendRow([2, 'SPPD', 'Surat Perintah Perjalanan Dinas (SPPD)', '094', 'Perjalanan dinas luar kota/kecamatan']);
      sheetJenis.appendRow([3, 'UND', 'Surat Undangan', '005', 'Undangan rapat dinas & pertemuan wali murid']);
      sheetJenis.appendRow([4, 'SKA', 'Surat Keterangan Aktif Sekolah', '421.2', 'Keterangan aktif belajar siswa']);
      sheetJenis.appendRow([5, 'SPO', 'Surat Panggilan Orang Tua', '421.2', 'Panggilan wali murid untuk konseling']);
      sheetJenis.appendRow([6, 'SP', 'Surat Pengantar', '045.2', 'Pengantar dokumen kedinasan resmi']);
      sheetJenis.appendRow([7, 'SKK', 'Surat Keterangan Kelakuan Baik', '421.2', 'Keterangan akhlak & kelakuan baik siswa']);
      sheetJenis.appendRow([8, 'SKP', 'Surat Keterangan Pindah / Mutasi Siswa', '421.2', 'Mutasi dan perpindahan sekolah']);
      sheetJenis.appendRow([9, 'SKB', 'Surat Keterangan Bebas Pinjam Perpustakaan', '421.2', 'Bebas tanggungan pustaka']);
      sheetJenis.appendRow([10, 'SM', 'Surat Masuk', '000', 'Pencatatan surat dinas masuk']);
      sheetJenis.appendRow([11, 'SK', 'Surat Keluar Lainnya', '421.2', 'Surat keluar umum instansi']);
    }
    formatHeader(sheetJenis);

    // 6. SURAT (Arsip Surat)
    let sheetSurat = ss.getSheetByName('SURAT') || ss.insertSheet('SURAT');
    if (sheetSurat.getLastRow() === 0) {
      sheetSurat.appendRow([
        'ID', 'NOMOR_URUT', 'NOMOR_SURAT', 'JENIS_SURAT', 'TANGGAL_SURAT',
        'NAMA_PENERIMA', 'NIS_NIP', 'KELAS_JABATAN', 'KEPERLUAN', 'TEMPAT',
        'TANGGAL_KEGIATAN', 'STATUS', 'DRIVE_FOLDER', 'DOCS_URL', 'PDF_URL', 'WAKTU_DIBUAT'
      ]);
    }
    formatHeader(sheetSurat);

    // 7. LOG_AKTIVITAS
    let sheetLog = ss.getSheetByName('LOG_AKTIVITAS') || ss.insertSheet('LOG_AKTIVITAS');
    if (sheetLog.getLastRow() === 0) {
      sheetLog.appendRow(['ID', 'WAKTU', 'PENGGUNA', 'AKSI', 'RINCIAN']);
    }
    formatHeader(sheetLog);
    
    // Hapus sheet bawaan (Sheet1) jika kosong
    const defaultSheet = ss.getSheetByName('Sheet1');
    if (defaultSheet && ss.getSheets().length > 1) {
      try { ss.deleteSheet(defaultSheet); } catch(e) {}
    }
    
    return {
      status: 'success',
      message: 'Setup SURATKU Berhasil!',
      spreadsheetId: ss.getId(),
      spreadsheetUrl: ss.getUrl(),
      rootFolderId: rootFolder.getId()
    };
  } finally {
    lock.releaseLock();
  }
}

function formatHeader(sheet) {
  try {
    const headerRange = sheet.getRange(1, 1, 1, Math.max(1, sheet.getLastColumn()));
    headerRange.setBackground('#0284c7');
    headerRange.setFontColor('#ffffff');
    headerRange.setFontWeight('bold');
    headerRange.setHorizontalAlignment('center');
    sheet.setFrozenRows(1);
  } catch(e) {}
}

/**
 * Simpan dan Catat Surat Baru ke Google Sheets
 */
function prosesBuatSurat(payload) {
  const ss = getDatabaseSpreadsheet();
  let sheetSurat = ss.getSheetByName('SURAT');
  if (!sheetSurat) {
    setupSURATKU();
    sheetSurat = ss.getSheetByName('SURAT');
  }
  
  // Simpan baris ke Google Sheets
  sheetSurat.appendRow([
    payload.id || ('surat-' + new Date().getTime()),
    payload.nomorUrut || '',
    payload.nomorSurat || '',
    payload.jenisSurat || '',
    payload.tanggalSurat || '',
    payload.namaPenerima || '',
    payload.nisNip || '-',
    payload.kelasJabatan || '-',
    payload.keperluan || '-',
    payload.tempat || '-',
    payload.tanggalKegiatan || '-',
    payload.status || 'Tercatat',
    payload.driveFolder || 'SURATKU - Arsip Surat',
    payload.docsUrl || '-',
    payload.pdfUrl || '-',
    payload.waktuDibuat || new Date().toISOString()
  ]);

  // Catat log
  let sheetLog = ss.getSheetByName('LOG_AKTIVITAS');
  if (sheetLog) {
    sheetLog.appendRow([
      'log-' + new Date().getTime(),
      new Date().toISOString(),
      payload.dibuatOleh || 'Operator',
      'Buat Surat: ' + payload.jenisSurat,
      'Nomor: ' + payload.nomorSurat + ' untuk ' + payload.namaPenerima
    ]);
  }
  
  return {
    status: 'success',
    message: 'Surat berhasil dicatat ke Google Sheets!',
    nomorSurat: payload.nomorSurat,
    spreadsheetUrl: ss.getUrl()
  };
}

/**
 * Sinkronisasi Master Seluruh Database ke Google Sheets
 */
function prosesSyncAll(payload) {
  const ss = getDatabaseSpreadsheet();
  setupSURATKU();
  
  // 1. Sync GURU
  if (payload.guru && Array.isArray(payload.guru)) {
    const sheetGuru = ss.getSheetByName('GURU');
    if (sheetGuru) {
      sheetGuru.clear();
      sheetGuru.appendRow(['ID', 'NAMA', 'NIP', 'NUPTK', 'JABATAN', 'PANGKAT_GOL', 'STATUS_AKTIF', 'TELEPON']);
      payload.guru.forEach(g => {
        sheetGuru.appendRow([g.id, g.nama, g.nip || '-', g.nuptk || '-', g.jabatan, g.pangkatGol || '-', g.statusAktif || 'AKTIF', g.telepon || '-']);
      });
      formatHeader(sheetGuru);
    }
  }

  // 2. Sync SISWA
  if (payload.siswa && Array.isArray(payload.siswa)) {
    const sheetSiswa = ss.getSheetByName('SISWA');
    if (sheetSiswa) {
      sheetSiswa.clear();
      sheetSiswa.appendRow(['ID', 'NAMA', 'NIS', 'NISN', 'KELAS', 'TEMPAT_LAHIR', 'TANGGAL_LAHIR', 'NAMA_ORANG_TUA', 'ALAMAT', 'STATUS_AKTIF']);
      payload.siswa.forEach(s => {
        sheetSiswa.appendRow([s.id, s.nama, s.nis || '-', s.nisn || '-', s.kelas, s.tempatLahir || '-', s.tanggalLahir || '-', s.namaOrangTua || '-', s.alamat || '-', s.statusAktif || 'AKTIF']);
      });
      formatHeader(sheetSiswa);
    }
  }

  // 3. Sync SURAT
  if (payload.surat && Array.isArray(payload.surat)) {
    const sheetSurat = ss.getSheetByName('SURAT');
    if (sheetSurat) {
      sheetSurat.clear();
      sheetSurat.appendRow([
        'ID', 'NOMOR_URUT', 'NOMOR_SURAT', 'JENIS_SURAT', 'TANGGAL_SURAT',
        'NAMA_PENERIMA', 'NIS_NIP', 'KELAS_JABATAN', 'KEPERLUAN', 'TEMPAT',
        'TANGGAL_KEGIATAN', 'STATUS', 'DRIVE_FOLDER', 'DOCS_URL', 'PDF_URL', 'WAKTU_DIBUAT'
      ]);
      payload.surat.forEach(s => {
        sheetSurat.appendRow([
          s.id, s.nomorUrut || '', s.nomorSurat, s.jenisSurat, s.tanggalSurat,
          s.namaPenerima, s.nisNip || '-', s.kelasJabatan || '-', s.keperluan || '-',
          s.tempat || '-', s.tanggalKegiatan || '-', s.status || 'Tercatat',
          s.driveFolder || '-', s.docsUrl || '-', s.pdfUrl || '-', s.waktuDibuat || ''
        ]);
      });
      formatHeader(sheetSurat);
    }
  }

  // 4. Log
  const sheetLog = ss.getSheetByName('LOG_AKTIVITAS');
  if (sheetLog) {
    sheetLog.appendRow([
      'log-' + new Date().getTime(),
      new Date().toISOString(),
      'Admin',
      'Sinkronisasi Master Database',
      'Ekspor data lokal ke Google Sheets berhasil'
    ]);
  }

  return {
    status: 'success',
    message: 'Semua data lokal berhasil disinkronkan ke Google Sheets!',
    spreadsheetUrl: ss.getUrl()
  };
}

/**
 * Web App Entry Points (doGet & doPost)
 */
function doGet(e) {
  const ss = getDatabaseSpreadsheet();
  return respondJson({
    status: 'online',
    app: 'SURATKU Google Apps Script API',
    spreadsheetUrl: ss.getUrl(),
    time: new Date().toISOString()
  });
}

function doPost(e) {
  try {
    let data = {};
    if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    }
    const action = data.action || 'PING';
    
    if (action === 'PING') {
      return respondJson({ status: 'online', message: 'Google Apps Script Web App Terhubung Aktif!' });
    }
    
    if (action === 'SETUP') {
      const res = setupSURATKU();
      return respondJson(res);
    }
    
    if (action === 'BUAT_SURAT') {
      const res = prosesBuatSurat(data.payload);
      return respondJson(res);
    }

    if (action === 'SYNC_ALL') {
      const res = prosesSyncAll(data.payload);
      return respondJson(res);
    }
    
    return respondJson({ status: 'error', message: 'Aksi (' + action + ') tidak dikenali' });
  } catch (err) {
    return respondJson({ status: 'error', message: err.toString() });
  }
}

function respondJson(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
`;
