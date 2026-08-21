import * as XLSX from 'xlsx';
import { OFFICIAL_PLN_COLUMNS } from '../constants/plnColumns';
import { formatNumber, formatDaya } from './formatters';
import { formatDMY } from './dateHelpers';

/**
 * Enterprise Multi-Sheet Official Excel Export (.xlsx)
 * Includes:
 * 1. RINGKASAN_EKSEKUTIF: Executive KPI metrics, summary, and date stamp
 * 2. DATA_67_KOLOM: Complete 67 PLN columns with formatted headers and auto-width
 * 3. REKAP_PER_ULP: Aggregated summary matrix per Unit ULP
 */
export function exportOfficialXLSX(data, metrics, filename = 'Laporan_Penggantian_kWh_Meter_PLN') {
  if (!data || data.length === 0) {
    alert('Tidak ada data untuk diekspor.');
    return;
  }

  const wb = XLSX.utils.book_new();

  // 1. Sheet 1: RINGKASAN EKSEKUTIF (Executive Summary)
  const summaryData = [
    ['PT PLN (PERSERO) - SISTEM MONITORING PENGGANTIAN KWH METER'],
    ['LAPORAN EKSEKUTIF & REKAPITULASI PEREMAJAAN KWH METER'],
    ['Tanggal Ekspor:', formatDMY(new Date()), 'Total Data Terfilter:', data.length],
    [],
    ['NO', 'INDIKATOR STRATEGIS', 'NILAI PENCAPAIAN', 'SATUAN', 'PROPORSI'],
    [1, 'Total Unit Penggantian', metrics?.total || data.length, 'Unit', '100%'],
    [2, 'Meter Prabayar (LPB)', metrics?.prabayarCount || 0, 'Unit', `${metrics?.prabayarPercent || 0}%`],
    [3, 'Meter Paskabayar', metrics?.paskaCount || 0, 'Unit', `${metrics?.paskaPercent || 0}%`],
    [4, 'Meter AMR / AMI', metrics?.amrCount || 0, 'Unit', `${metrics?.amrPercent || 0}%`],
    [5, 'Alasan Terbanyak', metrics?.topReasonName || '-', `${metrics?.topReasonCount || 0} Unit`, `${metrics?.topReasonPercent || 0}%`],
    [],
    ['Catatan:', 'Data diekspor secara otomatis dari Sistem Dashboard Monitoring kWh Meter Salatiga.']
  ];

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  wsSummary['!cols'] = [{ wch: 6 }, { wch: 30 }, { wch: 22 }, { wch: 12 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'RINGKASAN_EKSEKUTIF');

  // 2. Sheet 2: REKAPITULASI PER ULP (Aggregated Matrix)
  const ulpMap = {};
  data.forEach(item => {
    const u = String(item.UNITUP || 'Lainnya').trim();
    if (!ulpMap[u]) {
      ulpMap[u] = { total: 0, prabayar: 0, paskabayar: 0, amr: 0 };
    }
    ulpMap[u].total++;
    const kd = (item.KDPEMBMETER || '').toUpperCase();
    if (kd.startsWith('P')) ulpMap[u].prabayar++;
    else if (kd.startsWith('M') || kd.startsWith('E')) ulpMap[u].paskabayar++;
    else ulpMap[u].amr++;
  });

  const ulpRows = [
    ['REKAPITULASI PEKERJAAN PEREMAJAAN METER PER UNIT PELAYANAN (ULP)'],
    ['Tanggal:', formatDMY(new Date())],
    [],
    ['NO', 'KODE UNITUP', 'TOTAL PENGGANTIAN', 'PRABAYAR (LPB)', 'PASKABAYAR', 'AMR / AMI', 'RASIO PRABAYAR']
  ];

  let uIdx = 1;
  Object.entries(ulpMap)
    .sort((a, b) => b[1].total - a[1].total)
    .forEach(([unit, counts]) => {
      const ratio = counts.total > 0 ? ((counts.prabayar / counts.total) * 100).toFixed(1) + '%' : '0%';
      ulpRows.push([
        uIdx++,
        `UNITUP ${unit}`,
        counts.total,
        counts.prabayar,
        counts.paskabayar,
        counts.amr,
        ratio
      ]);
    });

  const wsUlp = XLSX.utils.aoa_to_sheet(ulpRows);
  wsUlp['!cols'] = [{ wch: 6 }, { wch: 20 }, { wch: 20 }, { wch: 18 }, { wch: 16 }, { wch: 14 }, { wch: 16 }];
  XLSX.utils.book_append_sheet(wb, wsUlp, 'REKAP_PER_ULP');

  // 3. Sheet 3: 67 KOLOM LENGKAP DATA TRANSAKSI
  const headerKeys = OFFICIAL_PLN_COLUMNS.map(c => c.key);

  const rows = data.map(item => {
    const r = {};
    headerKeys.forEach(k => {
      r[k] = item[k] !== undefined && item[k] !== null ? item[k] : '';
    });
    return r;
  });

  const wsData = XLSX.utils.json_to_sheet(rows, { header: headerKeys });
  wsData['!cols'] = headerKeys.map(k => ({ wch: Math.max(k.length + 4, 14) }));

  XLSX.utils.book_append_sheet(wb, wsData, 'DATA_67_KOLOM');

  // Write and download
  const dateSuffix = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `${filename}_${dateSuffix}.xlsx`);
}

