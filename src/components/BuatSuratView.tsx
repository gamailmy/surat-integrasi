import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  GraduationCap, 
  FileCheck,
  Eye,
  Hash,
  Calendar,
  Clock,
  BookOpen,
  CheckCircle2,
  Car,
  FileSignature,
  DollarSign,
  MapPin,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  JenisSurat, 
  DataSekolah, 
  DataGuru, 
  DataSiswa, 
  SuratRecord 
} from '../types';
import { 
  generateNextNomorSurat, 
  createSurat, 
  formatIndonesianDate 
} from '../services/storage';
import { syncSuratToGas } from '../services/gasSyncService';
import { 
  KLASIFIKASI_SURAT, 
  formatIndonesianDayDate, 
  formatDateRange,
  formatLamaHari,
  formatWaktuPelaksanaan,
  getDefaultKlasifikasiForJenisSurat,
  WAKTU_PRESETS
} from '../data/klasifikasiSurat';
import { LetterDocumentPreview } from './LetterDocumentPreview';

interface BuatSuratViewProps {
  sekolah: DataSekolah;
  daftarGuru: DataGuru[];
  daftarSiswa: DataSiswa[];
  initialJenisSurat?: JenisSurat;
  onSuratCreated: (surat: SuratRecord) => void;
}

export const BuatSuratView: React.FC<BuatSuratViewProps> = ({
  sekolah,
  daftarGuru,
  daftarSiswa,
  initialJenisSurat = 'Surat Tugas',
  onSuratCreated,
}) => {
  // Form State
  const [jenisSurat, setJenisSurat] = useState<JenisSurat>(initialJenisSurat as JenisSurat);
  const [kodeKlasifikasi, setKodeKlasifikasi] = useState<string>(
    getDefaultKlasifikasiForJenisSurat((initialJenisSurat as JenisSurat) || 'Surat Tugas')
  );
  const [showCustomKode, setShowCustomKode] = useState(false);
  const [isCustomNomor, setIsCustomNomor] = useState(false);
  const [customNomorSurat, setCustomNomorSurat] = useState('');
  const [tanggalSurat, setTanggalSurat] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [namaPenerima, setNamaPenerima] = useState('');
  const [nisNip, setNisNip] = useState('');
  const [kelasJabatan, setKelasJabatan] = useState('');
  const [pangkatGolongan, setPangkatGolongan] = useState('Penata Muda / III a');
  const [alamatPenerima, setAlamatPenerima] = useState('');
  const [namaOrangTua, setNamaOrangTua] = useState('');
  const [keperluan, setKeperluan] = useState('');
  const [tempat, setTempat] = useState('');
  
  // Date & Time Picker states
  const [isRangeDate, setIsRangeDate] = useState(false);
  const [tanggalMulai, setTanggalMulai] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [tanggalSelesai, setTanggalSelesai] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [tanggalKegiatanText, setTanggalKegiatanText] = useState('');

  // Time state
  const [jamMulai, setJamMulai] = useState('08:00');
  const [jamSelesai, setJamSelesai] = useState('12:00');
  const [isSampaiSelesai, setIsSampaiSelesai] = useState(true);
  const [zonaWaktu, setZonaWaktu] = useState<'WIB' | 'WITA' | 'WIT'>('WIB');
  const [waktuText, setWaktuText] = useState('08.00 WIB s.d Selesai');

  // SPPD Specific States
  const [sertakanSppd, setSertakanSppd] = useState<boolean>(true);
  const [nomorSppd, setNomorSppd] = useState<string>('');
  const [pejabatPemberiPerintah, setPejabatPemberiPerintah] = useState<string>(sekolah.namaKepalaSekolah || 'Kepala Sekolah');
  const [tingkatBiaya, setTingkatBiaya] = useState<string>('Tingkat C');
  const [alatAngkut, setAlatAngkut] = useState<string>('Kendaraan Umum / Angkutan Darat');
  const [tempatBerangkat, setTempatBerangkat] = useState<string>(sekolah.namaSekolah || 'Sekolah');
  const [tempatTujuan, setTempatTujuan] = useState<string>('');
  const [lamaHari, setLamaHari] = useState<string>('1 (Satu) Hari');
  const [tanggalBerangkat, setTanggalBerangkat] = useState<string>(new Date().toISOString().split('T')[0]);
  const [tanggalKembali, setTanggalKembali] = useState<string>(new Date().toISOString().split('T')[0]);
  const [instansiAnggaran, setInstansiAnggaran] = useState<string>(`Dana BOS ${sekolah.namaSekolah}`);
  const [mataAnggaran, setMataAnggaran] = useState<string>('5.1.02.04.01.0001 (Belanja Perjalanan Dinas)');
  const [pengikut, setPengikut] = useState<string>('-');

  const [menghadapKepada, setMenghadapKepada] = useState('');
  const [keterangan, setKeterangan] = useState('');

  // Selected quick pick
  const [selectedGuruId, setSelectedGuruId] = useState<string>('');
  const [selectedSiswaId, setSelectedSiswaId] = useState<string>('');

  // Loading state
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingText, setLoadingText] = useState('Sedang membuat surat...');

  // Recalculate formatted date text and travel duration whenever date pickers change
  useEffect(() => {
    if (isRangeDate) {
      setTanggalKegiatanText(formatDateRange(tanggalMulai, tanggalSelesai));
      setLamaHari(formatLamaHari(tanggalMulai, tanggalSelesai));
    } else {
      setTanggalKegiatanText(formatIndonesianDayDate(tanggalMulai));
      setLamaHari('1 (Satu) Hari');
    }
  }, [isRangeDate, tanggalMulai, tanggalSelesai]);

  // Recalculate formatted time text whenever time pickers change
  useEffect(() => {
    setWaktuText(formatWaktuPelaksanaan(jamMulai, jamSelesai, isSampaiSelesai, zonaWaktu));
  }, [jamMulai, jamSelesai, isSampaiSelesai, zonaWaktu]);

  // Auto-calculated next letter number with live classification code
  const nextNomorInfo = generateNextNomorSurat(tanggalSurat, jenisSurat, kodeKlasifikasi);

  // Sync SPPD default values with school
  useEffect(() => {
    if (sekolah.namaKepalaSekolah && !pejabatPemberiPerintah) {
      setPejabatPemberiPerintah(sekolah.namaKepalaSekolah);
    }
    if (sekolah.namaSekolah && !tempatBerangkat) {
      setTempatBerangkat(sekolah.namaSekolah);
    }
  }, [sekolah]);

  // Update initial fields based on letter type
  useEffect(() => {
    if (initialJenisSurat) {
      setJenisSurat(initialJenisSurat as JenisSurat);
      const defaultKode = getDefaultKlasifikasiForJenisSurat(initialJenisSurat as JenisSurat);
      setKodeKlasifikasi(defaultKode);
      applyTemplateDefaults(initialJenisSurat as JenisSurat);
    }
  }, [initialJenisSurat]);

  const handleJenisSuratChange = (newType: JenisSurat) => {
    setJenisSurat(newType);
    const defaultKode = getDefaultKlasifikasiForJenisSurat(newType);
    setKodeKlasifikasi(defaultKode);
    applyTemplateDefaults(newType);
  };

  const applyTemplateDefaults = (type: JenisSurat) => {
    switch (type) {
      case 'Surat Tugas':
      case 'Surat Perintah Perjalanan Dinas (SPPD)':
        setKeperluan('Mengikuti Workshop Peningkatan Kompetensi Guru & Implementasi Kurikulum Merdeka');
        setTempat('Hotel Grand Pasundan / Balai Penjaminan Mutu Pendidikan');
        setTempatTujuan('Balai Penjaminan Mutu Pendidikan (BPMP) Provinsi');
        setKeterangan('Demikian surat tugas dan SPPD ini diberikan untuk dilaksanakan dengan sebaik-baiknya dan melaporkan hasilnya setelah kegiatan.');
        break;
      case 'Surat Undangan':
        setNamaPenerima('Bapak/Ibu Orang Tua/Wali Murid');
        setKelasJabatan('Wali Murid');
        setAlamatPenerima('Tempat');
        setKeperluan('Rapat Pleno Komite Sekolah & Persiapan Asesmen Nasional Berbasis Komputer (ANBK)');
        setTempat('Ruang Pertemuan / Aula Utama Sekolah');
        setKeterangan('Mengingat pentingnya agenda ini, dimohon kehadiran Bapak/Ibu tepat pada waktunya tanpa diwakilkan.');
        break;
      case 'Surat Keterangan Aktif Sekolah':
        setKeperluan('Pengurusan Beasiswa PIP / Prestasi Akademik & Keperluan Administrasi Kependudukan');
        setKeterangan('Demikian surat keterangan ini dibuat dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya.');
        break;
      case 'Surat Panggilan Orang Tua':
        setKeperluan('Pembinaan Disiplin & Konsultasi Perkembangan Belajar Siswa di Sekolah');
        setTempat('Ruang Bimbingan Konseling (BK) / Kepala Sekolah');
        setMenghadapKepada('Guru Bimbingan Konseling (BK) & Wali Kelas');
        setKeterangan('Kehadiran Bapak/Ibu sangat diharapkan demi masa depan dan kelancaran pendidikan putra/putri.');
        break;
      case 'Surat Pengantar':
        setNamaPenerima('Kepala Dinas Pendidikan Provinsi / Kabupaten');
        setKelasJabatan('Pejabat Pembina Kepegawaian');
        setAlamatPenerima('Kantor Dinas Pendidikan Wilayah');
        setKeperluan('Pengiriman Berkas Usulan Kenaikan Pangkat & Sertifikasi Pendidik Periode Tahun 2026');
        setKeterangan('Bersama surat ini kami lampirkan berkas persyaratan lengkap untuk dapat diproses lebih lanjut.');
        break;
    }
  };

  const handleSelectGuru = (guruId: string) => {
    setSelectedGuruId(guruId || '');
    const guru = daftarGuru.find(g => g.id === guruId);
    if (guru) {
      setNamaPenerima(guru.nama || '');
      setNisNip(guru.nip || guru.nuptk || '-');
      setKelasJabatan(guru.jabatan || 'Guru Mata Pelajaran');
      setPangkatGolongan(guru.pangkatGolongan || 'Penata Muda / III a');
      setAlamatPenerima(guru.alamat || sekolah.kabupaten || '-');
    }
  };

  const handleSelectSiswa = (siswaId: string) => {
    setSelectedSiswaId(siswaId || '');
    const siswa = daftarSiswa.find(s => s.id === siswaId);
    if (siswa) {
      setNamaPenerima(siswa.nama || '');
      const formattedNisNisn = (siswa.nis && siswa.nisn)
        ? `${siswa.nis} / ${siswa.nisn}`
        : (siswa.nisn || siswa.nis || '-');
      setNisNip(formattedNisNisn);
      setKelasJabatan(siswa.kelas || '');
      setNamaOrangTua(siswa.namaOrangTua || '');
      setAlamatPenerima(siswa.alamat || '');
    }
  };

  // Form Submit / Create Letter
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaPenerima || !keperluan) {
      alert('Mohon lengkapi Nama Penerima dan Keperluan!');
      return;
    }

    setIsProcessing(true);
    setLoadingText('Menerapkan kode klasifikasi kedinasan & nomor surat...');

    setTimeout(() => {
      setLoadingText('Menyusun format lembar surat dinas & kelengkapan SPPD / Visum...');
      setTimeout(() => {
        setLoadingText('Menyimpan ke arsip digital...');
        setTimeout(() => {
          const effectiveNomor = isCustomNomor && customNomorSurat ? customNomorSurat : undefined;
          const newSurat = createSurat({
            jenisSurat,
            kodeKlasifikasi,
            tanggalSurat,
            nomorSurat: effectiveNomor,
            namaPenerima,
            nisNip,
            kelasJabatan,
            pangkatGolongan,
            alamatPenerima,
            namaOrangTua,
            keperluan,
            tempat,
            tanggalKegiatan: tanggalKegiatanText,
            hariTanggal: tanggalKegiatanText,
            waktu: waktuText,
            keterangan,
            menghadapKepada,
            // SPPD Fields
            sertakanSppd: jenisSurat === 'Surat Tugas' || jenisSurat === 'Surat Perintah Perjalanan Dinas (SPPD)' ? sertakanSppd : false,
            nomorSppd: nomorSppd || effectiveNomor || nextNomorInfo.nomorSurat,
            pejabatPemberiPerintah: pejabatPemberiPerintah || sekolah.namaKepalaSekolah,
            tingkatBiaya: tingkatBiaya || 'Tingkat C',
            alatAngkut: alatAngkut || 'Kendaraan Umum / Angkutan Darat',
            tempatBerangkat: tempatBerangkat || sekolah.namaSekolah,
            tempatTujuan: tempatTujuan || tempat || 'Lokasi Kegiatan',
            lamaHari: lamaHari || (isRangeDate ? '2 (Dua) Hari' : '1 (Satu) Hari'),
            tanggalBerangkat: tanggalBerangkat || tanggalMulai || tanggalSurat,
            tanggalKembali: tanggalKembali || tanggalSelesai || tanggalSurat,
            instansiAnggaran: instansiAnggaran || `Dana BOS ${sekolah.namaSekolah}`,
            mataAnggaran: mataAnggaran || '5.1.02.04.01.0001 (Belanja Perjalanan Dinas)',
            pengikut: pengikut || '-',
          });

          setIsProcessing(false);
          // Sync automatically to Google Sheets in background if URL configured
          syncSuratToGas(newSurat).catch(err => console.warn('Background sync error:', err));
          onSuratCreated(newSurat);
        }, 300);
      }, 300);
    }, 300);
  };

  // Live preview dummy record
  const isSppdApplicable = jenisSurat === 'Surat Tugas' || jenisSurat === 'Surat Perintah Perjalanan Dinas (SPPD)';
  const effectivePreviewNomor = (isCustomNomor && customNomorSurat) ? customNomorSurat : nextNomorInfo.nomorSurat;
  const previewRecord: SuratRecord = {
    id: 'preview-draft',
    nomorUrut: nextNomorInfo.nomorUrut,
    nomorSurat: effectivePreviewNomor,
    jenisSurat,
    kodeKlasifikasi,
    tanggalSurat,
    namaPenerima: namaPenerima || '(Nama Penerima Surat)',
    nisNip: nisNip || '-',
    kelasJabatan: kelasJabatan || '(Jabatan / Kelas)',
    pangkatGolongan: pangkatGolongan || 'Penata Muda / III a',
    alamatPenerima: alamatPenerima || '(Alamat Penerima)',
    namaOrangTua: namaOrangTua || '',
    keperluan: keperluan || '(Keperluan surat belum diisi)',
    tempat: tempat || '',
    tanggalKegiatan: tanggalKegiatanText || '',
    hariTanggal: tanggalKegiatanText || '',
    keterangan: keterangan || '',
    waktu: waktuText || '',
    menghadapKepada: menghadapKepada || '',
    dataSekolahSnapshot: sekolah,
    status: 'Tercatat',
    dibuatOleh: 'Operator Sekolah',
    waktuDibuat: new Date().toISOString(),
    tahun: nextNomorInfo.tahun,
    bulan: nextNomorInfo.bulan,
    bulanRomawi: nextNomorInfo.bulanRomawi,
    sertakanSppd: isSppdApplicable ? sertakanSppd : false,
    nomorSppd: nomorSppd || effectivePreviewNomor,
    pejabatPemberiPerintah: pejabatPemberiPerintah || sekolah.namaKepalaSekolah,
    tingkatBiaya: tingkatBiaya || 'Tingkat C',
    alatAngkut: alatAngkut || 'Kendaraan Umum / Angkutan Darat',
    tempatBerangkat: tempatBerangkat || sekolah.namaSekolah,
    tempatTujuan: tempatTujuan || tempat || 'Lokasi Kegiatan',
    lamaHari: lamaHari || (isRangeDate ? '2 (Dua) Hari' : '1 (Satu) Hari'),
    tanggalBerangkat: tanggalBerangkat || tanggalMulai || tanggalSurat,
    tanggalKembali: tanggalKembali || tanggalSelesai || tanggalSurat,
    instansiAnggaran: instansiAnggaran || `Dana BOS ${sekolah.namaSekolah}`,
    mataAnggaran: mataAnggaran || '5.1.02.04.01.0001 (Belanja Perjalanan Dinas)',
    pengikut: pengikut || '-',
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 6 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="space-y-4 pb-12"
    >
      {/* Title Bar with Next Number Indicator */}
      <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>Buat Surat & SPPD Kedinasan</span>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </h2>
            <span className="bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800 text-[10px] font-mono font-semibold px-2 py-0.5 rounded">
              Permendagri & Kemendikbudristek
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Lengkapi form di bawah ini. Untuk tugas dinas luar, lembar SPPD dan lembar Visum pejabat tujuan akan disusun otomatis.
          </p>
        </div>

        {/* Automatic / Custom Numbering Box */}
        <div className="bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/70 dark:border-blue-800/70 p-2.5 rounded-lg shrink-0 flex flex-col gap-1.5 min-w-[240px]">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">
                <Hash className="w-3 h-3" />
              </div>
              <span className="text-[10px] font-bold text-blue-900/80 dark:text-blue-300/80 uppercase tracking-wider">
                {isCustomNomor ? 'Nomor Surat Manual / Kustom' : 'Nomor Surat Otomatis'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                if (!isCustomNomor && !customNomorSurat) {
                  setCustomNomorSurat(nextNomorInfo.nomorSurat);
                }
                setIsCustomNomor(!isCustomNomor);
              }}
              className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              {isCustomNomor ? 'Gunakan Otomatis' : 'Sesuaikan / Edit'}
            </button>
          </div>

          {isCustomNomor ? (
            <input
              id="input-custom-nomor-surat"
              type="text"
              value={customNomorSurat}
              onChange={(e) => setCustomNomorSurat(e.target.value)}
              placeholder="Contoh: 800/012/SDN01/VIII/2026"
              className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-700 rounded text-xs font-mono font-bold text-blue-950 dark:text-blue-200 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          ) : (
            <div className="text-xs sm:text-sm font-bold text-blue-950 dark:text-blue-200 font-mono">
              {nextNomorInfo.nomorSurat}
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Form on Left, Live Paper Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Column: Form (7 cols on large) */}
        <div className="lg:col-span-7 space-y-4">
          <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-4 sm:p-5 space-y-4">
            
            {/* Step 1: Jenis Surat & Kode Klasifikasi */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                  <span>1. Format Surat & Klasifikasi Arsip</span>
                </span>
                <span className="text-[10px] text-slate-400">Standar Permendagri No. 83 / 2022</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Jenis Surat */}
                <div>
                  <label 
                    htmlFor="input-jenis-surat"
                    className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1"
                  >
                    Kategori / Format Surat <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="input-jenis-surat"
                    value={jenisSurat}
                    onChange={(e) => handleJenisSuratChange(e.target.value as JenisSurat)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-600 transition-all cursor-pointer"
                  >
                    <option value="Surat Tugas">1. Surat Tugas (Penugasan & Perjalanan Dinas)</option>
                    <option value="Surat Perintah Perjalanan Dinas (SPPD)">2. SPPD (Format Khusus Perjalanan Dinas)</option>
                    <option value="Surat Undangan">3. Surat Undangan (Rapat / Wali Murid / Dinas)</option>
                    <option value="Surat Keterangan Aktif Sekolah">4. Surat Keterangan Aktif Siswa</option>
                    <option value="Surat Panggilan Orang Tua">5. Surat Panggilan Orang Tua</option>
                    <option value="Surat Pengantar">6. Surat Pengantar (Berkas / Dokumen)</option>
                  </select>
                </div>

                {/* Kode Klasifikasi Permendagri / Kemendikbud */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label 
                      htmlFor="input-kode-klasifikasi"
                      className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300"
                    >
                      Kode Klasifikasi Surat <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowCustomKode(!showCustomKode)}
                      className="text-[10px] text-blue-600 hover:underline cursor-pointer"
                    >
                      {showCustomKode ? 'Pilih dari Daftar' : 'Tulis Manual'}
                    </button>
                  </div>

                  {showCustomKode ? (
                    <input
                      id="input-kode-klasifikasi-manual"
                      type="text"
                      value={kodeKlasifikasi}
                      onChange={(e) => setKodeKlasifikasi(e.target.value)}
                      placeholder="Contoh: 094 atau 800.1.11.1"
                      className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono font-bold text-blue-600 dark:text-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                  ) : (
                    <select
                      id="input-kode-klasifikasi"
                      value={kodeKlasifikasi}
                      onChange={(e) => setKodeKlasifikasi(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono font-bold text-blue-600 dark:text-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-all cursor-pointer"
                    >
                      {KLASIFIKASI_SURAT.map((item) => (
                        <option key={item.kode} value={item.kode}>
                          {item.kode} - {item.judul}
                        </option>
                      ))}
                    </select>
                  )}
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                    Kode ini disisipkan otomatis ke format nomor surat.
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Autocomplete Helpers */}
            {(jenisSurat === 'Surat Tugas' || jenisSurat === 'Surat Perintah Perjalanan Dinas (SPPD)' || jenisSurat === 'Surat Pengantar') && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-2.5 rounded-lg bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200/60 dark:border-sky-800/60"
              >
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-sky-900 dark:text-sky-300 mb-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                  <span>Pilih Cepat Guru / Pelaksana Tugas:</span>
                </div>
                <select
                  id="quick-pick-guru"
                  value={selectedGuruId}
                  onChange={(e) => handleSelectGuru(e.target.value)}
                  className="w-full text-xs font-medium px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-sky-300 dark:border-sky-700 rounded-md text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
                >
                  <option value="">-- Pilih Guru / Tenaga Pendidik --</option>
                  {daftarGuru.filter(g => g.statusAktif).map((guru) => (
                    <option key={guru.id} value={guru.id}>
                      {guru.nama} - {guru.jabatan} ({guru.pangkatGolongan || 'Golongan III/a'} | NIP: {guru.nip || '-'})
                    </option>
                  ))}
                </select>
              </motion.div>
            )}

            {(jenisSurat === 'Surat Keterangan Aktif Sekolah' || jenisSurat === 'Surat Panggilan Orang Tua') && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-2.5 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/60"
              >
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-900 dark:text-indigo-300 mb-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Pilih Cepat dari Data Siswa:</span>
                </div>
                <select
                  id="quick-pick-siswa"
                  value={selectedSiswaId}
                  onChange={(e) => handleSelectSiswa(e.target.value)}
                  className="w-full text-xs font-medium px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-indigo-300 dark:border-indigo-700 rounded-md text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">-- Pilih Siswa --</option>
                  {daftarSiswa.filter(s => s.statusAktif).map((siswa) => (
                    <option key={siswa.id} value={siswa.id}>
                      {siswa.nama} - {siswa.kelas} {siswa.nis ? `(NIS: ${siswa.nis})` : ''} {siswa.nisn ? `[NISN: ${siswa.nisn}]` : ''}
                    </option>
                  ))}
                </select>
              </motion.div>
            )}

            {/* Step 2: Data Penerima & Perihal */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                2. Data Penerima & Perihal Surat
              </div>

              {/* Tanggal Surat & Penerima */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label 
                    htmlFor="input-tanggal-surat"
                    className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1"
                  >
                    Tanggal Dikeluarkan Surat <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="input-tanggal-surat"
                    type="date"
                    required
                    value={tanggalSurat || ''}
                    onChange={(e) => setTanggalSurat(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-900"
                  />
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                    {formatIndonesianDate(tanggalSurat)}
                  </span>
                </div>

                <div>
                  <label 
                    htmlFor="input-nama-penerima"
                    className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1"
                  >
                    Nama Penerima / Pegawai yang Ditugaskan <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="input-nama-penerima"
                    type="text"
                    required
                    value={namaPenerima || ''}
                    onChange={(e) => setNamaPenerima(e.target.value)}
                    placeholder="Contoh: Drs. H. Ahmad Fauzi, M.Pd."
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-900"
                  />
                </div>
              </div>

              {/* NIS / NIP & Kelas / Jabatan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label 
                    htmlFor="input-nis-nip"
                    className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1"
                  >
                    NIS / NIP / NUPTK
                  </label>
                  <input
                    id="input-nis-nip"
                    type="text"
                    value={nisNip || ''}
                    onChange={(e) => setNisNip(e.target.value)}
                    placeholder="Contoh: 19820415 200801 1 012"
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-xs font-mono font-medium focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-900"
                  />
                </div>

                <div>
                  <label 
                    htmlFor="input-kelas-jabatan"
                    className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1"
                  >
                    Jabatan / Tugas / Kelas
                  </label>
                  <input
                    id="input-kelas-jabatan"
                    type="text"
                    value={kelasJabatan || ''}
                    onChange={(e) => setKelasJabatan(e.target.value)}
                    placeholder="Contoh: Guru Pembina / Koordinator Kurikulum"
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-900"
                  />
                </div>
              </div>

              {/* Pangkat / Golongan for Surat Tugas / SPPD */}
              {isSppdApplicable && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label 
                      htmlFor="input-pangkat-gol"
                      className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1"
                    >
                      Pangkat / Golongan Ruang
                    </label>
                    <input
                      id="input-pangkat-gol"
                      type="text"
                      value={pangkatGolongan || ''}
                      onChange={(e) => setPangkatGolongan(e.target.value)}
                      placeholder="Contoh: Penata Muda / III a"
                      className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-900"
                    />
                  </div>

                  <div>
                    <label 
                      htmlFor="input-tingkat-biaya"
                      className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1"
                    >
                      Tingkat Biaya Perjalanan Dinas
                    </label>
                    <select
                      id="input-tingkat-biaya"
                      value={tingkatBiaya}
                      onChange={(e) => setTingkatBiaya(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
                    >
                      <option value="Tingkat C">Tingkat C (Guru / Staf / Pelaksana)</option>
                      <option value="Tingkat B">Tingkat B (Kepala Sekolah / Pejabat Eselon)</option>
                      <option value="Tingkat A">Tingkat A (Pimpinan Lembaga / Eselon II)</option>
                      <option value="Tingkat D">Tingkat D (Pegawai Golongan I & II)</option>
                      <option value="Tanpa Biaya">Tanpa Biaya (Non-Budgeter)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Nama Orang Tua (if relevant) */}
              {(jenisSurat === 'Surat Keterangan Aktif Sekolah' || jenisSurat === 'Surat Panggilan Orang Tua') && (
                <div>
                  <label 
                    htmlFor="input-nama-orangtua"
                    className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1"
                  >
                    Nama Orang Tua / Wali Siswa
                  </label>
                  <input
                    id="input-nama-orangtua"
                    type="text"
                    value={namaOrangTua || ''}
                    onChange={(e) => setNamaOrangTua(e.target.value)}
                    placeholder="Contoh: Bambang Pratama"
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-900"
                  />
                </div>
              )}

              {/* Alamat Penerima */}
              <div>
                <label 
                  htmlFor="input-alamat-penerima"
                  className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1"
                >
                  Alamat Penerima / Unit Kerja
                </label>
                <input
                  id="input-alamat-penerima"
                  type="text"
                  value={alamatPenerima || ''}
                  onChange={(e) => setAlamatPenerima(e.target.value)}
                  placeholder="Contoh: Jl. Percetakan Negara No. 12 / Tempat"
                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-900"
                />
              </div>

              {/* Keperluan */}
              <div>
                <label 
                  htmlFor="input-keperluan"
                  className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1"
                >
                  Keperluan / Maksud Perjalanan Dinas / Perihal <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="input-keperluan"
                  required
                  rows={2}
                  value={keperluan || ''}
                  onChange={(e) => setKeperluan(e.target.value)}
                  placeholder="Rincian agenda atau dasar penugasan..."
                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-900"
                />
              </div>
            </div>

            {/* Step 3: Date & Time Picker */}
            {(jenisSurat === 'Surat Tugas' || jenisSurat === 'Surat Perintah Perjalanan Dinas (SPPD)' || jenisSurat === 'Surat Undangan' || jenisSurat === 'Surat Panggilan Orang Tua') && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    <span>3. Jadwal & Tempat Pelaksanaan</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setIsRangeDate(false)}
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer transition-colors ${
                        !isRangeDate 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      1 Hari
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsRangeDate(true)}
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer transition-colors ${
                        isRangeDate 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Rentang Hari (Multi-Hari)
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                  {/* Date Pickers */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label 
                        htmlFor="input-tgl-mulai"
                        className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-1"
                      >
                        {isRangeDate ? 'Tanggal Mulai / Berangkat' : 'Hari / Tanggal Pelaksanaan'}
                      </label>
                      <input
                        id="input-tgl-mulai"
                        type="date"
                        value={tanggalMulai || ''}
                        onChange={(e) => {
                          setTanggalMulai(e.target.value);
                          setTanggalBerangkat(e.target.value);
                        }}
                        className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600"
                      />
                    </div>

                    {isRangeDate && (
                      <div>
                        <label 
                          htmlFor="input-tgl-selesai"
                          className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-1"
                        >
                          Tanggal Selesai / Harus Kembali
                        </label>
                        <input
                          id="input-tgl-selesai"
                          type="date"
                          value={tanggalSelesai || ''}
                          onChange={(e) => {
                            setTanggalSelesai(e.target.value);
                            setTanggalKembali(e.target.value);
                          }}
                          className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600"
                        />
                      </div>
                    )}
                  </div>

                  {/* Calculated Day & Date Banner */}
                  <div className="flex items-center gap-2 p-2 bg-blue-50/70 dark:bg-blue-950/40 rounded-md border border-blue-200/60 dark:border-blue-800/60">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <div className="text-[11px] font-semibold text-blue-950 dark:text-blue-200">
                      Format Kalimat: <span className="font-bold">{tanggalKegiatanText}</span>
                    </div>
                  </div>

                  {/* Time Pickers & Quick Presets (Only for non-SPPD standalone or relevant) */}
                  <div className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase">
                        Waktu Pelaksanaan
                      </span>
                      <label className="flex items-center gap-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isSampaiSelesai}
                          onChange={(e) => setIsSampaiSelesai(e.target.checked)}
                          className="rounded text-blue-600"
                        />
                        <span>s.d. Selesai</span>
                      </label>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label htmlFor="input-jam-mulai" className="block text-[9px] text-slate-500 mb-0.5">
                          Jam Mulai
                        </label>
                        <input
                          id="input-jam-mulai"
                          type="time"
                          value={jamMulai || '08:00'}
                          onChange={(e) => setJamMulai(e.target.value)}
                          className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-mono font-semibold"
                        />
                      </div>

                      <div>
                        <label htmlFor="input-jam-selesai" className="block text-[9px] text-slate-500 mb-0.5">
                          Jam Selesai
                        </label>
                        <input
                          id="input-jam-selesai"
                          type="time"
                          disabled={isSampaiSelesai}
                          value={jamSelesai || '12:00'}
                          onChange={(e) => setJamSelesai(e.target.value)}
                          className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-mono font-semibold disabled:opacity-50"
                        />
                      </div>

                      <div>
                        <label htmlFor="select-zona-waktu" className="block text-[9px] text-slate-500 mb-0.5">
                          Zona Waktu
                        </label>
                        <select
                          id="select-zona-waktu"
                          value={zonaWaktu || 'WIB'}
                          onChange={(e) => setZonaWaktu(e.target.value as any)}
                          className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-semibold"
                        >
                          <option value="WIB">WIB</option>
                          <option value="WITA">WITA</option>
                          <option value="WIT">WIT</option>
                        </select>
                      </div>
                    </div>

                    {/* Quick Presets */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {WAKTU_PRESETS.map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => {
                            setJamMulai(preset.jamMulai || '08:00');
                            setJamSelesai(preset.jamSelesai || '12:00');
                            setIsSampaiSelesai(preset.isSampaiSelesai);
                          }}
                          className="px-2 py-0.5 text-[10px] font-medium bg-slate-200/80 dark:bg-slate-700 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded text-slate-700 dark:text-slate-200 cursor-pointer transition-colors"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>

                    <div className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                      Format Waktu: <strong className="text-blue-600 dark:text-blue-400">{waktuText}</strong>
                    </div>
                  </div>

                  {/* Tempat Kegiatan */}
                  <div>
                    <label 
                      htmlFor="input-tempat"
                      className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-1"
                    >
                      Tempat / Lokasi Kegiatan
                    </label>
                    <input
                      id="input-tempat"
                      type="text"
                      value={tempat || ''}
                      onChange={(e) => {
                        setTempat(e.target.value);
                        if (!tempatTujuan) setTempatTujuan(e.target.value);
                      }}
                      placeholder="Contoh: Balai Penjaminan Mutu Pendidikan (BPMP) / Aula Dinas"
                      className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: SPPD & Lembar Visum Perjalanan Dinas (When applicable) */}
            {isSppdApplicable && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <FileSignature className="w-3.5 h-3.5 text-blue-600" />
                    <span>4. Kelengkapan Lembar SPPD & Visum Kedinasan</span>
                  </div>
                  
                  <label className="flex items-center gap-2 text-xs font-bold text-blue-700 dark:text-blue-300 cursor-pointer bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 px-2.5 py-1 rounded-md">
                    <input
                      type="checkbox"
                      checked={sertakanSppd}
                      onChange={(e) => setSertakanSppd(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span>Sertakan SPPD & Visum</span>
                  </label>
                </div>

                <AnimatePresence>
                  {sertakanSppd && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="p-3 bg-blue-50/40 dark:bg-slate-800/80 rounded-xl border border-blue-200/80 dark:border-blue-900/50 space-y-3"
                    >
                      <div className="text-[11px] text-slate-600 dark:text-slate-300 bg-white/80 dark:bg-slate-900/80 p-2 rounded-lg border border-blue-100 dark:border-slate-700">
                        Dokumen ini menghasilkan <strong>Lembar I (Rincian SPPD)</strong> dan <strong>Lembar II (Visum Tanda Tangan Pejabat Tempat Tujuan)</strong> agar sah ditandatangani saat tiba di lokasi.
                      </div>

                      {/* Alat Angkut & Tempat Tujuan */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label 
                            htmlFor="input-alat-angkut"
                            className="block text-[10px] font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1"
                          >
                            <Car className="w-3 h-3 text-blue-600" />
                            <span>Alat Angkutan yang Digunakan</span>
                          </label>
                          <select
                            id="input-alat-angkut"
                            value={alatAngkut}
                            onChange={(e) => setAlatAngkut(e.target.value)}
                            className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-semibold"
                          >
                            <option value="Kendaraan Umum / Angkutan Darat">Kendaraan Umum / Angkutan Darat</option>
                            <option value="Kendaraan Dinas / Operasional Sekolah">Kendaraan Dinas / Operasional Sekolah</option>
                            <option value="Kereta Api / Commuter Line">Kereta Api / KRL / MRT</option>
                            <option value="Pesawat Udara">Pesawat Udara</option>
                            <option value="Kendaraan Pribadi">Kendaraan Pribadi</option>
                          </select>
                        </div>

                        <div>
                          <label 
                            htmlFor="input-tempat-tujuan"
                            className="block text-[10px] font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1"
                          >
                            <MapPin className="w-3 h-3 text-blue-600" />
                            <span>Tempat Tujuan Dinas</span>
                          </label>
                          <input
                            id="input-tempat-tujuan"
                            type="text"
                            value={tempatTujuan}
                            onChange={(e) => setTempatTujuan(e.target.value)}
                            placeholder="Contoh: Balai Penjaminan Mutu Pendidikan (BPMP)"
                            className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-medium"
                          />
                        </div>
                      </div>

                      {/* Tempat Berangkat & Lama Hari */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label 
                            htmlFor="input-tempat-berangkat"
                            className="block text-[10px] font-semibold text-slate-700 dark:text-slate-300 mb-1"
                          >
                            Tempat Berangkat
                          </label>
                          <input
                            id="input-tempat-berangkat"
                            type="text"
                            value={tempatBerangkat}
                            onChange={(e) => setTempatBerangkat(e.target.value)}
                            placeholder="Nama Sekolah / Kabupaten Asal"
                            className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-medium"
                          />
                        </div>

                        <div>
                          <label 
                            htmlFor="input-lama-hari"
                            className="block text-[10px] font-semibold text-slate-700 dark:text-slate-300 mb-1"
                          >
                            Lamanya Perjalanan Dinas
                          </label>
                          <input
                            id="input-lama-hari"
                            type="text"
                            value={lamaHari}
                            onChange={(e) => setLamaHari(e.target.value)}
                            placeholder="Contoh: 1 (Satu) Hari / 3 (Tiga) Hari"
                            className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-medium"
                          />
                        </div>
                      </div>

                      {/* Pembebanan Anggaran & Pengikut */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label 
                            htmlFor="input-instansi-anggaran"
                            className="block text-[10px] font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1"
                          >
                            <DollarSign className="w-3 h-3 text-emerald-600" />
                            <span>Pembebanan Anggaran (Instansi)</span>
                          </label>
                          <input
                            id="input-instansi-anggaran"
                            type="text"
                            value={instansiAnggaran}
                            onChange={(e) => setInstansiAnggaran(e.target.value)}
                            placeholder="Contoh: Dana BOS SMP Negeri 1 / DPA Dinas"
                            className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-medium"
                          />
                        </div>

                        <div>
                          <label 
                            htmlFor="input-mata-anggaran"
                            className="block text-[10px] font-semibold text-slate-700 dark:text-slate-300 mb-1"
                          >
                            Kode Rekening / Mata Anggaran
                          </label>
                          <input
                            id="input-mata-anggaran"
                            type="text"
                            value={mataAnggaran}
                            onChange={(e) => setMataAnggaran(e.target.value)}
                            placeholder="Contoh: 5.1.02.04.01.0001 (Belanja Perjalanan Dinas)"
                            className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-mono font-medium"
                          />
                        </div>
                      </div>

                      {/* Pengikut */}
                      <div>
                        <label 
                          htmlFor="input-pengikut"
                          className="block text-[10px] font-semibold text-slate-700 dark:text-slate-300 mb-1"
                        >
                          Pengikut / Anggota Tim (Jika ada)
                        </label>
                        <input
                          id="input-pengikut"
                          type="text"
                          value={pengikut}
                          onChange={(e) => setPengikut(e.target.value)}
                          placeholder="Tulis '-' jika sendiri, atau sebutkan nama pengikut"
                          className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-medium"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Menghadap Kepada for Surat Panggilan Orang Tua */}
            {jenisSurat === 'Surat Panggilan Orang Tua' && (
              <div>
                <label 
                  htmlFor="input-menghadap"
                  className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1"
                >
                  Menghadap Kepada
                </label>
                <input
                  id="input-menghadap"
                  type="text"
                  value={menghadapKepada || ''}
                  onChange={(e) => setMenghadapKepada(e.target.value)}
                  placeholder="Contoh: Kepala Sekolah / Guru BK / Wali Kelas"
                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-900"
                />
              </div>
            )}

            {/* Keterangan Tambahan / Penutup */}
            <div>
              <label 
                htmlFor="input-keterangan"
                className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1"
              >
                Keterangan / Paragraf Penutup
              </label>
              <textarea
                id="input-keterangan"
                rows={2}
                value={keterangan || ''}
                onChange={(e) => setKeterangan(e.target.value)}
                placeholder="Keterangan penutup surat..."
                className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-900"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                id="form-submit-create-letter-btn"
                type="submit"
                disabled={isProcessing}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-lg shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-75"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{loadingText}</span>
                  </div>
                ) : (
                  <>
                    <FileCheck className="w-4 h-4" />
                    <span>BUAT SURAT & SIMPAN KE ARSIP</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Live Paper Preview (5 cols on large) */}
        <div className="lg:col-span-5 sticky top-16 space-y-2">
          <div className="bg-slate-900 dark:bg-slate-900 text-white px-3 py-2 rounded-lg flex items-center justify-between shadow-xs border border-slate-800">
            <div className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-sky-400" />
              <span className="text-[11px] font-bold uppercase tracking-wider">Pratinjau Kertas A4 Kedinasan</span>
            </div>
            <span className="text-[10px] text-slate-300 font-mono bg-slate-800 px-1.5 py-0.5 rounded">
              {kodeKlasifikasi}
            </span>
          </div>

          {/* Paper View scaled down */}
          <div className="bg-slate-200/90 dark:bg-slate-950/80 p-2 sm:p-3 rounded-xl border border-slate-300 dark:border-slate-800 overflow-hidden max-h-[780px] overflow-y-auto shadow-inner">
            <div className="origin-top scale-[0.66] sm:scale-[0.78] lg:scale-[0.68] xl:scale-[0.80] transition-transform -my-14 -mx-10 sm:-my-10 sm:-mx-6 flex justify-center">
              <LetterDocumentPreview surat={previewRecord} />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
