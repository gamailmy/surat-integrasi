import React, { useState, useRef } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  X,
  Phone,
  Briefcase,
  Award,
  FileSpreadsheet,
  Download,
  Upload,
  AlertCircle
} from 'lucide-react';
import { DataGuru } from '../types';
import { 
  parseGuruExcelFile, 
  downloadGuruTemplate, 
  exportGuruToExcel 
} from '../services/excelService';

interface DataGuruViewProps {
  daftarGuru: DataGuru[];
  onSaveGuru: (guru: DataGuru) => void;
  onDeleteGuru: (id: string) => void;
  onImportGuru?: (gurus: DataGuru[], mode: 'merge' | 'replace') => void;
}

export const DataGuruView: React.FC<DataGuruViewProps> = ({
  daftarGuru,
  onSaveGuru,
  onDeleteGuru,
  onImportGuru,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAktif, setFilterAktif] = useState<'ALL' | 'AKTIF' | 'NONAKTIF'>('ALL');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGuru, setEditingGuru] = useState<DataGuru | null>(null);
  const [guruToDelete, setGuruToDelete] = useState<DataGuru | null>(null);

  // Import State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importedPreview, setImportedPreview] = useState<DataGuru[]>([]);
  const [importFileName, setImportFileName] = useState('');
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [importError, setImportError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form fields
  const [nama, setNama] = useState('');
  const [nip, setNip] = useState('');
  const [nuptk, setNuptk] = useState('');
  const [jabatan, setJabatan] = useState('');
  const [pangkatGolongan, setPangkatGolongan] = useState('');
  const [statusAktif, setStatusAktif] = useState(true);
  const [telepon, setTelepon] = useState('');

  const openAddModal = () => {
    setEditingGuru(null);
    setNama('');
    setNip('');
    setNuptk('');
    setJabatan('');
    setPangkatGolongan('Penata Muda / III a');
    setStatusAktif(true);
    setTelepon('');
    setIsModalOpen(true);
  };

  const openEditModal = (guru: DataGuru) => {
    setEditingGuru(guru);
    setNama(guru.nama || '');
    setNip(guru.nip || '');
    setNuptk(guru.nuptk || '');
    setJabatan(guru.jabatan || '');
    setPangkatGolongan(guru.pangkatGolongan || 'Penata Muda / III a');
    setStatusAktif(guru.statusAktif ?? true);
    setTelepon(guru.telepon || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) return;

    const guruData: DataGuru = {
      id: editingGuru ? editingGuru.id : `guru-${Date.now()}`,
      nama: nama.trim(),
      nip: nip.trim() || '-',
      nuptk: nuptk.trim() || '-',
      jabatan: jabatan.trim() || 'Guru Mata Pelajaran',
      pangkatGolongan: pangkatGolongan.trim() || 'Penata Muda / III a',
      statusAktif,
      telepon: telepon.trim(),
    };

    onSaveGuru(guruData);
    setIsModalOpen(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);
    setImportError(null);
    setImportFileName(file.name);

    try {
      const result = await parseGuruExcelFile(file);
      if (!result.success || result.data.length === 0) {
        setImportError(result.message || 'Tidak ada baris data guru yang valid ditemukan di dalam file Excel.');
      } else {
        setImportedPreview(result.data);
        setIsImportModalOpen(true);
      }
    } catch (err: any) {
      setImportError(err.message || 'Gagal membaca file Excel. Pastikan format tabel sesuai template.');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleConfirmImport = () => {
    if (importedPreview.length === 0) return;
    if (onImportGuru) {
      onImportGuru(importedPreview, importMode);
    } else {
      importedPreview.forEach(g => onSaveGuru(g));
    }
    setIsImportModalOpen(false);
    setImportedPreview([]);
  };

  const filteredList = daftarGuru.filter(g => {
    const matchSearch = 
      g.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.nip.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.jabatan.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = 
      filterAktif === 'ALL' || 
      (filterAktif === 'AKTIF' ? g.statusAktif : !g.statusAktif);

    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-3.5 animate-fadeIn pb-8">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx, .xls"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Header Bar */}
      <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">Data Guru & Tenaga Kependidikan</h2>
            <span className="bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800 text-[10px] font-mono font-semibold px-2 py-0.2 rounded">
              {daftarGuru.length} Pendidik
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Kelola data guru atau import dari file Excel untuk penulisan Surat Tugas otomatis.
          </p>
        </div>

        {/* Action Button Group */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Download Format Excel */}
          <button
            id="guru-download-template-btn"
            onClick={downloadGuruTemplate}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-lg text-xs transition-all cursor-pointer shrink-0"
            title="Download Format Excel Kosong untuk diisi"
          >
            <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Format Excel</span>
          </button>

          {/* Import Excel */}
          <button
            id="guru-import-excel-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs shadow-xs transition-all cursor-pointer shrink-0 active:scale-95 disabled:opacity-50"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>{isProcessing ? 'Membaca...' : 'Import Excel'}</span>
          </button>

          {/* Export Data Button */}
          {daftarGuru.length > 0 && (
            <button
              id="guru-export-excel-btn"
              onClick={() => exportGuruToExcel(daftarGuru)}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-lg text-xs transition-all cursor-pointer shrink-0"
              title="Download seluruh data guru ke file Excel"
            >
              <Upload className="w-3.5 h-3.5 rotate-180 text-emerald-600 dark:text-emerald-400" />
              <span>Export</span>
            </button>
          )}

          {/* Add Manual Guru Button */}
          <button
            id="guru-add-btn"
            onClick={openAddModal}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs shadow-xs transition-all cursor-pointer shrink-0 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>+ Tambah Guru</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {importError && (
        <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-xl flex items-center justify-between gap-2 text-xs text-red-700 dark:text-red-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{importError}</span>
          </div>
          <button onClick={() => setImportError(null)} className="text-red-500 hover:text-red-700">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Search & Filter */}
      <div className="bg-white dark:bg-slate-900 p-2.5 sm:p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row gap-2 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            id="guru-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama guru, NIP, atau jabatan..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-900"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            id="guru-filter-status"
            value={filterAktif}
            onChange={(e) => setFilterAktif(e.target.value as any)}
            className="w-full sm:w-auto px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-blue-600"
          >
            <option value="ALL">Semua Status</option>
            <option value="AKTIF">Status Aktif</option>
            <option value="NONAKTIF">Non-Aktif</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold text-[11px] uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-2.5 px-3 w-10 text-center">No</th>
                <th className="py-2.5 px-3">Nama Lengkap</th>
                <th className="py-2.5 px-3">NIP & NUPTK</th>
                <th className="py-2.5 px-3">Jabatan</th>
                <th className="py-2.5 px-3">Pangkat / Golongan</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
              {filteredList.map((guru, index) => (
                <tr key={guru.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-2 px-3 text-center text-slate-400 dark:text-slate-500 font-mono text-[11px]">
                    {index + 1}
                  </td>
                  <td className="py-2 px-3 font-bold text-slate-900 dark:text-slate-100">
                    <div>{guru.nama}</div>
                    {guru.telepon && (
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-normal flex items-center gap-1 mt-0.5">
                        <Phone className="w-2.5 h-2.5" />
                        <span>{guru.telepon}</span>
                      </div>
                    )}
                  </td>
                  <td className="py-2 px-3 font-mono text-xs">
                    <div>NIP: <span className="text-slate-900 dark:text-slate-200 font-semibold">{guru.nip}</span></div>
                    <div className="text-slate-400 dark:text-slate-500 text-[10px]">NUPTK: {guru.nuptk}</div>
                  </td>
                  <td className="py-2 px-3">
                    <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Briefcase className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                      <span>{guru.jabatan}</span>
                    </div>
                  </td>
                  <td className="py-2 px-3 text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Award className="w-3 h-3 text-amber-500 dark:text-amber-400" />
                      <span>{guru.pangkatGolongan}</span>
                    </div>
                  </td>
                  <td className="py-2 px-3 text-center">
                    {guru.statusAktif ? (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        <span>Aktif</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        <XCircle className="w-2.5 h-2.5" />
                        <span>Non-Aktif</span>
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        id={`guru-edit-btn-${guru.id}`}
                        onClick={() => openEditModal(guru)}
                        className="p-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded transition-colors cursor-pointer"
                        title="Edit Data Guru"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        id={`guru-delete-btn-${guru.id}`}
                        onClick={() => setGuruToDelete(guru)}
                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50 rounded transition-colors cursor-pointer"
                        title="Hapus Data Guru"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredList.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                    Tidak ada data guru yang cocok dengan pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* In-App Confirmation Modal for Safe Deletion */}
      {guruToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full shadow-2xl p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Hapus Data Guru?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Guru <strong className="text-slate-800 dark:text-slate-200">{guruToDelete.nama}</strong> ({guruToDelete.jabatan || 'Guru'}) akan dihapus dari daftar master guru sekolah.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setGuruToDelete(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setGuruToDelete(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteGuru(guruToDelete.id);
                  setGuruToDelete(null);
                }}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Hapus Guru</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Preview & Konfirmasi Import Excel */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full p-4 sm:p-5 border border-slate-200 dark:border-slate-800 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    Konfirmasi Import Data Guru
                  </h3>
                  <p className="text-[11px] text-slate-500">File: {importFileName} ({importedPreview.length} data terbaca)</p>
                </div>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="my-3 space-y-3 flex-1 overflow-y-auto pr-1">
              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 p-2.5 rounded-lg text-xs">
                <span className="font-medium text-slate-700 dark:text-slate-300">Metode Penggabungan Data:</span>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input 
                      type="radio" 
                      name="guruImportMode" 
                      value="merge" 
                      checked={importMode === 'merge'} 
                      onChange={() => setImportMode('merge')} 
                    />
                    <span>Gabungkan / Update</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer text-amber-600 dark:text-amber-400">
                    <input 
                      type="radio" 
                      name="guruImportMode" 
                      value="replace" 
                      checked={importMode === 'replace'} 
                      onChange={() => setImportMode('replace')} 
                    />
                    <span>Ganti Semua Data</span>
                  </label>
                </div>
              </div>

              <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold sticky top-0">
                    <tr>
                      <th className="p-2">Nama</th>
                      <th className="p-2">NIP / NUPTK</th>
                      <th className="p-2">Jabatan</th>
                      <th className="p-2">Pangkat/Gol</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {importedPreview.map((g, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="p-2 font-medium">{g.nama}</td>
                        <td className="p-2 font-mono text-[11px]">{g.nip}</td>
                        <td className="p-2">{g.jabatan}</td>
                        <td className="p-2 text-slate-500">{g.pangkatGolongan}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-lg"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmImport}
                className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs active:scale-95"
              >
                Impor Sekarang ({importedPreview.length} Guru)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add / Edit Guru */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-md w-full p-4 sm:p-5 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">
                {editingGuru ? 'Edit Data Guru' : 'Tambah Data Guru Baru'}
              </h3>
              <button
                id="guru-modal-close-btn"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-3 space-y-2.5">
              <div>
                <label 
                  htmlFor="input-guru-nama"
                  className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-0.5"
                >
                  Nama Lengkap & Gelar <span className="text-red-500">*</span>
                </label>
                <input
                  id="input-guru-nama"
                  type="text"
                  required
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Contoh: Budi Santoso, S.Pd."
                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label 
                    htmlFor="input-guru-nip"
                    className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-0.5"
                  >
                    NIP (Nomor Induk Pegawai)
                  </label>
                  <input
                    id="input-guru-nip"
                    type="text"
                    value={nip}
                    onChange={(e) => setNip(e.target.value)}
                    placeholder="19820415 200801 1 012"
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-900"
                  />
                </div>
                <div>
                  <label 
                    htmlFor="input-guru-nuptk"
                    className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-0.5"
                  >
                    NUPTK
                  </label>
                  <input
                    id="input-guru-nuptk"
                    type="text"
                    value={nuptk}
                    onChange={(e) => setNuptk(e.target.value)}
                    placeholder="3456789012345678"
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label 
                    htmlFor="input-guru-jabatan"
                    className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-0.5"
                  >
                    Jabatan / Penugasan
                  </label>
                  <input
                    id="input-guru-jabatan"
                    type="text"
                    value={jabatan}
                    onChange={(e) => setJabatan(e.target.value)}
                    placeholder="Guru Kelas VI"
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-900"
                  />
                </div>
                <div>
                  <label 
                    htmlFor="input-guru-pangkat"
                    className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-0.5"
                  >
                    Pangkat / Golongan
                  </label>
                  <input
                    id="input-guru-pangkat"
                    type="text"
                    value={pangkatGolongan}
                    onChange={(e) => setPangkatGolongan(e.target.value)}
                    placeholder="Penata / III c"
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-900"
                  />
                </div>
              </div>

              <div>
                <label 
                  htmlFor="input-guru-telepon"
                  className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-0.5"
                >
                  No. Telepon / WhatsApp
                </label>
                <input
                  id="input-guru-telepon"
                  type="text"
                  value={telepon}
                  onChange={(e) => setTelepon(e.target.value)}
                  placeholder="081234567890"
                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-900"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  id="input-guru-aktif"
                  type="checkbox"
                  checked={statusAktif}
                  onChange={(e) => setStatusAktif(e.target.checked)}
                  className="w-3.5 h-3.5 text-blue-600 rounded border-slate-300 dark:border-slate-600 focus:ring-blue-500"
                />
                <label htmlFor="input-guru-aktif" className="text-[11px] font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                  Status Guru Aktif di Sekolah
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  id="guru-modal-cancel-btn"
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  id="guru-modal-save-btn"
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-all cursor-pointer active:scale-95"
                >
                  Simpan Guru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
