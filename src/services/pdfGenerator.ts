import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { SuratRecord } from '../types';
import { formatIndonesianDate } from './storage';

/**
 * Helper to convert roman numerals
 */
export function toRomanNumeral(num: number): string {
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
}

export interface VisumDayInfo {
  dayIndex: number;
  dateStr: string;
  formattedDate: string;
  isFirstDay: boolean;
  isLastDay: boolean;
}

export function getVisumDaysList(surat: SuratRecord): VisumDayInfo[] {
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
}

export interface VisumPageChunk {
  pageIndex: number;
  totalPages: number;
  days: VisumDayInfo[];
  isFirstPage: boolean;
  isLastPage: boolean;
}

export function getVisumPages(surat: SuratRecord): VisumPageChunk[] {
  const allDays = getVisumDaysList(surat);

  if (allDays.length <= 5) {
    return [{
      pageIndex: 0,
      totalPages: 1,
      days: allDays,
      isFirstPage: true,
      isLastPage: true,
    }];
  }

  const pages: VisumPageChunk[] = [];
  let dayPointer = 0;
  let pageIdx = 0;

  while (dayPointer < allDays.length) {
    const isFirstPage = pageIdx === 0;
    const remainingDays = allDays.length - dayPointer;

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
      totalPages: 1,
      days: chunkDays,
      isFirstPage,
      isLastPage: dayPointer >= allDays.length,
    });
    pageIdx++;
  }

  return pages.map(p => ({ ...p, totalPages: pages.length }));
}

/**
 * Converts any image (SVG data URL, external URL, or blob) to a clean PNG Base64 Data URL
 * using an HTML5 Canvas to prevent canvas tainting and ensure Microsoft Word compatibility.
 */
export async function ensurePngDataUrl(src: string, width = 160, height = 160): Promise<string> {
  if (!src || typeof window === 'undefined') return '';
  if (src.startsWith('data:image/png') || src.startsWith('data:image/jpeg')) {
    return src;
  }

  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      
      const timer = setTimeout(() => {
        resolve(src);
      }, 2500);

      img.onload = () => {
        clearTimeout(timer);
        try {
          const canvas = document.createElement('canvas');
          const naturalW = img.naturalWidth || width;
          const naturalH = img.naturalHeight || height;
          canvas.width = Math.min(naturalW, 300);
          canvas.height = Math.min(naturalH, 300);
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const png = canvas.toDataURL('image/png');
            resolve(png);
            return;
          }
        } catch (e) {
          console.warn('Canvas conversion to PNG fallback:', e);
        }
        resolve(src);
      };

      img.onerror = () => {
        clearTimeout(timer);
        resolve(src);
      };

      img.src = src;
    } catch {
      resolve(src);
    }
  });
}

/**
 * Generates standard Indonesian Official KOP SURAT table
 * Fully compatible with Word (.doc) and PDF rendering engines.
 */
function generateKopSuratTableHtml(sek: SuratRecord['dataSekolahSnapshot'], logoKiriPng: string, logoKananPng: string): string {
  const showLogoKiri = sek.tampilkanLogoKiri !== false && !!logoKiriPng;
  const showLogoKanan = sek.tampilkanLogoKanan !== false && !!logoKananPng;

  return `
    <table width="100%" border="0" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse; margin-bottom: 2px;">
      <tr>
        ${showLogoKiri ? `
          <td width="80" align="center" valign="middle" style="width: 80px; text-align: center; vertical-align: middle; padding-right: 8px;">
            <img src="${logoKiriPng}" width="72" height="72" style="width: 72px; height: 72px; object-fit: contain;" alt="Logo Kop Kiri" />
          </td>
        ` : `
          <td width="10" style="width: 10px;"></td>
        `}
        
        <td align="center" valign="middle" style="text-align: center; vertical-align: middle; padding: 0 4px;">
          ${sek.instansiAtasan1 ? `
            <div style="font-family: Arial, sans-serif; font-size: 10.5pt; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; line-height: 1.25; color: #000000;">
              ${sek.instansiAtasan1}
            </div>
          ` : ''}
          ${sek.instansiAtasan2 ? `
            <div style="font-family: Arial, sans-serif; font-size: 10.5pt; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; line-height: 1.25; color: #000000;">
              ${sek.instansiAtasan2}
            </div>
          ` : ''}
          <div style="font-family: Arial, sans-serif; font-size: 14pt; font-weight: bold; text-transform: uppercase; line-height: 1.2; color: #000000; margin: 2px 0 2px 0;">
            ${sek.namaSekolah || 'UPTD SATUAN PENDIDIKAN'}
          </div>
          <div style="font-family: Arial, sans-serif; font-size: 9pt; color: #1e293b; line-height: 1.2;">
            NPSN: <strong>${sek.npsn || '-'}</strong> ${sek.nss ? `| NSS: ${sek.nss}` : ''}
          </div>
          <div style="font-family: Arial, sans-serif; font-size: 8.5pt; color: #334155; line-height: 1.2; margin-top: 1px;">
            ${sek.alamat}${sek.desa ? `, ${sek.desa}` : ''}${sek.kecamatan ? `, Kec. ${sek.kecamatan}` : ''}, ${sek.kabupaten} ${sek.kodePos}
          </div>
          <div style="font-family: Arial, sans-serif; font-size: 8pt; color: #475569; line-height: 1.2;">
            ${sek.telepon ? `Telp: ${sek.telepon}` : ''} ${sek.email ? `| Email: ${sek.email}` : ''} ${sek.website ? `| Web: ${sek.website}` : ''}
          </div>
        </td>

        ${showLogoKanan ? `
          <td width="80" align="center" valign="middle" style="width: 80px; text-align: center; vertical-align: middle; padding-left: 8px;">
            <img src="${logoKananPng}" width="72" height="72" style="width: 72px; height: 72px; object-fit: contain;" alt="Logo Kop Kanan" />
          </td>
        ` : `
          <td width="10" style="width: 10px;"></td>
        `}
      </tr>
    </table>

    <!-- Garis Pemisah KOP Ganda Standar Pemerintah (Tebal 3pt + Tipis 1pt) -->
    <table width="100%" border="0" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse; margin-top: 4px; margin-bottom: 18px;">
      <tr>
        <td style="border-top: 2.25pt solid #000000; border-bottom: 0.75pt solid #000000; height: 2pt; font-size: 1pt; line-height: 1pt; mso-line-height-rule: exactly;">&nbsp;</td>
      </tr>
    </table>
  `;
}

/**
 * Signature block generator
 */
function generateSignatureBlockHtml(
  sek: SuratRecord['dataSekolahSnapshot'], 
  tglFormatted: string, 
  title = 'Kepala Sekolah',
  customName?: string,
  customNip?: string
): string {
  const nama = customName || sek.namaKepalaSekolah;
  const nip = customNip || sek.nipKepalaSekolah;

  return `
    <table width="100%" border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-top: 24px; font-family: 'Times New Roman', Times, serif;">
      <tr>
        <td width="55%" style="width: 55%;"></td>
        <td width="45%" align="center" valign="top" style="width: 45%; text-align: center; font-size: 11pt; font-family: 'Times New Roman', Times, serif;">
          <div>${sek.kabupaten}, ${tglFormatted}</div>
          <div style="font-weight: 600; margin-top: 2px;">${title},</div>
          <div style="height: 52pt; line-height: 52pt; font-size: 1pt; mso-line-height-rule: exactly;">&nbsp;</div>
          <div style="font-weight: bold; text-decoration: underline; font-size: 11.5pt;">${nama}</div>
          <div style="font-size: 10pt; font-family: 'Times New Roman', Times, serif; margin-top: 1px;">NIP. ${nip || '-'}</div>
          ${sek.pangkatKepalaSekolah && !customName ? `<div style="font-size: 9.5pt; color: #334155; margin-top: 1px;">${sek.pangkatKepalaSekolah}</div>` : ''}
        </td>
      </tr>
    </table>
  `;
}

/**
 * Generates the body HTML for the main letter
 */
