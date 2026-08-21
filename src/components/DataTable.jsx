import React from 'react';
import {
  Table as TableIcon,
  Search,
  Download,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X
} from 'lucide-react';
import { Card } from './common/Card';
import { Badge } from './common/Badge';
import { Button } from './common/Button';
import { formatNumber, formatDaya } from '../utils/formatters';
import { exportToCSV } from '../utils/csvExporter';

export function DataTable({ pagination, onOpenDetail }) {
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
    setPage
  } = pagination;

  const handleExport = () => {
    exportToCSV(processedData);
  };

  const getServiceBadge = (kd) => {
    const code = (kd || '').toUpperCase();
    if (code.startsWith('P')) {
      return <Badge variant="cyan">Prabayar</Badge>;
    }
    if (code.startsWith('M')) {
      return <Badge variant="orange">Paska (Mekanik)</Badge>;
    }
    if (code.startsWith('E')) {
      return <Badge variant="orange">Paska (Elektrik)</Badge>;
    }
    if (code.startsWith('A') || code.startsWith('R')) {
      return <Badge variant="blue">AMR / AMI</Badge>;
    }
    return <Badge variant="slate">Lainnya</Badge>;
  };

  const renderSortableHeader = (label, columnKey) => (
    <th
      onClick={() => handleSort(columnKey)}
      className="px-3.5 py-3 text-left text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider cursor-pointer select-none hover:bg-surface-light-hover dark:hover:bg-surface-dark-hover hover:text-pln-cyan transition-colors"
    >
      <div className="flex items-center gap-1">
        <span>{label}</span>
        <ChevronsUpDown
          className={`w-3.5 h-3.5 ${
            sortColumn === columnKey ? 'text-pln-cyan opacity-100' : 'opacity-40'
          }`}
        />
      </div>
    </th>
  );

  return (
    <Card className="flex flex-col gap-4">
      {/* Table Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-surface-light-border dark:border-surface-dark-border">
        <div className="flex items-center gap-3">
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

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari IDPEL, Nama, No Meter..."
              className="w-full pl-9 pr-8 py-1.5 bg-base-light dark:bg-base-dark border border-surface-light-border dark:border-surface-dark-border rounded-8px text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-pln-cyan focus:ring-1 focus:ring-pln-cyan"
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

          {/* Export CSV Button */}
          <Button variant="primary" size="sm" icon={Download} onClick={handleExport}>
            Ekspor CSV
          </Button>
        </div>
      </div>

      {/* Table Container */}
      <div className="w-full overflow-x-auto rounded-8px border border-surface-light-border dark:border-surface-dark-border bg-base-light/50 dark:bg-base-dark/50">
        <table className="w-full text-xs text-left border-collapse">
          <thead className="bg-surface-light dark:bg-surface-dark border-b border-surface-light-border dark:border-surface-dark-border">
            <tr>
              <th className="px-3.5 py-3 text-xs font-bold text-slate-600 dark:text-slate-300">No</th>
              {renderSortableHeader('UNITUP', 'UNITUP')}
              {renderSortableHeader('Tgl Remaja', 'TGLREMAJA')}
              {renderSortableHeader('IDPEL', 'IDPEL')}
              {renderSortableHeader('Nama Pelanggan', 'NAMA')}
              {renderSortableHeader('Tarif / Daya', 'TARIF')}
              {renderSortableHeader('Alasan Ganti', 'ALASAN_GANTI_METER')}
              {renderSortableHeader('Layanan', 'KDPEMBMETER')}
              <th className="px-3.5 py-3 font-bold text-slate-600 dark:text-slate-300">Meter Lama &rarr; Baru</th>
              <th className="px-3.5 py-3 font-bold text-slate-600 dark:text-slate-300 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-light-border dark:divide-surface-dark-border">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan="10" className="px-4 py-8 text-center text-slate-400 text-xs">
                  Tidak ada data yang cocok dengan kriteria pencarian/filter.
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => {
                const rowNum = (currentPage - 1) * pageSize + idx + 1;
                return (
                  <tr
                    key={row._id}
                    className="hover:bg-pln-cyan/5 dark:hover:bg-pln-cyan/10 transition-colors"
                  >
                    <td className="px-3.5 py-2.5 text-slate-500 dark:text-slate-400">{rowNum}</td>
                    <td className="px-3.5 py-2.5 font-bold text-slate-900 dark:text-white">
                      {row.UNITUP || '-'}
                    </td>
                    <td className="px-3.5 py-2.5 text-slate-600 dark:text-slate-300">
                      {row.TGLREMAJA || '-'}
                    </td>
                    <td className="px-3.5 py-2.5 font-mono text-pln-cyan-light font-semibold">
                      {row.IDPEL || '-'}
                    </td>
                    <td className="px-3.5 py-2.5 font-semibold text-slate-900 dark:text-white max-w-[180px] truncate" title={row.NAMA}>
                      {row.NAMA || '-'}
                    </td>
                    <td className="px-3.5 py-2.5 text-slate-600 dark:text-slate-300">
                      {row.TARIF || '-'} / {formatDaya(row.DAYA)}
                    </td>
                    <td className="px-3.5 py-2.5 text-slate-600 dark:text-slate-300 max-w-[160px] truncate" title={row.ALASAN_GANTI_METER}>
                      {row.ALASAN_GANTI_METER || '-'}
                    </td>
                    <td className="px-3.5 py-2.5">{getServiceBadge(row.KDPEMBMETER)}</td>
                    <td className="px-3.5 py-2.5">
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <span className="text-slate-400">{row.MERK_METER_LAMA || '-'}</span>
                        <span className="text-pln-cyan font-bold">&rarr;</span>
                        <span className="text-pln-cyan-light font-semibold">
                          {row.MERK_METER_BARU || '-'}
                        </span>
                      </div>
                    </td>
                    <td className="px-3.5 py-2.5 text-center">
                      <button
                        onClick={() => onOpenDetail(row)}
                        className="px-2.5 py-1 text-[11px] font-semibold bg-surface-light dark:bg-surface-dark border border-surface-light-border dark:border-surface-dark-border hover:border-pln-cyan hover:text-pln-cyan-light text-slate-700 dark:text-slate-300 rounded-4px transition-colors"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer adhering to 4px spacing */}
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
    </Card>
  );
}
