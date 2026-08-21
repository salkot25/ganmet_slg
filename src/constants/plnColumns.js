import * as XLSX from 'xlsx';

/**
 * Susunan 67 Kolom Resmi Sesuai Google Spreadsheet:
 * https://docs.google.com/spreadsheets/d/1YYkRmszbtxTP9tryVjLn6egopDakjYlkdphUIkvRpNc/edit?gid=57517366#gid=57517366
 */
export const OFFICIAL_PLN_COLUMNS = [
  { key: 'NOAGENDA', label: 'NOAGENDA', col: 'A', required: true },
  { key: 'UNITUPI', label: 'UNITUPI', col: 'B' },
  { key: 'UNITAP', label: 'UNITAP', col: 'C' },
  { key: 'UNITUP', label: 'UNITUP', col: 'D', required: true },
  { key: 'NOMORPDL', label: 'NOMORPDL', col: 'E' },
  { key: 'IDPEL', label: 'IDPEL', col: 'F', required: true },
  { key: 'NAMA', label: 'NAMA', col: 'G', required: true },
  { key: 'ALAMAT', label: 'ALAMAT', col: 'H' },
  { key: 'KDDK', label: 'KDDK', col: 'I' },
  { key: 'NAMA_PROV', label: 'NAMA_PROV', col: 'J' },
  { key: 'NAMA_KAB', label: 'NAMA_KAB', col: 'K' },
  { key: 'NAMA_KEC', label: 'NAMA_KEC', col: 'L' },
  { key: 'NAMA_KEL', label: 'NAMA_KEL', col: 'M' },
  { key: 'TARIF', label: 'TARIF', col: 'N', required: true },
  { key: 'DAYA', label: 'DAYA', col: 'O', required: true },
  { key: 'KDPT', label: 'KDPT', col: 'P' },
  { key: 'KDPT_2', label: 'KDPT_2', col: 'Q' },
  { key: 'JENIS_MK', label: 'JENIS_MK', col: 'R' },
  { key: 'RP_TOKEN', label: 'RP_TOKEN', col: 'S' },
  { key: 'RPTOTAL', label: 'RPTOTAL', col: 'T' },
  { key: 'TGLPENGADUAN', label: 'TGLPENGADUAN', col: 'U' },
  { key: 'TGLTINDAKANPENGADUAN', label: 'TGLTINDAKANPENGADUAN', col: 'V' },
  { key: 'TGLBAYAR', label: 'TGLBAYAR', col: 'W' },
  { key: 'TGLAKTIVASI', label: 'TGLAKTIVASI', col: 'X' },
  { key: 'TGLPENANGGUHAN', label: 'TGLPENANGGUHAN', col: 'Y' },
  { key: 'TGLRESTITUSI', label: 'TGLRESTITUSI', col: 'Z' },
  { key: 'TGLREMAJA', label: 'TGLREMAJA', col: 'AA', required: true },
  { key: 'TGLNYALA', label: 'TGLNYALA', col: 'AB' },
  { key: 'TGLBATAL', label: 'TGLBATAL', col: 'AC' },
  { key: 'STATUS_PERMOHONAN', label: 'STATUS_PERMOHONAN', col: 'AD' },
  { key: 'ID_GANTI_METER', label: 'ID_GANTI_METER', col: 'AE' },
  { key: 'ALASAN_GANTI_METER', label: 'ALASAN_GANTI_METER', col: 'AF', required: true },
  { key: 'ALASAN_PENANGGUHAN', label: 'ALASAN_PENANGGUHAN', col: 'AG' },
  { key: 'KETERANGAN_ALASAN_PENANGGUHAN', label: 'KETERANGAN_ALASAN_PENANGGUHAN', col: 'AH' },
  { key: 'NO_METER_BARU', label: 'NO_METER_BARU', col: 'AI', required: true },
  { key: 'MERK_METER_BARU', label: 'MERK_METER_BARU', col: 'AJ', required: true },
  { key: 'TYPE_METER_BARU', label: 'TYPE_METER_BARU', col: 'AK' },
  { key: 'THTERA_METER_BARU', label: 'THTERA_METER_BARU', col: 'AL' },
  { key: 'THBUAT_METER_BARU', label: 'THBUAT_METER_BARU', col: 'AM' },
  { key: 'NO_METER_LAMA', label: 'NO_METER_LAMA', col: 'AN', required: true },
  { key: 'MERK_METER_LAMA', label: 'MERK_METER_LAMA', col: 'AO', required: true },
  { key: 'TYPE_METER_LAMA', label: 'TYPE_METER_LAMA', col: 'AP' },
  { key: 'THTERA_METER_LAMA', label: 'THTERA_METER_LAMA', col: 'AQ' },
  { key: 'THBUAT_METER_LAMA', label: 'THBUAT_METER_LAMA', col: 'AR' },
  { key: 'PETUGASPENGADUAN', label: 'PETUGASPENGADUAN', col: 'AS' },
  { key: 'PETUGASTINDAKANPENGADUAN', label: 'PETUGASTINDAKANPENGADUAN', col: 'AT' },
  { key: 'PETUGASAKTIVASI', label: 'PETUGASAKTIVASI', col: 'AU' },
  { key: 'PETUGASPENANGGUHAN', label: 'PETUGASPENANGGUHAN', col: 'AV' },
  { key: 'PETUGASRESTITUSI', label: 'PETUGASRESTITUSI', col: 'AW' },
  { key: 'PETUGASREMAJA', label: 'PETUGASREMAJA', col: 'AX' },
  { key: 'PETUGASBATAL', label: 'PETUGASBATAL', col: 'AY' },
  { key: 'TGLREKAP', label: 'TGLREKAP', col: 'AZ' },
  { key: 'KDPEMBMETER', label: 'KDPEMBMETER', col: 'BA', required: true },
  { key: 'CT_PRIMER_KWH', label: 'CT_PRIMER_KWH', col: 'BB' },
  { key: 'CT_SEKUNDER_KWH', label: 'CT_SEKUNDER_KWH', col: 'BC' },
  { key: 'PT_PRIMER_KWH', label: 'PT_PRIMER_KWH', col: 'BD' },
  { key: 'PT_SEKUNDER_KWH', label: 'PT_SEKUNDER_KWH', col: 'BE' },
  { key: 'KONSTANTA_KWH', label: 'KONSTANTA_KWH', col: 'BF' },
  { key: 'FAKMKWH', label: 'FAKMKWH', col: 'BG' },
  { key: 'TYPE_CT_KWH', label: 'TYPE_CT_KWH', col: 'BH' },
  { key: 'CT_PRIMER_KVARH', label: 'CT_PRIMER_KVARH', col: 'BI' },
  { key: 'CT_SEKUNDER_KVARH', label: 'CT_SEKUNDER_KVARH', col: 'BJ' },
  { key: 'PT_PRIMER_KVARH', label: 'PT_PRIMER_KVARH', col: 'BK' },
  { key: 'PT_SEKUNDER_KVARH', label: 'PT_SEKUNDER_KVARH', col: 'BL' },
  { key: 'KONSTANTA_KVARH', label: 'KONSTANTA_KVARH', col: 'BM' },
  { key: 'FAKMKVARH', label: 'FAKMKVARH', col: 'BN' },
  { key: 'TYPE_CT_KVARH', label: 'TYPE_CT_KVARH', col: 'BO' }
];