/**
 * Printable Executive Report & Berita Acara Generator (Print / Save as PDF)
 */
export function printExecutiveReport(data, metrics, filters) {
  if (!data || data.length === 0) {
    alert('Tidak ada data untuk dicetak.');
    return;
  }

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Pop-up browser diblokir. Harap izinkan pop-up untuk mencetak laporan.');
    return;
  }

  const sampleRows = data.slice(0, 50);
  const reportNo = `BA-PLN-GM/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${Math.floor(1000 + Math.random() * 9000)}`;

  const html = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <title>Laporan Resmi Rekapitulasi Penggantian kWh Meter PLN</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; margin: 24px; color: #0F172A; line-height: 1.4; }
        .header { border-bottom: 2px solid #00A2B9; padding-bottom: 12px; margin-bottom: 18px; display: flex; justify-content: space-between; align-items: center; }
        .brand { font-size: 20px; font-weight: 800; color: #00A2B9; letter-spacing: -0.5px; }
        .sub { font-size: 11px; color: #64748B; margin-top: 2px; font-weight: 600; }
        .report-meta { text-align: right; font-size: 11px; color: #475569; }
        .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
        .kpi-card { border: 1px solid #CBD5E1; border-radius: 8px; padding: 10px 12px; background: #F8FAFC; }
        .kpi-title { font-size: 9px; font-weight: 700; color: #64748B; text-transform: uppercase; }
        .kpi-val { font-size: 18px; font-weight: 800; color: #0F172A; margin-top: 2px; }
        .kpi-sub { font-size: 9px; color: #94A3B8; }
        table { width: 100%; border-collapse: collapse; font-size: 9.5px; margin-top: 14px; }
        th { background: #0B1728; color: #FFFFFF; text-align: left; padding: 6px 8px; font-weight: 700; }
        td { border-bottom: 1px solid #E2E8F0; padding: 5px 8px; }
        tr:nth-child(even) { background: #F8FAFC; }
        .sign-grid { display: grid; grid-template-columns: 1fr 1fr; margin-top: 36px; padding-top: 16px; page-break-inside: avoid; font-size: 11px; }
        .sign-box { text-align: center; }
        .sign-line { margin-top: 50px; font-weight: 700; border-top: 1px solid #0F172A; width: 60%; margin-left: auto; margin-right: auto; padding-top: 4px; }
        .footer { margin-top: 24px; font-size: 9px; color: #94A3B8; text-align: center; border-top: 1px solid #E2E8F0; padding-top: 10px; }
        @media print {
          body { margin: 10mm; }
          button { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="brand">⚡ PT PLN (PERSERO) - UNIT PELAKSANA PELAYANAN PELANGGAN</div>
          <div class="sub">BERITA ACARA & LAPORAN REKAPITULASI PENGGANTIAN KWH METER</div>
        </div>
        <div class="report-meta">
          <strong>No. Dokumen:</strong> ${reportNo}<br>
          <strong>Tanggal:</strong> ${formatDMY(new Date())}<br>
          <strong>Total Rekaman:</strong> ${formatNumber(data.length)} Unit
        </div>
      </div>

      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-title">Total Penggantian</div>
          <div class="kpi-val">${formatNumber(metrics?.total || data.length)}</div>
          <div class="kpi-sub">Unit Terfilter</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-title">Meter Prabayar (LPB)</div>
          <div class="kpi-val" style="color: #00A2B9;">${formatNumber(metrics?.prabayarCount || 0)}</div>
          <div class="kpi-sub">${metrics?.prabayarPercent || 0}% Rasio</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-title">Meter Paskabayar</div>
          <div class="kpi-val" style="color: #F59E0B;">${formatNumber(metrics?.paskaCount || 0)}</div>
          <div class="kpi-sub">${metrics?.paskaPercent || 0}% Rasio</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-title">Alasan Terbanyak</div>
          <div class="kpi-val" style="font-size: 13px;">${metrics?.topReasonName || '-'}</div>
          <div class="kpi-sub">${formatNumber(metrics?.topReasonCount || 0)} Unit</div>
        </div>
      </div>

      <div style="font-size: 11px; font-weight: 700; color: #0F172A; margin-bottom: 4px;">
        Rincian Transaksi Penggantian Meter (${sampleRows.length} Data Sampel):
      </div>

      <table>
        <thead>
          <tr>
            <th>No</th>
            <th>UNITUP</th>
            <th>TGL REMAJA</th>
            <th>IDPEL</th>
            <th>NAMA PELANGGAN</th>
            <th>TARIF / DAYA</th>
            <th>ALASAN GANTI</th>
            <th>METER LAMA &rarr; BARU</th>
            <th>PETUGAS REMAJA</th>
          </tr>
        </thead>
        <tbody>
          ${sampleRows.map((row, idx) => `
            <tr>
              <td>${idx + 1}</td>
              <td><strong>${row.UNITUP || '-'}</strong></td>
              <td>${row.TGLREMAJA || '-'}</td>
              <td style="font-family: monospace; font-weight: 700; color: #00838F;">${row.IDPEL || '-'}</td>
              <td>${row.NAMA || '-'}</td>
              <td>${row.TARIF || '-'} / ${formatDaya(row.DAYA)}</td>
              <td>${row.ALASAN_GANTI_METER || '-'}</td>
              <td>${row.MERK_METER_LAMA || '-'} &rarr; ${row.MERK_METER_BARU || '-'}</td>
              <td>${row.PETUGASREMAJA || '-'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="sign-grid">
        <div class="sign-box">
          <div>Mengetahui,</div>
          <div style="font-weight: 600;">Supervisor Transaksi Energi Listrik</div>
          <div class="sign-line">( .................................................. )</div>
        </div>
        <div class="sign-box">
          <div>Dibuat Oleh,</div>
          <div style="font-weight: 600;">Petugas Pelaksana Penggantian Meter</div>
          <div class="sign-line">( .................................................. )</div>
        </div>
      </div>

      <div class="footer">
        &copy; ${new Date().getFullYear()} PT PLN (Persero) - Dokumen resmi ini digenerate secara otomatis dari Dashboard Penggantian kWh Meter Salatiga.
      </div>

      <script>
        window.onload = function() {
          window.print();
        }
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