function generateMainLetterBody(surat: SuratRecord, tglSuratFormatted: string): string {
  const sek = surat.dataSekolahSnapshot;

  switch (surat.jenisSurat) {
    case 'Surat Tugas': {
      const tanggalPelaksanaan = surat.hariTanggal || surat.tanggalKegiatan || '';
      return `
        <div style="text-align: center; margin-bottom: 16px;">
          <div style="font-size: 13pt; font-weight: bold; text-decoration: underline; letter-spacing: 0.5px;">SURAT TUGAS</div>
          <div style="font-size: 10.5pt; margin-top: 2px;">Nomor: ${surat.nomorSurat}</div>
        </div>

        <p style="margin-bottom: 10px; text-align: justify; text-indent: 28px; line-height: 1.5; font-size: 11pt;">
          Yang bertanda tangan di bawah ini Kepala ${sek.namaSekolah}, Kecamatan ${sek.kecamatan}, ${sek.kabupaten}, Provinsi ${sek.provinsi}, dengan ini memberikan tugas kedinasan kepada:
        </p>

        <div style="margin-left: 20px; margin-bottom: 12px;">
          <table width="100%" border="0" cellpadding="2" cellspacing="0" style="width: 100%; font-size: 11pt; border-collapse: collapse; font-family: 'Times New Roman', Times, serif;">
            <tr>
              <td width="140" valign="top" style="width: 140px; padding: 2px 0;">Nama Lengkap</td>
              <td width="15" align="center" valign="top" style="width: 15px; padding: 2px 0; text-align: center; font-weight: bold;">:</td>
              <td valign="top" style="padding: 2px 0; font-weight: bold;">${surat.namaPenerima}</td>
            </tr>
            <tr>
              <td valign="top" style="padding: 2px 0;">NIP / NUPTK</td>
              <td align="center" valign="top" style="padding: 2px 0; text-align: center; font-weight: bold;">:</td>
              <td valign="top" style="padding: 2px 0; font-family: 'Times New Roman', Times, serif;">${surat.nisNip || '-'}</td>
            </tr>
            <tr>
              <td valign="top" style="padding: 2px 0;">Pangkat / Golongan</td>
              <td align="center" valign="top" style="padding: 2px 0; text-align: center; font-weight: bold;">:</td>
              <td valign="top" style="padding: 2px 0;">${surat.pangkatGolongan || 'Penata Muda / III a'}</td>
            </tr>
            <tr>
              <td valign="top" style="padding: 2px 0;">Jabatan / Tugas</td>
              <td align="center" valign="top" style="padding: 2px 0; text-align: center; font-weight: bold;">:</td>
              <td valign="top" style="padding: 2px 0;">${surat.kelasJabatan || '-'}</td>
            </tr>
            <tr>
              <td valign="top" style="padding: 2px 0;">Unit Kerja / Alamat</td>
              <td align="center" valign="top" style="padding: 2px 0; text-align: center; font-weight: bold;">:</td>
              <td valign="top" style="padding: 2px 0;">${surat.alamatPenerima || sek.namaSekolah}</td>
            </tr>
          </table>
        </div>

        <p style="margin-bottom: 10px; text-align: justify; text-indent: 28px; line-height: 1.5; font-size: 11pt;">
          Untuk melaksanakan tugas dalam rangka: <strong>${surat.keperluan}</strong>, yang diselenggarakan pada:
        </p>

        <div style="margin-left: 20px; margin-bottom: 12px;">
          <table width="100%" border="0" cellpadding="2" cellspacing="0" style="width: 100%; font-size: 11pt; border-collapse: collapse; font-family: 'Times New Roman', Times, serif;">
            ${tanggalPelaksanaan ? `
            <tr>
              <td width="140" valign="top" style="width: 140px; padding: 2px 0;">Hari / Tanggal</td>
              <td width="15" align="center" valign="top" style="width: 15px; padding: 2px 0; text-align: center; font-weight: bold;">:</td>
              <td valign="top" style="padding: 2px 0; font-weight: 600;">${tanggalPelaksanaan}</td>
            </tr>` : ''}
            ${surat.waktu ? `
            <tr>
              <td width="140" valign="top" style="width: 140px; padding: 2px 0;">Waktu Pelaksanaan</td>
              <td width="15" align="center" valign="top" style="width: 15px; padding: 2px 0; text-align: center; font-weight: bold;">:</td>
              <td valign="top" style="padding: 2px 0;">${surat.waktu}</td>
            </tr>` : ''}
            ${surat.tempat ? `
            <tr>
              <td width="140" valign="top" style="width: 140px; padding: 2px 0;">Tempat Kegiatan</td>
              <td width="15" align="center" valign="top" style="width: 15px; padding: 2px 0; text-align: center; font-weight: bold;">:</td>
              <td valign="top" style="padding: 2px 0; font-weight: 600;">${surat.tempat}</td>
            </tr>` : ''}
          </table>
        </div>

        <p style="margin-bottom: 16px; text-align: justify; text-indent: 28px; line-height: 1.5; font-size: 11pt;">
          ${surat.keterangan || 'Demikian surat tugas ini diberikan kepada yang bersangkutan untuk dapat dilaksanakan dengan penuh rasa tanggung jawab, serta melaporkan hasil pelaksanaan tugas kepada Kepala Sekolah setelah kegiatan selesai.'}
        </p>
      `;
    }

    case 'Surat Undangan': {
      const tanggalPelaksanaan = surat.hariTanggal || surat.tanggalKegiatan || '-';
      return `
        <table width="100%" border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 12px; font-size: 11pt; font-family: 'Times New Roman', Times, serif;">
          <tr>
            <td width="60%" valign="top" style="width: 60%;">
              <table border="0" cellpadding="1" cellspacing="0" style="font-size: 10.5pt; font-family: 'Times New Roman', Times, serif;">
                <tr><td width="70" valign="top" style="width: 70px;">Nomor</td><td width="12" align="center" valign="top" style="width: 12px; text-align: center; font-weight: bold;">:</td><td valign="top"><strong>${surat.nomorSurat}</strong></td></tr>
                <tr><td valign="top">Lampiran</td><td align="center" valign="top" style="text-align: center; font-weight: bold;">:</td><td valign="top">${surat.lampiran || '-'}</td></tr>
                <tr><td valign="top">Perihal</td><td align="center" valign="top" style="text-align: center; font-weight: bold;">:</td><td valign="top"><strong><u>${surat.perihal || 'Undangan Pertemuan / Rapat Dinas'}</u></strong></td></tr>
              </table>
            </td>
            <td width="40%" align="right" valign="top" style="width: 40%; text-align: right;">
              <div>${sek.kabupaten}, ${tglSuratFormatted}</div>
            </td>
          </tr>
        </table>

        <div style="margin-bottom: 12px; font-size: 11pt; line-height: 1.4;">
          <div>Kepada Yth.</div>
          <div style="font-weight: bold; font-size: 11.5pt; margin-top: 2px;">${surat.namaPenerima}</div>
          ${surat.kelasJabatan ? `<div style="font-size: 10.5pt;">${surat.kelasJabatan}</div>` : ''}
          <div style="margin-top: 1px;">Di ${surat.alamatPenerima || 'Tempat'}</div>
        </div>

        <p style="margin-bottom: 6px; text-align: justify; line-height: 1.5; font-size: 11pt;">
          Dengan hormat,
        </p>
        <p style="margin-bottom: 10px; text-align: justify; text-indent: 28px; line-height: 1.5; font-size: 11pt;">
          Sehubungan dengan pelaksanaan agenda kegiatan sekolah dalam rangka <strong>${surat.keperluan}</strong>, dengan ini kami mengundang Bapak/Ibu/Saudara untuk dapat hadir pada pertemuan yang akan dilaksanakan pada:
        </p>

        <div style="margin-left: 20px; margin-bottom: 12px;">
          <table width="100%" border="0" cellpadding="2" cellspacing="0" style="width: 100%; font-size: 11pt; border-collapse: collapse; font-family: 'Times New Roman', Times, serif;">
            <tr>
              <td width="140" valign="top" style="width: 140px; padding: 2px 0;">Hari / Tanggal</td>
              <td width="15" align="center" valign="top" style="width: 15px; padding: 2px 0; text-align: center; font-weight: bold;">:</td>
              <td valign="top" style="padding: 2px 0; font-weight: 600;">${tanggalPelaksanaan}</td>
            </tr>
            ${surat.waktu ? `
            <tr>
              <td width="140" valign="top" style="width: 140px; padding: 2px 0;">Waktu Pelaksanaan</td>
              <td width="15" align="center" valign="top" style="width: 15px; padding: 2px 0; text-align: center; font-weight: bold;">:</td>
              <td valign="top" style="padding: 2px 0;">${surat.waktu}</td>
            </tr>` : ''}
            <tr>
              <td width="140" valign="top" style="width: 140px; padding: 2px 0;">Tempat</td>
              <td width="15" align="center" valign="top" style="width: 15px; padding: 2px 0; text-align: center; font-weight: bold;">:</td>
              <td valign="top" style="padding: 2px 0;">${surat.tempat || sek.namaSekolah}</td>
            </tr>
            <tr>
              <td width="140" valign="top" style="width: 140px; padding: 2px 0;">Acara / Keperluan</td>
              <td width="15" align="center" valign="top" style="width: 15px; padding: 2px 0; text-align: center; font-weight: bold;">:</td>
              <td valign="top" style="padding: 2px 0; font-weight: bold;">${surat.keperluan}</td>
            </tr>
          </table>
        </div>

        <p style="margin-bottom: 16px; text-align: justify; text-indent: 28px; line-height: 1.5; font-size: 11pt;">
          ${surat.keterangan || 'Mengingat pentingnya agenda tersebut, kami sangat mengharapkan kehadiran Bapak/Ibu tepat pada waktunya. Atas perhatian, kerja sama, dan kehadiran Bapak/Ibu, kami sampaikan terima kasih.'}
        </p>
      `;
    }

    case 'Surat Keterangan Aktif Sekolah': {
      return `
        <div style="text-align: center; margin-bottom: 16px;">
          <div style="font-size: 13pt; font-weight: bold; text-decoration: underline; letter-spacing: 0.5px;">SURAT KETERANGAN AKTIF SEKOLAH</div>
          <div style="font-size: 10.5pt; margin-top: 2px;">Nomor: ${surat.nomorSurat}</div>
        </div>

        <p style="margin-bottom: 10px; text-align: justify; text-indent: 28px; line-height: 1.5; font-size: 11pt;">
          Yang bertanda tangan di bawah ini Kepala ${sek.namaSekolah}, Kecamatan ${sek.kecamatan}, Kabupaten/Kota ${sek.kabupaten}, Provinsi ${sek.provinsi}, menerangkan dengan sebenarnya bahwa:
        </p>

        <div style="margin-left: 20px; margin-bottom: 12px;">
          <table width="100%" border="0" cellpadding="2" cellspacing="0" style="width: 100%; font-size: 11pt; border-collapse: collapse; font-family: 'Times New Roman', Times, serif;">
            <tr>
              <td width="150" valign="top" style="width: 150px; padding: 2px 0;">Nama Siswa</td>
              <td width="15" align="center" valign="top" style="width: 15px; padding: 2px 0; text-align: center; font-weight: bold;">:</td>
              <td valign="top" style="padding: 2px 0; font-weight: bold;">${surat.namaPenerima}</td>
            </tr>
            <tr>
              <td valign="top" style="padding: 2px 0;">NIS / NISN</td>
              <td align="center" valign="top" style="padding: 2px 0; text-align: center; font-weight: bold;">:</td>
              <td valign="top" style="padding: 2px 0; font-family: 'Times New Roman', Times, serif;">${surat.nisNip || '-'}</td>
            </tr>
            <tr>
              <td valign="top" style="padding: 2px 0;">Tingkat / Kelas</td>
              <td align="center" valign="top" style="padding: 2px 0; text-align: center; font-weight: bold;">:</td>
              <td valign="top" style="padding: 2px 0;">${surat.kelasJabatan || '-'}</td>
            </tr>
            ${surat.namaOrangTua ? `
            <tr>
              <td valign="top" style="padding: 2px 0;">Nama Orang Tua / Wali</td>
              <td align="center" valign="top" style="padding: 2px 0; text-align: center; font-weight: bold;">:</td>
              <td valign="top" style="padding: 2px 0;">${surat.namaOrangTua}</td>
            </tr>` : ''}
            <tr>
              <td valign="top" style="padding: 2px 0;">Alamat Tempat Tinggal</td>
              <td align="center" valign="top" style="padding: 2px 0; text-align: center; font-weight: bold;">:</td>
              <td valign="top" style="padding: 2px 0;">${surat.alamatPenerima || '-'}</td>
            </tr>
          </table>
        </div>

        <p style="margin-bottom: 10px; text-align: justify; text-indent: 28px; line-height: 1.5; font-size: 11pt;">
          Adalah benar-benar siswa/siswi yang tercatat <strong>AKTIF</strong> belajar pada ${sek.namaSekolah} pada Tahun Pelajaran 2026/2027 dan senantiasa menaati tata tertib sekolah serta berkelakuan baik.
        </p>

        <p style="margin-bottom: 10px; text-align: justify; text-indent: 28px; line-height: 1.5; font-size: 11pt;">
          Surat keterangan ini diberikan kepada yang bersangkutan sebagai kelengkapan administrasi untuk keperluan: <strong>${surat.keperluan}</strong>.
        </p>

        <p style="margin-bottom: 16px; text-align: justify; text-indent: 28px; line-height: 1.5; font-size: 11pt;">
          ${surat.keterangan || 'Demikian surat keterangan ini dibuat dengan sebenarnya dan dengan penuh rasa tanggung jawab untuk dapat dipergunakan sebagaimana mestinya.'}
        </p>
      `;
    }

    case 'Surat Panggilan Orang Tua': {
      const tanggalPelaksanaan = surat.hariTanggal || surat.tanggalKegiatan || '-';
      return `
        <table width="100%" border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 12px; font-size: 11pt; font-family: 'Times New Roman', Times, serif;">
          <tr>
            <td width="60%" valign="top" style="width: 60%;">
              <table border="0" cellpadding="1" cellspacing="0" style="font-size: 10.5pt; font-family: 'Times New Roman', Times, serif;">
                <tr><td width="70" valign="top" style="width: 70px;">Nomor</td><td width="12" align="center" valign="top" style="width: 12px; text-align: center; font-weight: bold;">:</td><td valign="top"><strong>${surat.nomorSurat}</strong></td></tr>
                <tr><td valign="top">Lampiran</td><td align="center" valign="top" style="text-align: center; font-weight: bold;">:</td><td valign="top">-</td></tr>
                <tr><td valign="top">Perihal</td><td align="center" valign="top" style="text-align: center; font-weight: bold;">:</td><td valign="top"><strong><u>Panggilan Orang Tua / Wali Siswa</u></strong></td></tr>
              </table>
            </td>
            <td width="40%" align="right" valign="top" style="width: 40%; text-align: right;">
              <div>${sek.kabupaten}, ${tglSuratFormatted}</div>
            </td>
          </tr>
        </table>

        <div style="margin-bottom: 12px; font-size: 11pt; line-height: 1.4;">
          <div>Kepada Yth.</div>
          <div>Bapak / Ibu Orang Tua / Wali dari:</div>
          <div style="font-weight: bold; font-size: 11.5pt; margin-top: 1px;">${surat.namaPenerima} ${surat.kelasJabatan ? `(${surat.kelasJabatan})` : ''}</div>
          ${surat.nisNip && surat.nisNip !== '-' ? `<div style="font-size: 9.5pt; margin-top: 1px;">NIS / NISN: ${surat.nisNip}</div>` : ''}
          <div style="margin-top: 1px;">Di ${surat.alamatPenerima || 'Tempat'}</div>
        </div>

        <p style="margin-bottom: 6px; text-align: justify; line-height: 1.5; font-size: 11pt;">
          Dengan hormat,
        </p>
        <p style="margin-bottom: 10px; text-align: justify; text-indent: 28px; line-height: 1.5; font-size: 11pt;">
          Sehubungan dengan perkembangan pembinaan dan proses belajar putra/putri Bapak/Ibu di sekolah, dengan ini kami mengharapkan kehadiran Bapak/Ibu ke sekolah pada:
        </p>

        <div style="margin-left: 20px; margin-bottom: 12px;">
          <table width="100%" border="0" cellpadding="2" cellspacing="0" style="width: 100%; font-size: 11pt; border-collapse: collapse; font-family: 'Times New Roman', Times, serif;">
            <tr>
              <td width="140" valign="top" style="width: 140px; padding: 2px 0;">Hari / Tanggal</td>
              <td width="15" align="center" valign="top" style="width: 15px; padding: 2px 0; text-align: center; font-weight: bold;">:</td>
              <td valign="top" style="padding: 2px 0; font-weight: 600;">${tanggalPelaksanaan}</td>
            </tr>
            ${surat.waktu ? `
            <tr>
              <td width="140" valign="top" style="width: 140px; padding: 2px 0;">Waktu Pelaksanaan</td>
              <td width="15" align="center" valign="top" style="width: 15px; padding: 2px 0; text-align: center; font-weight: bold;">:</td>
              <td valign="top" style="padding: 2px 0;">${surat.waktu}</td>
            </tr>` : ''}
            <tr>
              <td width="140" valign="top" style="width: 140px; padding: 2px 0;">Tempat</td>
              <td width="15" align="center" valign="top" style="width: 15px; padding: 2px 0; text-align: center; font-weight: bold;">:</td>
              <td valign="top" style="padding: 2px 0;">${surat.tempat || `Ruang Kepala Sekolah / BK ${sek.namaSekolah}`}</td>
            </tr>
            <tr>
              <td width="140" valign="top" style="width: 140px; padding: 2px 0;">Menghadap</td>
              <td width="15" align="center" valign="top" style="width: 15px; padding: 2px 0; text-align: center; font-weight: bold;">:</td>
              <td valign="top" style="padding: 2px 0;">${surat.menghadapKepada || 'Kepala Sekolah / Guru BK / Wali Kelas'}</td>
            </tr>
            <tr>
              <td width="140" valign="top" style="width: 140px; padding: 2px 0;">Keperluan</td>
              <td width="15" align="center" valign="top" style="width: 15px; padding: 2px 0; text-align: center; font-weight: bold;">:</td>
              <td valign="top" style="padding: 2px 0; font-weight: bold;">${surat.keperluan}</td>
            </tr>
          </table>
        </div>

        <p style="margin-bottom: 16px; text-align: justify; text-indent: 28px; line-height: 1.5; font-size: 11pt;">
          ${surat.keterangan || 'Mengingat pentingnya agenda ini demi masa depan pendidikan putra/putri Bapak/Ibu, dimohon kehadirannya tepat waktu tanpa diwakilkan. Atas perhatian dan kerja samanya kami sampaikan terima kasih.'}
        </p>
      `;
    }

    case 'Surat Pengantar':
    default:
      return `
        <div style="text-align: center; margin-bottom: 16px;">
          <div style="font-size: 13pt; font-weight: bold; text-decoration: underline; letter-spacing: 0.5px;">SURAT PENGANTAR</div>
          <div style="font-size: 10.5pt; margin-top: 2px;">Nomor: ${surat.nomorSurat}</div>
        </div>

        <div style="margin-bottom: 12px; font-size: 11pt; line-height: 1.4;">
          <div>Kepada Yth.</div>
          <div style="font-weight: bold; font-size: 11.5pt; margin-top: 1px;">${surat.namaPenerima}</div>
          <div style="margin-top: 1px;">Di ${surat.alamatPenerima || 'Tempat'}</div>
        </div>

        <p style="margin-bottom: 10px; text-align: justify; line-height: 1.5; font-size: 11pt;">
          Bersama ini kami kirimkan berkas/dokumen resmi dari ${sek.namaSekolah} dengan rincian sebagai berikut:
        </p>

        <table width="100%" border="1" cellpadding="6" cellspacing="0" style="width: 100%; border-collapse: collapse; margin-bottom: 14px; font-size: 10.5pt; border: 1pt solid #000000; font-family: 'Times New Roman', Times, serif;">
          <thead>
            <tr style="background-color: #f1f5f9; text-align: center; font-weight: bold;">
              <th width="35" style="border: 1pt solid #000; padding: 6px; text-align: center; width: 35px;">No</th>
              <th style="border: 1pt solid #000; padding: 6px; text-align: left;">Jenis Berkas / Dokumen</th>
              <th width="110" style="border: 1pt solid #000; padding: 6px; text-align: center; width: 110px;">Banyaknya</th>
              <th style="border: 1pt solid #000; padding: 6px; text-align: left;">Keterangan</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td align="center" valign="top" style="border: 1pt solid #000; padding: 8px; text-align: center;">1</td>
              <td valign="top" style="border: 1pt solid #000; padding: 8px; font-weight: 500;">${surat.keperluan}</td>
              <td align="center" valign="top" style="border: 1pt solid #000; padding: 8px; text-align: center;">${surat.lampiran || '1 (Satu) Berkas'}</td>
              <td valign="top" style="border: 1pt solid #000; padding: 8px; font-size: 10pt;">${surat.keterangan || 'Dikirim dengan hormat untuk diketahui dan dipergunakan sebagaimana mestinya.'}</td>
            </tr>
          </tbody>
        </table>

        <p style="margin-bottom: 16px; text-align: justify; text-indent: 28px; line-height: 1.5; font-size: 11pt;">
          Demikian surat pengantar ini disampaikan, atas perhatian dan kerja sama yang baik kami sampaikan terima kasih.
        </p>
      `;
  }
}

