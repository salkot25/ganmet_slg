import { useState, useMemo } from 'react';

/**
 * Custom hook for dynamic multi-filtering, advanced BI aggregations, and anomaly auditing
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

  // Find latest date in rawData for reference
  const latestDate = useMemo(() => {
    let latest = null;
    rawData.forEach(d => {
      if (d._parsedDate && (!latest || d._parsedDate > latest)) {
        latest = d._parsedDate;
      }
    });
    return latest || new Date();
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
    let amrCount = 0;
    const reasonMap = {};

    filteredData.forEach(item => {
      const kd = (item.KDPEMBMETER || '').toUpperCase();
      if (kd.startsWith('P')) {
        prabayarCount++;
      } else if (kd.startsWith('M') || kd.startsWith('E')) {
        paskaCount++;
      } else if (kd.startsWith('A') || kd.startsWith('R')) {
        amrCount++;
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
      amrCount,
      amrPercent: total > 0 ? ((amrCount / total) * 100).toFixed(1) : '0.0',
      topReasonName,
      topReasonCount,
      topReasonPercent: total > 0 ? ((topReasonCount / total) * 100).toFixed(1) : '0.0'
    };
  }, [filteredData, rawData]);

  // Advanced BI Aggregation: Unit ULP Breakdown
  const ulpAnalytics = useMemo(() => {
    const map = {};
    filteredData.forEach(item => {
      const unit = String(item.UNITUP || 'Lainnya').trim();
      if (!map[unit]) {
        map[unit] = { unit, total: 0, prabayar: 0, paskabayar: 0, amr: 0 };
      }
      map[unit].total++;
      const kd = (item.KDPEMBMETER || '').toUpperCase();
      if (kd.startsWith('P')) map[unit].prabayar++;
      else if (kd.startsWith('M') || kd.startsWith('E')) map[unit].paskabayar++;
      else map[unit].amr++;
    });

    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [filteredData]);

  // Advanced BI Aggregation: Kecamatan & Kelurahan Spatial Distribution
  const spatialAnalytics = useMemo(() => {
    const kecMap = {};
    const kabMap = {};

    filteredData.forEach(item => {
      const kec = String(item.NAMA_KEC || 'TIDAK TERDEFINISI').trim().toUpperCase();
      const kab = String(item.NAMA_KAB || 'TIDAK TERDEFINISI').trim().toUpperCase();

      kecMap[kec] = (kecMap[kec] || 0) + 1;
      kabMap[kab] = (kabMap[kab] || 0) + 1;
    });

    const topKecamatan = Object.entries(kecMap)
      .filter(([k]) => k !== '' && k !== 'TIDAK TERDEFINISI')
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);

    const topKabupaten = Object.entries(kabMap)
      .filter(([k]) => k !== '' && k !== 'TIDAK TERDEFINISI')
      .sort((a, b) => b[1] - a[1]);

    return { topKecamatan, topKabupaten };
  }, [filteredData]);

  // Advanced BI Aggregation: Year-over-Year (YoY) Velocity Comparison
  const yoyAnalytics = useMemo(() => {
    const monthlyByYear = {
      2024: Array(12).fill(0),
      2025: Array(12).fill(0),
      2026: Array(12).fill(0)
    };

    filteredData.forEach(item => {
      if (!item._parsedDate) return;
      const yr = item._parsedDate.getFullYear();
      const mo = item._parsedDate.getMonth();
      if (monthlyByYear[yr] && mo >= 0 && mo < 12) {
        monthlyByYear[yr][mo]++;
      }
    });

    return monthlyByYear;
  }, [filteredData]);

  // Advanced BI Aggregation: Meter Brand Migration (Merk Lama -> Merk Baru)
  const brandMigrationAnalytics = useMemo(() => {
    const oldBrands = {};
    const newBrands = {};
    const flowMap = {};

    filteredData.forEach(item => {
      const oldB = (item.MERK_METER_LAMA || 'TIDAK DIKETAHUI').trim().toUpperCase();
      const newB = (item.MERK_METER_BARU || 'TIDAK DIKETAHUI').trim().toUpperCase();

      oldBrands[oldB] = (oldBrands[oldB] || 0) + 1;
      newBrands[newB] = (newBrands[newB] || 0) + 1;

      const key = `${oldB} -> ${newB}`;
      flowMap[key] = (flowMap[key] || 0) + 1;
    });

    const topOld = Object.entries(oldBrands)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    const topNew = Object.entries(newBrands)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const topFlows = Object.entries(flowMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([k, count]) => {
        const [from, to] = k.split(' -> ');
        return { from, to, count };
      });

    return { topOld, topNew, topFlows };
  }, [filteredData]);

  // Advanced BI Aggregation: Daya & Tarif Segmentation
  const dayaTarifAnalytics = useMemo(() => {
    const dayaBuckets = {
      '450 VA': 0,
      '900 VA': 0,
      '1300 VA': 0,
      '2200 VA': 0,
      '> 2200 VA': 0
    };

    const tarifMap = {};

    filteredData.forEach(item => {
      const d = parseInt(item.DAYA, 10);
      if (d === 450) dayaBuckets['450 VA']++;
      else if (d === 900) dayaBuckets['900 VA']++;
      else if (d === 1300) dayaBuckets['1300 VA']++;
      else if (d === 2200) dayaBuckets['2200 VA']++;
      else if (d > 2200) dayaBuckets['> 2200 VA']++;

      const trf = (item.TARIF || 'Lainnya').trim().toUpperCase();
      if (trf) tarifMap[trf] = (tarifMap[trf] || 0) + 1;
    });

    const topTarif = Object.entries(tarifMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    return { dayaBuckets, topTarif };
  }, [filteredData]);

  // Data Integrity & Anomaly Auditor
  const anomalyAudit = useMemo(() => {
    const anomalies = [];
    const idpelOccurrences = {};

    filteredData.forEach(item => {
      const idpel = String(item.IDPEL || '').trim();
      if (idpel) {
        idpelOccurrences[idpel] = (idpelOccurrences[idpel] || 0) + 1;
      }
    });

    filteredData.forEach(item => {
      const issues = [];
      const idpel = String(item.IDPEL || '').trim();

      // Issue 1: IDPEL Duplicate replacement
      if (idpel && idpelOccurrences[idpel] > 1) {
        issues.push(`IDPEL terduplikasi (${idpelOccurrences[idpel]}x ganti meter)`);
      }

      // Issue 2: Same old and new meter number
      const oldMtr = String(item.NO_METER_LAMA || '').trim();
      const newMtr = String(item.NO_METER_BARU || '').trim();
      if (oldMtr && newMtr && oldMtr === newMtr) {
        issues.push('Nomor meter lama identik dengan nomor meter baru');
      }

      // Issue 3: Missing crucial fields
      if (!item.TGLREMAJA) issues.push('Tanggal remaja kosong');
      if (!item.ALASAN_GANTI_METER) issues.push('Alasan penggantian tidak terisi');
      if (!item.TARIF || !item.DAYA) issues.push('Informasi Tarif / Daya tidak lengkap');

      if (issues.length > 0) {
        anomalies.push({
          record: item,
          issues
        });
      }
    });

    const totalRecords = filteredData.length || 1;
    const cleanRecords = totalRecords - anomalies.length;
    const integrityScore = Math.max(0, ((cleanRecords / totalRecords) * 100)).toFixed(1);

    return {
      anomalies,
      anomalyCount: anomalies.length,
      integrityScore
    };
  }, [filteredData]);

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
    alasanOptions,
    latestDate,
    ulpAnalytics,
    spatialAnalytics,
    yoyAnalytics,
    brandMigrationAnalytics,
    dayaTarifAnalytics,
    anomalyAudit
  };
}
