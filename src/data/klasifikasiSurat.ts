import { JenisSurat } from '../types';

export interface KlasifikasiItem {
  kode: string;
  nama: string;
  judul?: string;
  kategori: string;
  jenisSuratTerkait?: JenisSurat;
  deskripsi: string;
}

// Pola Klasifikasi Surat Dinas Pemerintah Indonesia (Permendikbudristek No. 40/2021 & Permendagri No. 83/2022)
export const DAFTAR_KLASIFIKASI_DINAS: KlasifikasiItem[] = [
  {
    kode: '800.1.11.1',
    nama: 'Surat Tugas Kedinasan Guru & Tenaga Kependidikan',
    judul: 'Surat Tugas Pendidik / GTK',
    kategori: 'Kepegawaian (800)',
    jenisSuratTerkait: 'Surat Tugas',
    deskripsi: 'Penugasan guru/staf untuk bimbingan teknis, workshop, pelatihan, pengawasan ujian, dan kegiatan dinas.'
  },
  {
    kode: '800',
    nama: 'Kepegawaian & Tata Kelola Guru',
    judul: 'Kepegawaian Umum',
    kategori: 'Kepegawaian (800)',
    jenisSuratTerkait: 'Surat Tugas',
    deskripsi: 'Urusan kepegawaian umum sekolah, penugasan internal, cuti, dan administrasi pendidik.'
  },
  {
    kode: '094',
    nama: 'Surat Tugas Perjalanan Dinas (SPPD)',
    judul: 'Perjalanan Dinas (SPPD)',
    kategori: 'Kepegawaian (800)',
    jenisSuratTerkait: 'Surat Tugas',
    deskripsi: 'Penugasan dinas luar kota/wilayah atau tugas perjalanan dinas resmi pendidik.'
  },
  {
    kode: '005',
    nama: 'Undangan Resmi Kedinasan & Pertemuan',
    judul: 'Undangan Resmi / Rapat',
    kategori: 'Umum & Protokoler (000)',
    jenisSuratTerkait: 'Surat Undangan',
    deskripsi: 'Undangan rapat dinas guru, pertemuan orang tua/wali murid, komite sekolah, dan sosialisasi program.'
  },
  {
    kode: '421.2',
    nama: 'Pendidikan Dasar & Kesiswaan (Surat Keterangan Siswa)',
    judul: 'Keterangan Aktif Siswa',
    kategori: 'Pendidikan (400)',
    jenisSuratTerkait: 'Surat Keterangan Aktif Sekolah',
    deskripsi: 'Surat keterangan aktif belajar siswa, keabsahan ijazah, beasiswa PIP, perlombaan, dan keperluan administrasi.'
  },
  {
    kode: '421.3',
    nama: 'Bimbingan Konseling & Tata Tertib Siswa (Panggilan / Pindah)',
    judul: 'Panggilan Orang Tua / BK',
    kategori: 'Kesiswaan (400)',
    jenisSuratTerkait: 'Surat Panggilan Orang Tua',
    deskripsi: 'Panggilan orang tua/wali murid, konsultasi bimbingan konseling, pembinaan disiplin, dan mutasi siswa.'
  },
  {
    kode: '420',
    nama: 'Pendidikan Umum & Pengantar Berkas Dinas',
    judul: 'Pengantar Berkas Pendidikan',
    kategori: 'Pendidikan (400)',
    jenisSuratTerkait: 'Surat Pengantar',
    deskripsi: 'Pengantar pengiriman berkas ke Dinas Pendidikan, usulan sertifikasi/kenaikan pangkat, dan laporan sekolah.'
  },
  {
    kode: '045',
    nama: 'Kearsipan & Naskah Dinas Pengantar Dokumen',
    judul: 'Pengantar Dokumen / Naskah',
    kategori: 'Administrasi Umum (000)',
    jenisSuratTerkait: 'Surat Pengantar',
    deskripsi: 'Pengantar dokumen administratif umum antar-instansi atau satuan kerja.'
  },
  {
    kode: '421.1',
    nama: 'Kurikulum, Pembelajaran & Ujian',
    judul: 'Kurikulum & Pembelajaran',
    kategori: 'Pendidikan (400)',
    deskripsi: 'Pelaksanaan kurikulum merdeka, jadwal pelajaran, asesmen/ANBK, dan kalender pendidikan.'
  },
  {
    kode: '421.7',
    nama: 'Kegiatan Ekstrakurikuler & Lomba Siswa',
    judul: 'Ekstrakurikuler & Lomba',
    kategori: 'Kesiswaan (400)',
    deskripsi: 'Kegiatan pramuka, olimpiade sains (OSN), O2SN, pentas seni (FLS2N), dan kejuaraan siswa.'
  }
];