/**
 * Generates SPPD Lembar 1 Table HTML
 */
function generateSppdLembar1Html(surat: SuratRecord, sek: SuratRecord['dataSekolahSnapshot'], logoKiriPng: string, logoKananPng: string): string {
  const kopHtml = generateKopSuratTableHtml(sek, logoKiriPng, logoKananPng);
  const tglFormatted = formatIndonesianDate(surat.tanggalSurat);
  const tglBerangkat = surat.tanggalBerangkat ? formatIndonesianDate(surat.tanggalBerangkat) : (surat.tanggalSurat ? formatIndonesianDate(surat.tanggalSurat) : '');
  const tglKembali = surat.tanggalKembali ? formatIndonesianDate(surat.tanggalKembali) : tglBerangkat;

  return `
    <div class="a4-page" style="width: 100%; max-width: 794px; min-height: 1123px; padding: 44px 56px; box-sizing: border-box; font-family: 'Times New Roman', Times, serif; color: #000000; background: #ffffff; margin: 0 auto;">
      ${kopHtml}

      <!-- Header SPPD kanan atas -->
      <table width="100%" border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 6px;">
        <tr>
          <td width="55%"></td>
          <td width="45%" align="right">
            <table border="0" cellpadding="1" cellspacing="0" style="font-size: 9pt; font-family: 'Times New Roman', Times, serif;">
              <tr><td width="70" valign="top">Lembar Ke</td><td width="10" align="center" valign="top">:</td><td valign="top">I (Satu)</td></tr>
              <tr><td valign="top">Kode No</td><td align="center" valign="top">:</td><td valign="top">${surat.kodeKlasifikasi || '094'} / SPPD</td></tr>
              <tr><td valign="top">Nomor</td><td align="center" valign="top">:</td><td valign="top"><strong>${surat.nomorSppd || surat.nomorSurat}</strong></td></tr>
            </table>
          </td>
        </tr>
      </table>

      <div style="text-align: center; margin-bottom: 12px;">
        <div style="font-size: 12.5pt; font-weight: bold; text-decoration: underline; letter-spacing: 0.5px;">SURAT PERINTAH PERJALANAN DINAS (SPPD)</div>
      </div>

      <table width="100%" border="1" cellpadding="5" cellspacing="0" style="width: 100%; border-collapse: collapse; font-size: 9.5pt; border: 1pt solid #000000; margin-bottom: 14px; font-family: 'Times New Roman', Times, serif;">
        <tr>
          <td width="26" align="center" valign="top" style="border: 1pt solid #000; text-align: center; font-weight: bold; width: 26px;">1.</td>
          <td width="230" valign="top" style="border: 1pt solid #000; width: 230px;">
            Pejabat Pembuat Komitmen / Pejabat yang memberi perintah
          </td>
          <td valign="top" style="border: 1pt solid #000;">
            <div style="font-weight: bold;">${surat.pejabatPemberiPerintah || sek.namaKepalaSekolah}</div>
            <div style="font-size: 8.5pt; color: #475569;">${surat.jabatanPejabatPemberiPerintah || `Kepala ${sek.namaSekolah}`}</div>
          </td>
        </tr>
        <tr>
          <td align="center" valign="top" style="border: 1pt solid #000; text-align: center; font-weight: bold;">2.</td>
          <td valign="top" style="border: 1pt solid #000;">Nama Pegawai yang diperintahkan</td>
          <td valign="top" style="border: 1pt solid #000;">
            <div style="font-weight: bold;">${surat.namaPenerima}</div>
            ${surat.nisNip && surat.nisNip !== '-' ? `<div style="font-size: 9pt; margin-top: 1px;">NIP. ${surat.nisNip}</div>` : ''}
          </td>
        </tr>
        <tr>
          <td align="center" valign="top" style="border: 1pt solid #000; text-align: center; font-weight: bold;">3.</td>
          <td valign="top" style="border: 1pt solid #000;">
            a. Pangkat dan Golongan ruang gaji<br/>
            b. Jabatan / Instansi<br/>
            c. Tingkat Biaya Perjalanan Dinas
          </td>
          <td valign="top" style="border: 1pt solid #000;">
            a. ${surat.pangkatGolongan || 'Penata Muda / III a'}<br/>
            b. ${surat.kelasJabatan || 'Guru'} / ${sek.namaSekolah}<br/>
            c. <strong>${surat.tingkatBiaya || 'Tingkat C'}</strong>
          </td>
        </tr>
        <tr>
          <td align="center" valign="top" style="border: 1pt solid #000; text-align: center; font-weight: bold;">4.</td>
          <td valign="top" style="border: 1pt solid #000;">Maksud Perjalanan Dinas</td>
          <td valign="top" style="border: 1pt solid #000; font-weight: 500;">${surat.keperluan}</td>
        </tr>
        <tr>
          <td align="center" valign="top" style="border: 1pt solid #000; text-align: center; font-weight: bold;">5.</td>
          <td valign="top" style="border: 1pt solid #000;">Alat angkut yang dipergunakan</td>
          <td valign="top" style="border: 1pt solid #000;">${surat.alatAngkut || 'Kendaraan Umum / Angkutan Darat'}</td>
        </tr>
        <tr>
          <td align="center" valign="top" style="border: 1pt solid #000; text-align: center; font-weight: bold;">6.</td>
          <td valign="top" style="border: 1pt solid #000;">
            a. Tempat Berangkat<br/>
            b. Tempat Tujuan
          </td>
          <td valign="top" style="border: 1pt solid #000;">
            a. ${surat.tempatBerangkat || sek.namaSekolah}<br/>
            b. <strong>${surat.tempatTujuan || surat.tempat || 'Lokasi Kegiatan'}</strong>
          </td>
        </tr>
        <tr>
          <td align="center" valign="top" style="border: 1pt solid #000; text-align: center; font-weight: bold;">7.</td>
          <td valign="top" style="border: 1pt solid #000;">
            a. Lamanya Perjalanan Dinas<br/>
            b. Tanggal Berangkat<br/>
            c. Tanggal Harus Kembali / Tiba
          </td>
          <td valign="top" style="border: 1pt solid #000;">
            a. ${surat.lamaHari || '1 (Satu) Hari'}<br/>
            b. ${tglBerangkat}<br/>
            c. ${tglKembali}
          </td>
        </tr>
        <tr>
          <td align="center" valign="top" style="border: 1pt solid #000; text-align: center; font-weight: bold;">8.</td>
          <td valign="top" style="border: 1pt solid #000;">Pengikut / Nama</td>
          <td valign="top" style="border: 1pt solid #000;">${surat.pengikut || '-'}</td>
        </tr>
        <tr>
          <td align="center" valign="top" style="border: 1pt solid #000; text-align: center; font-weight: bold;">9.</td>
          <td valign="top" style="border: 1pt solid #000;">
            Pembebanan Anggaran<br/>
            a. Instansi<br/>
            b. Mata Anggaran / Akun
          </td>
          <td valign="top" style="border: 1pt solid #000;">
            a. ${surat.instansiAnggaran || `Dana BOS ${sek.namaSekolah}`}<br/>
            b. <span>${surat.mataAnggaran || '5.1.02.04.01.0001 (Belanja Perjalanan Dinas Biasa)'}</span>
          </td>
        </tr>
        <tr>
          <td align="center" valign="top" style="border: 1pt solid #000; text-align: center; font-weight: bold;">10.</td>
          <td valign="top" style="border: 1pt solid #000;">Keterangan Lain-lain</td>
          <td valign="top" style="border: 1pt solid #000; font-size: 9pt;">${surat.keterangan || `Sesuai Surat Tugas Nomor: ${surat.nomorSurat}`}</td>
        </tr>
      </table>

      <!-- TTD Pengesahan SPPD Lembar 1 -->
      <table width="100%" border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-top: 14px; font-family: 'Times New Roman', Times, serif;">
        <tr>
          <td width="55%" style="width: 55%;"></td>
          <td width="45%" align="center" valign="top" style="width: 45%; text-align: center; font-size: 9.5pt; font-family: 'Times New Roman', Times, serif;">
            <div>Dikeluarkan di: ${sek.kabupaten}</div>
            <div>Pada tanggal: ${tglFormatted}</div>
            <div style="font-weight: 600; margin-top: 2px;">Pejabat Pembuat Komitmen / Kepala Sekolah,</div>
            <div style="height: 48pt; line-height: 48pt; font-size: 1pt; mso-line-height-rule: exactly;">&nbsp;</div>
            <div style="font-weight: bold; text-decoration: underline; font-size: 10.5pt;">${sek.namaKepalaSekolah}</div>
            <div style="font-size: 9pt; margin-top: 1px;">NIP. ${sek.nipKepalaSekolah || '-'}</div>
          </td>
        </tr>
      </table>
    </div>
  `;
}

