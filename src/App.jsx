import React, { useState } from 'react';
import { Header } from './components/Header';
import { FilterSection } from './components/FilterSection';
import { ExecutiveOverview } from './components/ExecutiveOverview';
import { RegionalAnalyticsSection } from './components/RegionalAnalyticsSection';
import { DataTable } from './components/DataTable';
import { CustomerDrawer } from './components/CustomerDrawer';
import { UploadExcelModal } from './components/UploadExcelModal';
import { CommandPalette } from './components/CommandPalette';
import { DataAuditSection } from './components/DataAuditSection';
import { ErrorBoundary } from './components/ErrorBoundary';

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
    relativeTimeStr,
    autoSyncInterval,
    setAutoSyncInterval,
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
    alasanOptions,
    latestDate,
    ulpAnalytics,
    spatialAnalytics,
    yoyAnalytics,
    brandMigrationAnalytics,
    dayaTarifAnalytics,
    anomalyAudit
  } = useFilteredData(rawData);

  const pagination = useTablePagination(filteredData);

  // Tab Workspace state ('overview' | 'analytics' | 'grid' | 'audit')
  const [activeTab, setActiveTab] = useState('overview');

  // Modal / Drawer states
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isUploadExcelOpen, setIsUploadExcelOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  const handleOpenDetail = (record) => {
    setSelectedRecord(record);
    setIsDrawerOpen(true);
  };

  const handleQuickFilterULP = (ulpCode) => {
    updateFilter('unitup', ulpCode);
    setActiveTab('grid');
  };

  if (loading && rawData.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-dark text-slate-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-11 h-11 border-3 border-pln-cyan border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-pln-cyan-light">Menghubungkan ke Google Spreadsheet Database...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="relative min-h-screen">
        {/* 60% Dominant Base Ambient Glows */}
        <div className="ambient-glow-1"></div>
        <div className="ambient-glow-2"></div>

        {/* Main Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-4 md:px-6 md:py-6 flex flex-col gap-5 md:gap-6">
          {/* Header with Navigation Tabs & Auto-Sync Controls */}
          <Header
            totalCount={rawData.length}
            isDark={isDark}
            onToggleTheme={toggleTheme}
            onDirectSync={directSyncFromAppsScript}
            onOpenUploadExcel={() => setIsUploadExcelOpen(true)}
            onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
            isSyncing={isSyncing}
            dataSource={dataSource}
            relativeTimeStr={relativeTimeStr}
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            autoSyncInterval={autoSyncInterval}
            onSetAutoSyncInterval={setAutoSyncInterval}
            anomalyCount={anomalyAudit?.anomalyCount || 0}
          />

          {/* Persistent Filter Section for Overview, Analytics, and Grid */}
          {activeTab !== 'audit' && (
            <FilterSection
              filters={filters}
              onUpdateFilter={updateFilter}
              onResetFilters={resetFilters}
              unitupOptions={unitupOptions}
              alasanOptions={alasanOptions}
              latestDate={latestDate}
            />
          )}

          {/* TAB 1: RINGKASAN EKSEKUTIF (High-level Strategic Snapshot) */}
          {activeTab === 'overview' && (
            <ExecutiveOverview
              data={filteredData}
              kpiMetrics={kpiMetrics}
              ulpAnalytics={ulpAnalytics}
              isDark={isDark}
              onOpenDetail={handleOpenDetail}
              onNavigateToTab={setActiveTab}
              onFilterULP={handleQuickFilterULP}
            />
          )}

          {/* TAB 2: ANALITIK & WILAYAH (Deep-Dive Territorial Intelligence & BI) */}
          {activeTab === 'analytics' && (
            <RegionalAnalyticsSection
              data={filteredData}
              ulpAnalytics={ulpAnalytics}
              spatialAnalytics={spatialAnalytics}
              yoyAnalytics={yoyAnalytics}
              brandMigrationAnalytics={brandMigrationAnalytics}
              dayaTarifAnalytics={dayaTarifAnalytics}
              isDark={isDark}
            />
          )}

          {/* TAB 3: DATA GRID & RINCIAN TABEL */}
          {activeTab === 'grid' && (
            <div className="flex flex-col gap-5 md:gap-6 animate-fade-in">
              <DataTable
                pagination={pagination}
                onOpenDetail={handleOpenDetail}
                metrics={kpiMetrics}
                filters={filters}
              />
            </div>
          )}

          {/* TAB 4: KUALITAS DATA & INTEGRITAS AUDIT */}
          {activeTab === 'audit' && (
            <div className="flex flex-col gap-5 md:gap-6 animate-fade-in">
              <DataAuditSection
                anomalyAudit={anomalyAudit}
                totalRecords={rawData.length}
                onOpenDetail={handleOpenDetail}
                onDirectSync={directSyncFromAppsScript}
                isSyncing={isSyncing}
              />
            </div>
          )}

          {/* Footer */}
          <footer className="text-center text-xs text-slate-500 dark:text-slate-400 py-4">
            &copy; 2026 PT PLN (Persero) - Dashboard Penggantian kWh Meter Salatiga. Connected to Google Spreadsheet via Apps Script.
          </footer>
        </div>

        {/* Slide-over Customer Inspection Drawer */}
        <CustomerDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          record={selectedRecord}
        />

        {/* Global Command Palette (Ctrl+K) */}
        <CommandPalette
          isOpen={isCommandPaletteOpen}
          onClose={() => setIsCommandPaletteOpen(false)}
          rawData={rawData}
          onSelectRecord={handleOpenDetail}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onUpdateFilter={updateFilter}
          onDirectSync={directSyncFromAppsScript}
          onOpenUploadExcel={() => setIsUploadExcelOpen(true)}
          isDark={isDark}
          onToggleTheme={toggleTheme}
          unitupOptions={unitupOptions}
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
    </ErrorBoundary>
  );
}