// Alias for ease of use
export const KLASIFIKASI_SURAT = DAFTAR_KLASIFIKASI_DINAS;

export function getKodeKlasifikasiDefault(jenisSurat: JenisSurat): string {
  switch (jenisSurat) {
    case 'Surat Tugas':
      return '800.1.11.1';
    case 'Surat Perintah Perjalanan Dinas (SPPD)':
      return '094';
    case 'Surat Undangan':
      return '005';
    case 'Surat Keterangan Aktif Sekolah':
      return '421.2';
    case 'Surat Panggilan Orang Tua':
      return '421.3';
    case 'Surat Pengantar':
      return '420';
    default:
      return '421.2';
  }
}

export const getDefaultKlasifikasiForJenisSurat = getKodeKlasifikasiDefault;

// Helper to format Indonesian day and date from "YYYY-MM-DD"
const DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export function formatIndonesianDayDate(isoDateString: string): string {
  if (!isoDateString) return '';
  const [year, month, day] = isoDateString.split('-').map(num => parseInt(num, 10));
  if (!year || !month || !day) return isoDateString;
  const d = new Date(year, month - 1, day);
  const dayName = DAYS[d.getDay()];
  const monthName = MONTHS[month - 1];
  return `${dayName}, ${day} ${monthName} ${year}`;
}

export function formatDateRange(startIso: string, endIso: string): string {
  if (!startIso) return '';
  if (!endIso || startIso === endIso) {
    return formatIndonesianDayDate(startIso);
  }

  const [y1, m1, d1] = startIso.split('-').map(num => parseInt(num, 10));
  const [y2, m2, d2] = endIso.split('-').map(num => parseInt(num, 10));

  const date1 = new Date(y1, m1 - 1, d1);
  const date2 = new Date(y2, m2 - 1, d2);

  const dayName1 = DAYS[date1.getDay()];
  const dayName2 = DAYS[date2.getDay()];

  if (y1 === y2 && m1 === m2) {
    return `${dayName1} s.d. ${dayName2}, ${d1} s.d. ${d2} ${MONTHS[m1 - 1]} ${y1}`;
  } else if (y1 === y2) {
    return `${dayName1}, ${d1} ${MONTHS[m1 - 1]} s.d. ${dayName2}, ${d2} ${MONTHS[m2 - 1]} ${y1}`;
  } else {
    return `${dayName1}, ${d1} ${MONTHS[m1 - 1]} ${y1} s.d. ${dayName2}, ${d2} ${MONTHS[m2 - 1]} ${y2}`;
  }
}

export function formatLamaHari(startIso: string, endIso: string): string {
  if (!startIso) return '1 (Satu) Hari';
  if (!endIso || startIso === endIso) {
    return '1 (Satu) Hari';
  }

  const [y1, m1, d1] = startIso.split('-').map(num => parseInt(num, 10));
  const [y2, m2, d2] = endIso.split('-').map(num => parseInt(num, 10));

  const date1 = new Date(y1, m1 - 1, d1);
  const date2 = new Date(y2, m2 - 1, d2);

  const diffTime = date2.getTime() - date1.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;

  if (diffDays <= 1) {
    return '1 (Satu) Hari';
  }

  const terbilangMap: Record<number, string> = {
    2: 'Dua',
    3: 'Tiga',
    4: 'Empat',
    5: 'Lima',
    6: 'Enam',
    7: 'Tujuh',
    8: 'Delapan',
    9: 'Sembilan',
    10: 'Sepuluh',
    11: 'Sebelas',
    12: 'Dua Belas',
    13: 'Tiga Belas',
    14: 'Empat Belas',
    15: 'Lima Belas',
    16: 'Enam Belas',
    17: 'Tujuh Belas',
    18: 'Delapan Belas',
    19: 'Sembilan Belas',
    20: 'Dua Puluh',
    30: 'Tiga Puluh'
  };

  const terbilangStr = terbilangMap[diffDays] || `${diffDays}`;
  return `${diffDays} (${terbilangStr}) Hari`;
}

