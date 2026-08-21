import React, { useState } from 'react';
import { Header } from './components/Header';
import { FilterSection } from './components/FilterSection';
import { KPICards } from './components/KPICards';
import { ChartsSection } from './components/ChartsSection';
import { DataTable } from './components/DataTable';
import { DetailModal } from './components/DetailModal';
import { UploadExcelModal } from './components/UploadExcelModal';

import { useTheme } from './hooks/useTheme';
import { useMeterData } from './hooks/useMeterData';
import { useFilteredData } from './hooks/useFilteredData';
import { useTablePagination } from './hooks/useTablePagination';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  const { isDark, toggleTheme } = useTheme();
  const {
    rawData,
    loading,
    isSyncing,
    isUploading,
    dataSource,
    toastMessage,
    directSyncFromAppsScript,
    uploadAndSyncToSpreadsheet
  } = useMeterData();

  const {
    filters,
    updateFilter,
    resetFilters,
    filteredData,
    kpiMetrics,
    unitupOptions,
    alasanOptions
  } = useFilteredData(rawData);

  const pagination = useTablePagination(filteredData);

  // Modal states
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isUploadExcelOpen, setIsUploadExcelOpen] = useState(false);

  const handleOpenDetail = (record) => {
    setSelectedRecord(record);
    setIsDetailOpen(true);
  };

  if (loading && rawData.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-dark text-slate-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-pln-cyan border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-pln-cyan-light">Menghubungkan ke Google Spreadsheet Database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* 60% Dominant Base Ambient Glows */}
      <div className="ambient-glow-1"></div>
      <div className="ambient-glow-2"></div>

      {/* Main Container adhering strictly to 4px spatial scale */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-4 md:px-6 md:py-6 flex flex-col gap-5 md:gap-6">
        {/* Header with Direct 1-Click Sync & Upload Excel */}
        <Header
          totalCount={rawData.length}
          isDark={isDark}
          onToggleTheme={toggleTheme}
          onDirectSync={directSyncFromAppsScript}
          onOpenUploadExcel={() => setIsUploadExcelOpen(true)}
          isSyncing={isSyncing}
          dataSource={dataSource}
        />

        {/* Filter Section (4 Primary Columns) */}
        <FilterSection
          filters={filters}
          onUpdateFilter={updateFilter}
          onResetFilters={resetFilters}
          unitupOptions={unitupOptions}
          alasanOptions={alasanOptions}
        />

        {/* Executive KPI Metric Cards */}
        <KPICards metrics={kpiMetrics} />

        {/* Visual Analytics Charts (Tren Waktu & Distribusi Alasan) */}
        <ChartsSection data={filteredData} isDark={isDark} />

        {/* Data Grid & Export */}
        <DataTable pagination={pagination} onOpenDetail={handleOpenDetail} />

        {/* Footer */}
        <footer className="text-center text-xs text-slate-500 dark:text-slate-400 py-4">
          &copy; 2026 PT PLN (Persero) - Dashboard Penggantian kWh Meter. Connected to Google Spreadsheet via Apps Script.
        </footer>
      </div>

      {/* Detail Modal */}
      <DetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        record={selectedRecord}
      />

      {/* Upload Excel & Update Spreadsheet Modal */}
      <UploadExcelModal
        isOpen={isUploadExcelOpen}
        onClose={() => setIsUploadExcelOpen(false)}
        onUploadSpreadsheet={uploadAndSyncToSpreadsheet}
        isUploading={isUploading}
      />

      {/* Non-intrusive Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-surface-light dark:bg-surface-dark border border-pln-cyan/40 rounded-12px shadow-2xl animate-fade-in text-xs font-semibold text-slate-900 dark:text-slate-100 backdrop-blur-md">
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}
    </div>
  );
}
