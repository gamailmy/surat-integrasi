export type JenisSurat = 
  | 'Surat Tugas'
  | 'Surat Perintah Perjalanan Dinas (SPPD)'
  | 'Surat Undangan'
  | 'Surat Keterangan Aktif Sekolah'
  | 'Surat Panggilan Orang Tua'
  | 'Surat Pengantar';

export interface DataSekolah {
  // Instansi Atasan pada KOP Surat
  instansiAtasan1: string; // e.g. PEMERINTAH PROVINSI DKI JAKARTA
  instansiAtasan2: string; // e.g. DINAS PENDIDIKAN
  namaSekolah: string;
  npsn: string;
  nss: string;
  alamat: string;
  desa: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  kodePos: string;
  telepon: string;
  email: string;
  website: string;
  namaKepalaSekolah: string;
  nipKepalaSekolah: string;
  pangkatKepalaSekolah?: string;
  kodeSekolah: string; // e.g. SDC, SMPN1, SMAN1
  formatPenomoran: string; // e.g. {KLASIFIKASI}/{NO}/{KODE}/{BULAN_ROMAWI}/{TAHUN}
  
  // Logo Kop Surat
  logoKiri?: string; // Base64 / SVG data URL (Logo Pemda / Tut Wuri Handayani)
  logoKanan?: string; // Base64 / SVG data URL (Logo Sekolah)
  tampilkanLogoKiri: boolean;
  tampilkanLogoKanan: boolean;
  digitNomorUrut?: number; // e.g. 1 (1, 2, 3) or 3 (001, 002, 003)
}

export interface DataGuru {
  id: string;
  nama: string;
  nip: string;
  nuptk: string;
  jabatan: string;
  pangkatGolongan: string;
  statusAktif: boolean;
  telepon?: string;
}

export interface DataSiswa {
  id: string;
  nama: string;
  nis: string;
  nisn: string;
  kelas: string;
  tempatLahir: string;
  tanggalLahir: string;
  namaOrangTua: string;
  alamat: string;
  statusAktif: boolean;
  telepon?: string;
}

export interface SuratRecord {
  id: string;
  nomorUrut: number;
  nomorSurat: string;
  kodeKlasifikasi?: string; // e.g. 800, 005, 421.2, 421.3, 420
  jenisSurat: JenisSurat;
  tanggalSurat: string; // YYYY-MM-DD
  
  // Data Penerima
  namaPenerima: string;
  nisNip: string;
  kelasJabatan: string;
  alamatPenerima: string;
  namaOrangTua?: string;
  
  // Data Kegiatan / Keperluan
  keperluan: string;
  tempat?: string;
  tanggalKegiatan?: string;
  keterangan?: string;
  
  // Field spesifik waktu & pelaksanaan
  hariTanggal?: string;
  waktu?: string;
  menghadapKepada?: string;
  nomorPengantar?: string;
  lampiran?: string;
  perihal?: string;

  // Field spesifik SPPD (Surat Perintah Perjalanan Dinas)
  sertakanSppd?: boolean; // Apakah menyertakan lembar SPPD & Visum
  nomorSppd?: string;
  tingkatBiaya?: string; // e.g. 'Tingkat C'
  alatAngkut?: string; // e.g. 'Kendaraan Umum / Bus / Angkutan Darat'
  tempatBerangkat?: string; // e.g. 'UPTD SDN 1 Cempaka Putih / Jakarta Pusat'
  tempatTujuan?: string; // e.g. 'Dinas Pendidikan Provinsi DKI Jakarta'
  lamaHari?: string; // e.g. '1 (Satu) Hari'
  tanggalBerangkat?: string; // YYYY-MM-DD
  tanggalKembali?: string; // YYYY-MM-DD
  instansiAnggaran?: string; // e.g. 'Dana BOS Reguler Tahun 2026'
  mataAnggaran?: string; // e.g. '5.1.02.04.01.0001 (Belanja Perjalanan Dinas Biasa)'
  pengikut?: string; // e.g. '-'
  pangkatGolongan?: string; // e.g. 'Penata / III c'
  pejabatPemberiPerintah?: string; // e.g. 'Kepala Sekolah'
  jabatanPejabatPemberiPerintah?: string;
  
  // Snapshot Data Sekolah saat dibuat
  dataSekolahSnapshot: DataSekolah;
  
  // Metadata
  status: 'Tercatat' | 'Terkirim' | 'Selesai' | 'Dibatalkan';
  dibuatOleh: string;
  waktuDibuat: string; // ISO string
  tahun: number;
  bulan: string; // Nama bulan Bahasa Indonesia
  bulanRomawi: string; // Romawi
  driveFolder?: string;
  driveFileId?: string;
}

export interface LogAktivitas {
  id: string;
  waktu: string;
  aksi: string;
  rincian: string;
  pengguna: string;
  tipe: 'create' | 'update' | 'delete' | 'auth' | 'settings' | 'sync';
}

export interface AppSettings {
  adminUsername: string;
  adminPasswordHash: string; // stored in settings
  adminNama: string;
  gasWebAppUrl: string;
  googleSpreadsheetUrl?: string;
  googleDriveFolderName: string;
  autoIncrementCounter: number;
  tahunAktif: number;
  enableSoundEffects: boolean;
  darkMode?: boolean;
}

export type ActiveTab = 
  | 'dashboard'
  | 'buat-surat'
  | 'arsip-surat'
  | 'data-guru'
  | 'data-siswa'
  | 'data-sekolah'
  | 'pengaturan';