// Preset and time formatter helpers
export const WAKTU_PRESETS = [
  { label: '08.00 WIB s.d Selesai', jamMulai: '08:00', jamSelesai: '12:00', isSampaiSelesai: true },
  { label: '08.00 - 12.00 WIB', jamMulai: '08:00', jamSelesai: '12:00', isSampaiSelesai: false },
  { label: '09.00 - 11.30 WIB', jamMulai: '09:00', jamSelesai: '11:30', isSampaiSelesai: false },
  { label: '13.00 - 15.30 WIB', jamMulai: '13:00', jamSelesai: '15:30', isSampaiSelesai: false },
];

export function formatWaktuPelaksanaan(
  jamMulai: string, 
  jamSelesai: string, 
  isSampaiSelesai: boolean, 
  zona: string = 'WIB'
): string {
  const mulaiFormatted = jamMulai.replace(':', '.');
  if (isSampaiSelesai) {
    return `${mulaiFormatted} ${zona} s.d. Selesai`;
  }
  const selesaiFormatted = jamSelesai.replace(':', '.');
  return `${mulaiFormatted} - ${selesaiFormatted} ${zona}`;
}

// Preset Logo Resmi SVG siap pakai
export const PRESET_LOGOS = {
  tutWuri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="46" fill="%230284c7" stroke="%230369a1" stroke-width="4"/><path d="M50 18 L68 38 L32 38 Z" fill="%23facc15"/><circle cx="50" cy="28" r="5" fill="%23ffffff"/><path d="M26 44 Q50 62 74 44 Q50 82 26 44 Z" fill="%23ffffff"/><path d="M38 48 L62 48 L50 72 Z" fill="%23facc15"/><circle cx="50" cy="54" r="4" fill="%230284c7"/><text x="50" y="90" font-size="8" font-weight="bold" fill="%23ffffff" text-anchor="middle" font-family="Arial">TUT WURI HANDAYANI</text></svg>`,
  tutwuri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="46" fill="%230284c7" stroke="%230369a1" stroke-width="4"/><path d="M50 18 L68 38 L32 38 Z" fill="%23facc15"/><circle cx="50" cy="28" r="5" fill="%23ffffff"/><path d="M26 44 Q50 62 74 44 Q50 82 26 44 Z" fill="%23ffffff"/><path d="M38 48 L62 48 L50 72 Z" fill="%23facc15"/><circle cx="50" cy="54" r="4" fill="%230284c7"/><text x="50" y="90" font-size="8" font-weight="bold" fill="%23ffffff" text-anchor="middle" font-family="Arial">TUT WURI HANDAYANI</text></svg>`,
  pemda: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><path d="M50 10 L84 26 L84 62 Q50 92 50 92 Q16 62 16 26 Z" fill="%231e3a8a" stroke="%23facc15" stroke-width="4"/><circle cx="50" cy="46" r="22" fill="%23ffffff"/><path d="M50 28 L56 42 L70 42 L59 51 L63 65 L50 56 L37 65 L41 51 L30 42 L44 42 Z" fill="%23ea580c"/><text x="50" y="80" font-size="7" font-weight="bold" fill="%23facc15" text-anchor="middle" font-family="Arial">PEMERINTAH DAERAH</text></svg>`,
  sekolah: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="45" fill="%23065f46" stroke="%2310b981" stroke-width="4"/><circle cx="50" cy="50" r="36" fill="%23ffffff"/><path d="M30 65 L50 32 L70 65 Z" fill="%23065f46"/><path d="M36 60 L50 38 L64 60 Z" fill="%23f59e0b"/><rect x="46" y="52" width="8" height="13" fill="%23ffffff"/><circle cx="50" cy="44" r="3" fill="%23ffffff"/><text x="50" y="88" font-size="7" font-weight="bold" fill="%23ffffff" text-anchor="middle" font-family="Arial">SATUAN PENDIDIKAN</text></svg>`
};
