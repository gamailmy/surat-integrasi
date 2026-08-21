import React from 'react';
import { 
  FileText, 
  Calendar, 
  Clock, 
  Hash, 
  Plus, 
  ArrowRight, 
  Eye, 
  Sparkles,
  CheckCircle2,
  Car
} from 'lucide-react';
import { motion } from 'motion/react';
import { SuratRecord, JenisSurat, DataSekolah } from '../types';

interface DashboardViewProps {
  suratList: SuratRecord[];
  sekolah: DataSekolah;
  onNavigateCreate: (initialType?: JenisSurat) => void;
  onNavigateArchive: () => void;
  onNavigateGuru: () => void;
  onNavigateSiswa: () => void;
  onPreviewSurat: (surat: SuratRecord) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  suratList,
  sekolah,
  onNavigateCreate,
  onNavigateArchive,
  onPreviewSurat,
}) => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const todayStr = now.toISOString().split('T')[0];

  // 1. Total Surat
  const totalSurat = suratList.length;

  // 2. Surat Bulan Ini
  const suratBulanIni = suratList.filter(s => {
    const d = new Date(s.tanggalSurat);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).length;

  // 3. Surat Hari Ini
  const suratHariIni = suratList.filter(s => s.tanggalSurat === todayStr).length;

  // 4. Nomor Surat Terakhir
  const nomorTerakhir = suratList.length > 0 ? suratList[0].nomorSurat : 'Belum Ada';

  const jenisSuratPresets: { type: JenisSurat; title: string; desc: string; iconBg: string; badge?: string }[] = [
    {
      type: 'Surat Tugas',
      title: 'Surat Tugas & SPPD',
      desc: 'Penugasan dinas, workshop & lembar SPPD',
      iconBg: 'bg-blue-600 text-white',
      badge: 'Multi-Lembar',
    },
    {
      type: 'Surat Perintah Perjalanan Dinas (SPPD)',
      title: 'SPPD & Visum',
      desc: 'Format rincian dinas & tanda tangan visum lokasi',
      iconBg: 'bg-teal-600 text-white',
      badge: 'Resmi',
    },
    {
      type: 'Surat Undangan',
      title: 'Surat Undangan',
      desc: 'Rapat dinas, wali murid & komite sekolah',
      iconBg: 'bg-indigo-600 text-white',
    },
    {
      type: 'Surat Keterangan Aktif Sekolah',
      title: 'Keterangan Aktif',
      desc: 'Siswa aktif sekolah & keperluan beasiswa',
      iconBg: 'bg-emerald-600 text-white',
    },
    {
      type: 'Surat Panggilan Orang Tua',
      title: 'Panggilan Orang Tua',
      desc: 'Konseling BK & pembinaan siswa',
      iconBg: 'bg-amber-600 text-white',
    },
    {
      type: 'Surat Pengantar',
      title: 'Surat Pengantar',
      desc: 'Pengantar berkas usulan ke dinas',
      iconBg: 'bg-purple-600 text-white',
    },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 6 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.25 }}
      className="space-y-4"
    >
      {/* Welcome Banner with Call to Action */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.99 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 rounded-xl p-4 sm:p-5 text-white shadow-sm relative overflow-hidden"
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/15 text-sky-100 text-[11px] font-medium mb-1.5 border border-white/20">
              <Sparkles className="w-3 h-3 text-sky-300" />
              <span>Sistem Administrasi Persuratan & SPPD Digital</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight">
              Selamat Datang di SURATKU
            </h2>
            <p className="text-sky-100 text-xs sm:text-sm mt-1 leading-relaxed font-normal">
              Buat surat dinas, surat tugas guru, lembar SPPD beserta Visum kedinasan siap tanda tangan pejabat tujuan dalam hitungan detik.
            </p>
          </div>

          <button
            id="dashboard-hero-create-btn"
            onClick={() => onNavigateCreate()}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-blue-700 hover:bg-sky-50 font-bold rounded-lg shadow-sm hover:scale-[1.02] transition-all text-xs sm:text-sm cursor-pointer shrink-0 active:scale-95"
          >
            <div className="w-5 h-5 rounded bg-blue-600 text-white flex items-center justify-center">
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <span>+ BUAT SURAT BARU</span>
          </button>
        </div>
      </motion.div>

      {/* 4 Kartu Statistik */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Total Surat */}
        <div 
          id="stat-total-surat"
          className="bg-white dark:bg-slate-900 rounded-xl p-3.5 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Surat
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 tracking-tight">
              {totalSurat}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">dokumen</span>
          </div>
          <div className="mt-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Tersimpan di Arsip</span>
          </div>
        </div>

        {/* Card 2: Surat Bulan Ini */}
        <div 
          id="stat-surat-bulan-ini"
          className="bg-white dark:bg-slate-900 rounded-xl p-3.5 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Surat Bulan Ini
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 tracking-tight">
              {suratBulanIni}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">surat</span>
          </div>
          <div className="mt-1.5 text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1">
            <span>Bulan Ini ({now.toLocaleString('id-ID', { month: 'short', year: 'numeric' })})</span>
          </div>
        </div>

        {/* Card 3: Surat Hari Ini */}
        <div 
          id="stat-surat-hari-ini"
          className="bg-white dark:bg-slate-900 rounded-xl p-3.5 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Surat Hari Ini
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 tracking-tight">
              {suratHariIni}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">dibuat hari ini</span>
          </div>
          <div className="mt-1.5 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
            Otomatis terupdate
          </div>
        </div>

        {/* Card 4: Nomor Surat Terakhir */}
        <div 
          id="stat-nomor-terakhir"
          className="bg-white dark:bg-slate-900 rounded-xl p-3.5 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Nomor Terakhir
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Hash className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xs sm:text-sm font-bold text-blue-900 dark:text-blue-300 font-mono truncate" title={nomorTerakhir}>
              {nomorTerakhir}
            </div>
          </div>
          <div className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
            <span>Kode: <strong className="text-slate-700 dark:text-slate-300 font-mono">{sekolah.kodeSekolah}</strong></span>
          </div>
        </div>
      </div>

      {/* Quick Access to Template Surat */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">Pilihan Cepat Format & Template Surat</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Klik jenis surat untuk langsung membuka form otomatis</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2.5">
          {jenisSuratPresets.map((preset, idx) => (
            <motion.button
              key={preset.type}
              id={`quick-preset-${idx}`}
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigateCreate(preset.type)}
              className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-xs transition-all text-left group cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-7 h-7 rounded-lg ${preset.iconBg} flex items-center justify-center group-hover:scale-105 transition-transform shadow-2xs`}>
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  {preset.badge && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                      {preset.badge}
                    </span>
                  )}
                </div>
                <div className="font-bold text-slate-900 dark:text-slate-100 text-xs group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {preset.title}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug line-clamp-2">
                  {preset.desc}
                </p>
              </div>
              <div className="mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-800 flex items-center text-[11px] font-semibold text-blue-600 dark:text-blue-400 gap-1 group-hover:translate-x-0.5 transition-transform">
                <span>Pilih Format</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Tabel Surat Terbaru */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <span>Surat Terbaru</span>
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded">
                5 Terakhir
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Daftar arsip surat resmi yang baru dibuat</p>
          </div>

          <button
            id="dashboard-see-all-archive-btn"
            onClick={onNavigateArchive}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            <span>Buka Semua Arsip</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold text-[11px] uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-2.5 px-3">Nomor Surat</th>
                <th className="py-2.5 px-3">Jenis Surat</th>
                <th className="py-2.5 px-3">Nama Penerima</th>
                <th className="py-2.5 px-3">Tanggal</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
              {suratList.slice(0, 5).map((surat) => (
                <tr key={surat.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-2 px-3 font-mono font-bold text-blue-900 dark:text-blue-300 text-xs">
                    {surat.nomorSurat}
                  </td>
                  <td className="py-2 px-3">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800">
                      {surat.jenisSurat}
                    </span>
                  </td>
                  <td className="py-2 px-3 font-semibold text-slate-900 dark:text-slate-100">
                    <div>{surat.namaPenerima}</div>
                    {surat.kelasJabatan && (
                      <span className="text-[10px] text-slate-400 font-normal">{surat.kelasJabatan}</span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-slate-500 dark:text-slate-400 font-mono text-[11px] whitespace-nowrap">
                    {surat.tanggalSurat}
                  </td>
                  <td className="py-2 px-3">
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                      surat.status === 'Selesai'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : surat.status === 'Terkirim'
                        ? 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                    }`}>
                      {surat.status}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-center">
                    <button
                      id={`recent-surat-preview-${surat.id}`}
                      onClick={() => onPreviewSurat(surat)}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 dark:hover:bg-blue-600 hover:text-white text-slate-700 dark:text-slate-200 font-semibold rounded text-[11px] transition-colors cursor-pointer"
                      title="Lihat & Download PDF"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Lihat PDF</span>
                    </button>
                  </td>
                </tr>
              ))}
              {suratList.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400 dark:text-slate-500 text-xs">
                    Belum ada surat yang dibuat. Klik tombol "+ Buat Surat Baru" di atas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};
