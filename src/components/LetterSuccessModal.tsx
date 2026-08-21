import React, { useEffect, useState } from 'react';
import { 
  CheckCircle2, 
  FileDown, 
  Eye, 
  PlusCircle, 
  FileText, 
  Printer, 
  ExternalLink,
  FolderCheck,
  X 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SuratRecord } from '../types';
import { exportSuratRecordToPdf, exportToWord, printLetter } from '../services/pdfGenerator';

interface LetterSuccessModalProps {
  surat: SuratRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onPreview: (surat: SuratRecord) => void;
  onResetCreate: () => void;
  onNavigateArchive: () => void;
}

export const LetterSuccessModal: React.FC<LetterSuccessModalProps> = ({
  surat,
  isOpen,
  onClose,
  onPreview,
  onResetCreate,
  onNavigateArchive,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (isOpen && surat) {
      try {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#2563eb', '#38bdf8', '#10b981', '#fbbf24'],
        });
      } catch {
        // ignore if not supported
      }
    }
  }, [isOpen, surat]);

  if (!isOpen || !surat) return null;

  const handleDownloadPdf = async () => {
    try {
      setIsDownloading(true);
      await exportSuratRecordToPdf(surat);
    } catch (e) {
      console.error('Download error:', e);
      onPreview(surat);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadWord = () => {
    exportToWord(surat);
  };

  const handlePrint = () => {
    const element = document.getElementById('letter-paper-preview') || document.getElementById(`letter-${surat.id}`);
    if (element) {
      printLetter(element);
    } else {
      onPreview(surat);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-md w-full p-5 border border-slate-200 dark:border-slate-800 relative overflow-hidden">
        {/* Close button */}
        <button
          id="success-modal-close-btn"
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Success Icon & Badge */}
        <div className="text-center">
          <div className="w-11 h-11 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center mx-auto mb-2.5">
            <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[10px] font-semibold mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
            Tersimpan di Google Drive & Sheets
          </div>

          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            SURAT BERHASIL DIBUAT!
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
            Surat resmi otomatis dicatat ke database dan siap diunduh.
          </p>
        </div>

        {/* Letter Details Card */}
        <div className="mt-3.5 p-3 rounded-lg bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-800/60 space-y-1.5 text-left">
          <div className="flex items-center justify-between border-b border-blue-200/50 dark:border-blue-800/60 pb-1.5">
            <span className="text-[10px] text-blue-900/70 dark:text-blue-300/80 font-semibold uppercase">Nomor Surat</span>
            <span className="text-xs font-bold text-blue-950 dark:text-blue-200 font-mono">
              {surat.nomorSurat}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Jenis Surat</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px]">{surat.jenisSurat}</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Penerima</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px] truncate block">{surat.namaPenerima}</span>
            </div>
          </div>

          <div className="pt-1 border-t border-blue-200/40 dark:border-blue-800/40 flex items-center gap-1 text-[10px] text-blue-800 dark:text-blue-300">
            <FolderCheck className="w-3 h-3 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="truncate font-mono">Folder: <strong>{surat.driveFolder || 'SURATKU - Arsip Surat/2026/Agustus'}</strong></span>
          </div>
        </div>

        {/* Main Action Buttons */}
        <div className="mt-4 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              id="success-open-pdf-btn"
              onClick={() => onPreview(surat)}
              className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>BUKA PDF</span>
            </button>

            <button
              id="success-download-pdf-btn"
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="w-full py-2 px-3 bg-slate-900 dark:bg-blue-600 dark:hover:bg-blue-500 hover:bg-slate-800 disabled:opacity-60 text-white text-xs font-bold rounded-lg shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>{isDownloading ? 'MENGUNDUH...' : 'DOWNLOAD PDF'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              id="success-download-word-btn"
              onClick={handleDownloadWord}
              className="w-full py-1.5 px-2.5 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-slate-700 text-[11px] font-semibold rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer"
            >
              <FileText className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              <span>GOOGLE DOCS</span>
            </button>

            <button
              id="success-print-btn"
              onClick={handlePrint}
              className="w-full py-1.5 px-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer"
            >
              <Printer className="w-3 h-3 text-slate-600 dark:text-slate-400" />
              <span>CETAK SURAT</span>
            </button>
          </div>
        </div>

        {/* Next actions */}
        <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <button
            id="success-create-new-btn"
            onClick={onResetCreate}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-bold flex items-center gap-1 cursor-pointer py-0.5 text-[11px]"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>BUAT SURAT BARU</span>
          </button>

          <button
            id="success-goto-archive-btn"
            onClick={onNavigateArchive}
            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-semibold flex items-center gap-1 cursor-pointer py-0.5 text-[11px]"
          >
            <span>Lihat Arsip</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
