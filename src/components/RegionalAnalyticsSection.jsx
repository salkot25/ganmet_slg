import React, { useState, useMemo, useRef } from 'react';
import {
  Building2,
  GitCompare,
  Zap,
  BarChart3,
  Download,
  ArrowRight,
  PieChart,
  TrendingUp,
  Activity,
  Layers,
  MapPin,
  CalendarRange,
  Filter,
  Check
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import { Card } from './common/Card';
import { Badge } from './common/Badge';
import { formatNumber } from '../utils/formatters';
import { getChartTheme, PLN_COLORS } from '../constants/plnTheme';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export function RegionalAnalyticsSection({
  data,
  ulpAnalytics,
  spatialAnalytics,
  yoyAnalytics,
  brandMigrationAnalytics,
  dayaTarifAnalytics,
  isDark,
  onFilterULP,
  onFilterAlasan
}) {
  const [granularity, setGranularity] = useState('daily'); // 'daily' | 'monthly'
  const theme = useMemo(() => getChartTheme(isDark), [isDark]);

  const ulpBarRef = useRef(null);
  const yoyChartRef = useRef(null);
  const kecChartRef = useRef(null);

  // 1. Stacked ULP Comparison Chart Data
  const ulpChartData = useMemo(() => {
    if (!ulpAnalytics || ulpAnalytics.length === 0) return { labels: [], datasets: [] };

    const labels = ulpAnalytics.map(u => `ULP ${u.unit}`);
    const prabayar = ulpAnalytics.map(u => u.prabayar);
    const paskabayar = ulpAnalytics.map(u => u.paskabayar);
    const amr = ulpAnalytics.map(u => u.amr);

    return {
      labels,
      datasets: [
        {
          label: 'Prabayar (LPB)',
          data: prabayar,
          backgroundColor: '#00C2CB',
          borderRadius: 4
        },
        {
          label: 'Paskabayar',
          data: paskabayar,
          backgroundColor: '#F59E0B',
          borderRadius: 4
        },
        {
          label: 'AMR / AMI',
          data: amr,
          backgroundColor: '#3B82F6',
          borderRadius: 4
        }
      ]
    };
  }, [ulpAnalytics]);

  // 2. Year-over-Year (YoY) Multi-Line Comparison Chart Data
  const yoyChartData = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    if (!yoyAnalytics) return { labels: monthNames, datasets: [] };

    return {
      labels: monthNames,
      datasets: [
        {
          label: 'Tahun 2024',
          data: yoyAnalytics[2024] || [],
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.35,
          borderWidth: 2,
          pointRadius: 3
        },
        {
          label: 'Tahun 2025',
          data: yoyAnalytics[2025] || [],
          borderColor: '#F59E0B',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          tension: 0.35,
          borderWidth: 2,
          pointRadius: 3
        },
        {
          label: 'Tahun 2026',
          data: yoyAnalytics[2026] || [],
          borderColor: '#00C2CB',
          backgroundColor: 'rgba(0, 194, 203, 0.15)',
          tension: 0.35,
          borderWidth: 2.5,
          pointRadius: 4,
          fill: true
        }
      ]
    };
  }, [yoyAnalytics]);

  // 3. Top Kecamatan Horizontal Bar Data
  const kecamatanChartData = useMemo(() => {
    if (!spatialAnalytics || !spatialAnalytics.topKecamatan) return { labels: [], datasets: [] };
    const list = spatialAnalytics.topKecamatan;

    return {
      labels: list.map(([kec]) => kec),
      datasets: [
        {
          label: 'Jumlah Penggantian Meter',
          data: list.map(([, count]) => count),
          backgroundColor: '#00A2B9',
          borderRadius: 4
        }
      ]
    };
  }, [spatialAnalytics]);

  // 4. Daya Distribution Chart Data
  const dayaChartData = useMemo(() => {
    if (!dayaTarifAnalytics) return { labels: [], datasets: [] };
    const { dayaBuckets } = dayaTarifAnalytics;
    return {
      labels: Object.keys(dayaBuckets),
      datasets: [
        {
          label: 'Jumlah Pelanggan',
          data: Object.values(dayaBuckets),
          backgroundColor: [
            '#00A2B9',
            '#00C2CB',
            '#3B82F6',
            '#F59E0B',
            '#10B981'
          ],
          borderRadius: 6
        }
      ]
    };
  }, [dayaTarifAnalytics]);

  // 5. Top Golongan Tarif Bar Data
  const tarifChartData = useMemo(() => {
    if (!dayaTarifAnalytics || !dayaTarifAnalytics.topTarif) return { labels: [], datasets: [] };
    const top = dayaTarifAnalytics.topTarif;
    return {
      labels: top.map(t => t[0]),
      datasets: [
        {
          label: 'Pelanggan per Golongan Tarif',
          data: top.map(t => t[1]),
          backgroundColor: '#00A2B9',
          borderRadius: 6
        }
      ]
    };
  }, [dayaTarifAnalytics]);

  // 6. Time Series Trend Line Data
  const trendChartData = useMemo(() => {
    const buckets = {};
    data.forEach((d) => {
      if (!d._parsedDate) return;
      let key;
      const yr = d._parsedDate.getFullYear();
      const mo = String(d._parsedDate.getMonth() + 1).padStart(2, '0');
      if (granularity === 'monthly') {
        key = `${yr}-${mo}`;
      } else {
        const dy = String(d._parsedDate.getDate()).padStart(2, '0');
        key = `${yr}-${mo}-${dy}`;
      }
      buckets[key] = (buckets[key] || 0) + 1;
    });

    const sortedKeys = Object.keys(buckets).sort();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

    const labels = sortedKeys.map((k) => {
      if (granularity === 'monthly') {
        const [y, m] = k.split('-');
        return `${monthNames[parseInt(m, 10) - 1]} ${y}`;
      }
      const [y, m, d] = k.split('-');
      return `${d}/${m}/${y}`;
    });

    return {
      labels,
      datasets: [
        {
          label: 'Frekuensi Penggantian',
          data: sortedKeys.map((k) => buckets[k]),
          borderColor: PLN_COLORS.cyan,
          backgroundColor: isDark ? 'rgba(0, 162, 185, 0.22)' : 'rgba(0, 162, 185, 0.12)',
          fill: true,
          tension: 0.35,
          pointBackgroundColor: PLN_COLORS.cyanLight,
          pointBorderColor: '#FFFFFF',
          pointRadius: granularity === 'daily' ? 1.5 : 3.5,
          borderWidth: 2.5
        }
      ]
    };
  }, [data, granularity, isDark]);

  const downloadChartImage = (chartRef, filename = 'Chart_PLN.png') => {
    if (!chartRef || !chartRef.current) return;
    const chart = chartRef.current;
    const imageUri = chart.toBase64Image();
    const link = document.createElement('a');
    link.href = imageUri;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const baseChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        backgroundColor: theme.tooltipBg,
        titleColor: theme.tooltipTitle,
        bodyColor: theme.tooltipBody,
        borderColor: theme.tooltipBorder,
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (ctx) => ` ${ctx.dataset.label || 'Jumlah'}: ${formatNumber(ctx.raw)} Unit`
        }
      }
    },
    scales: {
      x: {
        grid: { color: theme.gridColor },
        ticks: { color: theme.textColor, font: { family: 'Plus Jakarta Sans', size: 10 } }
      },
      y: {
        beginAtZero: true,
        grid: { color: theme.gridColor },
        ticks: {
          color: theme.textColor,
          font: { family: 'Plus Jakarta Sans', size: 10 },
          callback: (v) => formatNumber(v)
        }
      }
    }
  };

  return (
    <div className="flex flex-col gap-5 md:gap-6 animate-fade-in text-xs">
      {/* 1. Wilayah Banner */}
      <div className="p-4 bg-surface-light dark:bg-surface-dark border border-surface-light-border dark:border-surface-dark-border rounded-16px shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-10px bg-pln-cyan/15 border border-pln-cyan/30 flex items-center justify-center text-pln-cyan flex-shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Pusat Intelijen Wilayah & Analisis Spasial (BI Hub)
            </h3>
            <p className="text-slate-500 dark:text-slate-400">
              Analisis komparatif kinerja {ulpAnalytics.length} Unit Pelayanan (ULP), persebaran kecamatan, migrasi merk meter, dan tren YoY
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-xs">
            {ulpAnalytics.length} Unit ULP Terdata
          </span>
          <span className="px-3 py-1 rounded-full bg-pln-cyan/15 border border-pln-cyan/30 text-pln-cyan font-bold text-xs">
            {spatialAnalytics?.topKecamatan?.length || 0} Kecamatan Aktif
          </span>
        </div>
      </div>

      {/* 2. Full Width ULP Stacked Comparison Chart */}
      <Card className="flex flex-col min-h-[380px]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-surface-light-border dark:border-surface-dark-border mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-pln-cyan" />
              Komparasi Volume & Komposisi Penggantian per Unit Kerja (ULP)
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Perbandingan kontribusi peremajaan Prabayar (LPB) vs Pascabayar antar unit kerja
            </p>
          </div>

          <button
            onClick={() => downloadChartImage(ulpBarRef, 'Komparasi_ULP_PLN.png')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-6px border border-surface-light-border dark:border-surface-dark-border text-slate-400 hover:text-pln-cyan hover:bg-base-light dark:hover:bg-base-dark transition-colors font-semibold"
            title="Unduh grafik sebagai gambar PNG"
          >
            <Download className="w-3.5 h-3.5" /> Unduh PNG
          </button>
        </div>

        <div className="relative flex-1 w-full min-h-[280px]">
          <Bar
            ref={ulpBarRef}
            data={ulpChartData}
            options={{
              ...baseChartOptions,
              scales: {
                x: {
                  stacked: true,
                  grid: { color: theme.gridColor },
                  ticks: { color: theme.textColor, font: { family: 'Plus Jakarta Sans', size: 10 } }
                },
                y: {
                  stacked: true,
                  beginAtZero: true,
                  grid: { color: theme.gridColor },
                  ticks: {
                    color: theme.textColor,
                    font: { family: 'Plus Jakarta Sans', size: 10 },
                    callback: (v) => formatNumber(v)
                  }
                }
              },
              plugins: {
                ...baseChartOptions.plugins,
                legend: {
                  position: 'top',
                  labels: {
                    color: theme.textColor,
                    font: { family: 'Plus Jakarta Sans', size: 10, weight: '600' }
                  }
                }
              }
            }}
          />
        </div>
      </Card>

      {/* 3. Two Columns: Year-over-Year (YoY) Velocity & Sebaran Kecamatan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
        {/* YoY Velocity Comparison Chart */}
        <Card className="flex flex-col min-h-[360px]">
          <div className="flex items-center justify-between pb-3 border-b border-surface-light-border dark:border-surface-dark-border mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <CalendarRange className="w-4 h-4 text-pln-cyan" />
                Komparasi Laju Pertumbuhan Tahunan (YoY: 2024 vs 2025 vs 2026)
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Pola kecepatan penggantian meter bulanan antar tahun
              </p>
            </div>
            <button
              onClick={() => downloadChartImage(yoyChartRef, 'YoY_Growth_PLN.png')}
              className="p-1.5 rounded-6px border border-surface-light-border dark:border-surface-dark-border text-slate-400 hover:text-pln-cyan hover:bg-base-light dark:hover:bg-base-dark transition-colors"
              title="Unduh PNG"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="relative flex-1 w-full min-h-[250px]">
            <Line
              ref={yoyChartRef}
              data={yoyChartData}
              options={{
                ...baseChartOptions,
                plugins: {
                  ...baseChartOptions.plugins,
                  legend: {
                    position: 'top',
                    labels: {
                      color: theme.textColor,
                      font: { family: 'Plus Jakarta Sans', size: 10, weight: '600' }
                    }
                  }
                }
              }}
            />
          </div>
        </Card>

        {/* Spatial Breakdown: Top Kecamatan */}
        <Card className="flex flex-col min-h-[360px]">
          <div className="flex items-center justify-between pb-3 border-b border-surface-light-border dark:border-surface-dark-border mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-pln-cyan" />
                Top 8 Kecamatan dengan Peremajaan Tertinggi
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Sebaran geografis penggantian meter per kecamatan (Kolom L)
              </p>
            </div>
            <button
              onClick={() => downloadChartImage(kecChartRef, 'Sebaran_Kecamatan_PLN.png')}
              className="p-1.5 rounded-6px border border-surface-light-border dark:border-surface-dark-border text-slate-400 hover:text-pln-cyan hover:bg-base-light dark:hover:bg-base-dark transition-colors"
              title="Unduh PNG"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="relative flex-1 w-full min-h-[250px]">
            <Bar
              ref={kecChartRef}
              data={kecamatanChartData}
              options={{
                ...baseChartOptions,
                indexAxis: 'y',
                plugins: {
                  ...baseChartOptions.plugins,
                  legend: { display: false }
                }
              }}
            />
          </div>
        </Card>
      </div>

      {/* 4. Matriks Migrasi Merk Meter (Bongkar -> Pasang) */}
      {brandMigrationAnalytics && (
        <Card className="flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-surface-light-border dark:border-surface-dark-border">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <GitCompare className="w-4 h-4 text-pln-cyan" />
                Matriks Peralihan Teknologi & Merk Meter (Bongkar &rarr; Pasang)
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Pola peralihan merk meter lama (mekanik/elektronik) ke merk meter modern
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Top 5 Merk Lama */}
            <div className="p-4 bg-base-light dark:bg-base-dark rounded-12px border border-surface-light-border dark:border-surface-dark-border flex flex-col gap-3">
              <span className="font-bold text-amber-500 text-xs uppercase tracking-wider flex items-center gap-1.5">
                Top Merk Lama (Dibongkar)
              </span>
              <div className="space-y-2">
                {brandMigrationAnalytics.topOld.map(([brand, count], idx) => (
                  <div key={brand} className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {idx + 1}. {brand}
                    </span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {formatNumber(count)} unit
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top 5 Merk Baru */}
            <div className="p-4 bg-base-light dark:bg-base-dark rounded-12px border border-surface-light-border dark:border-surface-dark-border flex flex-col gap-3">
              <span className="font-bold text-emerald-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
                Top Merk Baru (Dipasang)
              </span>
              <div className="space-y-2">
                {brandMigrationAnalytics.topNew.map(([brand, count], idx) => (
                  <div key={brand} className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {idx + 1}. {brand}
                    </span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {formatNumber(count)} unit
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Alur Migrasi */}
            <div className="p-4 bg-pln-cyan/10 rounded-12px border border-pln-cyan/30 flex flex-col gap-3">
              <span className="font-bold text-pln-cyan text-xs uppercase tracking-wider">
                Alur Migrasi Paling Dominan
              </span>
              <div className="space-y-2">
                {brandMigrationAnalytics.topFlows.map((flow, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 truncate max-w-[170px]">
                      <span className="text-slate-400 truncate">{flow.from}</span>
                      <ArrowRight className="w-3 h-3 text-pln-cyan flex-shrink-0" />
                      <span className="text-pln-cyan-light font-bold truncate">{flow.to}</span>
                    </div>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {formatNumber(flow.count)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* 5. Segmentasi Golongan Tarif & Daya */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
        {/* Daya Bar Chart */}
        <Card className="flex flex-col min-h-[340px]">
          <div className="pb-3 border-b border-surface-light-border dark:border-surface-dark-border mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Zap className="w-4 h-4 text-pln-cyan" />
              Distribusi Golongan Daya Pelanggan
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Segmentasi kapasitas daya meter (450 VA s/d &gt; 2.200 VA)
            </p>
          </div>
          <div className="relative flex-1 w-full min-h-[240px]">
            <Bar
              data={dayaChartData}
              options={{
                ...baseChartOptions,
                plugins: {
                  ...baseChartOptions.plugins,
                  legend: { display: false }
                }
              }}
            />
          </div>
        </Card>

        {/* Tarif Bar Chart */}
        <Card className="flex flex-col min-h-[340px]">
          <div className="pb-3 border-b border-surface-light-border dark:border-surface-dark-border mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-pln-cyan" />
              Top Golongan Tarif Pelanggan
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Frekuensi peremajaan berdasarkan kelompok tarif (R1, R1T, B1, S2, dll.)
            </p>
          </div>
          <div className="relative flex-1 w-full min-h-[240px]">
            <Bar
              data={tarifChartData}
              options={{
                ...baseChartOptions,
                plugins: {
                  ...baseChartOptions.plugins,
                  legend: { display: false }
                }
              }}
            />
          </div>
        </Card>
      </div>

      {/* 6. Granular Time Series Trend */}
      <Card className="flex flex-col min-h-[340px]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-surface-light-border dark:border-surface-dark-border mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-pln-cyan" />
              Dinamika Tren Peremajaan Harian / Bulanan
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Evaluasi fluktuasi pekerjaan penggantian meter di lapangan
            </p>
          </div>

          <div className="flex p-0.5 bg-base-light dark:bg-base-dark border border-surface-light-border dark:border-surface-dark-border rounded-6px">
            <button
              onClick={() => setGranularity('daily')}
              className={`px-3 py-1 text-xs font-semibold rounded-4px transition-all ${
                granularity === 'daily'
                  ? 'bg-pln-cyan text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Harian
            </button>
            <button
              onClick={() => setGranularity('monthly')}
              className={`px-3 py-1 text-xs font-semibold rounded-4px transition-all ${
                granularity === 'monthly'
                  ? 'bg-pln-cyan text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Bulanan
            </button>
          </div>
        </div>

        <div className="relative flex-1 w-full min-h-[240px]">
          <Line
            data={trendChartData}
            options={{
              ...baseChartOptions,
              plugins: { ...baseChartOptions.plugins, legend: { display: false } }
            }}
          />
        </div>
      </Card>
    </div>
  );
}
