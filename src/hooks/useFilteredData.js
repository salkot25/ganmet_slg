import { useState, useMemo } from 'react';

/**
 * Custom hook for dynamic multi-filtering and fast memoized aggregations
 */
export function useFilteredData(rawData) {
  const [filters, setFilters] = useState({
    unitup: 'ALL',
    dateStart: null,
    dateEnd: null,
    alasan: 'ALL',
    layanan: 'ALL' // 'ALL' | 'PRABAYAR' | 'PASKABAYAR' | 'AMR_AMI'
  });

  // Extract distinct UNITUP options
  const unitupOptions = useMemo(() => {
    const set = new Set(rawData.map(d => String(d.UNITUP || '').trim()).filter(Boolean));
    return Array.from(set).sort();
  }, [rawData]);

  // Extract distinct Alasan options with counts
  const alasanOptions = useMemo(() => {
    const counts = {};
    rawData.forEach(d => {
      const al = (d.ALASAN_GANTI_METER || 'Lainnya').trim();
      if (al) counts[al] = (counts[al] || 0) + 1;
    });
    return Object.keys(counts)
      .sort((a, b) => counts[b] - counts[a])
      .map(alasan => ({
        label: alasan,
        count: counts[alasan]
      }));
  }, [rawData]);

  // Filtered dataset
  const filteredData = useMemo(() => {
    const { unitup, dateStart, dateEnd, alasan, layanan } = filters;

    return rawData.filter(item => {
      // 1. UNITUP
      if (unitup !== 'ALL' && String(item.UNITUP || '').trim() !== unitup) {
        return false;
      }

      // 2. Tanggal Remaja
      if (item._parsedDate) {
        if (dateStart && item._parsedDate < dateStart) return false;
        if (dateEnd && item._parsedDate > dateEnd) return false;
      }

      // 3. Alasan Ganti Meter
      if (alasan !== 'ALL' && (item.ALASAN_GANTI_METER || '').trim() !== alasan) {
        return false;
      }

      // 4. KDPEMBMETER Layanan
      if (layanan !== 'ALL') {
        const kd = (item.KDPEMBMETER || '').toUpperCase();
        if (layanan === 'PRABAYAR' && !kd.startsWith('P')) return false;
        if (layanan === 'PASKABAYAR' && (!kd.startsWith('M') && !kd.startsWith('E'))) return false;
        if (layanan === 'AMR_AMI' && (!kd.startsWith('A') && !kd.startsWith('R'))) return false;
      }

      return true;
    });
  }, [rawData, filters]);

  // Memoized KPI Summary Metrics
  const kpiMetrics = useMemo(() => {
    const total = filteredData.length;
    const rawTotal = rawData.length || 1;

    let prabayarCount = 0;
    let paskaCount = 0;
    const reasonMap = {};

    filteredData.forEach(item => {
      const kd = (item.KDPEMBMETER || '').toUpperCase();
      if (kd.startsWith('P')) {
        prabayarCount++;
      } else if (kd.startsWith('M') || kd.startsWith('E')) {
        paskaCount++;
      }

      const al = (item.ALASAN_GANTI_METER || 'Lainnya').trim();
      if (al) {
        reasonMap[al] = (reasonMap[al] || 0) + 1;
      }
    });

    let topReasonName = '-';
    let topReasonCount = 0;
    Object.entries(reasonMap).forEach(([reason, count]) => {
      if (count > topReasonCount) {
        topReasonCount = count;
        topReasonName = reason;
      }
    });

    return {
      total,
      rawTotal,
      totalPercent: ((total / rawTotal) * 100).toFixed(1),
      prabayarCount,
      prabayarPercent: total > 0 ? ((prabayarCount / total) * 100).toFixed(1) : '0.0',
      paskaCount,
      paskaPercent: total > 0 ? ((paskaCount / total) * 100).toFixed(1) : '0.0',
      topReasonName,
      topReasonCount,
      topReasonPercent: total > 0 ? ((topReasonCount / total) * 100).toFixed(1) : '0.0'
    };
  }, [filteredData, rawData]);

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      unitup: 'ALL',
      dateStart: null,
      dateEnd: null,
      alasan: 'ALL',
      layanan: 'ALL'
    });
  };

  return {
    filters,
    updateFilter,
    resetFilters,
    filteredData,
    kpiMetrics,
    unitupOptions,
    alasanOptions
  };
}
