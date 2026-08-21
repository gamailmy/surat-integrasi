import React, { useState } from 'react';
import { FileText, MapPin, Stamp, CheckCheck, Layers } from 'lucide-react';
import { SuratRecord } from '../types';
import { formatIndonesianDate } from '../services/storage';

export type LetterPreviewPage = 'all' | 'surat' | 'sppd1' | 'sppd2' | 'sppd_all';

interface LetterDocumentPreviewProps {
  surat: SuratRecord;
  scale?: number;
  id?: string;
  defaultPage?: LetterPreviewPage;
  showPageSelector?: boolean;
}

// 1. KOP SURAT RESMI
const KopSurat: React.FC<{ sek: SuratRecord['dataSekolahSnapshot'] }> = ({ sek }) => {
  const showLogoKiri = sek.tampilkanLogoKiri !== false && !!sek.logoKiri;
  const showLogoKanan = sek.tampilkanLogoKanan !== false && !!sek.logoKanan;

  return (
    <div>
      <div className="flex items-center justify-between gap-3 pb-1">
        {showLogoKiri ? (
          <div className="w-20 h-20 flex-shrink-0 flex items-center justify-center">
            <img 
              src={sek.logoKiri} 
              alt="Logo Kop Kiri" 
              className="max-w-full max-h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
        ) : (
          <div className="w-16 h-16 flex-shrink-0 opacity-0 pointer-events-none" />
        )}

        <div className="text-center flex-1 px-1">
          {sek.instansiAtasan1 && (
            <div className="text-[12px] sm:text-[13px] font-bold uppercase tracking-wider text-slate-900 leading-tight">
              {sek.instansiAtasan1}
            </div>
          )}
          {sek.instansiAtasan2 && (
            <div className="text-[12px] sm:text-[13px] font-bold uppercase tracking-wider text-slate-900 leading-tight">
              {sek.instansiAtasan2}
            </div>
          )}
          <div className="text-[16px] sm:text-[18px] font-extrabold uppercase text-slate-950 tracking-normal my-0.5 leading-tight font-sans">
            {sek.namaSekolah || 'UPTD SATUAN PENDIDIKAN'}
          </div>
          <div className="text-[11px] text-slate-800 leading-tight font-sans">
            NPSN: <span className="font-semibold">{sek.npsn || '-'}</span> {sek.nss ? `| NSS: ${sek.nss}` : ''}
          </div>
          <div className="text-[10.5px] text-slate-700 font-sans leading-tight mt-0.5">
            {sek.alamat}{sek.desa ? `, ${sek.desa}` : ''}{sek.kecamatan ? `, Kec. ${sek.kecamatan}` : ''}, {sek.kabupaten} {sek.kodePos}
          </div>
          <div className="text-[10px] text-slate-600 font-sans leading-tight mt-0.5">
            {sek.telepon ? `Telp: ${sek.telepon}` : ''} {sek.email ? ` | Email: ${sek.email}` : ''} {sek.website ? ` | Website: ${sek.website}` : ''}
          </div>
        </div>

        {showLogoKanan ? (
          <div className="w-20 h-20 flex-shrink-0 flex items-center justify-center">
            <img 
              src={sek.logoKanan} 
              alt="Logo Kop Kanan" 
              className="max-w-full max-h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
        ) : (
          <div className="w-16 h-16 flex-shrink-0 opacity-0 pointer-events-none" />
        )}
      </div>

      {/* Garis Pemisah KOP Ganda (3px Tebal + 1px Tipis) */}
      <div className="mt-1 mb-5">
        <div className="border-t-[3px] border-black w-full" />
        <div className="border-t-[1px] border-black w-full mt-[2px]" />
      </div>
    </div>
  );
};

// 2. TANDA TANGAN KEPALA SEKOLAH
const TandaTanganKepalaSekolah: React.FC<{ 
  sek: SuratRecord['dataSekolahSnapshot']; 
  tanggalSurat: string;
  labelJabatan?: string;
  customName?: string;
  customNip?: string;
}> = ({ 
  sek, 
  tanggalSurat, 
  labelJabatan,
  customName,
  customNip 
}) => {
  const tglFormatted = formatIndonesianDate(tanggalSurat);
  const nama = customName || sek.namaKepalaSekolah;
  const nip = customNip || sek.nipKepalaSekolah;
  const jabatan = labelJabatan || `Kepala ${sek.namaSekolah}`;

  return (
    <div className="mt-8 flex justify-end">
      <div className="w-72 text-center text-[12.5px] leading-relaxed">
        <div>{sek.kabupaten}, {tglFormatted}</div>
        <div className="font-semibold mt-0.5">{jabatan},</div>
        
        {/* Space for stamp & signature */}
        <div className="h-16" />

        <div className="font-bold underline text-slate-950 text-[13px]">
          {nama}
        </div>
        <div className="text-[11.5px] font-mono text-slate-900 mt-0.5">
          NIP. {nip || '-'}
        </div>
        {sek.pangkatKepalaSekolah && !customName && (
          <div className="text-[11px] text-slate-700 mt-0.5">
            {sek.pangkatKepalaSekolah}
          </div>
        )}
      </div>
    </div>
  );
};

