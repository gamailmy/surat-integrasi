import React, { useState } from 'react';
import { 
  X, 
  FileDown, 
  Printer, 
  FileText, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Calendar,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SuratRecord } from '../types';
import { LetterDocumentPreview } from './LetterDocumentPreview';
import { exportSuratRecordToPdf, exportToWord, printLetter } from '../services/pdfGenerator';

interface ViewLetterModalProps {
  surat: SuratRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (id: string, newStatus: SuratRecord['status']) => void;
}

export const ViewLetterModal: React.FC<ViewLetterModalProps> = ({
  surat,
  isOpen,
  onClose,
  onStatusChange,
}) => {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen || !surat) return null;

  const handleDownloadPdf = async () => {
    try {
      setIsExporting(true);
      await exportSuratRecordToPdf(surat);
    } catch (e) {
      console.error('PDF error:', e);
      alert('Terjadi kendala saat export PDF. Anda dapat menggunakan tombol Cetak atau download versi Word/Docs.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadWord = async () => {
    try {
      setIsExporting(true);
      await exportToWord(surat);
    } catch (e) {
      console.error('Word export error:', e);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = async () => {
    const element = document.getElementById('view-modal-letter-preview');
    if (element) {
      await printLetter(element);
    } else {
      await printLetter(surat);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-3 bg-slate-900/70 backdrop-blur-xs">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="bg-slate-100 dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-5xl h-[92vh] flex flex-col overflow-hidden border border-slate-300 dark:border-slate-800"
      >
        {/* Header Toolbar */}
        <div className="modal-toolbar no-print bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-3.5 sm:px-4 py-2.5 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm font-mono truncate max-w-[200px] sm:max-w-md">
                  {surat.nomorSurat}
                </h3>
                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 hidden sm:inline">
                  {surat.jenisSurat}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[250px] sm:max-w-md">
                Penerima: <strong className="text-slate-700 dark:text-slate-200">{surat.namaPenerima}</strong> &bull; {surat.dataSekolahSnapshot.namaSekolah}
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-1.5">
            {/* Zoom Controls */}
            <div className="hidden md:flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 mr-1">
              <button
                onClick={() => setZoomLevel(prev => Math.max(60, prev - 10))}
                className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono px-1 font-semibold text-slate-700 dark:text-slate-300 min-w-[36px] text-center">
                {zoomLevel}%
              </span>
              <button
                onClick={() => setZoomLevel(prev => Math.min(140, prev + 10))}
                className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel(100)}
                className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded transition-colors"
                title="Reset Zoom"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>

            <button
              id="view-modal-pdf-btn"
              onClick={handleDownloadPdf}
              disabled={isExporting}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              {isExporting ? (
                <span>Generating...</span>
              ) : (
                <>
                  <FileDown className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Download PDF</span>
                  <span className="sm:hidden">PDF</span>
                </>
              )}
            </button>

            <button
              id="view-modal-word-btn"
              onClick={handleDownloadWord}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
              title="Download format Word / Docs"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Word / Docs</span>
              <span className="sm:hidden">Docs</span>
            </button>

            <button
              id="view-modal-print-btn"
              onClick={handlePrint}
              className="p-1.5 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              title="Cetak Surat"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>

            <button
              id="view-modal-close-btn"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer ml-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body: Scrollable Paper Preview */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 flex justify-center bg-slate-200/60 dark:bg-slate-950/80">
          <div 
            style={{ 
              transform: `scale(${zoomLevel / 100})`, 
              transformOrigin: 'top center',
              transition: 'transform 0.15s ease-out'
            }}
            className="w-full flex justify-center"
          >
            <LetterDocumentPreview 
              surat={surat} 
              id="view-modal-letter-preview" 
            />
          </div>
        </div>

        {/* Footer Status & Meta info */}
        <div className="modal-footer-meta no-print bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between text-xs text-slate-600 dark:text-slate-400 gap-2">
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              Dibuat: <strong className="text-slate-700 dark:text-slate-200">{new Date(surat.waktuDibuat).toLocaleDateString('id-ID')}</strong>
            </span>
            <span className="hidden sm:flex items-center gap-1">
              <User className="w-3 h-3 text-slate-400" />
              Operator: <strong className="text-slate-700 dark:text-slate-200">{surat.dibuatOleh}</strong>
            </span>
          </div>

          {/* Status changer */}
          {onStatusChange && (
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Status:</span>
              <select
                id="view-modal-status-select"
                value={surat.status || 'Tercatat'}
                onChange={(e) => onStatusChange(surat.id, e.target.value as SuratRecord['status'])}
                className="text-xs font-semibold px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="Tercatat">Tercatat</option>
                <option value="Terkirim">Terkirim</option>
                <option value="Selesai">Selesai</option>
                <option value="Dibatalkan">Dibatalkan</option>
              </select>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
