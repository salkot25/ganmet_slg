import { useState, useEffect, useCallback } from 'react';
import { parseDMY, formatDMY } from '../utils/dateHelpers';
import { SPREADSHEET_CONFIG } from '../constants/appConfig';

/**
 * Custom hook for Meter Data fetching, direct sync, and updating Google Spreadsheet
 */
export function useMeterData() {
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [dataSource, setDataSource] = useState('default'); // 'default' | 'apps_script' | 'csv' | 'excel'
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [toastMessage, setToastMessage] = useState(null); // { type: 'success' | 'error', text: '' }

  const gasUrl = SPREADSHEET_CONFIG.DEFAULT_GAS_URL;

  const showToast = useCallback((text, type = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  }, []);

  const processRecords = useCallback((records, source = 'default') => {
    const processed = records.map((item, idx) => {
      const parsedDate = parseDMY(item.TGLREMAJA);
      return {
        ...item,
        _id: idx + 1,
        _parsedDate: parsedDate,
        TGLREMAJA: parsedDate ? formatDMY(parsedDate) : (item.TGLREMAJA || '')
      };
    });
    setRawData(processed);
    setDataSource(source);
    setLastSyncTime(new Date());
    setLoading(false);
    setIsSyncing(false);
    setIsUploading(false);
  }, []);

  const loadDefaultData = useCallback(async () => {
    try {
      if (window.DATA_KWH && Array.isArray(window.DATA_KWH)) {
        processRecords(window.DATA_KWH, 'default');
        return;
      }
      const baseUrl = import.meta.env.BASE_URL || '/';
      const dataUrl = `${baseUrl.endsWith('/') ? baseUrl : baseUrl + '/'}data_kwh.json`;
      const res = await fetch(dataUrl);
      if (res.ok) {
        const data = await res.json();
        processRecords(data, 'default');
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.warn('Fallback data loading:', err);
      setLoading(false);
    }
  }, [processRecords]);

  // Direct Live Sync from Google Apps Script without popup
  const directSyncFromAppsScript = useCallback(async (isSilent = false) => {
    setIsSyncing(true);
    setError(null);

    try {
      const res = await fetch(gasUrl);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const json = await res.json();
      let records = [];

      if (json.status === 'success' && Array.isArray(json.data)) {
        records = json.data;
      } else if (Array.isArray(json)) {
        records = json;
      } else if (json.data && Array.isArray(json.data)) {
        records = json.data;
      } else {
        throw new Error(json.message || 'Respon Google Apps Script tidak valid.');
      }

      processRecords(records, 'apps_script');
      if (!isSilent) {
        showToast(`Sinkronisasi berhasil! ${records.length.toLocaleString('id-ID')} data terbaru dimuat.`);
      }
      return records.length;
    } catch (err) {
      console.error('GAS Sync Error:', err);
      setIsSyncing(false);
      setError(err.message);
      if (!isSilent) {
        showToast(`Gagal sinkronisasi: ${err.message}`, 'error');
      }
      if (rawData.length === 0) {
        loadDefaultData();
      }
      throw err;
    }
  }, [gasUrl, processRecords, showToast, rawData.length, loadDefaultData]);

  // Upload Excel records and push to Google Spreadsheet via POST
  const uploadAndSyncToSpreadsheet = useCallback(async (action, records) => {
    if (!records || records.length === 0) {
      throw new Error('Tidak ada data untuk diunggah.');
    }

    setIsUploading(true);
    setError(null);

    try {
      const payload = {
        action: action, // 'append' | 'overwrite'
        data: records
      };

      const res = await fetch(gasUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(payload)
      });

      const json = await res.json();

      if (json.status !== 'success') {
        throw new Error(json.message || 'Gagal menyimpan data ke Google Spreadsheet.');
      }

      showToast(`Sukses! ${records.length.toLocaleString('id-ID')} data berhasil diperbarui di Google Spreadsheet.`);

      await directSyncFromAppsScript(true);
      return json;
    } catch (err) {
      console.error('Upload to Spreadsheet Error:', err);
      setIsUploading(false);
      showToast(`Gagal update spreadsheet: ${err.message}`, 'error');
      throw err;
    }
  }, [gasUrl, showToast, directSyncFromAppsScript]);

  // Auto-sync on initial mount
  useEffect(() => {
    loadDefaultData().then(() => {
      directSyncFromAppsScript(true).catch(() => {});
    });
  }, []);

  return {
    rawData,
    loading,
    isSyncing,
    isUploading,
    error,
    dataSource,
    lastSyncTime,
    toastMessage,
    directSyncFromAppsScript,
    uploadAndSyncToSpreadsheet
  };
}
