import React, { useState, useRef } from 'react';
import { CloudCog, FileUp, RotateCcw, Link2, CheckCircle2, AlertCircle, Loader2, Copy, Check, ExternalLink } from 'lucide-react';
import { Modal } from './common/Modal';
import { Button } from './common/Button';
import Papa from 'papaparse';
import { SPREADSHEET_CONFIG } from '../constants/appConfig';

export function SyncModal({
  isOpen,
  onClose,
  onImportCSV,
  onReloadDefault,
  onSyncAppsScript,
  currentGasUrl,
  isSyncing,
  dataSource
}) {
  const [urlInput, setUrlInput] = useState(currentGasUrl || '');
  const [syncStatus, setSyncStatus] = useState(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef(null);

  const handleAppsScriptSubmit = async (e) => {
    e.preventDefault();
    if (!urlInput.trim()) {
      setSyncStatus({ type: 'error', message: 'Silakan masukkan URL Web App Google Apps Script.' });
      return;
    }

    setSyncStatus(null);
    try {
      const count = await onSyncAppsScript(urlInput.trim());
      setSyncStatus({
        type: 'success',
        message: `Berhasil terhubung! ${count.toLocaleString('id-ID')} data berhasil disinkronkan secara realtime.`
      });
    } catch (err) {
      setSyncStatus({
        type: 'error',
        message: `Gagal sinkronisasi: ${err.message}`
      });
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data && results.data.length > 0) {
          onImportCSV(results.data);
          onClose();
          alert(`Berhasil memuat ${results.data.length} data dari file CSV!`);
        }
      },
      error: (err) => {
        alert(`Gagal membaca file CSV: ${err.message}`);
      }
    });
  };

  const sampleGasCode = `// SPREADSHEET ID: ${SPREADSHEET_CONFIG.SPREADSHEET_ID} (GID: ${SPREADSHEET_CONFIG.SHEET_GID})
function doGet(e) {
  var SPREADSHEET_ID = '${SPREADSHEET_CONFIG.SPREADSHEET_ID}';
  var ss;
  try {
    ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  } catch (err) {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  }
  var sheet = ss.getSheets()[0];
  var values = sheet.getDataRange().getValues();
  var headers = values[0];
  var records = [];
  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    if (!row[0] && !row[5]) continue;
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      var val = row[j];
      if (val instanceof Date) {
        var d = ('0' + val.getDate()).slice(-2);
        var m = ('0' + (val.getMonth() + 1)).slice(-2);
        obj[headers[j]] = d + '/' + m + '/' + val.getFullYear();
      } else {
        obj[headers[j]] = val !== null && val !== undefined ? val : '';
      }
    }
    records.push(obj);
  }
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success', total: records.length, data: records
  })).setMimeType(ContentService.MimeType.JSON);
}`;

  const copyCode = () => {
    navigator.clipboard.writeText(sampleGasCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Integrasi & Sinkronisasi Database"
      icon={CloudCog}
      maxWidth="max-w-2xl"
    >
      <div className="flex flex-col gap-5 text-xs">
        {/* Source Spreadsheet Info Banner */}
        <div className="flex items-center justify-between p-3 bg-pln-cyan/10 border border-pln-cyan/30 rounded-8px text-slate-800 dark:text-slate-200">
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-pln-cyan uppercase tracking-wider">Sumber Database Utama</span>
            <span className="font-mono text-[11px] text-slate-600 dark:text-slate-400 truncate max-w-md">
              ID: {SPREADSHEET_CONFIG.SPREADSHEET_ID} (GID: {SPREADSHEET_CONFIG.SHEET_GID})
            </span>
          </div>
          <a
            href={SPREADSHEET_CONFIG.FULL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-1 bg-pln-cyan text-white font-semibold rounded-6px hover:bg-pln-cyan-dark transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Buka Sheet
          </a>
        </div>

        {/* 1. Google Apps Script Live Sync */}
        <div className="flex flex-col gap-3 p-4 bg-base-light dark:bg-base-dark rounded-12px border border-pln-cyan/30 shadow-sm">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Link2 className="w-4 h-4 text-pln-cyan" />
              Live Google Apps Script Web App API
            </h4>
            {dataSource === 'apps_script' && (
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="w-3 h-3" /> Live Terhubung
              </span>
            )}
          </div>

          <p className="text-slate-500 dark:text-slate-400">
            Hubungkan dashboard langsung ke Google Spreadsheet via Web App URL Google Apps Script untuk pembaruan data otomatis.
          </p>

          <form onSubmit={handleAppsScriptSubmit} className="flex flex-col sm:flex-row gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://script.google.com/macros/s/.../exec"
              className="flex-1 px-3 py-2 bg-surface-light dark:bg-surface-dark border border-surface-light-border dark:border-surface-dark-border rounded-8px text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:border-pln-cyan focus:ring-1 focus:ring-pln-cyan"
            />
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSyncing}
              className="whitespace-nowrap"
            >
              {isSyncing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Menghubungkan...
                </>
              ) : (
                'Hubungkan & Sinkronkan'
              )}
            </Button>
          </form>

          {syncStatus && (
            <div
              className={`p-2.5 rounded-8px flex items-start gap-2 text-[11px] font-medium ${
                syncStatus.type === 'success'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
              }`}
            >
              {syncStatus.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              )}
              <span>{syncStatus.message}</span>
            </div>
          )}

          {/* Quick Guide Snippet */}
          <details className="mt-1 group cursor-pointer text-slate-500 dark:text-slate-400">
            <summary className="font-semibold text-pln-cyan hover:underline select-none">
              Lihat Panduan & Script Google Apps Script (Code.gs)
            </summary>
            <div className="mt-3 p-3 bg-slate-900 rounded-8px border border-slate-800 text-[11px] text-slate-300 relative">
              <div className="flex justify-between items-center pb-2 mb-2 border-b border-slate-800">
                <span className="font-bold text-pln-yellow">Google Apps Script (Code.gs)</span>
                <button
                  type="button"
                  onClick={copyCode}
                  className="flex items-center gap-1 text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-200 px-2 py-1 rounded-4px border border-slate-700"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Tersalin!' : 'Salin Script'}
                </button>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-slate-400 mb-2">
                <li>Buka <a href={SPREADSHEET_CONFIG.FULL_URL} target="_blank" rel="noreferrer" className="text-pln-cyan underline">Google Spreadsheet ini</a> &rarr; menu <strong>Extensions &gt; Apps Script</strong>.</li>
                <li>Hapus kode bawaan dan tempel kode script ini.</li>
                <li>Klik <strong>Deploy &gt; New deployment &gt; Web app</strong>.</li>
                <li>Pilih <em>Execute as: Me</em> dan <em>Who has access: Anyone</em> &rarr; klik <strong>Deploy</strong>.</li>
                <li>Salin Web app URL dan tempel ke kolom di atas.</li>
              </ol>
            </div>
          </details>
        </div>

        {/* Divider */}
        <div className="flex items-center text-center text-slate-400 font-bold text-[11px]">
          <span className="flex-1 border-b border-surface-light-border dark:border-surface-dark-border"></span>
          <span className="px-3">OPSI CADANGAN / LOKAL</span>
          <span className="flex-1 border-b border-surface-light-border dark:border-surface-dark-border"></span>
        </div>

        {/* 2. Upload CSV & Reload Default Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-2 p-3.5 bg-base-light dark:bg-base-dark rounded-12px border border-surface-light-border dark:border-surface-dark-border">
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FileUp className="w-4 h-4 text-pln-cyan" />
              Upload File CSV Baru
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Pilih file CSV hasil download AP2T / Google Sheet lokal:
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="mt-1 text-[11px] text-slate-700 dark:text-slate-300 file:mr-2 file:py-1 file:px-2.5 file:rounded-4px file:border-0 file:text-[11px] file:font-semibold file:bg-pln-cyan file:text-white hover:file:bg-pln-cyan-dark cursor-pointer"
            />
          </div>

          <div className="flex flex-col gap-2 p-3.5 bg-base-light dark:bg-base-dark rounded-12px border border-surface-light-border dark:border-surface-dark-border">
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-pln-cyan" />
              Muat Ulang Default
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Kembalikan ke dataset 12.864 data default bawaan.
            </p>
            <Button
              variant="secondary"
              size="sm"
              icon={RotateCcw}
              onClick={() => {
                onReloadDefault();
                onClose();
              }}
              className="self-start mt-1"
            >
              Muat Ulang 12.864 Data
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
