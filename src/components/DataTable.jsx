import React, { useState } from 'react';
import {
  Table as TableIcon,
  Search,
  Download,
  Printer,
  FileSpreadsheet,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
  Columns3,
  Copy,
  Check,
  CheckSquare,
  Square,
  Sparkles,
  Layers
} from 'lucide-react';
import { Card } from './common/Card';
import { Badge } from './common/Badge';
import { Button } from './common/Button';
import { formatNumber, formatDaya } from '../utils/formatters';
import { exportToCSV } from '../utils/csvExporter';
import { exportOfficialXLSX, printExecutiveReport } from '../utils/reportGenerator';
import { ColumnSelectorModal } from './ColumnSelectorModal';
import { OFFICIAL_PLN_COLUMNS } from '../constants/plnColumns';

export const DEFAULT_VISIBLE_COLUMNS = [
  'UNITUP',
  'TGLREMAJA',
  'IDPEL',
  'NAMA',
  'TARIF',
  'ALASAN_GANTI_METER',
  'KDPEMBMETER',
  'MERK_METER_LAMA',
  'MERK_METER_BARU'
];

export function DataTable({
  pagination,
  onOpenDetail,
  metrics,
  filters
}) {
  const {
    searchTerm,
    setSearchTerm,
    sortColumn,
    sortDirection,
    handleSort,
    currentPage,
    totalPages,
    pageSize,
    setPageSize,
    totalItems,
    paginatedData,
    processedData,
    setPage,
    selectedIds,
    toggleSelectRow,
    toggleSelectAllCurrentPage,
    clearSelection
  } = pagination;

  const [visibleColumns, setVisibleColumns] = useState(DEFAULT_VISIBLE_COLUMNS);
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  const handleCopyIdpel = (idpel, id) => {
    navigator.clipboard.writeText(String(idpel));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleBatchCopyIdpels = () => {
    const selectedRows = processedData.filter(r => selectedIds.has(r._id));
    const idpels = selectedRows.map(r => r.IDPEL).filter(Boolean).join('\n');
    navigator.clipboard.writeText(idpels);
    alert(`${selectedRows.length} IDPEL berhasil disalin ke clipboard!`);
  };

  const handleExportSelectedXLSX = () => {
    const selectedRows = processedData.filter(r => selectedIds.has(r._id));
    exportOfficialXLSX(selectedRows, metrics, 'Ekspor_Pilihan_Penggantian_kWh_Meter_PLN');
  };

  const handlePrintSelectedReport = () => {
    const selectedRows = processedData.filter(r => selectedIds.has(r._id));
    printExecutiveReport(selectedRows, metrics, filters);
  };

  const getServiceBadge = (kd) => {
    const code = (kd || '').toUpperCase();
    if (code.startsWith('P')) return <Badge variant="cyan">Prabayar</Badge>;
    if (code.startsWith('M')) return <Badge variant="orange">Paska (Mek)</Badge>;
    if (code.startsWith('E')) return <Badge variant="orange">Paska (Elk)</Badge>;
    if (code.startsWith('A') || code.startsWith('R')) return <Badge variant="blue">AMR / AMI</Badge>;
    return <Badge variant="slate">Lainnya</Badge>;
  };

  const isAllCurrentSelected = paginatedData.length > 0 && paginatedData.every(r => selectedIds.has(r._id));

  const renderSortableHeader = (label, columnKey) => {
    const isSorted = sortColumn === columnKey;
    return (
      <th
        onClick={() => handleSort(columnKey)}
        className={`px-3.5 py-3 text-left text-xs font-bold uppercase tracking-wider cursor-pointer select-none transition-colors whitespace-nowrap ${
          isSorted
            ? 'text-pln-cyan bg-pln-cyan/10'
            : 'text-slate-600 dark:text-slate-300 hover:bg-surface-light-hover dark:hover:bg-surface-dark-hover hover:text-pln-cyan'
        }`}
      >
        <div className="flex items-center gap-1">
          <span>{label}</span>
          <ChevronsUpDown
            className={`w-3.5 h-3.5 ${
              isSorted ? 'text-pln-cyan opacity-100' : 'opacity-40'
            }`}
          />
        </div>
      </th>
    );
  };

  return (
    <Card className="flex flex-col gap-4 relative">
      {/* Table Header Controls */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 pb-3 border-b border-surface-light-border dark:border-surface-dark-border">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <TableIcon className="w-5 h-5 text-pln-cyan" />
            <h3 className="text-sm md:text-base font-bold text-slate-900 dark:text-slate-100">
              Data Rincian Penggantian Meter
            </h3>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-pln-cyan/10 border border-pln-cyan/30 text-pln-cyan-light">
            {formatNumber(totalItems)} Data
          </span>
        </div>

        <div className="flex items-center gap-2.5 w-full lg:w-auto flex-wrap">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari IDPEL, Nama, No Meter..."
              className="w-full pl-9 pr-8 py-1.5 bg-base-light dark:bg-base-dark border border-surface-light-border dark:border-surface-dark-border rounded-8px text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-pln-cyan focus:ring-1 focus:ring-pln-cyan font-medium"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Column Visibility Selector Trigger */}
          <Button
            variant="secondary"
            size="sm"
            icon={Columns3}
            onClick={() => setIsColumnModalOpen(true)}
            title="Pilih dan atur kolom yang ditampilkan"
          >
            <span className="hidden sm:inline">Kolom</span> ({visibleColumns.length})
          </Button>

          {/* Print Executive Report */}
          <Button
            variant="secondary"
            size="sm"
            icon={Printer}
            onClick={() => printExecutiveReport(processedData, metrics, filters)}
            title="Cetak Berita Acara Resmi / Simpan ke PDF"
          >
            <span className="hidden sm:inline">Berita Acara</span>
          </Button>

          {/* Export Menu */}
          <div className="relative">
            <Button
              variant="primary"
              size="sm"
              icon={Download}
              onClick={() => setIsExportMenuOpen(prev => !prev)}
            >
              Ekspor Data
            </Button>

            {isExportMenuOpen && (
              <div className="absolute right-0 mt-1 w-56 bg-surface-light dark:bg-surface-dark border border-surface-light-border dark:border-surface-dark-border rounded-10px shadow-2xl py-1.5 z-30 animate-fade-in text-xs">
                <button
                  type="button"
                  onClick={() => {
                    exportOfficialXLSX(processedData, metrics);
                    setIsExportMenuOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-pln-cyan/10 hover:text-pln-cyan flex items-center gap-2.5 font-bold text-slate-800 dark:text-slate-200"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <div>
                    <p className="leading-tight">Excel 3-Sheet (.xlsx)</p>
                    <span className="text-[10px] text-slate-400 font-normal">Ringkasan, Rekap ULP, & 67 Kolom</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    exportToCSV(processedData);
                    setIsExportMenuOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-pln-cyan/10 hover:text-pln-cyan flex items-center gap-2.5 font-bold text-slate-800 dark:text-slate-200 border-t border-surface-light-border dark:border-surface-dark-border"
                >
                  <Download className="w-4 h-4 text-pln-cyan flex-shrink-0" />
                  <div>
                    <p className="leading-tight">File CSV Standar</p>
                    <span className="text-[10px] text-slate-400 font-normal">Format UTF-8 BOM Excel</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="w-full overflow-x-auto rounded-8px border border-surface-light-border dark:border-surface-dark-border bg-base-light/50 dark:bg-base-dark/50">
        <table className="w-full text-xs text-left border-collapse">
          <thead className="bg-surface-light dark:bg-surface-dark border-b border-surface-light-border dark:border-surface-dark-border select-none">
            <tr>
              <th className="px-3 py-3 w-10 text-center">
                <button
                  type="button"
                  onClick={toggleSelectAllCurrentPage}
                  className="text-slate-400 hover:text-pln-cyan"
                  title="Pilih semua baris halaman ini"
                >
                  {isAllCurrentSelected ? (
                    <CheckSquare className="w-4 h-4 text-pln-cyan" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>
              </th>
              <th className="px-3 py-3 font-bold text-slate-600 dark:text-slate-300">No</th>
              
              {/* Dynamic Headers based on visibleColumns */}
              {visibleColumns.map((colKey) => {
                const colMeta = OFFICIAL_PLN_COLUMNS.find(c => c.key === colKey);
                const label = colMeta ? colMeta.label : colKey;
                return renderSortableHeader(label, colKey);
              })}

              <th className="px-3.5 py-3 font-bold text-slate-600 dark:text-slate-300 text-center sticky right-0 bg-surface-light dark:bg-surface-dark shadow-l">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-light-border dark:divide-surface-dark-border">
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={visibleColumns.length + 3}
                  className="px-4 py-8 text-center text-slate-400 text-xs"
                >
                  Tidak ada data yang cocok dengan kriteria pencarian/filter.
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => {
                const rowNum = (currentPage - 1) * pageSize + idx + 1;
                const isSelected = selectedIds.has(row._id);

                return (
                  <tr
                    key={row._id}
                    className={`transition-colors ${
                      isSelected
                        ? 'bg-pln-cyan/15 dark:bg-pln-cyan/20'
                        : 'hover:bg-pln-cyan/5 dark:hover:bg-pln-cyan/10'
                    }`}
                  >
                    <td className="px-3 py-2.5 text-center">
                      <button
                        type="button"
                        onClick={() => toggleSelectRow(row._id)}
                        className="text-slate-400 hover:text-pln-cyan"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-pln-cyan" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>

                    <td className="px-3 py-2.5 text-slate-500 dark:text-slate-400">{rowNum}</td>

                    {/* Dynamic Cell Values */}
                    {visibleColumns.map((colKey) => {
                      if (colKey === 'IDPEL') {
                        return (
                          <td key={colKey} className="px-3.5 py-2.5 font-mono text-pln-cyan-light font-bold whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <span>{row.IDPEL || '-'}</span>
                              <button
                                type="button"
                                onClick={() => handleCopyIdpel(row.IDPEL, row._id)}
                                className="text-slate-400 hover:text-pln-cyan"
                                title="Salin IDPEL"
                              >
                                {copiedId === row._id ? (
                                  <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3 h-3 opacity-60 hover:opacity-100" />
                                )}
                              </button>
                            </div>
                          </td>
                        );
                      }

                      if (colKey === 'KDPEMBMETER') {
                        return (
                          <td key={colKey} className="px-3.5 py-2.5 whitespace-nowrap">
                            {getServiceBadge(row.KDPEMBMETER)}
                          </td>
                        );
                      }

                      if (colKey === 'TARIF') {
                        return (
                          <td key={colKey} className="px-3.5 py-2.5 text-slate-600 dark:text-slate-300 whitespace-nowrap font-medium">
                            {row.TARIF || '-'} / {formatDaya(row.DAYA)}
                          </td>
                        );
                      }

                      if (colKey === 'UNITUP') {
                        return (
                          <td key={colKey} className="px-3.5 py-2.5 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                            {row.UNITUP || '-'}
                          </td>
                        );
                      }

                      if (colKey === 'NAMA') {
                        return (
                          <td
                            key={colKey}
                            className="px-3.5 py-2.5 font-semibold text-slate-900 dark:text-white max-w-[180px] truncate"
                            title={row.NAMA}
                          >
                            {row.NAMA || '-'}
                          </td>
                        );
                      }

                      if (colKey === 'ALASAN_GANTI_METER') {
                        return (
                          <td
                            key={colKey}
                            className="px-3.5 py-2.5 text-slate-600 dark:text-slate-300 max-w-[160px] truncate"
                            title={row.ALASAN_GANTI_METER}
                          >
                            {row.ALASAN_GANTI_METER || '-'}
                          </td>
                        );
                      }

                      return (
                        <td
                          key={colKey}
                          className="px-3.5 py-2.5 text-slate-600 dark:text-slate-300 max-w-[140px] truncate whitespace-nowrap"
                          title={String(row[colKey] || '')}
                        >
                          {String(row[colKey] || '-')}
                        </td>
                      );
                    })}

                    <td className="px-3.5 py-2.5 text-center sticky right-0 bg-surface-light dark:bg-surface-dark">
                      <button
                        onClick={() => onOpenDetail(row)}
                        className="px-3 py-1 text-[11px] font-bold bg-surface-light dark:bg-surface-dark border border-surface-light-border dark:border-surface-dark-border hover:border-pln-cyan hover:text-pln-cyan-light text-slate-700 dark:text-slate-300 rounded-4px transition-colors shadow-sm"
                      >
                        Inspeksi
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <span>Tampilkan</span>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="px-2 py-1 bg-base-light dark:bg-base-dark border border-surface-light-border dark:border-surface-dark-border rounded-4px text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-pln-cyan"
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <span>baris per halaman</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setPage(1)}
            disabled={currentPage <= 1}
            className="p-1.5 rounded-4px border border-surface-light-border dark:border-surface-dark-border disabled:opacity-40 hover:bg-surface-light-hover dark:hover:bg-surface-dark-hover"
            title="Halaman Pertama"
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setPage(currentPage - 1)}
            disabled={currentPage <= 1}
            className="p-1.5 rounded-4px border border-surface-light-border dark:border-surface-dark-border disabled:opacity-40 hover:bg-surface-light-hover dark:hover:bg-surface-dark-hover"
            title="Sebelumnya"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="px-3 font-semibold text-slate-700 dark:text-slate-200">
            Halaman {currentPage} dari {totalPages}
          </span>
          <button
            onClick={() => setPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="p-1.5 rounded-4px border border-surface-light-border dark:border-surface-dark-border disabled:opacity-40 hover:bg-surface-light-hover dark:hover:bg-surface-dark-hover"
            title="Berikutnya"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setPage(totalPages)}
            disabled={currentPage >= totalPages}
            className="p-1.5 rounded-4px border border-surface-light-border dark:border-surface-dark-border disabled:opacity-40 hover:bg-surface-light-hover dark:hover:bg-surface-dark-hover"
            title="Halaman Terakhir"
          >
            <ChevronsRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Floating Action Toolbar for Batch Row Operations */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-surface-light dark:bg-surface-dark border border-pln-cyan rounded-16px shadow-2xl p-3 flex items-center gap-3 animate-slide-left backdrop-blur-lg">
          <div className="flex items-center gap-2 pl-2 pr-3 border-r border-surface-light-border dark:border-surface-dark-border">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-xs text-slate-900 dark:text-white">
              {selectedIds.size} Baris Terpilih
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleBatchCopyIdpels}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-8px bg-pln-cyan text-white text-xs font-bold hover:bg-pln-cyan-dark transition-colors shadow-sm"
              title="Salin semua IDPEL terpilih ke clipboard"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Salin IDPEL</span>
            </button>

            <button
              type="button"
              onClick={handleExportSelectedXLSX}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-8px bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-500/25 transition-colors"
              title="Ekspor hanya baris terpilih ke file Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Ekspor Excel Pilihan</span>
            </button>

            <button
              type="button"
              onClick={handlePrintSelectedReport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-8px bg-amber-500/15 text-amber-400 border border-amber-500/30 text-xs font-bold hover:bg-amber-500/25 transition-colors"
              title="Cetak Berita Acara baris terpilih"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Berita Acara</span>
            </button>

            <button
              type="button"
              onClick={clearSelection}
              className="p-1.5 rounded-6px text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors ml-1"
              title="Batal pilih semua"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Column Selector Modal */}
      <ColumnSelectorModal
        isOpen={isColumnModalOpen}
        onClose={() => setIsColumnModalOpen(false)}
        visibleColumns={visibleColumns}
        onUpdateVisibleColumns={setVisibleColumns}
        defaultColumns={DEFAULT_VISIBLE_COLUMNS}
      />
    </Card>
  );
}