// 3. LEMBAR I SPPD (SURAT PERINTAH PERJALANAN DINAS)
const SppdLembarDepan: React.FC<{ surat: SuratRecord; sek: SuratRecord['dataSekolahSnapshot'] }> = ({ surat, sek }) => {
  const tglSurat = formatIndonesianDate(surat.tanggalSurat);
  const tglBerangkat = formatIndonesianDate(surat.tanggalBerangkat || surat.tanggalSurat);
  const tglKembali = formatIndonesianDate(surat.tanggalKembali || surat.tanggalSurat);

  return (
    <div className="space-y-3">
      {/* Header SPPD kanan atas */}
      <div className="flex justify-end text-[11px] font-mono text-slate-700 mb-1">
        <table className="text-[11px] border-collapse">
          <tbody>
            <tr>
              <td className="pr-2">Lembar Ke</td>
              <td>: I (Satu)</td>
            </tr>
            <tr>
              <td className="pr-2">Kode No</td>
              <td>: {surat.kodeKlasifikasi || '094'} / SPPD</td>
            </tr>
            <tr>
              <td className="pr-2">Nomor</td>
              <td className="font-bold text-slate-950 font-sans">: {surat.nomorSppd || surat.nomorSurat}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="text-center my-2">
        <h2 className="text-[14.5px] font-bold underline tracking-wider uppercase text-slate-950 font-sans">
          SURAT PERINTAH PERJALANAN DINAS (SPPD)
        </h2>
      </div>

      {/* Tabel 10 Poin Standar SPPD */}
      <table className="w-full border-collapse border border-slate-900 text-[12px] my-2">
        <tbody>
          <tr>
            <td className="border border-slate-900 px-2 py-1.5 w-8 text-center align-top font-bold">1.</td>
            <td className="border border-slate-900 px-2.5 py-1.5 w-64 align-top">
              Pejabat Pembuat Komitmen / Pejabat yang memberi perintah
            </td>
            <td className="border border-slate-900 px-2.5 py-1.5 align-top font-semibold text-slate-950">
              {surat.pejabatPemberiPerintah || sek.namaKepalaSekolah}
              <div className="text-[10.5px] font-normal text-slate-600">
                {surat.jabatanPejabatPemberiPerintah || `Kepala ${sek.namaSekolah}`}
              </div>
            </td>
          </tr>

          <tr>
            <td className="border border-slate-900 px-2 py-1.5 text-center align-top font-bold">2.</td>
            <td className="border border-slate-900 px-2.5 py-1.5 align-top">
              Nama Pegawai yang diperintahkan
            </td>
            <td className="border border-slate-900 px-2.5 py-1.5 align-top">
              <div className="font-bold text-slate-950">{surat.namaPenerima}</div>
              {surat.nisNip && surat.nisNip !== '-' && (
                <div className="text-[11.5px] font-mono text-slate-800 mt-0.5">
                  NIP. {surat.nisNip}
                </div>
              )}
            </td>
          </tr>

          <tr>
            <td className="border border-slate-900 px-2 py-1.5 text-center align-top font-bold">3.</td>
            <td className="border border-slate-900 px-2.5 py-1.5 align-top">
              a. Pangkat dan Golongan ruang gaji<br />
              b. Jabatan / Instansi<br />
              c. Tingkat Biaya Perjalanan Dinas
            </td>
            <td className="border border-slate-900 px-2.5 py-1.5 align-top space-y-0.5">
              <div>a. {surat.pangkatGolongan || 'Penata Muda / III a'}</div>
              <div>b. {surat.kelasJabatan || 'Guru'} / {sek.namaSekolah}</div>
              <div className="font-semibold text-slate-950">c. {surat.tingkatBiaya || 'Tingkat C'}</div>
            </td>
          </tr>

          <tr>
            <td className="border border-slate-900 px-2 py-1.5 text-center align-top font-bold">4.</td>
            <td className="border border-slate-900 px-2.5 py-1.5 align-top">
              Maksud Perjalanan Dinas
            </td>
            <td className="border border-slate-900 px-2.5 py-1.5 align-top font-medium text-slate-950 leading-snug">
              {surat.keperluan}
            </td>
          </tr>

          <tr>
            <td className="border border-slate-900 px-2 py-1.5 text-center align-top font-bold">5.</td>
            <td className="border border-slate-900 px-2.5 py-1.5 align-top">
              Alat angkut yang dipergunakan
            </td>
            <td className="border border-slate-900 px-2.5 py-1.5 align-top">
              {surat.alatAngkut || 'Kendaraan Umum / Angkutan Darat'}
            </td>
          </tr>

          <tr>
            <td className="border border-slate-900 px-2 py-1.5 text-center align-top font-bold">6.</td>
            <td className="border border-slate-900 px-2.5 py-1.5 align-top">
              a. Tempat Berangkat<br />
              b. Tempat Tujuan
            </td>
            <td className="border border-slate-900 px-2.5 py-1.5 align-top space-y-0.5">
              <div>a. {surat.tempatBerangkat || sek.namaSekolah}</div>
              <div className="font-semibold text-slate-950">b. {surat.tempatTujuan || surat.tempat || 'Lokasi Kegiatan'}</div>
            </td>
          </tr>

          <tr>
            <td className="border border-slate-900 px-2 py-1.5 text-center align-top font-bold">7.</td>
            <td className="border border-slate-900 px-2.5 py-1.5 align-top">
              a. Lamanya Perjalanan Dinas<br />
              b. Tanggal Berangkat<br />
              c. Tanggal Harus Kembali / Tiba
            </td>
            <td className="border border-slate-900 px-2.5 py-1.5 align-top space-y-0.5">
              <div>a. {surat.lamaHari || '1 (Satu) Hari'}</div>
              <div>b. {tglBerangkat}</div>
              <div>c. {tglKembali}</div>
            </td>
          </tr>

          <tr>
            <td className="border border-slate-900 px-2 py-1.5 text-center align-top font-bold">8.</td>
            <td className="border border-slate-900 px-2.5 py-1.5 align-top">
              Pengikut / Nama
            </td>
            <td className="border border-slate-900 px-2.5 py-1.5 align-top">
              {surat.pengikut || '-'}
            </td>
          </tr>

          <tr>
            <td className="border border-slate-900 px-2 py-1.5 text-center align-top font-bold">9.</td>
            <td className="border border-slate-900 px-2.5 py-1.5 align-top">
              Pembebanan Anggaran<br />
              a. Instansi<br />
              b. Mata Anggaran / Akun
            </td>
            <td className="border border-slate-900 px-2.5 py-1.5 align-top space-y-0.5">
              <div>a. {surat.instansiAnggaran || `Dana BOS ${sek.namaSekolah}`}</div>
              <div className="text-[11.5px] font-mono">b. {surat.mataAnggaran || '5.1.02.04.01.0001 (Belanja Perjalanan Dinas Biasa)'}</div>
            </td>
          </tr>

          <tr>
            <td className="border border-slate-900 px-2 py-1.5 text-center align-top font-bold">10.</td>
            <td className="border border-slate-900 px-2.5 py-1.5 align-top">
              Keterangan Lain-lain
            </td>
            <td className="border border-slate-900 px-2.5 py-1.5 align-top text-[11px] leading-snug">
              {surat.keterangan || `Sesuai Surat Tugas Nomor: ${surat.nomorSurat}`}
            </td>
          </tr>
        </tbody>
      </table>

      {/* TTD Pengesahan SPPD */}
      <div className="mt-4 flex justify-end text-[12px]">
        <div className="w-72 text-center leading-tight">
          <div>Dikeluarkan di: {sek.kabupaten}</div>
          <div>Pada tanggal: {tglSurat}</div>
          <div className="font-semibold mt-1">Pejabat Pembuat Komitmen / Kepala Sekolah,</div>
          
          <div className="h-16" />

          <div className="font-bold underline text-slate-950 text-[12.5px]">
            {sek.namaKepalaSekolah}
          </div>
          <div className="text-[11.5px] font-mono text-slate-900 mt-0.5">
            NIP. {sek.nipKepalaSekolah || '-'}
          </div>
        </div>
      </div>
    </div>
  );
};

// 4. LEMBAR II SPPD (LEMBAR VISUM & PENGESAHAN PERJALANAN DINAS)
const toRomanNumeral = (num: number): string => {
  const romanMap: [number, string][] = [
    [10, 'X'],
    [9, 'IX'],
    [8, 'VIII'],
    [7, 'VII'],
    [6, 'VI'],
    [5, 'V'],
    [4, 'IV'],
    [3, 'III'],
    [2, 'II'],
    [1, 'I'],
  ];
  let result = '';
  let n = num;
  for (const [val, roman] of romanMap) {
    while (n >= val) {
      result += roman;
      n -= val;
    }
  }
  return result || 'I';
};

interface VisumDayInfo {
  dayIndex: number;
  dateStr: string;
  formattedDate: string;
  isFirstDay: boolean;
  isLastDay: boolean;
}

