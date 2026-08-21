/**
 * Pure CSV exporter with UTF-8 BOM encoding for Microsoft Excel compatibility
 */

export function exportToCSV(data, filename = 'PLN_Penggantian_kWh_Meter.csv') {
  if (!data || data.length === 0) {
    alert('Tidak ada data untuk diekspor.');
    return;
  }

  const exportCols = [
    'NOAGENDA', 'UNITUP', 'IDPEL', 'NAMA', 'TARIF', 'DAYA', 
    'TGLREMAJA', 'ALASAN_GANTI_METER', 'NO_METER_LAMA', 'MERK_METER_LAMA', 
    'NO_METER_BARU', 'MERK_METER_BARU', 'KDPEMBMETER', 'PETUGASREMAJA'
  ];

  let csvContent = '\uFEFF'; // UTF-8 BOM
  csvContent += exportCols.join(',') + '\n';

  data.forEach(row => {
    const rowValues = exportCols.map(col => {
      let val = row[col] !== undefined && row[col] !== null ? String(row[col]) : '';
      if (val.includes(',') || val.includes('"') || val.includes('\n')) {
        val = `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    });
    csvContent += rowValues.join(',') + '\n';
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename.replace('.csv', '')}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
