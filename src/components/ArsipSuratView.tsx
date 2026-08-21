import React, { useState } from 'react';
import { 
  Search, 
  Eye, 
  Trash2, 
  FolderTree, 
  FileText, 
  Folder,
  FolderOpen,
  AlertTriangle,
  X,
  Printer
} from 'lucide-react';
import { motion } from 'motion/react';
import { SuratRecord, JenisSurat } from '../types';
import { exportToWord, printLetter } from '../services/pdfGenerator';

interface ArsipSuratViewProps {
  suratList: SuratRecord[];
  onPreviewSurat: (surat: SuratRecord) => void;
  onDeleteSurat: (id: string) => void;
  onUpdateStatus: (id: string, status: SuratRecord['status']) => void;
  onNavigateCreate: () => void;
}

export const ArsipSuratView: React.FC<ArsipSuratViewProps> = ({
  suratList,
  onPreviewSurat,
  onDeleteSurat,
  onUpdateStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJenis, setSelectedJenis] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'drive'>('table');
  const [suratToDelete, setSuratToDelete] = useState<SuratRecord | null>(null);

  // Filtered letters
  const filteredList = suratList.filter(s => {
    const matchSearch = 
      s.nomorSurat.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.namaPenerima.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.keperluan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.jenisSurat.toLowerCase().includes(searchTerm.toLowerCase());

    const matchJenis = selectedJenis === 'ALL' || s.jenisSurat === selectedJenis;
    const matchStatus = selectedStatus === 'ALL' || s.status === selectedStatus;

    return matchSearch && matchJenis && matchStatus;
  });

  const confirmDelete = () => {
    if (suratToDelete) {
      onDeleteSurat(suratToDelete.id);
      setSuratToDelete(null);
    }
  };

  const jenisOptions: JenisSurat[] = [
    'Surat Tugas',
    'Surat Perintah Perjalanan Dinas (SPPD)',
    'Surat Undangan',
    'Surat Keterangan Aktif Sekolah',
    'Surat Panggilan Orang Tua',
    'Surat Pengantar',
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 6 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.25 }}
      className="space-y-3.5 pb-8"
    >
      {/* Header & Controls */}
      <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">Arsip Dokumen Surat</h2>
            <span className="bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800 text-[11px] font-mono font-semibold px-2 py-0.2 rounded">
              {filteredList.length}/{suratList.length} Surat
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Seluruh berkas surat resmi & SPPD tersimpan rapi dan dapat dicetak atau diunduh ulang.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="inline-flex p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold">
            <button
              id="view-mode-table-btn"
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-xs font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Tabel Arsip
            </button>
            <button
              id="view-mode-drive-btn"
              onClick={() => setViewMode('drive')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                viewMode === 'drive' ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-xs font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <FolderTree className="w-3 h-3" />
              <span>Struktur Drive</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-2.5 sm:p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2 items-center">
        {/* Search */}
        <div className="lg:col-span-6 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            id="archive-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nomor surat, penerima, perihal..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-900"
          />
        </div>

        {/* Filter Jenis Surat */}
        <div className="lg:col-span-3">
          <select
            id="archive-filter-jenis"
            value={selectedJenis}
            onChange={(e) => setSelectedJenis(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-blue-600"
          >
            <option value="ALL">Semua Jenis Surat</option>
            {jenisOptions.map((j) => (
              <option key={j} value={j}>{j}</option>
            ))}
          </select>
        </div>

        {/* Filter Status */}
        <div className="lg:col-span-3">
          <select
            id="archive-filter-status"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-blue-600"
          >
            <option value="ALL">Semua Status</option>
            <option value="Tercatat">Tercatat</option>
            <option value="Terkirim">Terkirim</option>
            <option value="Selesai">Selesai</option>
            <option value="Dibatalkan">Dibatalkan</option>
          </select>
        </div>
      </div>

      {/* View Mode 1: Table */}
      {viewMode === 'table' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold text-[11px] uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-2.5 px-3 w-10 text-center">No</th>
                  <th className="py-2.5 px-3">Nomor Surat</th>
                  <th className="py-2.5 px-3">Jenis Surat</th>
                  <th className="py-2.5 px-3">Penerima</th>
                  <th className="py-2.5 px-3">Tanggal</th>
                  <th className="py-2.5 px-3">Keperluan</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
                {filteredList.map((surat, index) => (
                  <tr key={surat.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-2 px-3 text-center text-slate-400 dark:text-slate-500 font-mono text-[11px]">
                      {index + 1}
                    </td>
                    <td className="py-2 px-3">
                      <div className="font-mono font-bold text-blue-900 dark:text-blue-300 whitespace-nowrap text-xs">
                        {surat.nomorSurat}
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                        Urut #{surat.nomorUrut}
                      </div>
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800">
                        <span>{surat.jenisSurat}</span>
                        {surat.sertakanSppd && surat.jenisSurat === 'Surat Tugas' && (
                          <span className="text-[9px] bg-blue-600 text-white px-1 py-0.2 rounded font-bold">+SPPD</span>
                        )}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">{surat.namaPenerima}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">{surat.kelasJabatan || '-'}</div>
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                      {surat.tanggalSurat}
                    </td>
                    <td className="py-2 px-3 max-w-xs">
                      <p className="line-clamp-2 text-[11px] text-slate-600 dark:text-slate-400 leading-tight" title={surat.keperluan}>
                        {surat.keperluan}
                      </p>
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap">
                      <select
                        id={`archive-status-change-${surat.id}`}
                        value={surat.status}
                        onChange={(e) => onUpdateStatus(surat.id, e.target.value as SuratRecord['status'])}
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border focus:outline-none cursor-pointer ${
                          surat.status === 'Selesai'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                            : surat.status === 'Terkirim'
                            ? 'bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800'
                            : 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                        }`}
                      >
                        <option value="Tercatat">Tercatat</option>
                        <option value="Terkirim">Terkirim</option>
                        <option value="Selesai">Selesai</option>
                        <option value="Dibatalkan">Dibatalkan</option>
                      </select>
                    </td>
                    <td className="py-2 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          id={`archive-preview-btn-${surat.id}`}
                          onClick={() => onPreviewSurat(surat)}
                          className="p-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded transition-colors cursor-pointer"
                          title="Buka / Preview PDF"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          id={`archive-print-btn-${surat.id}`}
                          onClick={() => printLetter(surat)}
                          className="p-1 text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded transition-colors cursor-pointer"
                          title="Cetak Surat Langsung (Tanpa Header/Footer Browser)"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          id={`archive-word-btn-${surat.id}`}
                          onClick={() => exportToWord(surat)}
                          className="p-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer"
                          title="Download Google Docs / Word"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                        <button
                          id={`archive-delete-btn-${surat.id}`}
                          onClick={() => setSuratToDelete(surat)}
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50 rounded transition-colors cursor-pointer"
                          title="Hapus dari Arsip"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredList.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-slate-400 dark:text-slate-500">
                      <FileText className="w-6 h-6 mx-auto mb-1.5 text-slate-300 dark:text-slate-600" />
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Tidak ada surat ditemukan</p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Coba sesuaikan kata kunci pencarian atau filter jenis surat.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View Mode 2: Hierarki Google Drive */}
      {viewMode === 'drive' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
            <FolderOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">Hierarki Folder Google Drive (SURATKU - Arsip Surat)</h3>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Di Google Drive, setiap surat diarsipkan otomatis berdasarkan <strong>Tahun &rarr; Bulan &rarr; Jenis Surat</strong>:
          </p>

          <div className="p-3 rounded-lg bg-slate-900 text-slate-100 font-mono text-[11px] space-y-1.5 border border-slate-800">
            <div className="text-sky-400 flex items-center gap-1.5 font-bold">
              <Folder className="w-3.5 h-3.5" />
              <span>SURATKU - Arsip Surat /</span>
            </div>
            <div className="pl-5 text-amber-300 flex items-center gap-1.5">
              <Folder className="w-3 h-3" />
              <span>└── 2026 /</span>
            </div>
            <div className="pl-10 text-emerald-300 flex items-center gap-1.5">
              <Folder className="w-3 h-3" />
              <span>└── Agustus /</span>
            </div>
            {jenisOptions.map((j) => (
              <div key={j} className="pl-16 text-slate-300 flex items-center justify-between py-0.5 hover:text-white">
                <div className="flex items-center gap-1.5">
                  <Folder className="w-3 h-3 text-sky-400" />
                  <span>└── {j} /</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  {suratList.filter(s => s.jenisSurat === j).length} Dokumen (.pdf & .gdoc)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* In-App Confirmation Modal for Safe Deletion */}
      {suratToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full shadow-2xl p-5 space-y-4"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Hapus Arsip Surat?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Surat dengan nomor <strong className="text-slate-800 dark:text-slate-200 font-mono">{suratToDelete.nomorSurat}</strong> untuk <strong className="text-slate-800 dark:text-slate-200">{suratToDelete.namaPenerima}</strong> akan dihapus dari arsip lokal sekolah.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSuratToDelete(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSuratToDelete(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Hapus Arsip</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};