const getVisumDaysList = (surat: SuratRecord): VisumDayInfo[] => {
  const tglStartStr = surat.tanggalBerangkat || surat.tanggalSurat;
  const tglEndStr = surat.tanggalKembali || tglStartStr;

  if (!tglStartStr) {
    return [{ dayIndex: 1, dateStr: '', formattedDate: '', isFirstDay: true, isLastDay: true }];
  }

  const start = new Date(tglStartStr);
  const end = tglEndStr ? new Date(tglEndStr) : start;

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start.getTime() > end.getTime()) {
    return [{
      dayIndex: 1,
      dateStr: tglStartStr,
      formattedDate: formatIndonesianDate(tglStartStr),
      isFirstDay: true,
      isLastDay: true,
    }];
  }

  const diffTime = Math.abs(end.getTime() - start.getTime());
  const calculatedDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
  const totalDays = Math.max(calculatedDays, 1);

  const days: VisumDayInfo[] = [];
  for (let i = 0; i < totalDays; i++) {
    const currDate = new Date(start);
    currDate.setDate(start.getDate() + i);
    const isoStr = currDate.toISOString().split('T')[0];
    days.push({
      dayIndex: i + 1,
      dateStr: isoStr,
      formattedDate: formatIndonesianDate(isoStr),
      isFirstDay: i === 0,
      isLastDay: i === totalDays - 1,
    });
  }

  return days;
};

export interface VisumPageChunk {
  pageIndex: number;
  totalPages: number;
  days: VisumDayInfo[];
  isFirstPage: boolean;
  isLastPage: boolean;
}

export const getVisumPages = (surat: SuratRecord): VisumPageChunk[] => {
  const allDays = getVisumDaysList(surat);

  // If 1 to 5 days, fit completely on 1 single page without creating empty sheets
  if (allDays.length <= 5) {
    return [{
      pageIndex: 0,
      totalPages: 1,
      days: allDays,
      isFirstPage: true,
      isLastPage: true,
    }];
  }

  // For 6 or more days, fill each page to maximum capacity before breaking to the next page
  const pages: VisumPageChunk[] = [];
  let dayPointer = 0;
  let pageIdx = 0;

  while (dayPointer < allDays.length) {
    const isFirstPage = pageIdx === 0;
    const remainingDays = allDays.length - dayPointer;

    // Page 1 contains Box I (Keberangkatan), so it fits 5 days to fill the first sheet completely.
    // Subsequent pages without Box I can fit up to 6 days (or 5 days if combined with the closing box).
    let capacity = 5;
    if (!isFirstPage) {
      if (remainingDays <= 5) {
        capacity = remainingDays;
      } else {
        capacity = 6;
      }
    }

    const takeCount = Math.min(capacity, remainingDays);
    const chunkDays = allDays.slice(dayPointer, dayPointer + takeCount);
    dayPointer += takeCount;

    pages.push({
      pageIndex: pageIdx,
      totalPages: 1, // updated below
      days: chunkDays,
      isFirstPage,
      isLastPage: dayPointer >= allDays.length,
    });
    pageIdx++;
  }

  return pages.map(p => ({ ...p, totalPages: pages.length }));
};