/**
 * Generates SPPD Lembar 2 (Visum Lokasi) Table HTML
 * 100% Identical to on-screen government layout in LetterDocumentPreview.tsx
 */
function generateSingleVisumPageHtml(
  surat: SuratRecord, 
  sek: SuratRecord['dataSekolahSnapshot'], 
  chunk: VisumPageChunk, 
  totalTravelDays: number
): string {
  const tempatTujuan = surat.tempatTujuan || surat.tempat || 'Lokasi Tujuan';
  const tempatBerangkat = surat.tempatBerangkat || sek.namaSekolah || 'Tempat Kedudukan';
  const tglBerangkat = surat.tanggalBerangkat ? formatIndonesianDate(surat.tanggalBerangkat) : (surat.tanggalSurat ? formatIndonesianDate(surat.tanggalSurat) : '');
  const tglKembali = surat.tanggalKembali ? formatIndonesianDate(surat.tanggalKembali) : tglBerangkat;

  const isSingleDay = totalTravelDays === 1;
  const sigHeightPt = isSingleDay ? 38 : (chunk.days.length === 2 ? 30 : 20);

  let rowsHtml = '';

  // I. Keberangkatan Pertama (Only on first visum page)
  if (chunk.isFirstPage) {
    rowsHtml += `
      <tr>
        <td width="50%" valign="top" style="border: 1pt solid #000000; padding: 6px 8px; width: 50%; vertical-align: top; box-sizing: border-box;">
          <div style="font-weight: bold; font-size: 11pt;">I.</div>
        </td>
        <td width="50%" valign="top" style="border: 1pt solid #000000; padding: 6px 8px; width: 50%; vertical-align: top; box-sizing: border-box;">
          <table width="100%" border="0" cellpadding="0" cellspacing="0" style="width: 100%; font-size: 9.5pt; font-family: 'Times New Roman', Times, serif; border-collapse: collapse;">
            <tr>
              <td width="100" valign="top" style="width: 100px; padding: 1px 0;">Berangkat dari</td>
              <td width="12" align="center" valign="top" style="width: 12px; padding: 1px 0; text-align: center; font-weight: bold;">:</td>
              <td valign="top" style="padding: 1px 0; font-weight: bold;">${tempatBerangkat}</td>
            </tr>
            <tr>
              <td valign="top" style="padding: 0; font-size: 8.5pt;">(Tempat Kedudukan)</td>
              <td valign="top"></td>
              <td valign="top"></td>
            </tr>
            <tr>
              <td valign="top" style="padding: 1px 0;">Ke</td>
              <td align="center" valign="top" style="padding: 1px 0; text-align: center; font-weight: bold;">:</td>
              <td valign="top" style="padding: 1px 0; font-weight: bold;">${tempatTujuan}</td>
            </tr>
            <tr>
              <td valign="top" style="padding: 1px 0;">Pada tanggal</td>
              <td align="center" valign="top" style="padding: 1px 0; text-align: center; font-weight: bold;">:</td>
              <td valign="top" style="padding: 1px 0;">${tglBerangkat}</td>
            </tr>
          </table>

          <div style="margin-top: 8px; text-align: center;">
            <div style="font-size: 9pt; font-weight: 500;">Pemberi Tugas,</div>
            <div style="height: ${sigHeightPt}pt; line-height: ${sigHeightPt}pt; font-size: 1pt; mso-line-height-rule: exactly;">&nbsp;</div>
            <div style="font-weight: bold; text-decoration: underline; font-size: 10pt;">${sek.namaKepalaSekolah}</div>
            <div style="font-size: 8.5pt; margin-top: 1px; font-family: 'Times New Roman', Times, serif;">NIP. ${sek.nipKepalaSekolah || '-'}</div>
          </div>
        </td>
      </tr>
    `;
  }

  // II s/d N: Kunjungan Tempat Tujuan
  chunk.days.forEach((vDay) => {
    const romanLabel = toRomanNumeral(vDay.dayIndex + 1);

    if (isSingleDay) {
      rowsHtml += `
        <tr>
          <td width="50%" valign="top" style="border: 1pt solid #000000; padding: 6px 8px; width: 50%; vertical-align: top; box-sizing: border-box;">
            <table width="100%" border="0" cellpadding="0" cellspacing="0" style="width: 100%; font-size: 9.5pt; font-family: 'Times New Roman', Times, serif; border-collapse: collapse;">
              <tr>
                <td width="18" valign="top" style="width: 18px; padding: 1px 0; font-weight: bold;">${romanLabel}.</td>
                <td width="82" valign="top" style="width: 82px; padding: 1px 0;">Tiba di</td>
                <td width="12" align="center" valign="top" style="width: 12px; padding: 1px 0; text-align: center; font-weight: bold;">:</td>
                <td valign="top" style="padding: 1px 0; font-weight: bold;">${tempatTujuan}</td>
              </tr>
              <tr>
                <td></td>
                <td valign="top" style="padding: 1px 0;">Pada tanggal</td>
                <td align="center" valign="top" style="padding: 1px 0; text-align: center; font-weight: bold;">:</td>
                <td valign="top" style="padding: 1px 0;">${vDay.formattedDate || tglBerangkat}</td>
              </tr>
            </table>

            <div style="margin-top: 8px; text-align: center;">
              <div style="height: ${sigHeightPt}pt; line-height: ${sigHeightPt}pt; font-size: 1pt; mso-line-height-rule: exactly;">&nbsp;</div>
              <div style="font-size: 9pt; letter-spacing: 0.5px;">( .................................................... )</div>
              <div style="font-size: 8.5pt; margin-top: 1px; text-align: center; font-family: 'Times New Roman', Times, serif;">NIP. &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>
            </div>
          </td>

          <td width="50%" valign="top" style="border: 1pt solid #000000; padding: 6px 8px; width: 50%; vertical-align: top; box-sizing: border-box;">
            <table width="100%" border="0" cellpadding="0" cellspacing="0" style="width: 100%; font-size: 9.5pt; font-family: 'Times New Roman', Times, serif; border-collapse: collapse;">
              <tr>
                <td width="100" valign="top" style="width: 100px; padding: 1px 0;">Berangkat dari</td>
                <td width="12" align="center" valign="top" style="width: 12px; padding: 1px 0; text-align: center; font-weight: bold;">:</td>
                <td valign="top" style="padding: 1px 0; font-weight: bold;">${tempatTujuan}</td>
              </tr>
              <tr>
                <td valign="top" style="padding: 1px 0;">Ke</td>
                <td align="center" valign="top" style="padding: 1px 0; text-align: center; font-weight: bold;">:</td>
                <td valign="top" style="padding: 1px 0; font-weight: bold;">${tempatBerangkat}</td>
              </tr>
              <tr>
                <td valign="top" style="padding: 1px 0;">Pada tanggal</td>
                <td align="center" valign="top" style="padding: 1px 0; text-align: center; font-weight: bold;">:</td>
                <td valign="top" style="padding: 1px 0;">${vDay.formattedDate || tglKembali}</td>
              </tr>
            </table>

            <div style="margin-top: 8px; text-align: center;">
              <div style="height: ${sigHeightPt}pt; line-height: ${sigHeightPt}pt; font-size: 1pt; mso-line-height-rule: exactly;">&nbsp;</div>
              <div style="font-size: 9pt; letter-spacing: 0.5px;">( .................................................... )</div>
              <div style="font-size: 8.5pt; margin-top: 1px; text-align: center; font-family: 'Times New Roman', Times, serif;">NIP. &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>
            </div>
          </td>
        </tr>
      `;
    } else {
      const targetDestNext = vDay.isLastDay ? tempatBerangkat : tempatTujuan;
      rowsHtml += `
        <tr>
          <td width="50%" valign="top" style="border: 1pt solid #000000; padding: 6px 8px; width: 50%; vertical-align: top; box-sizing: border-box;">
            <table width="100%" border="0" cellpadding="0" cellspacing="0" style="width: 100%; font-size: 9.5pt; font-family: 'Times New Roman', Times, serif; border-collapse: collapse;">
              <tr>
                <td width="18" valign="top" style="width: 18px; padding: 1px 0; font-weight: bold;">${romanLabel}.</td>
                <td width="82" valign="top" style="width: 82px; padding: 1px 0;">Tiba di</td>
                <td width="12" align="center" valign="top" style="width: 12px; padding: 1px 0; text-align: center; font-weight: bold;">:</td>
                <td valign="top" style="padding: 1px 0; font-weight: bold;">${tempatTujuan}</td>
              </tr>
              <tr>
                <td></td>
                <td valign="top" style="padding: 1px 0;">Pada tanggal</td>
                <td align="center" valign="top" style="padding: 1px 0; text-align: center; font-weight: bold;">:</td>
                <td valign="top" style="padding: 1px 0;">${vDay.formattedDate}</td>
              </tr>
            </table>

            <div style="margin-top: 8px; text-align: center;">
              <div style="height: ${sigHeightPt}pt; line-height: ${sigHeightPt}pt; font-size: 1pt; mso-line-height-rule: exactly;">&nbsp;</div>
              <div style="font-size: 9pt; letter-spacing: 0.5px;">( .................................................... )</div>
              <div style="font-size: 8.5pt; margin-top: 1px; text-align: center; font-family: 'Times New Roman', Times, serif;">NIP. &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>
            </div>
          </td>

          <td width="50%" valign="top" style="border: 1pt solid #000000; padding: 6px 8px; width: 50%; vertical-align: top; box-sizing: border-box;">
            <table width="100%" border="0" cellpadding="0" cellspacing="0" style="width: 100%; font-size: 9.5pt; font-family: 'Times New Roman', Times, serif; border-collapse: collapse;">
              <tr>
                <td width="100" valign="top" style="width: 100px; padding: 1px 0;">Berangkat dari</td>
                <td width="12" align="center" valign="top" style="width: 12px; padding: 1px 0; text-align: center; font-weight: bold;">:</td>
                <td valign="top" style="padding: 1px 0; font-weight: bold;">${tempatTujuan}</td>
              </tr>
              <tr>
                <td valign="top" style="padding: 1px 0;">Ke</td>
                <td align="center" valign="top" style="padding: 1px 0; text-align: center; font-weight: bold;">:</td>
                <td valign="top" style="padding: 1px 0; font-weight: bold;">${targetDestNext}</td>
              </tr>
              <tr>
                <td valign="top" style="padding: 1px 0;">Pada tanggal</td>
                <td align="center" valign="top" style="padding: 1px 0; text-align: center; font-weight: bold;">:</td>
                <td valign="top" style="padding: 1px 0;">${vDay.formattedDate}</td>
              </tr>
            </table>

            <div style="margin-top: 8px; text-align: center;">
              <div style="height: ${sigHeightPt}pt; line-height: ${sigHeightPt}pt; font-size: 1pt; mso-line-height-rule: exactly;">&nbsp;</div>
              <div style="font-size: 9pt; letter-spacing: 0.5px;">( .................................................... )</div>
              <div style="font-size: 8.5pt; margin-top: 1px; text-align: center; font-family: 'Times New Roman', Times, serif;">NIP. &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>
            </div>
          </td>
        </tr>
      `;
    }
  });

  // Penutup: Tiba Kembali & Pengesahan PA / KPA (Only on last visum page)
  if (chunk.isLastPage) {
    const finalRoman = toRomanNumeral(totalTravelDays + 2);
    const catatanRoman = toRomanNumeral(totalTravelDays + 3);
    const perhatianRoman = toRomanNumeral(totalTravelDays + 4);

    rowsHtml += `
      <tr>
        <td width="50%" valign="top" style="border: 1pt solid #000000; padding: 6px 8px; width: 50%; vertical-align: top; box-sizing: border-box;">
          <table width="100%" border="0" cellpadding="0" cellspacing="0" style="width: 100%; font-size: 9.5pt; font-family: 'Times New Roman', Times, serif; border-collapse: collapse;">
            <tr>
              <td width="18" valign="top" style="width: 18px; padding: 1px 0; font-weight: bold;">${finalRoman}.</td>
              <td width="82" valign="top" style="width: 82px; padding: 1px 0;">Tiba di</td>
              <td width="12" align="center" valign="top" style="width: 12px; padding: 1px 0; text-align: center; font-weight: bold;">:</td>
              <td valign="top" style="padding: 1px 0; font-weight: bold;">${tempatBerangkat}</td>
            </tr>
            <tr>
              <td></td>
              <td valign="top" style="padding: 0; font-size: 8.5pt;">(Tempat Kedudukan)</td>
              <td valign="top"></td>
              <td valign="top"></td>
            </tr>
            <tr>
              <td></td>
              <td valign="top" style="padding: 1px 0;">Pada tanggal</td>
              <td align="center" valign="top" style="padding: 1px 0; text-align: center; font-weight: bold;">:</td>
              <td valign="top" style="padding: 1px 0;">${tglKembali}</td>
            </tr>
          </table>

          <div style="margin-top: 8px; text-align: center;">
            <div style="font-weight: bold; text-transform: uppercase; font-size: 8.5pt; line-height: 1.25;">
              PENGGUNA ANGGARAN/ KUASA<br/>
              PENGGUNA ANGGARAN,
            </div>
            <div style="height: ${sigHeightPt}pt; line-height: ${sigHeightPt}pt; font-size: 1pt; mso-line-height-rule: exactly;">&nbsp;</div>
            <div style="font-weight: bold; text-decoration: underline; font-size: 10pt;">${sek.namaKepalaSekolah}</div>
            <div style="font-size: 8.5pt; margin-top: 1px; font-family: 'Times New Roman', Times, serif;">NIP. ${sek.nipKepalaSekolah || '-'}</div>
          </div>
        </td>

        <td width="50%" valign="top" style="border: 1pt solid #000000; padding: 6px 8px; width: 50%; vertical-align: top; box-sizing: border-box;">
          <p style="font-size: 8.5pt; text-align: justify; margin: 0 0 6px 0; line-height: 1.35;">
            Telah diperiksa, dengan keterangan bahwa perjalanan tersebut di atas benar dilakukan atas perintahnya dan semata-mata untuk kepentingan jabatan dalam waktu yang sesingkat-singkatnya.
          </p>

          <div style="margin-top: 6px; text-align: center;">
            <div style="font-weight: bold; text-transform: uppercase; font-size: 8.5pt; line-height: 1.25;">
              PENGGUNA ANGGARAN/ KUASA<br/>
              PENGGUNA ANGGARAN,
            </div>
            <div style="height: ${sigHeightPt}pt; line-height: ${sigHeightPt}pt; font-size: 1pt; mso-line-height-rule: exactly;">&nbsp;</div>
            <div style="font-weight: bold; text-decoration: underline; font-size: 10pt;">${sek.namaKepalaSekolah}</div>
            <div style="font-size: 8.5pt; margin-top: 1px; font-family: 'Times New Roman', Times, serif;">NIP. ${sek.nipKepalaSekolah || '-'}</div>
          </div>
        </td>
      </tr>

      <tr>
        <td style="border: 1pt solid #000000; padding: 5px 8px; font-weight: bold; font-size: 9.5pt;">
          ${catatanRoman}. &nbsp; CATATAN LAIN-LAIN:
        </td>
        <td style="border: 1pt solid #000000; padding: 5px 8px;">&nbsp;</td>
      </tr>

      <tr>
        <td colspan="2" style="border: 1pt solid #000000; padding: 6px 8px; font-size: 8.5pt; line-height: 1.35;">
          <div style="font-weight: bold; margin-bottom: 2px; font-size: 9pt;">
            ${perhatianRoman}. &nbsp; PERHATIAN :
          </div>
          <p style="margin: 0; text-align: justify; line-height: 1.35;">
            PA/ KPA yang menerbitkan SPD, Pegawai yang melakukan perjalanan dinas, para pejabat yang mengesahkan tanggal berangkat/tiba, serta bendahara pengeluaran bertanggung jawab berdasarkan peraturan-peraturan Keuangan Negara apabila Negara mendapat rugi akibat kesalahan, kelalaian dan kealpaannya.
          </p>
        </td>
      </tr>
    `;
  }

  return `
    <div class="a4-page" style="width: 100%; max-width: 794px; min-height: 1123px; padding: 44px 56px; box-sizing: border-box; font-family: 'Times New Roman', Times, serif; color: #000000; background: #ffffff; margin: 0 auto;">
      ${!chunk.isFirstPage ? `
        <div style="margin-bottom: 8px; padding-bottom: 3px; border-bottom: 1px solid #94a3b8; font-size: 9pt; color: #475569;">
          <table width="100%" border="0" cellpadding="0" cellspacing="0" style="font-size: 9pt;">
            <tr>
              <td align="left" style="font-style: italic; font-weight: bold;">Lanjutan Lembar Visum SPPD - ${surat.nomorSurat || ''}</td>
              <td align="right">Halaman ${chunk.pageIndex + 1} dari ${chunk.totalPages}</td>
            </tr>
          </table>
        </div>
      ` : ''}

      <div style="text-align: center; margin-bottom: 12px;">
        <div style="font-size: 11.5pt; font-weight: bold; text-decoration: underline; letter-spacing: 0.5px;">LEMBAR VISUM / PENGESAHAN PERJALANAN DINAS</div>
      </div>

      <table width="100%" border="1" cellpadding="6" cellspacing="0" style="width: 100%; border-collapse: collapse; font-size: 9.5pt; font-family: 'Times New Roman', Times, serif; border: 1pt solid #000000; table-layout: fixed;">
        <colgroup>
          <col width="50%" style="width: 50%;" />
          <col width="50%" style="width: 50%;" />
        </colgroup>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    </div>
  `;
}

