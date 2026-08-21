import React, { useState, useRef } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  X,
  User,
  FileSpreadsheet,
  Download,
  Upload,
  AlertCircle
} from 'lucide-react';
import { DataSiswa } from '../types';
import { 
  parseSiswaExcelFile, 
  downloadSiswaTemplate, 
  exportSiswaToExcel 
} from '../services/excelService';

interface DataSiswaViewProps {
  daftarSiswa: DataSiswa[];
  onSaveSiswa: (siswa: DataSiswa) => void;
  onDeleteSiswa: (id: string) => void;
  onImportSiswa?: (siswas: DataSiswa[], mode: 'merge' | 'replace') => void;
}

export const DataSiswaView: React.FC<DataSiswaViewProps> = ({
  daftarSiswa,
  onSaveSiswa,
  onDeleteSiswa,
  onImportSiswa,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterKelas, setFilterKelas] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSiswa, setEditingSiswa] = useState<DataSiswa | null>(null);
  const [siswaToDelete, setSiswaToDelete] = useState<DataSiswa | null>(null);

  // Import State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importedPreview, setImportedPreview] = useState<DataSiswa[]>([]);
  const [importFileName, setImportFileName] = useState('');
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [importError, setImportError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form Fields
  const [nama, setNama] = useState('');
  const [nis, setNis] = useState('');
  const [nisn, setNisn] = useState('');
  const [kelas, setKelas] = useState('Kelas VI-A');
  const [tempatLahir, setTempatLahir] = useState('Jakarta');
  const [tanggalLahir, setTanggalLahir] = useState('2012-05-14');
  const [namaOrangTua, setNamaOrangTua] = useState('');
  const [alamat, setAlamat] = useState('');
  const [statusAktif, setStatusAktif] = useState(true);

  const openAddModal = () => {
    setEditingSiswa(null);
    setNama('');
    setNis('');
    setNisn('');
    setKelas('Kelas VI-A');
    setTempatLahir('Jakarta');
    setTanggalLahir('2013-01-01');
    setNamaOrangTua('');
    setAlamat('');
    setStatusAktif(true);
    setIsModalOpen(true);
  };

  const openEditModal = (siswa: DataSiswa) => {
    setEditingSiswa(siswa);
    setNama(siswa.nama || '');
    setNis(siswa.nis || '');
    setNisn(siswa.nisn || '');
    setKelas(siswa.kelas || 'Kelas VI-A');
    setTempatLahir(siswa.tempatLahir || '');
    setTanggalLahir(siswa.tanggalLahir || '2013-01-01');
    setNamaOrangTua(siswa.namaOrangTua || '');
    setAlamat(siswa.alamat || '');
    setStatusAktif(siswa.statusAktif ?? true);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || !nis.trim()) return;

    const siswaData: DataSiswa = {
      id: editingSiswa ? editingSiswa.id : `siswa-${Date.now()}`,
      nama: nama.trim(),
      nis: nis.trim(),
      nisn: nisn.trim(),
      kelas: kelas.trim(),
      tempatLahir: tempatLahir.trim(),
      tanggalLahir: tanggalLahir.trim(),
      namaOrangTua: namaOrangTua.trim() || '-',
      alamat: alamat.trim() || '-',
      statusAktif,
    };

    onSaveSiswa(siswaData);
    setIsModalOpen(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);
    setImportError(null);
    setImportFileName(file.name);

    try {
      const result = await parseSiswaExcelFile(file);
      if (!result.success || result.data.length === 0) {
        setImportError(result.message || 'Tidak ada baris data siswa yang valid ditemukan di dalam file Excel.');
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
    if (onImportSiswa) {
      onImportSiswa(importedPreview, importMode);
    } else {
      importedPreview.forEach(s => onSaveSiswa(s));
    }
    setIsImportModalOpen(false);
    setImportedPreview([]);
  };

  const kelasList = Array.from(new Set(daftarSiswa.map(s => s.kelas))).sort();

  const filteredList = daftarSiswa.filter(s => {
    const matchSearch = 
      s.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.nis.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.nisn && s.nisn.toLowerCase().includes(searchTerm.toLowerCase())) ||
      s.namaOrangTua.toLowerCase().includes(searchTerm.toLowerCase());

    const matchKelas = filterKelas === 'ALL' || s.kelas === filterKelas;

    return matchSearch && matchKelas;
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
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">Data Siswa / Peserta Didik</h2>
            <span className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800 text-[10px] font-mono font-semibold px-2 py-0.2 rounded">
              {daftarSiswa.length} Siswa Terdaftar
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Kelola data siswa atau import dari file Excel untuk Surat Keterangan Aktif dan Panggilan.
          </p>
        </div>

        {/* Action Button Group */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Download Format Excel */}
          <button
            id="siswa-download-template-btn"
            onClick={downloadSiswaTemplate}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-lg text-xs transition-all cursor-pointer shrink-0"
            title="Download Format Excel Kosong untuk diisi"
          >
            <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Format Excel</span>
          </button>

          {/* Import Excel */}
          <button
            id="siswa-import-excel-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs shadow-xs transition-all cursor-pointer shrink-0 active:scale-95 disabled:opacity-50"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>{isProcessing ? 'Membaca...' : 'Import Excel'}</span>
          </button>

          {/* Export Data Button */}
          {daftarSiswa.length > 0 && (
            <button
              id="siswa-export-excel-btn"
              onClick={() => exportSiswaToExcel(daftarSiswa)}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-lg text-xs transition-all cursor-pointer shrink-0"
              title="Download seluruh data siswa ke file Excel"
            >
              <Upload className="w-3.5 h-3.5 rotate-180 text-emerald-600 dark:text-emerald-400" />
              <span>Export</span>
            </button>
          )}

          {/* Add Manual Siswa Button */}
          <button
            id="siswa-add-btn"
            onClick={openAddModal}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs shadow-xs transition-all cursor-pointer shrink-0 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>+ Tambah Siswa</span>
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
            id="siswa-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama siswa, NIS, NISN, orang tua..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-900"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            id="siswa-filter-kelas"
            value={filterKelas}
            onChange={(e) => setFilterKelas(e.target.value)}
            className="w-full sm:w-auto px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-blue-600"
          >
            <option value="ALL">Semua Kelas</option>
            {kelasList.map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
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
                <th className="py-2.5 px-3">Nama Siswa</th>
                <th className="py-2.5 px-3">NIS / NISN</th>
                <th className="py-2.5 px-3">Kelas</th>
                <th className="py-2.5 px-3">Orang Tua / Wali</th>
                <th className="py-2.5 px-3">Alamat Domisili</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
              {filteredList.map((siswa, index) => (
                <tr key={siswa.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-2 px-3 text-center text-slate-400 dark:text-slate-500 font-mono text-[11px]">
                    {index + 1}
                  </td>
                  <td className="py-2 px-3">
                    <div className="font-bold text-slate-900 dark:text-slate-100">{siswa.nama}</div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500">
                      TTL: {siswa.tempatLahir}, {siswa.tanggalLahir}
                    </div>
                  </td>
                  <td className="py-2 px-3 font-mono text-xs">
                    <div>NIS: <span className="text-slate-900 dark:text-slate-200 font-semibold">{siswa.nis}</span></div>
                    {siswa.nisn && <div className="text-slate-400 dark:text-slate-500 text-[10px]">NISN: {siswa.nisn}</div>}
                  </td>
                  <td className="py-2 px-3 whitespace-nowrap">
                    <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800">
                      {siswa.kelas}
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    <div className="text-slate-800 dark:text-slate-200 font-semibold flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                      <span>{siswa.namaOrangTua}</span>
                    </div>
                  </td>
                  <td className="py-2 px-3 max-w-xs">
                    <p className="line-clamp-2 text-[11px] text-slate-600 dark:text-slate-400" title={siswa.alamat}>
                      {siswa.alamat}
                    </p>
                  </td>
                  <td className="py-2 px-3 text-center whitespace-nowrap">
                    {siswa.statusAktif ? (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        <span>Aktif</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        <XCircle className="w-2.5 h-2.5" />
                        <span>Lulus / Keluar</span>
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        id={`siswa-edit-btn-${siswa.id}`}
                        onClick={() => openEditModal(siswa)}
                        className="p-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded transition-colors cursor-pointer"
                        title="Edit Data Siswa"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        id={`siswa-delete-btn-${siswa.id}`}
                        onClick={() => setSiswaToDelete(siswa)}
                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50 rounded transition-colors cursor-pointer"
                        title="Hapus Data Siswa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredList.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                    Tidak ada data siswa yang cocok dengan pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* In-App Confirmation Modal for Safe Deletion */}
      {siswaToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full shadow-2xl p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Hapus Data Siswa?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Siswa <strong className="text-slate-800 dark:text-slate-200">{siswaToDelete.nama}</strong> ({siswaToDelete.kelas}) akan dihapus dari daftar siswa sekolah.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSiswaToDelete(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSiswaToDelete(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteSiswa(siswaToDelete.id);
                  setSiswaToDelete(null);
                }}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Hapus Siswa</span>
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
                    Konfirmasi Import Data Siswa
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
                      name="siswaImportMode" 
                      value="merge" 
                      checked={importMode === 'merge'} 
                      onChange={() => setImportMode('merge')} 
                    />
                    <span>Gabungkan / Update</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer text-amber-600 dark:text-amber-400">
                    <input 
                      type="radio" 
                      name="siswaImportMode" 
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
                      <th className="p-2">NIS / NISN</th>
                      <th className="p-2">Kelas</th>
                      <th className="p-2">Nama Orang Tua</th>
                      <th className="p-2">Alamat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {importedPreview.map((s, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="p-2 font-medium">{s.nama}</td>
                        <td className="p-2 font-mono text-[11px]">{s.nis}</td>
                        <td className="p-2">{s.kelas}</td>
                        <td className="p-2">{s.namaOrangTua}</td>
                        <td className="p-2 text-slate-500 truncate max-w-xs">{s.alamat}</td>
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
                Impor Sekarang ({importedPreview.length} Siswa)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add / Edit Siswa */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-md w-full p-4 sm:p-5 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">
                {editingSiswa ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
              </h3>
              <button
                id="siswa-modal-close-btn"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-3 space-y-2.5">
              <div>
                <label 
                  htmlFor="input-siswa-nama"
                  className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-0.5"
                >
                  Nama Lengkap Siswa <span className="text-red-500">*</span>
                </label>
                <input
                  id="input-siswa-nama"
                  type="text"
                  required
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Contoh: Muhammad Rizky Pratama"
                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-900"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label 
                    htmlFor="input-siswa-nis"
                    className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-0.5"
                  >
                    NIS <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="input-siswa-nis"
                    type="text"
                    required
                    value={nis}
                    onChange={(e) => setNis(e.target.value)}
                    placeholder="20230101"
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-900"
                  />
                </div>
                <div>
                  <label 
                    htmlFor="input-siswa-nisn"
                    className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-0.5"
                  >
                    NISN
                  </label>
                  <input
                    id="input-siswa-nisn"
                    type="text"
                    value={nisn}
                    onChange={(e) => setNisn(e.target.value)}
                    placeholder="0112345678"
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-900"
                  />
                </div>
                <div>
                  <label 
                    htmlFor="input-siswa-kelas"
                    className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-0.5"
                  >
                    Kelas
                  </label>
                  <input
                    id="input-siswa-kelas"
                    type="text"
                    value={kelas}
                    onChange={(e) => setKelas(e.target.value)}
                    placeholder="Kelas VI-A"
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label 
                    htmlFor="input-siswa-tempat-lahir"
                    className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-0.5"
                  >
                    Tempat Lahir
                  </label>
                  <input
                    id="input-siswa-tempat-lahir"
                    type="text"
                    value={tempatLahir}
                    onChange={(e) => setTempatLahir(e.target.value)}
                    placeholder="Jakarta"
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-900"
                  />
                </div>
                <div>
                  <label 
                    htmlFor="input-siswa-tanggal-lahir"
                    className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-0.5"
                  >
                    Tanggal Lahir
                  </label>
                  <input
                    id="input-siswa-tanggal-lahir"
                    type="date"
                    value={tanggalLahir}
                    onChange={(e) => setTanggalLahir(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-900"
                  />
                </div>
              </div>

              <div>
                <label 
                  htmlFor="input-siswa-orangtua"
                  className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-0.5"
                >
                  Nama Orang Tua / Wali
                </label>
                <input
                  id="input-siswa-orangtua"
                  type="text"
                  value={namaOrangTua}
                  onChange={(e) => setNamaOrangTua(e.target.value)}
                  placeholder="Contoh: Bambang Pratama"
                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-900"
                />
              </div>

              <div>
                <label 
                  htmlFor="input-siswa-alamat"
                  className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-0.5"
                >
                  Alamat Domisili
                </label>
                <textarea
                  id="input-siswa-alamat"
                  rows={2}
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  placeholder="Jl. Percetakan Negara No. 12..."
                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-900"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  id="input-siswa-aktif"
                  type="checkbox"
                  checked={statusAktif}
                  onChange={(e) => setStatusAktif(e.target.checked)}
                  className="w-3.5 h-3.5 text-blue-600 rounded border-slate-300 dark:border-slate-600 focus:ring-blue-500"
                />
                <label htmlFor="input-siswa-aktif" className="text-[11px] font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                  Status Siswa Aktif Belajar di Sekolah
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  id="siswa-modal-cancel-btn"
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  id="siswa-modal-save-btn"
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-all cursor-pointer active:scale-95"
                >
                  Simpan Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