const SppdLembarVisumPage: React.FC<{ 
  surat: SuratRecord; 
  sek: SuratRecord['dataSekolahSnapshot'];
  chunk: VisumPageChunk;
  totalTravelDays: number;
}> = ({ surat, sek, chunk, totalTravelDays }) => {
  const tempatTujuan = surat.tempatTujuan || surat.tempat || 'Lokasi Tujuan';
  const tempatBerangkat = surat.tempatBerangkat || sek.namaSekolah || 'Tempat Kedudukan';
  const tglBerangkat = surat.tanggalBerangkat ? formatIndonesianDate(surat.tanggalBerangkat) : (surat.tanggalSurat ? formatIndonesianDate(surat.tanggalSurat) : '');
  const tglKembali = surat.tanggalKembali ? formatIndonesianDate(surat.tanggalKembali) : tglBerangkat;

  const isSingleDay = totalTravelDays === 1;
  // Adaptive signature height to fill page elegantly according to row count
  const sigHeightClass = isSingleDay 
    ? 'h-14' 
    : (chunk.days.length === 2 ? 'h-11' : (chunk.days.length <= 4 ? 'h-8' : 'h-6'));

  return (
    <div className="w-full font-serif text-[10px] sm:text-[10.5px] text-black">
      {/* Header if continuing to next pages */}
      {!chunk.isFirstPage && (
        <div className="mb-2.5 pb-1 border-b border-slate-400 flex justify-between items-center text-[10.5px] text-slate-700">
          <span className="font-semibold italic">Lanjutan Lembar Visum SPPD - {surat.nomorSurat || ''}</span>
          <span>Halaman {chunk.pageIndex + 1} dari {chunk.totalPages}</span>
        </div>
      )}

      <table className="w-full table-fixed border-collapse border border-black leading-tight">
        <colgroup>
          <col style={{ width: '50%' }} />
          <col style={{ width: '50%' }} />
        </colgroup>
        <tbody>
          {/* I. Bagian Pertama: Keberangkatan dari Tempat Kedudukan (HANYA DI HALAMAN PERTAMA) */}
          {chunk.isFirstPage && (
            <tr>
              <td className="border border-black p-2 w-1/2 align-top box-border overflow-hidden">
                <div className="font-semibold text-black text-[11px]">I.</div>
              </td>
              <td className="border border-black p-2 w-1/2 align-top box-border overflow-hidden">
                <table className="w-full table-fixed text-[10px] sm:text-[10.5px] border-collapse">
                  <tbody>
                    <tr>
                      <td className="w-[105px] py-0.5 text-black align-top">Berangkat dari</td>
                      <td className="w-2.5 py-0.5 text-center align-top">:</td>
                      <td className="py-0.5 font-medium break-words">{tempatBerangkat}</td>
                    </tr>
                    <tr>
                      <td className="py-0.5 text-black align-top text-[9.5px]">(Tempat Kedudukan)</td>
                      <td className="py-0.5 text-center align-top"></td>
                      <td className="py-0.5"></td>
                    </tr>
                    <tr>
                      <td className="py-0.5 text-black align-top">Ke</td>
                      <td className="py-0.5 text-center align-top">:</td>
                      <td className="py-0.5 font-medium break-words">{tempatTujuan}</td>
                    </tr>
                    <tr>
                      <td className="py-0.5 text-black align-top">Pada tanggal</td>
                      <td className="py-0.5 text-center align-top">:</td>
                      <td className="py-0.5 break-words">{tglBerangkat}</td>
                    </tr>
                  </tbody>
                </table>

                <div className="mt-2 text-center">
                  <div className="text-center text-[10px] font-medium">Pemberi Tugas,</div>
                  <div className={sigHeightClass} />
                  <div className="font-bold underline text-[10.5px] text-slate-950 text-center">
                    {sek.namaKepalaSekolah}
                  </div>
                  <div className="text-center text-[9.5px] mt-0.5 font-mono">
                    NIP. {sek.nipKepalaSekolah || '-'}
                  </div>
                </div>
              </td>
            </tr>
          )}

          {/* II s/d N: Bagian Kunjungan Tempat Tujuan (Disesuaikan nomor romawi bersambung) */}
          {chunk.days.map((vDay) => {
            const romanLabel = toRomanNumeral(vDay.dayIndex + 1);
            
            // For single day travel:
            if (isSingleDay) {
              return (
                <tr key={`visum-day-${vDay.dayIndex}`}>
                  <td className="border border-black p-2 w-1/2 align-top box-border overflow-hidden">
                    <table className="w-full table-fixed text-[10px] sm:text-[10.5px] border-collapse">
                      <tbody>
                        <tr>
                          <td className="w-4 py-0.5 font-semibold text-black align-top">{romanLabel}.</td>
                          <td className="w-[85px] py-0.5 text-black align-top">Tiba di</td>
                          <td className="w-2.5 py-0.5 text-center align-top">:</td>
                          <td className="py-0.5 font-medium break-words">{tempatTujuan}</td>
                        </tr>
                        <tr>
                          <td></td>
                          <td className="py-0.5 text-black align-top">Pada tanggal</td>
                          <td className="py-0.5 text-center align-top">:</td>
                          <td className="py-0.5 break-words">{vDay.formattedDate || tglBerangkat}</td>
                        </tr>
                      </tbody>
                    </table>

                    <div className="mt-2.5 text-center">
                      <div className={sigHeightClass} />
                      <div className="text-[10px] text-center font-normal">
                        ( .................................................... )
                      </div>
                      <div className="text-center text-[9.5px] mt-0.5 font-mono">
                        NIP. &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                      </div>
                    </div>
                  </td>

                  <td className="border border-black p-2 w-1/2 align-top box-border overflow-hidden">
                    <table className="w-full table-fixed text-[10px] sm:text-[10.5px] border-collapse">
                      <tbody>
                        <tr>
                          <td className="w-[95px] py-0.5 text-black align-top">Berangkat dari</td>
                          <td className="w-2.5 py-0.5 text-center align-top">:</td>
                          <td className="py-0.5 font-medium break-words">{tempatTujuan}</td>
                        </tr>
                        <tr>
                          <td className="py-0.5 text-black align-top">Ke</td>
                          <td className="py-0.5 text-center align-top">:</td>
                          <td className="py-0.5 font-medium break-words">{tempatBerangkat}</td>
                        </tr>
                        <tr>
                          <td className="py-0.5 text-black align-top">Pada tanggal</td>
                          <td className="py-0.5 text-center align-top">:</td>
                          <td className="py-0.5 break-words">{vDay.formattedDate || tglKembali}</td>
                        </tr>
                      </tbody>
                    </table>

                    <div className="mt-2.5 text-center">
                      <div className={sigHeightClass} />
                      <div className="text-[10px] text-center font-normal">
                        ( .................................................... )
                      </div>
                      <div className="text-center text-[9.5px] mt-0.5 font-mono">
                        NIP. &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                      </div>
                    </div>
                  </td>
                </tr>
              );
            }

            // For multi-day travel (Hari 1, 2, dst):
            const targetDestNext = vDay.isLastDay ? tempatBerangkat : tempatTujuan;

            return (
              <tr key={`visum-day-${vDay.dayIndex}`}>
                <td className="border border-black p-2 w-1/2 align-top box-border overflow-hidden">
                  <table className="w-full table-fixed text-[10px] sm:text-[10.5px] border-collapse">
                    <tbody>
                      <tr>
                        <td className="w-4 py-0.5 font-semibold text-black align-top">{romanLabel}.</td>
                        <td className="w-[85px] py-0.5 text-black align-top">Tiba di</td>
                        <td className="w-2.5 py-0.5 text-center align-top">:</td>
                        <td className="py-0.5 font-medium break-words">{tempatTujuan}</td>
                      </tr>
                      <tr>
                        <td></td>
                        <td className="py-0.5 text-black align-top">Pada tanggal</td>
                        <td className="py-0.5 text-center align-top">:</td>
                        <td className="py-0.5 break-words">{vDay.formattedDate}</td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="mt-2.5 text-center">
                    <div className={sigHeightClass} />
                    <div className="text-[10px] text-center font-normal">
                      ( .................................................... )
                    </div>
                    <div className="text-center text-[9.5px] mt-0.5 font-mono">
                      NIP. &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    </div>
                  </div>
                </td>

                <td className="border border-black p-2 w-1/2 align-top box-border overflow-hidden">
                  <table className="w-full table-fixed text-[10px] sm:text-[10.5px] border-collapse">
                    <tbody>
                      <tr>
                        <td className="w-[95px] py-0.5 text-black align-top">Berangkat dari</td>
                        <td className="w-2.5 py-0.5 text-center align-top">:</td>
                        <td className="py-0.5 font-medium break-words">{tempatTujuan}</td>
                      </tr>
                      <tr>
                        <td className="py-0.5 text-black align-top">Ke</td>
                        <td className="py-0.5 text-center align-top">:</td>
                        <td className="py-0.5 font-medium break-words">{targetDestNext}</td>
                      </tr>
                      <tr>
                        <td className="py-0.5 text-black align-top">Pada tanggal</td>
                        <td className="py-0.5 text-center align-top">:</td>
                        <td className="py-0.5 break-words">{vDay.formattedDate}</td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="mt-2.5 text-center">
                    <div className={sigHeightClass} />
                    <div className="text-[10px] text-center font-normal">
                      ( .................................................... )
                    </div>
                    <div className="text-center text-[9.5px] mt-0.5 font-mono">
                      NIP. &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    </div>
                  </div>
                </td>
              </tr>
            );
          })}

          {/* Bagian Penutup: Tiba Kembali di Tempat Kedudukan & Pengesahan PA / KPA (HANYA DI HALAMAN TERAKHIR) */}
          {chunk.isLastPage && (() => {
            const finalRoman = toRomanNumeral(totalTravelDays + 2);
            return (
              <tr>
                <td className="border border-black p-2 w-1/2 align-top box-border overflow-hidden">
                  <table className="w-full table-fixed text-[10px] sm:text-[10.5px] border-collapse">
                    <tbody>
                      <tr>
                        <td className="w-4 py-0.5 font-semibold text-black align-top">{finalRoman}.</td>
                        <td className="w-[85px] py-0.5 text-black align-top">Tiba di</td>
                        <td className="w-2.5 py-0.5 text-center align-top">:</td>
                        <td className="py-0.5 font-medium break-words">{tempatBerangkat}</td>
                      </tr>
                      <tr>
                        <td></td>
                        <td className="py-0.5 text-black align-top text-[9.5px]">(Tempat Kedudukan)</td>
                        <td className="py-0.5 text-center align-top"></td>
                        <td className="py-0.5"></td>
                      </tr>
                      <tr>
                        <td></td>
                        <td className="py-0.5 text-black align-top">Pada tanggal</td>
                        <td className="py-0.5 text-center align-top">:</td>
                        <td className="py-0.5 break-words">{tglKembali}</td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="mt-2 text-center">
                    <div className="font-bold uppercase text-[9.5px] sm:text-[10px] leading-tight text-center">
                      PENGGUNA ANGGARAN/ KUASA<br />
                      PENGGUNA ANGGARAN,
                    </div>
                    <div className={sigHeightClass} />
                    <div className="font-bold underline text-[10.5px] text-slate-950 text-center">
                      {sek.namaKepalaSekolah}
                    </div>
                    <div className="text-center text-[9.5px] mt-0.5 font-mono">
                      NIP. {sek.nipKepalaSekolah || '-'}
                    </div>
                  </div>
                </td>

                <td className="border border-black p-2 w-1/2 align-top box-border overflow-hidden">
                  <p className="text-[9.5px] sm:text-[10px] text-justify leading-snug">
                    Telah diperiksa, dengan keterangan bahwa perjalanan tersebut di atas benar dilakukan atas perintahnya dan semata-mata untuk kepentingan jabatan dalam waktu yang sesingkat-singkatnya.
                  </p>

                  <div className="mt-2 text-center">
                    <div className="font-bold uppercase text-[9.5px] sm:text-[10px] leading-tight text-center">
                      PENGGUNA ANGGARAN/ KUASA<br />
                      PENGGUNA ANGGARAN,
                    </div>
                    <div className={sigHeightClass} />
                    <div className="font-bold underline text-[10.5px] text-slate-950 text-center">
                      {sek.namaKepalaSekolah}
                    </div>
                    <div className="text-center text-[9.5px] mt-0.5 font-mono">
                      NIP. {sek.nipKepalaSekolah || '-'}
                    </div>
                  </div>
                </td>
              </tr>
            );
          })()}

          {/* Catatan Lain-Lain (HANYA DI HALAMAN TERAKHIR) */}
          {chunk.isLastPage && (() => {
            const catatanRoman = toRomanNumeral(totalTravelDays + 3);
            return (
              <tr>
                <td className="border border-black p-2 align-top font-semibold text-black text-[10px] sm:text-[10.5px]">
                  {catatanRoman}. &nbsp; CATATAN LAIN-LAIN:
                </td>
                <td className="border border-black p-2 align-top"></td>
              </tr>
            );
          })()}

          {/* Perhatian (HANYA DI HALAMAN TERAKHIR) */}
          {chunk.isLastPage && (() => {
            const perhatianRoman = toRomanNumeral(totalTravelDays + 4);
            return (
              <tr>
                <td colSpan={2} className="border border-black p-2 text-[9.5px] sm:text-[10px] leading-relaxed">
                  <div className="font-semibold text-black mb-0.5 text-[10px] sm:text-[10.5px]">
                    {perhatianRoman}. &nbsp; PERHATIAN :
                  </div>
                  <p className="text-justify text-black">
                    PA/ KPA yang menerbitkan SPD, Pegawai yang melakukan perjalanan dinas, para pejabat yang mengesahkan tanggal berangkat/tiba, serta bendahara pengeluaran bertanggung jawab berdasarkan peraturan-peraturan Keuangan Negara apabila Negara mendapat rugi akibat kesalahan, kelalaian dan kealpaannya.
                  </p>
                </td>
              </tr>
            );
          })()}
        </tbody>
      </table>
    </div>
  );
};