/**
 * Builds the complete multi-page HTML representation for rendering/exporting
 */
export async function buildFullDocumentPagesHtml(surat: SuratRecord): Promise<string[]> {
  const sek = surat.dataSekolahSnapshot;
  const tglSuratFormatted = formatIndonesianDate(surat.tanggalSurat);

  // Convert logos to PNG Data URLs
  const logoKiriPng = sek.logoKiri ? await ensurePngDataUrl(sek.logoKiri) : '';
  const logoKananPng = sek.logoKanan ? await ensurePngDataUrl(sek.logoKanan) : '';

  const pages: string[] = [];

  // Page 1: Main Letter (Surat Tugas, Undangan, dst)
  const isDirectSppd = surat.jenisSurat === 'Surat Perintah Perjalanan Dinas (SPPD)';
  if (!isDirectSppd) {
    const kopHtml = generateKopSuratTableHtml(sek, logoKiriPng, logoKananPng);
    const bodyHtml = generateMainLetterBody(surat, tglSuratFormatted);
    const sigHtml = generateSignatureBlockHtml(sek, tglSuratFormatted);

    pages.push(`
      <div class="a4-page" style="width: 100%; max-width: 794px; min-height: 1123px; padding: 44px 56px; box-sizing: border-box; font-family: 'Times New Roman', Times, serif; color: #000000; background: #ffffff; margin: 0 auto;">
        ${kopHtml}
        ${bodyHtml}
        ${sigHtml}
      </div>
    `);
  }

  // If SPPD is attached or is SPPD type
  const hasSppd = isDirectSppd || (surat.sertakanSppd !== false && surat.jenisSurat === 'Surat Tugas');
  if (hasSppd) {
    // SPPD Lembar 1 (Rincian)
    pages.push(generateSppdLembar1Html(surat, sek, logoKiriPng, logoKananPng));

    // SPPD Lembar 2+ (Visum Lokasi)
    const visumPages = getVisumPages(surat);
    const totalTravelDays = getVisumDaysList(surat).length;
    visumPages.forEach((chunk) => {
      pages.push(generateSingleVisumPageHtml(surat, sek, chunk, totalTravelDays));
    });
  }

  return pages;
}

