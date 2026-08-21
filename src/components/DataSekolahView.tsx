import React, { useState, useRef } from 'react';
import { 
  Save, 
  Check, 
  School, 
  UserCheck, 
  Hash, 
  Globe,
  Image as ImageIcon,
  Upload,
  Eye,
  RefreshCw
} from 'lucide-react';
import { DataSekolah } from '../types';
import { PRESET_LOGOS } from '../data/klasifikasiSurat';

interface DataSekolahViewProps {
  sekolah: DataSekolah;
  onSaveSekolah: (sekolah: DataSekolah) => void;
}

export const DataSekolahView: React.FC<DataSekolahViewProps> = ({
  sekolah,
  onSaveSekolah,
}) => {
  const [formData, setFormData] = useState<DataSekolah>({
    ...sekolah,
    instansiAtasan1: sekolah?.instansiAtasan1 || 'PEMERINTAH DAERAH PROVINSI / KABUPATEN',
    instansiAtasan2: sekolah?.instansiAtasan2 || 'DINAS PENDIDIKAN DAN KEBUDAYAAN',
    namaSekolah: sekolah?.namaSekolah || '',
    npsn: sekolah?.npsn || '',
    nss: sekolah?.nss || '',
    alamat: sekolah?.alamat || '',
    desa: sekolah?.desa || '',
    kecamatan: sekolah?.kecamatan || '',
    kabupaten: sekolah?.kabupaten || '',
    provinsi: sekolah?.provinsi || '',
    kodePos: sekolah?.kodePos || '',
    telepon: sekolah?.telepon || '',
    email: sekolah?.email || '',
    website: sekolah?.website || '',
    namaKepalaSekolah: sekolah?.namaKepalaSekolah || '',
    nipKepalaSekolah: sekolah?.nipKepalaSekolah || '',
    pangkatKepalaSekolah: sekolah?.pangkatKepalaSekolah || '',
    kodeSekolah: sekolah?.kodeSekolah || 'SDN01',
    formatPenomoran: sekolah?.formatPenomoran || '{KLASIFIKASI}/{NO}/{KODE}/{BULAN_ROMAWI}/{TAHUN}',
    tampilkanLogoKiri: sekolah?.tampilkanLogoKiri ?? true,
    tampilkanLogoKanan: sekolah?.tampilkanLogoKanan ?? false,
    digitNomorUrut: sekolah?.digitNomorUrut || 3,
  });
  const [isSaved, setIsSaved] = useState(false);
  const logoKiriInputRef = useRef<HTMLInputElement>(null);
  const logoKananInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (field: keyof DataSekolah, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsSaved(false);
  };

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'logoKiri' | 'logoKanan'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert to resized base64 string to keep localStorage small and fast
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 240;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/png');
          handleChange(field, dataUrl);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSekolah(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-3.5 animate-fadeIn pb-8">
      {/* Hidden File Inputs */}
      <input
        ref={logoKiriInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleImageUpload(e, 'logoKiri')}
      />
      <input
        ref={logoKananInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleImageUpload(e, 'logoKanan')}
      />

      {/* Header Bar */}
      <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">Profil Satuan Pendidikan & Kop Surat</h2>
            <span className="bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800 text-[10px] font-mono font-semibold px-2 py-0.2 rounded">
              NPSN: {formData.npsn}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Pengaturan resmi identitas instansi, logo kop surat, hierarki dinas, dan format penomoran surat.
          </p>
        </div>

        <button
          id="sekolah-header-save-btn"
          onClick={handleSubmit}
          className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs shadow-xs transition-all cursor-pointer shrink-0 active:scale-95"
        >
          {isSaved ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>TERSIMPAN</span>
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              <span>SIMPAN PERUBAHAN</span>
            </>
          )}
        </button>
      </div>

      {/* Live Kop Surat Preview Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-4 overflow-hidden">
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-blue-600" />
            <span>Pratinjau Langsung Kepala Surat (Kop Surat)</span>
          </div>
          <span className="text-[10px] text-slate-400 font-normal">Sesuai standar surat resmi pemerintahan</span>
        </div>

        {/* Kop Render */}
        <div className="bg-slate-50 dark:bg-slate-950 p-4 sm:p-5 rounded-lg border border-slate-200/80 dark:border-slate-800 font-serif">
          <div className="flex items-center justify-between gap-3 text-slate-900 dark:text-slate-100">
            {/* Logo Kiri */}
            {formData.tampilkanLogoKiri ? (
              <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 flex items-center justify-center">
                {formData.logoKiri ? (
                  <img src={formData.logoKiri} alt="Logo Kiri" className="max-h-full max-w-full object-contain" />
                ) : (
                  <div className="w-14 h-14 border border-dashed border-slate-300 rounded flex items-center justify-center text-[9px] text-slate-400">
                    Logo Kiri
                  </div>
                )}
              </div>
            ) : <div className="w-4" />}

            {/* Header Text */}
            <div className="flex-1 text-center font-serif leading-tight">
              {formData.instansiAtasan1 && (
                <div className="text-[11px] sm:text-xs font-bold tracking-wider uppercase text-slate-800 dark:text-slate-200">
                  {formData.instansiAtasan1}
                </div>
              )}
              {formData.instansiAtasan2 && (
                <div className="text-xs sm:text-sm font-bold tracking-wider uppercase text-slate-900 dark:text-slate-100">
                  {formData.instansiAtasan2}
                </div>
              )}
              <div className="text-sm sm:text-base font-extrabold tracking-wide uppercase mt-0.5 text-black dark:text-white">
                {formData.namaSekolah || 'NAMA SATUAN PENDIDIKAN'}
              </div>
              <div className="text-[9px] sm:text-[10px] text-slate-600 dark:text-slate-400 mt-1 font-sans not-italic">
                {formData.alamat && `${formData.alamat}, `}
                {formData.desa && `Kel. ${formData.desa}, `}
                {formData.kecamatan && `Kec. ${formData.kecamatan}, `}
                {formData.kabupaten && `${formData.kabupaten}, `}
                {formData.provinsi && `${formData.provinsi} ${formData.kodePos || ''}`}
              </div>
              {(formData.telepon || formData.email || formData.website) && (
                <div className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 font-sans">
                  {formData.telepon && `Telp: ${formData.telepon} `}
                  {formData.email && `| Email: ${formData.email} `}
                  {formData.website && `| Web: ${formData.website}`}
                </div>
              )}
            </div>

            {/* Logo Kanan */}
            {formData.tampilkanLogoKanan ? (
              <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 flex items-center justify-center">
                {formData.logoKanan ? (
                  <img src={formData.logoKanan} alt="Logo Kanan" className="max-h-full max-w-full object-contain" />
                ) : (
                  <div className="w-14 h-14 border border-dashed border-slate-300 rounded flex items-center justify-center text-[9px] text-slate-400">
                    Logo Kanan
                  </div>
                )}
              </div>
            ) : <div className="w-4" />}
          </div>

          {/* Double Separator Line */}
          <div className="mt-3 border-b-2 border-black dark:border-white border-t border-t-black dark:border-t-white pt-0.5" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
          {/* Col 1: Instansi & Kop Setting (7 cols) */}
          <div className="lg:col-span-7 space-y-3.5">
            {/* Card: Kop Surat & Logo Management */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-4 sm:p-5 space-y-3">
              <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                <ImageIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                  1. Pengaturan Logo Kop Surat
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Logo Kiri */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Logo Kiri (Pemda / Tut Wuri)</span>
                    <label className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.tampilkanLogoKiri}
                        onChange={(e) => handleChange('tampilkanLogoKiri', e.target.checked)}
                        className="rounded text-blue-600"
                      />
                      <span>Tampilkan</span>
                    </label>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-1 flex items-center justify-center shrink-0">
                      {formData.logoKiri ? (
                        <img src={formData.logoKiri} alt="Logo Kiri" className="max-h-full max-w-full object-contain" />
                      ) : (
                        <span className="text-[10px] text-slate-400">Kosong</span>
                      )}
                    </div>

                    <div className="space-y-1.5 flex-1">
                      <button
                        type="button"
                        onClick={() => logoKiriInputRef.current?.click()}
                        className="w-full py-1 px-2 text-[11px] font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Upload className="w-3 h-3" />
                        <span>Upload Gambar Logo</span>
                      </button>

                      {/* Preset selector */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleChange('logoKiri', PRESET_LOGOS.tutWuri)}
                          className="flex-1 py-0.5 text-[9px] font-medium bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 rounded text-slate-700 dark:text-slate-200"
                        >
                          Preset Tut Wuri
                        </button>
                        <button
                          type="button"
                          onClick={() => handleChange('logoKiri', PRESET_LOGOS.pemda)}
                          className="flex-1 py-0.5 text-[9px] font-medium bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 rounded text-slate-700 dark:text-slate-200"
                        >
                          Preset Pemda
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Logo Kanan */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Logo Kanan (Lambang Sekolah)</span>
                    <label className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.tampilkanLogoKanan}
                        onChange={(e) => handleChange('tampilkanLogoKanan', e.target.checked)}
                        className="rounded text-blue-600"
                      />
                      <span>Tampilkan</span>
                    </label>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-1 flex items-center justify-center shrink-0">
                      {formData.logoKanan ? (
                        <img src={formData.logoKanan} alt="Logo Kanan" className="max-h-full max-w-full object-contain" />
                      ) : (
                        <span className="text-[10px] text-slate-400">Kosong</span>
                      )}
                    </div>

                    <div className="space-y-1.5 flex-1">
                      <button
                        type="button"
                        onClick={() => logoKananInputRef.current?.click()}
                        className="w-full py-1 px-2 text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Upload className="w-3 h-3" />
                        <span>Upload Logo Sekolah</span>
                      </button>

                      {/* Preset / Reset */}
                      <button
                        type="button"
                        onClick={() => handleChange('logoKanan', '')}
                        className="w-full py-0.5 text-[9px] font-medium bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 rounded text-slate-700 dark:text-slate-200"
                      >
                        Hapus Logo Kanan
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card: Hierarki Instansi & Identitas Sekolah */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-4 sm:p-5 space-y-3">
              <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                <School className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                  2. Hierarki Instansi & Identitas Satuan Pendidikan
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label htmlFor="input-instansi-1" className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-0.5">
                    Instansi Atasan Baris 1 (Pemerintah Daerah)
                  </label>
                  <input
                    id="input-instansi-1"
                    type="text"
                    value={formData.instansiAtasan1 || ''}
                    onChange={(e) => handleChange('instansiAtasan1', e.target.value)}
                    placeholder="PEMERINTAH PROVINSI DKI JAKARTA"
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="input-instansi-2" className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-0.5">
                    Instansi Atasan Baris 2 (Dinas Pendidikan)
                  </label>
                  <input
                    id="input-instansi-2"
                    type="text"
                    value={formData.instansiAtasan2 || ''}
                    onChange={(e) => handleChange('instansiAtasan2', e.target.value)}
                    placeholder="DINAS PENDIDIKAN"
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="input-nama-sekolah" className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-0.5">
                    Nama Resmi Sekolah (Huruf Kapital pada KOP) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="input-nama-sekolah"
                    type="text"
                    required
                    value={formData.namaSekolah || ''}
                    onChange={(e) => handleChange('namaSekolah', e.target.value)}
                    placeholder="SD NEGERI 01 JAKARTA PUSAT"
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label htmlFor="input-npsn" className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-0.5">
                    NPSN (Nomor Pokok Sekolah Nasional)
                  </label>
                  <input
                    id="input-npsn"
                    type="text"
                    value={formData.npsn || ''}
                    onChange={(e) => handleChange('npsn', e.target.value)}
                    placeholder="20101234"
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label htmlFor="input-nss" className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-0.5">
                    NSS (Nomor Statistik Sekolah)
                  </label>
                  <input
                    id="input-nss"
                    type="text"
                    value={formData.nss || ''}
                    onChange={(e) => handleChange('nss', e.target.value)}
                    placeholder="101016001234"
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="input-alamat-sekolah" className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-0.5">
                    Alamat Lengkap Jalan / Nomor
                  </label>
                  <input
                    id="input-alamat-sekolah"
                    type="text"
                    value={formData.alamat || ''}
                    onChange={(e) => handleChange('alamat', e.target.value)}
                    placeholder="Jl. Percetakan Negara No. 21"
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label htmlFor="input-desa" className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-0.5">
                    Kelurahan / Desa
                  </label>
                  <input
                    id="input-desa"
                    type="text"
                    value={formData.desa || ''}
                    onChange={(e) => handleChange('desa', e.target.value)}
                    placeholder="Johar Baru"
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label htmlFor="input-kecamatan" className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-0.5">
                    Kecamatan
                  </label>
                  <input
                    id="input-kecamatan"
                    type="text"
                    value={formData.kecamatan || ''}
                    onChange={(e) => handleChange('kecamatan', e.target.value)}
                    placeholder="Johar Baru"
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label htmlFor="input-kabupaten" className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-0.5">
                    Kota / Kabupaten
                  </label>
                  <input
                    id="input-kabupaten"
                    type="text"
                    value={formData.kabupaten || ''}
                    onChange={(e) => handleChange('kabupaten', e.target.value)}
                    placeholder="Kota Jakarta Pusat"
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label htmlFor="input-provinsi" className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-0.5">
                    Provinsi
                  </label>
                  <input
                    id="input-provinsi"
                    type="text"
                    value={formData.provinsi || ''}
                    onChange={(e) => handleChange('provinsi', e.target.value)}
                    placeholder="DKI Jakarta"
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label htmlFor="input-kode-pos" className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-0.5">
                    Kode Pos
                  </label>
                  <input
                    id="input-kode-pos"
                    type="text"
                    value={formData.kodePos || ''}
                    onChange={(e) => handleChange('kodePos', e.target.value)}
                    placeholder="10560"
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>
            </div>

            {/* Card: Kontak */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-4 sm:p-5 space-y-3">
              <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">3. Kontak & Saluran Komunikasi</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label htmlFor="input-telepon-sekolah" className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-0.5">
                    No. Telepon / Fax
                  </label>
                  <input
                    id="input-telepon-sekolah"
                    type="text"
                    value={formData.telepon || ''}
                    onChange={(e) => handleChange('telepon', e.target.value)}
                    placeholder="(021) 4241234"
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label htmlFor="input-email-sekolah" className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-0.5">
                    Email Resmi
                  </label>
                  <input
                    id="input-email-sekolah"
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="info@sdn01jakpus.sch.id"
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label htmlFor="input-website-sekolah" className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-0.5">
                    Website / Portal
                  </label>
                  <input
                    id="input-website-sekolah"
                    type="text"
                    value={formData.website || ''}
                    onChange={(e) => handleChange('website', e.target.value)}
                    placeholder="www.sdn01jakpus.sch.id"
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Col 2: Kepala Sekolah & Format Nomor (5 cols) */}
          <div className="lg:col-span-5 space-y-3.5">
            {/* Card 4: Pejabat Kepala Sekolah */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-4 sm:p-5 space-y-3">
              <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                <UserCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">4. Pejabat Kepala Sekolah</h3>
              </div>

              <div className="space-y-2.5">
                <div>
                  <label htmlFor="input-kepala-sekolah" className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-0.5">
                    Nama Kepala Sekolah & Gelar <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="input-kepala-sekolah"
                    type="text"
                    required
                    value={formData.namaKepalaSekolah || ''}
                    onChange={(e) => handleChange('namaKepalaSekolah', e.target.value)}
                    placeholder="Dra. Hj. Siti Aminah, M.Pd."
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label htmlFor="input-nip-kepala" className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-0.5">
                    NIP Kepala Sekolah
                  </label>
                  <input
                    id="input-nip-kepala"
                    type="text"
                    value={formData.nipKepalaSekolah || ''}
                    onChange={(e) => handleChange('nipKepalaSekolah', e.target.value)}
                    placeholder="19700512 199503 2 001"
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label htmlFor="input-pangkat-kepala" className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-0.5">
                    Pangkat / Golongan Ruang
                  </label>
                  <input
                    id="input-pangkat-kepala"
                    type="text"
                    value={formData.pangkatKepalaSekolah || ''}
                    onChange={(e) => handleChange('pangkatKepalaSekolah', e.target.value)}
                    placeholder="Pembina Utama Muda / IV c"
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>
            </div>

            {/* Card 5: Penomoran Surat Otomatis Sesuai Aturan Sekolah / Pemerintah */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-4 sm:p-5 space-y-3">
              <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                <Hash className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                    5. Penyesuaian Pola Nomor Surat Sekolah
                  </h3>
                  <p className="text-[10.5px] text-slate-500">
                    Sesuaikan struktur penomoran surat agar cocok dengan standar sekolah / madrasah / dinas Anda.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {/* Format Presets */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Pilihan Format Cepat (Klik untuk Menerapkan):
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleChange('formatPenomoran', '{KLASIFIKASI}/{NO}/{KODE}/{BULAN_ROMAWI}/{TAHUN}')}
                      className={`text-left p-2 rounded border text-[10.5px] transition-all cursor-pointer ${
                        formData.formatPenomoran === '{KLASIFIKASI}/{NO}/{KODE}/{BULAN_ROMAWI}/{TAHUN}'
                          ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/60 font-semibold text-blue-900 dark:text-blue-200'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="font-bold">1. Standar Kemendikbudristek</div>
                      <div className="font-mono text-[10px] text-slate-500 truncate">{'{KLASIFIKASI}/{NO}/{KODE}/{BULAN_ROMAWI}/{TAHUN}'}</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleChange('formatPenomoran', '{NO}/{KLASIFIKASI}/{KODE}/{BULAN_ROMAWI}/{TAHUN}')}
                      className={`text-left p-2 rounded border text-[10.5px] transition-all cursor-pointer ${
                        formData.formatPenomoran === '{NO}/{KLASIFIKASI}/{KODE}/{BULAN_ROMAWI}/{TAHUN}'
                          ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/60 font-semibold text-blue-900 dark:text-blue-200'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="font-bold">2. Nomor di Depan</div>
                      <div className="font-mono text-[10px] text-slate-500 truncate">{'{NO}/{KLASIFIKASI}/{KODE}/{BULAN_ROMAWI}/{TAHUN}'}</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleChange('formatPenomoran', '{KLASIFIKASI}/{NO}-{KODE}/{BULAN_ROMAWI}/{TAHUN}')}
                      className={`text-left p-2 rounded border text-[10.5px] transition-all cursor-pointer ${
                        formData.formatPenomoran === '{KLASIFIKASI}/{NO}-{KODE}/{BULAN_ROMAWI}/{TAHUN}'
                          ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/60 font-semibold text-blue-900 dark:text-blue-200'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="font-bold">3. Garis Sambung (No-Kode)</div>
                      <div className="font-mono text-[10px] text-slate-500 truncate">{'{KLASIFIKASI}/{NO}-{KODE}/{BULAN_ROMAWI}/{TAHUN}'}</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleChange('formatPenomoran', '{KLASIFIKASI}/{NO}/{KODE}/{TAHUN}')}
                      className={`text-left p-2 rounded border text-[10.5px] transition-all cursor-pointer ${
                        formData.formatPenomoran === '{KLASIFIKASI}/{NO}/{KODE}/{TAHUN}'
                          ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/60 font-semibold text-blue-900 dark:text-blue-200'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="font-bold">4. Ringkas Tanpa Bulan Romawi</div>
                      <div className="font-mono text-[10px] text-slate-500 truncate">{'{KLASIFIKASI}/{NO}/{KODE}/{TAHUN}'}</div>
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="input-format-nomor" className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-0.5">
                    Pola Format Penomoran Kustom
                  </label>
                  <input
                    id="input-format-nomor"
                    type="text"
                    value={formData.formatPenomoran || ''}
                    onChange={(e) => handleChange('formatPenomoran', e.target.value)}
                    placeholder="{KLASIFIKASI}/{NO}/{KODE}/{BULAN_ROMAWI}/{TAHUN}"
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block leading-relaxed">
                    Tag yang tersedia: <code className="text-blue-600 font-bold">&#123;KLASIFIKASI&#125;</code>, <code className="text-blue-600 font-bold">&#123;NO&#125;</code>, <code className="text-blue-600 font-bold">&#123;KODE&#125;</code>, <code className="text-blue-600 font-bold">&#123;BULAN_ROMAWI&#125;</code>, <code className="text-blue-600 font-bold">&#123;BULAN&#125;</code>, <code className="text-blue-600 font-bold">&#123;TAHUN&#125;</code>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="input-kode-sekolah" className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-0.5">
                      Kode Singkatan Sekolah (&#123;KODE&#125;)
                    </label>
                    <input
                      id="input-kode-sekolah"
                      type="text"
                      value={formData.kodeSekolah || ''}
                      onChange={(e) => handleChange('kodeSekolah', e.target.value)}
                      placeholder="SDN01-JP"
                      className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <label htmlFor="input-digit-nomor" className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-0.5">
                      Jumlah Digit Nomor Urut
                    </label>
                    <select
                      id="input-digit-nomor"
                      value={formData.digitNomorUrut || 3}
                      onChange={(e) => handleChange('digitNomorUrut', parseInt(e.target.value, 10))}
                      className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-600"
                    >
                      <option value={3}>3 Digit (001, 002, ...)</option>
                      <option value={4}>4 Digit (0001, 0002, ...)</option>
                      <option value={2}>2 Digit (01, 02, ...)</option>
                    </select>
                  </div>
                </div>

                {/* Example Preview */}
                <div className="p-2.5 bg-blue-50/70 dark:bg-blue-950/40 rounded-lg border border-blue-200/60 dark:border-blue-800/60 space-y-1">
                  <div className="text-[10px] font-bold text-blue-900/70 dark:text-blue-300/80 uppercase">Pratinjau Hasil Penomoran Surat:</div>
                  <div className="text-xs font-mono font-bold text-blue-950 dark:text-blue-200">
                    {(formData.formatPenomoran || '{KLASIFIKASI}/{NO}/{KODE}/{BULAN_ROMAWI}/{TAHUN}')
                      .replace('{KLASIFIKASI}', '800.1.11.1')
                      .replace('{NO}', (formData.digitNomorUrut === 4 ? '0001' : formData.digitNomorUrut === 2 ? '01' : '001'))
                      .replace('{KODE}', formData.kodeSekolah || 'SDN01')
                      .replace('{BULAN_ROMAWI}', 'VIII')
                      .replace('{BULAN}', '08')
                      .replace('{TAHUN}', '2026')}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    (Contoh dengan klasifikasi Surat Tugas: 800.1.11.1. Untuk surat siswa otomatis menggunakan 421.2)
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Save Action */}
            <button
              id="sekolah-bottom-save-btn"
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Save className="w-3.5 h-3.5" />
              <span>SIMPAN SEMUA PENGATURAN SEKOLAH</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