// 5. ISI NASKAH DINAS UTAMA
export const LetterDocumentPreview: React.FC<LetterDocumentPreviewProps> = ({
  surat,
  id = 'letter-paper-preview',
  defaultPage = 'all',
  showPageSelector = true,
}) => {
  const [currentPage, setCurrentPage] = useState<LetterPreviewPage>(defaultPage);
  const sek = surat.dataSekolahSnapshot;
  const tglSuratFormatted = formatIndonesianDate(surat.tanggalSurat);

  const isTugas = surat.jenisSurat === 'Surat Tugas';
  const isSppdDirect = surat.jenisSurat === 'Surat Perintah Perjalanan Dinas (SPPD)';
  const hasSppd = isSppdDirect || (isTugas && surat.sertakanSppd !== false);

  const visumPages = hasSppd ? getVisumPages(surat) : [];
  const totalTravelDays = hasSppd ? getVisumDaysList(surat).length : 1;

  const shouldRenderSurat = (currentPage === 'all' || currentPage === 'surat') && !isSppdDirect;
  const shouldRenderSppd1 = hasSppd && (currentPage === 'all' || currentPage === 'sppd1' || (isSppdDirect && currentPage === 'surat'));
  const shouldRenderSppd2 = hasSppd && (currentPage === 'all' || currentPage === 'sppd2');

  return (
    <div className="w-full space-y-3">
      {/* Selector Tabs if SPPD exists */}
      {hasSppd && showPageSelector && (
        <div className="no-print bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-1 overflow-x-auto">
            {!isSppdDirect && (
              <button
                type="button"
                onClick={() => setCurrentPage('surat')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  currentPage === 'surat'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Lembar 1: Surat Tugas</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setCurrentPage('sppd1')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                currentPage === 'sppd1'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Stamp className="w-3.5 h-3.5" />
              <span>{isSppdDirect ? 'Lembar 1: Rincian SPPD' : 'Lembar 2: SPPD Rincian'}</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentPage('sppd2')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                currentPage === 'sppd2'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>
                {isSppdDirect 
                  ? `Lembar Visum (${visumPages.length > 1 ? `${visumPages.length} Halaman` : 'Lembar 2'})` 
                  : `Lembar Visum (${visumPages.length > 1 ? `${visumPages.length} Halaman` : 'Lembar 3'})`}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentPage('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                currentPage === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Semua Lembar ({visumPages.length > 1 ? `${(isSppdDirect ? 1 : 2) + visumPages.length} Halaman` : 'Paket Lengkap'})</span>
            </button>
          </div>

          <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-md flex items-center gap-1">
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Format SPPD & Visum ({totalTravelDays} Hari {visumPages.length > 1 ? `· ${visumPages.length} Lembar Visum` : ''})</span>
          </span>
        </div>
      )}

      {/* Main Printable Document Container */}
      <div id={id} className="space-y-6 print:space-y-0">
        {/* ================= PAGE 1: SURAT UTAMA ================= */}
        {shouldRenderSurat && (
          <div 
            className="a4-page bg-white text-slate-950 mx-auto font-serif shadow-xl rounded-xs border border-slate-300 print:border-none print:shadow-none transition-all print:m-0"
            style={{
              width: '100%',
              maxWidth: '794px',
              minHeight: '1123px',
              padding: '44px 56px',
              boxSizing: 'border-box',
              fontSize: '13px',
              lineHeight: '1.6',
              color: '#0f172a',
            }}
          >
            <KopSurat sek={sek} />

            {/* === A. SURAT TUGAS === */}
            {surat.jenisSurat === 'Surat Tugas' && (
              <div className="space-y-4">
                <div className="text-center my-3">
                  <h2 className="text-base font-bold underline tracking-wider uppercase text-slate-950 font-sans">
                    SURAT TUGAS
                  </h2>
                  <p className="text-[12px] mt-0.5 text-slate-900 font-sans">
                    Nomor: <span className="font-semibold">{surat.nomorSurat}</span>
                  </p>
                </div>

                <p className="text-justify indent-8 text-[13px] leading-relaxed">
                  Yang bertanda tangan di bawah ini Kepala {sek.namaSekolah}, Kecamatan {sek.kecamatan}, {sek.kabupaten}, Provinsi {sek.provinsi}, dengan ini memberikan tugas kedinasan kepada:
                </p>

                <div className="my-2.5 pl-6 pr-2">
                  <table className="w-full border-collapse text-[13px]">
                    <tbody>
                      <tr>
                        <td className="w-40 py-1 align-top text-slate-800">Nama Lengkap</td>
                        <td className="w-4 py-1 align-top text-center font-bold">:</td>
                        <td className="py-1 font-bold text-slate-950">{surat.namaPenerima}</td>
                      </tr>
                      <tr>
                        <td className="py-1 align-top text-slate-800">NIP / NUPTK</td>
                        <td className="py-1 align-top text-center font-bold">:</td>
                        <td className="py-1 font-mono text-[12.5px]">{surat.nisNip || '-'}</td>
                      </tr>
                      <tr>
                        <td className="py-1 align-top text-slate-800">Pangkat / Golongan</td>
                        <td className="py-1 align-top text-center font-bold">:</td>
                        <td className="py-1">{surat.pangkatGolongan || 'Penata Muda / III a'}</td>
                      </tr>
                      <tr>
                        <td className="py-1 align-top text-slate-800">Jabatan / Tugas</td>
                        <td className="py-1 align-top text-center font-bold">:</td>
                        <td className="py-1">{surat.kelasJabatan || '-'}</td>
                      </tr>
                      <tr>
                        <td className="py-1 align-top text-slate-800">Unit Kerja / Alamat</td>
                        <td className="py-1 align-top text-center font-bold">:</td>
                        <td className="py-1">{surat.alamatPenerima || sek.namaSekolah}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <p className="text-justify indent-8 text-[13px] leading-relaxed">
                  Untuk melaksanakan tugas dalam rangka: <strong className="text-slate-950">{surat.keperluan}</strong>, yang diselenggarakan pada:
                </p>

                <div className="my-2.5 pl-6 pr-2">
                  <table className="w-full border-collapse text-[13px]">
                    <tbody>
                      {surat.hariTanggal && (
                        <tr>
                          <td className="w-40 py-1 align-top text-slate-800">Hari / Tanggal</td>
                          <td className="w-4 py-1 align-top text-center font-bold">:</td>
                          <td className="py-1 font-semibold text-slate-950">{surat.hariTanggal}</td>
                        </tr>
                      )}
                      {!surat.hariTanggal && surat.tanggalKegiatan && (
                        <tr>
                          <td className="w-40 py-1 align-top text-slate-800">Hari / Tanggal</td>
                          <td className="w-4 py-1 align-top text-center font-bold">:</td>
                          <td className="py-1 font-semibold text-slate-950">{surat.tanggalKegiatan}</td>
                        </tr>
                      )}
                      {surat.waktu && (
                        <tr>
                          <td className="py-1 align-top text-slate-800">Waktu Pelaksanaan</td>
                          <td className="py-1 align-top text-center font-bold">:</td>
                          <td className="py-1">{surat.waktu}</td>
                        </tr>
                      )}
                      {surat.tempat && (
                        <tr>
                          <td className="py-1 align-top text-slate-800">Tempat Kegiatan</td>
                          <td className="py-1 align-top text-center font-bold">:</td>
                          <td className="py-1 font-semibold text-slate-950">{surat.tempat}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <p className="text-justify indent-8 text-[13px] leading-relaxed">
                  {surat.keterangan || 'Demikian surat tugas ini diberikan kepada yang bersangkutan untuk dapat dilaksanakan dengan penuh rasa tanggung jawab, serta melaporkan hasil pelaksanaan tugas kepada Kepala Sekolah setelah kegiatan selesai.'}
                </p>

                <TandaTanganKepalaSekolah sek={sek} tanggalSurat={surat.tanggalSurat} />
              </div>
            )}

            {/* === B. SURAT UNDANGAN RESMI === */}
            {surat.jenisSurat === 'Surat Undangan' && (
              <div className="space-y-4">
                <div className="flex justify-between items-start text-xs my-2">
                  <table className="text-xs border-collapse">
                    <tbody>
                      <tr>
                        <td className="w-20 py-0.5 text-slate-800">Nomor</td>
                        <td className="w-3 py-0.5 text-center font-bold">:</td>
                        <td className="py-0.5 font-bold text-slate-950 font-sans">{surat.nomorSurat}</td>
                      </tr>
                      <tr>
                        <td className="py-0.5 text-slate-800">Lampiran</td>
                        <td className="py-0.5 text-center font-bold">:</td>
                        <td className="py-0.5">{surat.lampiran || '-'}</td>
                      </tr>
                      <tr>
                        <td className="py-0.5 text-slate-800">Perihal</td>
                        <td className="py-0.5 text-center font-bold">:</td>
                        <td className="py-0.5 font-bold underline text-slate-950">{surat.perihal || 'Undangan Pertemuan / Rapat Dinas'}</td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="text-right text-xs">
                    <div>{sek.kabupaten}, {tglSuratFormatted}</div>
                  </div>
                </div>

                <div className="my-3 text-xs leading-relaxed">
                  <div>Kepada Yth.</div>
                  <div className="font-bold text-[13.5px] text-slate-950 mt-0.5">{surat.namaPenerima}</div>
                  {surat.kelasJabatan && <div className="text-slate-800">{surat.kelasJabatan}</div>}
                  <div className="mt-0.5">Di {surat.alamatPenerima || 'Tempat'}</div>
                </div>

                <div className="space-y-2 text-[13px]">
                  <p className="text-justify">
                    Dengan hormat,
                  </p>
                  <p className="text-justify indent-8 leading-relaxed">
                    Sehubungan dengan pelaksanaan agenda kegiatan sekolah dalam rangka <strong>{surat.keperluan}</strong>, dengan ini kami mengundang Bapak/Ibu/Saudara untuk dapat hadir pada pertemuan yang akan dilaksanakan pada:
                  </p>
                </div>

                <div className="my-2.5 pl-6 pr-2">
                  <table className="w-full border-collapse text-[13px]">
                    <tbody>
                      {surat.hariTanggal && (
                        <tr>
                          <td className="w-40 py-1 align-top text-slate-800">Hari / Tanggal</td>
                          <td className="w-4 py-1 align-top text-center font-bold">:</td>
                          <td className="py-1 font-semibold text-slate-950">{surat.hariTanggal}</td>
                        </tr>
                      )}
                      {!surat.hariTanggal && surat.tanggalKegiatan && (
                        <tr>
                          <td className="w-40 py-1 align-top text-slate-800">Hari / Tanggal</td>
                          <td className="w-4 py-1 align-top text-center font-bold">:</td>
                          <td className="py-1 font-semibold text-slate-950">{surat.tanggalKegiatan}</td>
                        </tr>
                      )}
                      {surat.waktu && (
                        <tr>
                          <td className="py-1 align-top text-slate-800">Waktu Pelaksanaan</td>
                          <td className="py-1 align-top text-center font-bold">:</td>
                          <td className="py-1">{surat.waktu}</td>
                        </tr>
                      )}
                      <tr>
                        <td className="py-1 align-top text-slate-800">Tempat</td>
                        <td className="py-1 align-top text-center font-bold">:</td>
                        <td className="py-1">{surat.tempat || sek.namaSekolah}</td>
                      </tr>
                      <tr>
                        <td className="py-1 align-top text-slate-800">Acara / Keperluan</td>
                        <td className="py-1 align-top text-center font-bold">:</td>
                        <td className="py-1 font-bold text-slate-950">{surat.keperluan}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <p className="text-justify indent-8 text-[13px] leading-relaxed">
                  {surat.keterangan || 'Mengingat pentingnya agenda tersebut, kami sangat mengharapkan kehadiran Bapak/Ibu tepat pada waktunya. Atas perhatian, kerja sama, dan kehadiran Bapak/Ibu, kami sampaikan terima kasih.'}
                </p>

                <TandaTanganKepalaSekolah sek={sek} tanggalSurat={surat.tanggalSurat} />
              </div>
            )}

            {/* === C. SURAT KETERANGAN AKTIF SEKOLAH === */}
            {surat.jenisSurat === 'Surat Keterangan Aktif Sekolah' && (
              <div className="space-y-4">
                <div className="text-center my-3">
                  <h2 className="text-base font-bold underline tracking-wider uppercase text-slate-950 font-sans">
                    SURAT KETERANGAN AKTIF SEKOLAH
                  </h2>
                  <p className="text-[12px] mt-0.5 text-slate-900 font-sans">
                    Nomor: <span className="font-semibold">{surat.nomorSurat}</span>
                  </p>
                </div>

                <p className="text-justify indent-8 text-[13px] leading-relaxed">
                  Yang bertanda tangan di bawah ini Kepala {sek.namaSekolah}, Kecamatan {sek.kecamatan}, Kabupaten/Kota {sek.kabupaten}, Provinsi {sek.provinsi}, menerangkan dengan sebenarnya bahwa:
                </p>

                <div className="my-2.5 pl-6 pr-2">
                  <table className="w-full border-collapse text-[13px]">
                    <tbody>
                      <tr>
                        <td className="w-44 py-1 align-top text-slate-800">Nama Siswa</td>
                        <td className="w-4 py-1 align-top text-center font-bold">:</td>
                        <td className="py-1 font-bold text-slate-950">{surat.namaPenerima}</td>
                      </tr>
                      <tr>
                        <td className="py-1 align-top text-slate-800">NIS / NISN</td>
                        <td className="py-1 align-top text-center font-bold">:</td>
                        <td className="py-1 font-mono text-[12.5px]">{surat.nisNip || '-'}</td>
                      </tr>
                      <tr>
                        <td className="py-1 align-top text-slate-800">Tingkat / Kelas</td>
                        <td className="py-1 align-top text-center font-bold">:</td>
                        <td className="py-1 font-medium">{surat.kelasJabatan || '-'}</td>
                      </tr>
                      {surat.namaOrangTua && (
                        <tr>
                          <td className="py-1 align-top text-slate-800">Nama Orang Tua / Wali</td>
                          <td className="py-1 align-top text-center font-bold">:</td>
                          <td className="py-1">{surat.namaOrangTua}</td>
                        </tr>
                      )}
                      <tr>
                        <td className="py-1 align-top text-slate-800">Alamat Tempat Tinggal</td>
                        <td className="py-1 align-top text-center font-bold">:</td>
                        <td className="py-1">{surat.alamatPenerima || '-'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <p className="text-justify indent-8 text-[13px] leading-relaxed">
                  Adalah benar-benar siswa/siswi yang tercatat <strong>AKTIF</strong> belajar pada {sek.namaSekolah} pada Tahun Pelajaran 2026/2027 dan senantiasa menaati tata tertib sekolah serta berkelakuan baik.
                </p>

                <p className="text-justify indent-8 text-[13px] leading-relaxed">
                  Surat keterangan ini diberikan kepada yang bersangkutan sebagai kelengkapan administrasi untuk keperluan: <strong className="text-slate-950">{surat.keperluan}</strong>.
                </p>

                <p className="text-justify indent-8 text-[13px] leading-relaxed">
                  {surat.keterangan || 'Demikian surat keterangan ini dibuat dengan sebenarnya dan dengan penuh rasa tanggung jawab untuk dapat dipergunakan sebagaimana mestinya.'}
                </p>

                <TandaTanganKepalaSekolah sek={sek} tanggalSurat={surat.tanggalSurat} />
              </div>
            )}

            {/* === D. SURAT PANGGILAN ORANG TUA === */}
            {surat.jenisSurat === 'Surat Panggilan Orang Tua' && (
              <div className="space-y-4">
                <div className="flex justify-between items-start text-xs my-2">
                  <table className="text-xs border-collapse">
                    <tbody>
                      <tr>
                        <td className="w-20 py-0.5 text-slate-800">Nomor</td>
                        <td className="w-3 py-0.5 text-center font-bold">:</td>
                        <td className="py-0.5 font-bold text-slate-950 font-sans">{surat.nomorSurat}</td>
                      </tr>
                      <tr>
                        <td className="py-0.5 text-slate-800">Lampiran</td>
                        <td className="py-0.5 text-center font-bold">:</td>
                        <td className="py-0.5">-</td>
                      </tr>
                      <tr>
                        <td className="py-0.5 text-slate-800">Perihal</td>
                        <td className="py-0.5 text-center font-bold">:</td>
                        <td className="py-0.5 font-bold underline text-slate-950">Panggilan Orang Tua / Wali Siswa</td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="text-right text-xs">
                    <div>{sek.kabupaten}, {tglSuratFormatted}</div>
                  </div>
                </div>

                <div className="my-3 text-xs leading-relaxed">
                  <div>Kepada Yth.</div>
                  <div>Bapak / Ibu Orang Tua / Wali dari:</div>
                  <div className="font-bold text-[13.5px] text-slate-950 mt-0.5">
                    {surat.namaPenerima} {surat.kelasJabatan ? `(${surat.kelasJabatan})` : ''}
                  </div>
                  {surat.nisNip && surat.nisNip !== '-' && (
                    <div className="text-[11px] text-slate-700 font-mono mt-0.5">
                      NIS / NISN: {surat.nisNip}
                    </div>
                  )}
                  <div className="mt-0.5">Di {surat.alamatPenerima || 'Tempat'}</div>
                </div>

                <div className="space-y-2 text-[13px]">
                  <p className="text-justify">
                    Dengan hormat,
                  </p>
                  <p className="text-justify indent-8 leading-relaxed">
                    Sehubungan dengan perkembangan pembinaan dan proses belajar putra/putri Bapak/Ibu di sekolah, dengan ini kami mengharapkan kehadiran Bapak/Ibu ke sekolah pada:
                  </p>
                </div>

                <div className="my-2.5 pl-6 pr-2">
                  <table className="w-full border-collapse text-[13px]">
                    <tbody>
                      {surat.hariTanggal && (
                        <tr>
                          <td className="w-40 py-1 align-top text-slate-800">Hari / Tanggal</td>
                          <td className="w-4 py-1 align-top text-center font-bold">:</td>
                          <td className="py-1 font-semibold text-slate-950">{surat.hariTanggal}</td>
                        </tr>
                      )}
                      {!surat.hariTanggal && surat.tanggalKegiatan && (
                        <tr>
                          <td className="w-40 py-1 align-top text-slate-800">Hari / Tanggal</td>
                          <td className="w-4 py-1 align-top text-center font-bold">:</td>
                          <td className="py-1 font-semibold text-slate-950">{surat.tanggalKegiatan}</td>
                        </tr>
                      )}
                      {surat.waktu && (
                        <tr>
                          <td className="py-1 align-top text-slate-800">Waktu Pelaksanaan</td>
                          <td className="py-1 align-top text-center font-bold">:</td>
                          <td className="py-1">{surat.waktu}</td>
                        </tr>
                      )}
                      <tr>
                        <td className="py-1 align-top text-slate-800">Tempat</td>
                        <td className="py-1 align-top text-center font-bold">:</td>
                        <td className="py-1">{surat.tempat || `Ruang Kepala Sekolah / BK ${sek.namaSekolah}`}</td>
                      </tr>
                      <tr>
                        <td className="py-1 align-top text-slate-800">Menghadap</td>
                        <td className="py-1 align-top text-center font-bold">:</td>
                        <td className="py-1">{surat.menghadapKepada || 'Kepala Sekolah / Guru BK / Wali Kelas'}</td>
                      </tr>
                      <tr>
                        <td className="py-1 align-top text-slate-800">Keperluan</td>
                        <td className="py-1 align-top text-center font-bold">:</td>
                        <td className="py-1 font-bold text-slate-950">{surat.keperluan}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <p className="text-justify indent-8 text-[13px] leading-relaxed">
                  {surat.keterangan || 'Mengingat pentingnya pertemuan ini demi masa depan pendidikan putra/putri Bapak/Ibu, dimohon hadir tepat waktu tanpa diwakilkan. Atas perhatian dan kerja sama Bapak/Ibu, kami sampaikan terima kasih.'}
                </p>

                <TandaTanganKepalaSekolah sek={sek} tanggalSurat={surat.tanggalSurat} />
              </div>
            )}

            {/* === E. SURAT PENGANTAR === */}
            {surat.jenisSurat === 'Surat Pengantar' && (
              <div className="space-y-4">
                <div className="text-center my-3">
                  <h2 className="text-base font-bold underline tracking-wider uppercase text-slate-950 font-sans">
                    SURAT PENGANTAR
                  </h2>
                  <p className="text-[12px] mt-0.5 text-slate-900 font-sans">
                    Nomor: <span className="font-semibold">{surat.nomorSurat}</span>
                  </p>
                </div>

                <div className="my-3 text-xs leading-relaxed">
                  <div>Kepada Yth.</div>
                  <div className="font-bold text-[13.5px] text-slate-950">{surat.namaPenerima}</div>
                  <div className="mt-0.5">Di {surat.alamatPenerima || 'Tempat'}</div>
                </div>

                <p className="text-justify text-[13px] leading-relaxed">
                  Bersama ini kami kirimkan berkas/dokumen resmi dari {sek.namaSekolah} dengan rincian sebagai berikut:
                </p>

                <table className="w-full border-collapse border border-slate-900 text-[13px] my-3">
                  <thead>
                    <tr className="bg-slate-100 text-center font-sans font-bold text-slate-900">
                      <th className="border border-slate-900 p-2 w-12 text-center">No</th>
                      <th className="border border-slate-900 p-2 text-left">Jenis Berkas / Dokumen</th>
                      <th className="border border-slate-900 p-2 w-28 text-center">Banyaknya</th>
                      <th className="border border-slate-900 p-2 text-left">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-slate-900 p-2.5 text-center font-mono align-top">1</td>
                      <td className="border border-slate-900 p-2.5 font-medium align-top">{surat.keperluan}</td>
                      <td className="border border-slate-900 p-2.5 text-center align-top">{surat.lampiran || '1 (Satu) Berkas'}</td>
                      <td className="border border-slate-900 p-2.5 text-[12px] leading-relaxed align-top">
                        {surat.keterangan || 'Dikirim dengan hormat untuk diketahui dan dipergunakan sebagaimana mestinya.'}
                      </td>
                    </tr>
                  </tbody>
                </table>

                <p className="text-justify indent-8 text-[13px] leading-relaxed">
                  Demikian surat pengantar ini disampaikan, atas perhatian dan kerja sama yang baik kami sampaikan terima kasih.
                </p>

                <TandaTanganKepalaSekolah sek={sek} tanggalSurat={surat.tanggalSurat} />
              </div>
            )}
          </div>
        )}

        {/* ================= PAGE BREAK FOR MULTI-PAGE PRINT ================= */}
        {shouldRenderSurat && shouldRenderSppd1 && (
          <div className="page-break hidden print:block" />
        )}

        {/* ================= PAGE 2: LEMBAR I SPPD (RINCIAN) ================= */}
        {shouldRenderSppd1 && (
          <div 
            className="a4-page bg-white text-slate-950 mx-auto font-serif shadow-xl rounded-xs border border-slate-300 print:border-none print:shadow-none transition-all print:m-0"
            style={{
              width: '100%',
              maxWidth: '794px',
              minHeight: '1123px',
              padding: '44px 56px',
              boxSizing: 'border-box',
              fontSize: '12px',
              lineHeight: '1.5',
              color: '#0f172a',
            }}
          >
            <KopSurat sek={sek} />
            <SppdLembarDepan surat={surat} sek={sek} />
          </div>
        )}

        {/* ================= PAGE BREAK FOR MULTI-PAGE PRINT ================= */}
        {shouldRenderSppd1 && shouldRenderSppd2 && (
          <div className="page-break hidden print:block" />
        )}

        {/* ================= PAGE 3+: LEMBAR II SPPD (VISUM LOKASI, BERSAMBUNG JIKA BANYAK HARI) ================= */}
        {shouldRenderSppd2 && visumPages.map((vChunk, idx) => (
          <React.Fragment key={`visum-page-chunk-${idx}`}>
            {/* Page break before each visum page if preceding pages rendered */}
            {(shouldRenderSppd1 || idx > 0) && (
              <div className="page-break hidden print:block" />
            )}
            
            <div 
              className="a4-page bg-white text-slate-950 mx-auto font-serif shadow-xl rounded-xs border border-slate-300 print:border-none print:shadow-none transition-all print:m-0"
              style={{
                width: '100%',
                maxWidth: '794px',
                minHeight: '1123px',
                padding: '44px 56px',
                boxSizing: 'border-box',
                fontSize: '12px',
                lineHeight: '1.5',
                color: '#0f172a',
              }}
            >
              <SppdLembarVisumPage 
                surat={surat} 
                sek={sek} 
                chunk={vChunk} 
                totalTravelDays={totalTravelDays} 
              />
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