/**
 * Generates an authentic Indonesian official school letter HTML string
 */
export function generateLetterHtml(surat: SuratRecord): string {
  const sek = surat.dataSekolahSnapshot;
  const tglSuratFormatted = formatIndonesianDate(surat.tanggalSurat);
  const kopHtml = generateKopSuratTableHtml(sek, sek.logoKiri || '', sek.logoKanan || '');
  const bodyHtml = generateMainLetterBody(surat, tglSuratFormatted);
  const sigHtml = generateSignatureBlockHtml(sek, tglSuratFormatted);

  return `
    <div style="font-family: 'Times New Roman', Times, serif; background-color: #ffffff; color: #0f172a; width: 100%; max-width: 800px; margin: 0 auto; padding: 36px 48px; box-sizing: border-box; line-height: 1.45;">
      ${kopHtml}
      ${bodyHtml}
      ${sigHtml}
    </div>
  `;
}

/**
 * Exports SuratRecord or DOM Element directly to a crisp, real PDF
 * Fully resolves tainted canvas issues, ensures A4 proportions, and handles multi-page documents.
 */
export async function exportSuratRecordToPdf(surat: SuratRecord, customFileName?: string): Promise<void> {
  const fileName = customFileName || `${surat.jenisSurat}_${surat.nomorSurat.replace(/[/\\?%*:|"<>]/g, '_')}`;

  // Build clean pages with pre-rasterized PNG logos
  const pagesHtml = await buildFullDocumentPagesHtml(surat);

  // Create clean offscreen rendering container
  const tempWrapper = document.createElement('div');
  tempWrapper.id = 'pdf-render-offscreen-wrapper';
  tempWrapper.style.position = 'fixed';
  tempWrapper.style.left = '0';
  tempWrapper.style.top = '0';
  tempWrapper.style.width = '794px';
  tempWrapper.style.backgroundColor = '#ffffff';
  tempWrapper.style.color = '#000000';
  tempWrapper.style.zIndex = '-99999';
  tempWrapper.style.visibility = 'visible';
  tempWrapper.style.opacity = '1';
  tempWrapper.style.pointerEvents = 'none';
  tempWrapper.style.transform = 'none';

  tempWrapper.innerHTML = pagesHtml.join('\n');
  document.body.appendChild(tempWrapper);

  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const pageElements = Array.from(tempWrapper.querySelectorAll<HTMLElement>('.a4-page'));
    const targets = pageElements.length > 0 ? pageElements : [tempWrapper];

    for (let i = 0; i < targets.length; i++) {
      const pageEl = targets[i];
      if (i > 0) {
        pdf.addPage('a4', 'portrait');
      }

      const canvas = await html2canvas(pageEl, {
        scale: 2,
        useCORS: true,
        allowTaint: false, // Critical: must be false to allow canvas.toDataURL()
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 794,
        width: 794,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.96);
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
    }

    pdf.save(fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`);
  } catch (error) {
    console.error('Critical PDF generation error:', error);
    // Fallback: If canvas rendering hits a browser security constraint, open print dialog
    printLetter(surat);
  } finally {
    if (tempWrapper.parentNode) {
      tempWrapper.parentNode.removeChild(tempWrapper);
    }
  }
}

/**
 * Generic exportToPdf wrapper
 */
export async function exportToPdf(
  elementOrSurat: string | HTMLElement | SuratRecord, 
  fileName?: string
): Promise<void> {
  if (typeof elementOrSurat === 'object' && elementOrSurat !== null && 'jenisSurat' in elementOrSurat) {
    return exportSuratRecordToPdf(elementOrSurat as SuratRecord, fileName);
  }

  // If string ID or element passed, find surat or export element
  let el: HTMLElement | null = null;
  if (typeof elementOrSurat === 'string') {
    el = document.getElementById(elementOrSurat);
  } else if (elementOrSurat instanceof HTMLElement) {
    el = elementOrSurat;
  }

  if (!el) {
    throw new Error('Element not found');
  }

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  const canvas = await html2canvas(el, {
    scale: 2,
    useCORS: true,
    allowTaint: false,
    backgroundColor: '#ffffff',
    windowWidth: 794,
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.96);
  pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
  pdf.save(fileName ? (fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`) : 'Dokumen_Surat.pdf');
}