/**
 * Generate dan unduh template Excel resmi (.xlsx)
 */
export function downloadOfficialExcelTemplate() {
  const headerKeys = OFFICIAL_PLN_COLUMNS.map(c => c.key);

  // 1 Contoh Baris Sampel Data Riil
  const sampleRow = {
    NOAGENDA: '5235124010300001',
    UNITUPI: '52',
    UNITAP: '52350',
    UNITUP: '52351',
    NOMORPDL: '523510070150',
    IDPEL: '523510070150',
    NAMA: 'CONTOH PELANGGAN PLN',
    ALAMAT: 'JL. SUDIRMAN NO. 12',
    KDDK: '52351001',
    NAMA_PROV: 'JAWA TENGAH',
    NAMA_KAB: 'SEMARANG',
    NAMA_KEC: 'TENGARAN',
    NAMA_KEL: 'TENGARAN',
    TARIF: 'R1T',
    DAYA: 1300,
    KDPT: '1',
    KDPT_2: '',
    JENIS_MK: 'T',
    RP_TOKEN: '0',
    RPTOTAL: '0',
    TGLPENGADUAN: '03/01/2024',
    TGLTINDAKANPENGADUAN: '03/01/2024',
    TGLBAYAR: '',
    TGLAKTIVASI: '03/01/2024',
    TGLPENANGGUHAN: '',
    TGLRESTITUSI: '',
    TGLREMAJA: '03/01/2024',
    TGLNYALA: '03/01/2024',
    TGLBATAL: '',
    STATUS_PERMOHONAN: 'SELESAI',
    ID_GANTI_METER: 'GM001',
    ALASAN_GANTI_METER: 'Program meter tua',
    ALASAN_PENANGGUHAN: '',
    KETERANGAN_ALASAN_PENANGGUHAN: '',
    NO_METER_BARU: '32109876543',
    MERK_METER_BARU: 'CANNET',
    TYPE_METER_BARU: '1 FASA',
    THTERA_METER_BARU: '2024',
    THBUAT_METER_BARU: '2024',
    NO_METER_LAMA: '12345678901',
    MERK_METER_LAMA: 'ITRON',
    TYPE_METER_LAMA: '1 FASA',
    THTERA_METER_LAMA: '2015',
    THBUAT_METER_LAMA: '2015',
    PETUGASPENGADUAN: 'PETUGAS A',
    PETUGASTINDAKANPENGADUAN: 'REGU 1',
    PETUGASAKTIVASI: 'PETUGAS B',
    PETUGASPENANGGUHAN: '',
    PETUGASRESTITUSI: '',
    PETUGASREMAJA: 'PETUGAS C',
    PETUGASBATAL: '',
    TGLREKAP: '03/01/2024',
    KDPEMBMETER: 'P - SISTEM PRABAYAR',
    CT_PRIMER_KWH: '',
    CT_SEKUNDER_KWH: '',
    PT_PRIMER_KWH: '',
    PT_SEKUNDER_KWH: '',
    KONSTANTA_KWH: '1000',
    FAKMKWH: '1',
    TYPE_CT_KWH: '',
    CT_PRIMER_KVARH: '',
    CT_SEKUNDER_KVARH: '',
    PT_PRIMER_KVARH: '',
    PT_SEKUNDER_KVARH: '',
    KONSTANTA_KVARH: '',
    FAKMKVARH: '',
    TYPE_CT_KVARH: ''
  };

  const ws = XLSX.utils.json_to_sheet([sampleRow], { header: headerKeys });

  // Auto-width columns
  ws['!cols'] = headerKeys.map(k => ({ wch: Math.max(k.length + 3, 14) }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'DATA_GANTI_METER');

  XLSX.writeFile(wb, 'Template_Resmi_Penggantian_kWh_Meter_PLN.xlsx');
}

/**
 * Validasi kecocokan kolom file upload terhadap susunan resmi
 */
export function validateUploadedColumns(uploadedRows) {
  if (!uploadedRows || uploadedRows.length === 0) {
    return { isValid: false, matchCount: 0, total: 67, missingRequired: [] };
  }

  const uploadedKeys = new Set(Object.keys(uploadedRows[0]).map(k => k.trim().toUpperCase()));
  let matchCount = 0;
  const missingRequired = [];

  OFFICIAL_PLN_COLUMNS.forEach(col => {
    if (uploadedKeys.has(col.key.toUpperCase())) {
      matchCount++;
    } else if (col.required) {
      missingRequired.push(col.key);
    }
  });

  return {
    isValid: missingRequired.length === 0,
    matchCount,
    totalCount: OFFICIAL_PLN_COLUMNS.length,
    percentage: ((matchCount / OFFICIAL_PLN_COLUMNS.length) * 100).toFixed(0),
    missingRequired
  };
}