/**
 * Generates an editable Microsoft Word (.doc) document with embedded PNG Kop logos
 * and 100% Word-compatible table layouts.
 */
export async function exportToWord(surat: SuratRecord): Promise<void> {
  const cleanName = surat.nomorSurat.replace(/[/\\?%*:|"<>]/g, '_');
  const pagesHtml = await buildFullDocumentPagesHtml(surat);

  // Word document wrapper with section break between pages
  const wordSectionBreak = '<br clear="all" style="page-break-before:always;mso-break-type:section-break" />';
  const combinedBody = pagesHtml.join(wordSectionBreak);

  const content = `
    <html xmlns:v="urn:schemas-microsoft-com:vml"
          xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:w="urn:schemas-microsoft-com:office:word"
          xmlns:m="http://schemas.microsoft.com/office/2004/12/omml"
          xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
      <title>${surat.jenisSurat} - ${surat.nomorSurat}</title>
      <style>
        @page Section1 {
          size: 595.3pt 841.9pt; /* A4 */
          margin: 36pt 42pt 36pt 42pt; /* Standard government document margins (13mm top/bottom, 15mm left/right) */
          mso-header-margin: 0pt;
          mso-footer-margin: 0pt;
          mso-paper-source: 0;
        }
        div.Section1 { page: Section1; }
        body {
          font-family: 'Times New Roman', Times, serif;
          font-size: 11pt;
          line-height: 1.35;
          color: #000000;
          background-color: #ffffff;
        }
        .a4-page {
          width: 100% !important;
          max-width: 100% !important;
          min-height: auto !important;
          padding: 0 !important;
          margin: 0 !important;
          box-shadow: none !important;
          background: transparent !important;
        }
        table {
          border-collapse: collapse;
          mso-table-lspace: 0pt;
          mso-table-rspace: 0pt;
          mso-padding-alt: 0pt;
        }
        td {
          mso-table-lspace: 0pt;
          mso-table-rspace: 0pt;
        }
        p {
          margin: 0 0 6pt 0;
        }
        img {
          display: inline-block;
        }
      </style>
    </head>
    <body>
      <div class="Section1">
        ${combinedBody}
      </div>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff' + content], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${surat.jenisSurat}_${cleanName}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Triggers Browser Print for the Letter with zero browser headers/footers
 * and pristine A4 school document layout.
 */
export async function printLetter(elementIdOrElementOrSurat: string | HTMLElement | SuratRecord): Promise<void> {
  try {
    let htmlContent = '';
    
    if (typeof elementIdOrElementOrSurat === 'object' && elementIdOrElementOrSurat !== null && 'jenisSurat' in elementIdOrElementOrSurat) {
      const surat = elementIdOrElementOrSurat as SuratRecord;
      const pages = await buildFullDocumentPagesHtml(surat);
      htmlContent = pages.join('\n');
    } else {
      const el: HTMLElement | null = typeof elementIdOrElementOrSurat === 'string'
        ? document.getElementById(elementIdOrElementOrSurat)
        : (elementIdOrElementOrSurat as HTMLElement);

      if (el) {
        const a4Pages = el.querySelectorAll('.a4-page');
        if (a4Pages.length > 0) {
          htmlContent = Array.from(a4Pages).map(page => page.outerHTML).join('\n');
        } else {
          htmlContent = `<div class="a4-page">${el.innerHTML}</div>`;
        }
      }
    }

    if (!htmlContent) {
      window.print();
      return;
    }

    // Collect all stylesheets from host document
    const styles: string[] = [];
    document.querySelectorAll('style, link[rel="stylesheet"]').forEach((node) => {
      styles.push(node.outerHTML);
    });

    const iframe = document.createElement('iframe');
    iframe.id = 'clean-print-frame';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    iframe.style.zIndex = '-99999';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!doc) {
      window.print();
      return;
    }

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="utf-8">
        <title>Dokumen Persuratan Sekolah</title>
        ${styles.join('\n')}
        <style>
          @page {
            size: A4 portrait;
            margin: 0mm !important;
          }
          *, *::before, *::after {
            box-sizing: border-box;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #0f172a !important;
            font-family: 'Times New Roman', Times, serif;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print,
          .modal-toolbar,
          .modal-footer-meta,
          .page-selector-bar,
          button,
          nav {
            display: none !important;
            visibility: hidden !important;
          }
          .a4-page {
            width: 210mm !important;
            min-height: 297mm !important;
            max-width: 210mm !important;
            padding: 15mm 20mm 15mm 20mm !important;
            margin: 0 auto !important;
            background: #ffffff !important;
            color: #0f172a !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            box-sizing: border-box !important;
            page-break-after: always !important;
            break-after: page !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .a4-page:last-child {
            page-break-after: auto !important;
            break-after: auto !important;
          }
        </style>
      </head>
      <body>
        <div id="print-content-wrapper">
          ${htmlContent}
        </div>
      </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.error('Print frame error:', err);
        window.print();
      } finally {
        setTimeout(() => {
          if (iframe.parentNode) {
            iframe.parentNode.removeChild(iframe);
          }
        }, 3000);
      }
    }, 450);

  } catch (error) {
    console.error('Print error:', error);
    window.print();
  }
}

export const printLetterDocument = printLetter;
