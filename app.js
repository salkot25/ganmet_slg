/**
 * PLN KWH METER REPLACEMENT DASHBOARD
 * Core Application Engine & Data Controller
 */

// Application State
const state = {
  rawData: [],
  filteredData: [],
  filters: {
    unitup: 'ALL',
    dateStart: null,
    dateEnd: null,
    alasan: 'ALL',
    layanan: 'ALL' // ALL, PRABAYAR, PASKABAYAR, AMR_AMI
  },
  table: {
    searchTerm: '',
    sortColumn: 'TGLREMAJA',
    sortDirection: 'desc',
    currentPage: 1,
    pageSize: 25
  },
  charts: {
    trendGranularity: 'monthly', // 'monthly' | 'daily'
    instances: {}
  }
};

// Date helper: parse DD/MM/YYYY to Date object
function parseDMY(dateStr) {
  if (!dateStr) return null;
  const parts = dateStr.trim().split('/');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }
  return null;
}

// Format Date object to DD/MM/YYYY
function formatDMY(date) {
  if (!date) return '';
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

// Format Number with Thousands Separator
function formatNum(num) {
  return new Intl.NumberFormat('id-ID').format(num);
}

// Initialize Application
document.addEventListener('DOMContentLoaded', async () => {
  // Init Lucide Icons
  if (window.lucide) lucide.createIcons();

  // Setup Theme
  initTheme();

  // Setup Date Picker (Flatpickr)
  initDatePicker();

  // Load Data
  await loadInitialData();

  // Setup Event Listeners
  setupEventListeners();
});

// -------------------------------------------------------------
// THEME CONTROLLER
// -------------------------------------------------------------
function initTheme() {
  const savedTheme = localStorage.getItem('pln_theme') || 'dark';
  applyTheme(savedTheme);

  const btnToggle = document.getElementById('btn-theme-toggle');
  if (btnToggle) {
    btnToggle.addEventListener('click', () => {
      const isDark = document.body.classList.contains('dark-theme');
      applyTheme(isDark ? 'light' : 'dark');
    });
  }
}

function applyTheme(theme) {
  const themeIcon = document.getElementById('theme-icon');
  if (theme === 'light') {
    document.body.classList.remove('dark-theme');
    document.body.classList.add('light-theme');
    localStorage.setItem('pln_theme', 'light');
    if (themeIcon) themeIcon.setAttribute('data-lucide', 'moon');
  } else {
    document.body.classList.remove('light-theme');
    document.body.classList.add('dark-theme');
    localStorage.setItem('pln_theme', 'dark');
    if (themeIcon) themeIcon.setAttribute('data-lucide', 'sun');
  }
  if (window.lucide) lucide.createIcons();
  
  // Re-render charts for theme color adaptation
  if (state.filteredData.length > 0) {
    updateCharts();
  }
}

// -------------------------------------------------------------
// DATA INGESTION & PROCESSING
// -------------------------------------------------------------
async function loadInitialData() {
  try {
    let data = [];
    if (window.DATA_KWH && Array.isArray(window.DATA_KWH)) {
      data = window.DATA_KWH;
    } else {
      // Fallback: fetch JSON
      const res = await fetch('data_kwh.json');
      if (res.ok) {
        data = await res.json();
      }
    }

    if (data.length > 0) {
      processDataset(data);
    } else {
      document.getElementById('data-status-text').textContent = 'Data belum dimuat';
    }
  } catch (err) {
    console.error('Error loading dataset:', err);
    document.getElementById('data-status-text').textContent = 'Gagal memuat data';
  }
}

function processDataset(data) {
  // Augment records with parsed Date objects for ultra-fast filtering
  state.rawData = data.map((item, idx) => {
    return {
      ...item,
      _id: idx + 1,
      _parsedDate: parseDMY(item.TGLREMAJA)
    };
  });

  document.getElementById('data-status-text').textContent = `${formatNum(state.rawData.length)} Data Dimuat`;

  // Populate Filter Dropdowns
  populateFilterOptions();

  // Apply default filter & render
  applyFilters();
}

function populateFilterOptions() {
  // UNITUP Dropdown
  const unitupSelect = document.getElementById('filter-unitup');
  const unitupSet = new Set(state.rawData.map(d => String(d.UNITUP || '').trim()).filter(Boolean));
  unitupSelect.innerHTML = '<option value="ALL">Semua UNITUP</option>';
  [...unitupSet].sort().forEach(unit => {
    const opt = document.createElement('option');
    opt.value = unit;
    opt.textContent = `UNITUP ${unit}`;
    unitupSelect.appendChild(opt);
  });

  // Alasan Ganti Meter Dropdown
  const alasanSelect = document.getElementById('filter-alasan');
  const alasanCounts = {};
  state.rawData.forEach(d => {
    const al = (d.ALASAN_GANTI_METER || 'Lainnya').trim();
    if (al) alasanCounts[al] = (alasanCounts[al] || 0) + 1;
  });

  alasanSelect.innerHTML = '<option value="ALL">Semua Alasan Penggantian</option>';
  Object.keys(alasanCounts)
    .sort((a, b) => alasanCounts[b] - alasanCounts[a])
    .forEach(alasan => {
      const opt = document.createElement('option');
      opt.value = alasan;
      opt.textContent = `${alasan} (${formatNum(alasanCounts[alasan])})`;
      alasanSelect.appendChild(opt);
    });
}

// -------------------------------------------------------------
// FILTER ENGINE
// -------------------------------------------------------------
function applyFilters() {
  const { unitup, dateStart, dateEnd, alasan, layanan } = state.filters;

  state.filteredData = state.rawData.filter(item => {
    // 1. UNITUP Filter
    if (unitup !== 'ALL' && String(item.UNITUP || '').trim() !== unitup) {
      return false;
    }

    // 2. Tanggal Remaja Date Filter
    if (item._parsedDate) {
      if (dateStart && item._parsedDate < dateStart) return false;
      if (dateEnd && item._parsedDate > dateEnd) return false;
    }

    // 3. Alasan Ganti Meter Filter
    if (alasan !== 'ALL' && (item.ALASAN_GANTI_METER || '').trim() !== alasan) {
      return false;
    }

    // 4. KDPEMBMETER Filter (Layanan)
    if (layanan !== 'ALL') {
      const kd = (item.KDPEMBMETER || '').toUpperCase();
      if (layanan === 'PRABAYAR' && !kd.startsWith('P')) return false;
      if (layanan === 'PASKABAYAR' && (!kd.startsWith('M') && !kd.startsWith('E'))) return false;
      if (layanan === 'AMR_AMI' && (!kd.startsWith('A') && !kd.startsWith('R'))) return false;
    }

    return true;
  });

  // Reset pagination to page 1
  state.table.currentPage = 1;

  // Refresh All Dashboard Views
  updateKPICards();
  updateCharts();
  renderTable();
}

// -------------------------------------------------------------
// KPI CARDS UPDATE
// -------------------------------------------------------------
function updateKPICards() {
  const total = state.filteredData.length;
  const rawTotal = state.rawData.length || 1;

  let prabayarCount = 0;
  let paskaCount = 0;
  const reasonCountMap = {};

  state.filteredData.forEach(item => {
    const kd = (item.KDPEMBMETER || '').toUpperCase();
    if (kd.startsWith('P')) {
      prabayarCount++;
    } else if (kd.startsWith('M') || kd.startsWith('E')) {
      paskaCount++;
    }

    const alasan = (item.ALASAN_GANTI_METER || 'Lainnya').trim();
    if (alasan) {
      reasonCountMap[alasan] = (reasonCountMap[alasan] || 0) + 1;
    }
  });

  const prabayarPct = total > 0 ? ((prabayarCount / total) * 100).toFixed(1) : 0;
  const paskaPct = total > 0 ? ((paskaCount / total) * 100).toFixed(1) : 0;
  const totalPct = ((total / rawTotal) * 100).toFixed(1);

  // Find Top Reason
  let topReasonName = '-';
  let topReasonCount = 0;
  Object.entries(reasonCountMap).forEach(([reason, count]) => {
    if (count > topReasonCount) {
      topReasonCount = count;
      topReasonName = reason;
    }
  });

  // Animate / Set Values
  document.getElementById('kpi-total-meter').textContent = formatNum(total);
  document.getElementById('kpi-total-percent').textContent = `${totalPct}% dari total basis data`;

  document.getElementById('kpi-prabayar-count').textContent = formatNum(prabayarCount);
  document.getElementById('kpi-prabayar-bar').style.width = `${prabayarPct}%`;
  document.getElementById('kpi-prabayar-ratio').textContent = `${prabayarPct}% Rasio Prabayar`;

  document.getElementById('kpi-paska-count').textContent = formatNum(paskaCount);
  document.getElementById('kpi-paska-bar').style.width = `${paskaPct}%`;
  document.getElementById('kpi-paska-ratio').textContent = `${paskaPct}% Rasio Paskabayar`;

  document.getElementById('kpi-top-alasan-name').textContent = topReasonName;
  document.getElementById('kpi-top-alasan-name').title = topReasonName;
  document.getElementById('kpi-top-alasan-count').textContent = `${formatNum(topReasonCount)} unit (${total > 0 ? ((topReasonCount / total) * 100).toFixed(1) : 0}%)`;
}

// -------------------------------------------------------------
// VISUAL CHARTS (Chart.js)
// -------------------------------------------------------------
function getChartThemeColors() {
  const isDark = document.body.classList.contains('dark-theme');
  return {
    textColor: isDark ? '#94A3B8' : '#475569',
    gridColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)',
    cyanPrimary: '#00A2B9',
    cyanLight: '#00C2CB',
    cyanBg: isDark ? 'rgba(0, 162, 185, 0.25)' : 'rgba(0, 162, 185, 0.15)',
    yellowPrimary: '#FFC107',
    orangePrimary: '#F59E0B',
    greenPrimary: '#10B981',
    bluePrimary: '#3B82F6',
    purplePrimary: '#8B5CF6'
  };
}

function updateCharts() {
  renderTrendChart();
  renderReasonChart();
  renderBrandChart();
  renderTariffChart();
}

// 1. Trend Chart (Per Tanggal Remaja)
function renderTrendChart() {
  const ctx = document.getElementById('trendChart')?.getContext('2d');
  if (!ctx) return;

  const colors = getChartThemeColors();
  const granularity = state.charts.trendGranularity;
  const timeBuckets = {};

  state.filteredData.forEach(d => {
    if (!d._parsedDate) return;
    let key;
    if (granularity === 'monthly') {
      const yr = d._parsedDate.getFullYear();
      const mo = String(d._parsedDate.getMonth() + 1).padStart(2, '0');
      key = `${yr}-${mo}`;
    } else {
      const yr = d._parsedDate.getFullYear();
      const mo = String(d._parsedDate.getMonth() + 1).padStart(2, '0');
      const dy = String(d._parsedDate.getDate()).padStart(2, '0');
      key = `${yr}-${mo}-${dy}`;
    }
    timeBuckets[key] = (timeBuckets[key] || 0) + 1;
  });

  const sortedKeys = Object.keys(timeBuckets).sort();
  const labels = sortedKeys.map(k => {
    if (granularity === 'monthly') {
      const [y, m] = k.split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      return `${monthNames[parseInt(m, 10) - 1]} ${y}`;
    }
    const [y, m, d] = k.split('-');
    return `${d}/${m}/${y}`;
  });
  const dataVals = sortedKeys.map(k => timeBuckets[k]);

  if (state.charts.instances.trend) {
    state.charts.instances.trend.destroy();
  }

  // Create gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, 300);
  gradient.addColorStop(0, colors.cyanBg);
  gradient.addColorStop(1, 'rgba(0, 162, 185, 0)');

  state.charts.instances.trend = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Jumlah Pergantian Meter',
        data: dataVals,
        borderColor: colors.cyanPrimary,
        backgroundColor: gradient,
        borderWidth: 2.5,
        fill: true,
        tension: 0.35,
        pointBackgroundColor: colors.cyanLight,
        pointBorderColor: '#FFFFFF',
        pointHoverRadius: 6,
        pointRadius: granularity === 'daily' ? 1.5 : 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(13, 27, 42, 0.95)',
          titleColor: '#F8FAFC',
          bodyColor: '#00C2CB',
          borderColor: 'rgba(0, 162, 185, 0.3)',
          borderWidth: 1,
          padding: 10,
          displayColors: false,
          callbacks: {
            label: (ctx) => `${formatNum(ctx.raw)} Unit Diganti`
          }
        }
      },
      scales: {
        x: {
          grid: { color: colors.gridColor },
          ticks: { color: colors.textColor, font: { family: 'Plus Jakarta Sans', size: 11 } }
        },
        y: {
          beginAtZero: true,
          grid: { color: colors.gridColor },
          ticks: { color: colors.textColor, font: { family: 'Plus Jakarta Sans', size: 11 }, callback: v => formatNum(v) }
        }
      }
    }
  });
}

// 2. Reason Doughnut Chart
function renderReasonChart() {
  const ctx = document.getElementById('reasonChart')?.getContext('2d');
  if (!ctx) return;

  const colors = getChartThemeColors();
  const counts = {};
  state.filteredData.forEach(d => {
    const al = (d.ALASAN_GANTI_METER || 'Lainnya').trim();
    counts[al] = (counts[al] || 0) + 1;
  });

  const sortedReasons = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const topReasons = sortedReasons.slice(0, 5);
  const otherCount = sortedReasons.slice(5).reduce((acc, curr) => acc + curr[1], 0);

  const labels = topReasons.map(r => r[0]);
  const values = topReasons.map(r => r[1]);
  if (otherCount > 0) {
    labels.push('Lainnya');
    values.push(otherCount);
  }

  if (state.charts.instances.reason) {
    state.charts.instances.reason.destroy();
  }

  const palette = [
    '#00A2B9', // Cyan PLN
    '#00C2CB', // Cyan Light
    '#FFC107', // PLN Yellow
    '#F59E0B', // Orange
    '#3B82F6', // Blue
    '#64748B'  // Muted Gray
  ];

  state.charts.instances.reason = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: values,
        backgroundColor: palette.slice(0, labels.length),
        borderWidth: 2,
        borderColor: document.body.classList.contains('dark-theme') ? '#102238' : '#FFFFFF'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '68%',
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: colors.textColor,
            font: { family: 'Plus Jakarta Sans', size: 11, weight: '500' },
            boxWidth: 12,
            padding: 8
          }
        },
        tooltip: {
          backgroundColor: 'rgba(13, 27, 42, 0.95)',
          borderColor: 'rgba(0, 162, 185, 0.3)',
          borderWidth: 1,
          callbacks: {
            label: (ctx) => {
              const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
              const val = ctx.raw;
              const pct = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
              return ` ${formatNum(val)} unit (${pct}%)`;
            }
          }
        }
      }
    }
  });
}

// 3. Brand Comparison Chart (Old vs New)
function renderBrandChart() {
  const ctx = document.getElementById('brandChart')?.getContext('2d');
  if (!ctx) return;

  const colors = getChartThemeColors();
  const oldBrands = {};
  const newBrands = {};

  state.filteredData.forEach(d => {
    const oldB = (d.MERK_METER_LAMA || 'TIDAK TERDEFINISI').trim().toUpperCase();
    const newB = (d.MERK_METER_BARU || 'TIDAK TERDEFINISI').trim().toUpperCase();
    oldBrands[oldB] = (oldBrands[oldB] || 0) + 1;
    newBrands[newB] = (newBrands[newB] || 0) + 1;
  });

  // Get Top 5 Brands from both
  const topOld = Object.entries(oldBrands).sort((a, b) => b[1] - a[1]).slice(0, 4);
  const topNew = Object.entries(newBrands).sort((a, b) => b[1] - a[1]).slice(0, 4);

  const unionBrands = Array.from(new Set([...topOld.map(b => b[0]), ...topNew.map(b => b[0])])).slice(0, 5);

  const dataOld = unionBrands.map(b => oldBrands[b] || 0);
  const dataNew = unionBrands.map(b => newBrands[b] || 0);

  if (state.charts.instances.brand) {
    state.charts.instances.brand.destroy();
  }

  state.charts.instances.brand = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: unionBrands,
      datasets: [
        {
          label: 'Meter Lama (Bongkar)',
          data: dataOld,
          backgroundColor: 'rgba(245, 158, 11, 0.75)',
          borderColor: '#F59E0B',
          borderWidth: 1,
          borderRadius: 4
        },
        {
          label: 'Meter Baru (Pasang)',
          data: dataNew,
          backgroundColor: 'rgba(0, 162, 185, 0.8)',
          borderColor: '#00A2B9',
          borderWidth: 1,
          borderRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: { color: colors.textColor, font: { family: 'Plus Jakarta Sans', size: 10 } }
        },
        tooltip: {
          backgroundColor: 'rgba(13, 27, 42, 0.95)',
          borderColor: 'rgba(0, 162, 185, 0.3)',
          borderWidth: 1
        }
      },
      scales: {
        x: {
          grid: { color: colors.gridColor },
          ticks: { color: colors.textColor, font: { family: 'Plus Jakarta Sans', size: 10 } }
        },
        y: {
          beginAtZero: true,
          grid: { color: colors.gridColor },
          ticks: { color: colors.textColor, font: { family: 'Plus Jakarta Sans', size: 10 }, callback: v => formatNum(v) }
        }
      }
    }
  });
}

// 4. Tariff Breakdown Chart
function renderTariffChart() {
  const ctx = document.getElementById('tariffChart')?.getContext('2d');
  if (!ctx) return;

  const colors = getChartThemeColors();
  const tariffCounts = {};

  state.filteredData.forEach(d => {
    const t = (d.TARIF || 'LAINNYA').trim().toUpperCase();
    tariffCounts[t] = (tariffCounts[t] || 0) + 1;
  });

  const sortedTariffs = Object.entries(tariffCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const labels = sortedTariffs.map(t => t[0]);
  const values = sortedTariffs.map(t => t[1]);

  if (state.charts.instances.tariff) {
    state.charts.instances.tariff.destroy();
  }

  state.charts.instances.tariff = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Jumlah Pelanggan',
        data: values,
        backgroundColor: 'rgba(0, 194, 203, 0.75)',
        borderColor: '#00C2CB',
        borderWidth: 1,
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(13, 27, 42, 0.95)',
          borderColor: 'rgba(0, 162, 185, 0.3)',
          borderWidth: 1,
          callbacks: {
            label: (ctx) => `${formatNum(ctx.raw)} Pelanggan`
          }
        }
      },
      scales: {
        x: {
          grid: { color: colors.gridColor },
          ticks: { color: colors.textColor, font: { family: 'Plus Jakarta Sans', size: 11 } }
        },
        y: {
          beginAtZero: true,
          grid: { color: colors.gridColor },
          ticks: { color: colors.textColor, font: { family: 'Plus Jakarta Sans', size: 11 }, callback: v => formatNum(v) }
        }
      }
    }
  });
}

// -------------------------------------------------------------
// TABLE & PAGINATION ENGINE
// -------------------------------------------------------------
function getProcessedTableData() {
  let list = [...state.filteredData];

  // Search
  const query = state.table.searchTerm.toLowerCase().trim();
  if (query) {
    list = list.filter(item => {
      return (
        String(item.IDPEL || '').toLowerCase().includes(query) ||
        String(item.NAMA || '').toLowerCase().includes(query) ||
        String(item.NO_METER_LAMA || '').toLowerCase().includes(query) ||
        String(item.NO_METER_BARU || '').toLowerCase().includes(query) ||
        String(item.TARIF || '').toLowerCase().includes(query) ||
        String(item.ALASAN_GANTI_METER || '').toLowerCase().includes(query) ||
        String(item.PETUGASREMAJA || '').toLowerCase().includes(query)
      );
    });
  }

  // Sorting
  const { sortColumn, sortDirection } = state.table;
  list.sort((a, b) => {
    let valA = a[sortColumn] || '';
    let valB = b[sortColumn] || '';

    if (sortColumn === 'TGLREMAJA') {
      const dateA = a._parsedDate || new Date(0);
      const dateB = b._parsedDate || new Date(0);
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    }

    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortDirection === 'asc' ? valA - valB : valB - valA;
    }

    valA = String(valA).toLowerCase();
    valB = String(valB).toLowerCase();
    if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  return list;
}

function renderTable() {
  const tableBody = document.getElementById('table-body');
  const tableCountBadge = document.getElementById('table-filtered-count');
  if (!tableBody) return;

  const dataset = getProcessedTableData();
  const total = dataset.length;
  tableCountBadge.textContent = `Menampilkan ${formatNum(total)} data`;

  // Pagination bounds
  const { currentPage, pageSize } = state.table;
  const totalPages = Math.ceil(total / pageSize) || 1;
  const safePage = Math.min(Math.max(currentPage, 1), totalPages);
  state.table.currentPage = safePage;

  const startIdx = (safePage - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, total);
  const pageData = dataset.slice(startIdx, endIdx);

  // Update Page Indicator
  document.getElementById('page-indicator').textContent = `Halaman ${safePage} dari ${totalPages}`;
  document.getElementById('btn-first-page').disabled = safePage <= 1;
  document.getElementById('btn-prev-page').disabled = safePage <= 1;
  document.getElementById('btn-next-page').disabled = safePage >= totalPages;
  document.getElementById('btn-last-page').disabled = safePage >= totalPages;

  if (pageData.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="10" style="text-align:center; padding: 32px; color: var(--text-muted);">
          Tidak ada data penggantian kWh meter yang cocok dengan filter.
        </td>
      </tr>
    `;
    return;
  }

  let html = '';
  pageData.forEach((row, i) => {
    const rowNum = startIdx + i + 1;
    const kd = (row.KDPEMBMETER || '').toUpperCase();
    let badgeClass = 'badge-prabayar';
    let badgeText = 'Prabayar';

    if (kd.startsWith('M')) {
      badgeClass = 'badge-paskabayar';
      badgeText = 'Paska (Mekanik)';
    } else if (kd.startsWith('E')) {
      badgeClass = 'badge-paskabayar';
      badgeText = 'Paska (Elektrik)';
    } else if (kd.startsWith('A') || kd.startsWith('R')) {
      badgeClass = 'badge-amr';
      badgeText = 'AMR / AMI';
    }

    const dayaFormatted = row.DAYA ? `${formatNum(row.DAYA)} VA` : '';
    const tarifDaya = `${row.TARIF || '-'} / ${dayaFormatted}`;

    html += `
      <tr>
        <td>${rowNum}</td>
        <td><strong>${row.UNITUP || '-'}</strong></td>
        <td>${row.TGLREMAJA || '-'}</td>
        <td><code>${row.IDPEL || '-'}</code></td>
        <td><strong>${row.NAMA || '-'}</strong></td>
        <td>${tarifDaya}</td>
        <td><span title="${row.ALASAN_GANTI_METER || '-'}">${row.ALASAN_GANTI_METER || '-'}</span></td>
        <td><span class="badge ${badgeClass}">${badgeText}</span></td>
        <td>
          <div class="meter-flow">
            <span class="meter-old">${row.MERK_METER_LAMA || '-'}</span>
            <span class="meter-arrow">&rarr;</span>
            <span class="meter-new">${row.MERK_METER_BARU || '-'}</span>
          </div>
        </td>
        <td>
          <button class="btn-detail" onclick="openDetailModal(${row._id})">
            Detail
          </button>
        </td>
      </tr>
    `;
  });

  tableBody.innerHTML = html;
}

// -------------------------------------------------------------
// MODALS (Detail & Sync)
// -------------------------------------------------------------
window.openDetailModal = function(id) {
  const item = state.rawData.find(d => d._id === id);
  if (!item) return;

  const modalContent = document.getElementById('modal-content');
  modalContent.innerHTML = `
    <div class="detail-grid">
      <div class="detail-item">
        <span class="detail-label">ID Pelanggan (IDPEL)</span>
        <span class="detail-value">${item.IDPEL || '-'}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Nomor Agenda</span>
        <span class="detail-value">${item.NOAGENDA || '-'}</span>
      </div>
      <div class="detail-item full-width">
        <span class="detail-label">Nama Pelanggan</span>
        <span class="detail-value" style="font-size: 1.05rem; color: var(--pln-cyan-400);">${item.NAMA || '-'}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Kode UNITUP (ULP)</span>
        <span class="detail-value">${item.UNITUP || '-'}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Tanggal Remaja</span>
        <span class="detail-value">${item.TGLREMAJA || '-'}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Tarif / Daya</span>
        <span class="detail-value">${item.TARIF || '-'} / ${item.DAYA ? formatNum(item.DAYA) + ' VA' : '-'}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Jenis Layanan Meter</span>
        <span class="detail-value">${item.KDPEMBMETER || '-'}</span>
      </div>
      <div class="detail-item full-width">
        <span class="detail-label">Alasan Penggantian Meter</span>
        <span class="detail-value" style="color: var(--pln-yellow);">${item.ALASAN_GANTI_METER || '-'}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">No & Merk Meter Lama</span>
        <span class="detail-value">${item.NO_METER_LAMA || '-'} (${item.MERK_METER_LAMA || '-'})</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">No & Merk Meter Baru</span>
        <span class="detail-value" style="color: var(--pln-cyan-400);">${item.NO_METER_BARU || '-'} (${item.MERK_METER_BARU || '-'})</span>
      </div>
      <div class="detail-item full-width">
        <span class="detail-label">Petugas Remaja</span>
        <span class="detail-value">${item.PETUGASREMAJA || '-'}</span>
      </div>
    </div>
  `;

  document.getElementById('detail-modal').classList.add('active');
};

function closeModals() {
  document.getElementById('detail-modal').classList.remove('active');
  document.getElementById('sync-modal').classList.remove('active');
}

// -------------------------------------------------------------
// DATE RANGE PICKER & PRESETS
// -------------------------------------------------------------
let flatpickrInstance = null;

function initDatePicker() {
  const dateInput = document.getElementById('filter-date-range');
  if (!dateInput) return;

  flatpickrInstance = flatpickr(dateInput, {
    mode: 'range',
    dateFormat: 'd/m/Y',
    onChange: (selectedDates) => {
      if (selectedDates.length === 2) {
        state.filters.dateStart = selectedDates[0];
        // Set dateEnd to end of day
        const end = new Date(selectedDates[1]);
        end.setHours(23, 59, 59, 999);
        state.filters.dateEnd = end;

        // Reset preset buttons active state
        document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
        applyFilters();
      }
    }
  });
}

function setDatePreset(preset) {
  document.querySelectorAll('.preset-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.preset === preset);
  });

  if (preset === 'all') {
    state.filters.dateStart = null;
    state.filters.dateEnd = null;
    if (flatpickrInstance) flatpickrInstance.clear();
  } else if (preset === '2024') {
    state.filters.dateStart = new Date(2024, 0, 1);
    state.filters.dateEnd = new Date(2024, 11, 31, 23, 59, 59);
    if (flatpickrInstance) flatpickrInstance.setDate([state.filters.dateStart, state.filters.dateEnd]);
  } else if (preset === '2025') {
    state.filters.dateStart = new Date(2025, 0, 1);
    state.filters.dateEnd = new Date(2025, 11, 31, 23, 59, 59);
    if (flatpickrInstance) flatpickrInstance.setDate([state.filters.dateStart, state.filters.dateEnd]);
  } else if (preset === '2026') {
    state.filters.dateStart = new Date(2026, 0, 1);
    state.filters.dateEnd = new Date(2026, 11, 31, 23, 59, 59);
    if (flatpickrInstance) flatpickrInstance.setDate([state.filters.dateStart, state.filters.dateEnd]);
  } else if (preset === 'last30') {
    const end = new Date(2026, 5, 29); // Latest date in dataset
    const start = new Date(end);
    start.setDate(start.getDate() - 30);
    state.filters.dateStart = start;
    state.filters.dateEnd = end;
    if (flatpickrInstance) flatpickrInstance.setDate([start, end]);
  }

  applyFilters();
}

// -------------------------------------------------------------
// EVENT LISTENERS SETUP
// -------------------------------------------------------------
function setupEventListeners() {
  // 1. UNITUP Filter Change
  document.getElementById('filter-unitup')?.addEventListener('change', (e) => {
    state.filters.unitup = e.target.value;
    applyFilters();
  });

  // 2. Alasan Ganti Meter Filter Change
  document.getElementById('filter-alasan')?.addEventListener('change', (e) => {
    state.filters.alasan = e.target.value;
    applyFilters();
  });

  // 3. Layanan Segmented Buttons
  document.getElementById('filter-layanan-group')?.addEventListener('click', (e) => {
    const btn = e.target.closest('.segment-btn');
    if (!btn) return;
    document.querySelectorAll('#filter-layanan-group .segment-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.filters.layanan = btn.dataset.value;
    applyFilters();
  });

  // 4. Date Presets
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      setDatePreset(btn.dataset.preset);
    });
  });

  // 5. Reset Filter Button
  document.getElementById('btn-reset-filter')?.addEventListener('click', () => {
    state.filters.unitup = 'ALL';
    state.filters.alasan = 'ALL';
    state.filters.layanan = 'ALL';
    state.filters.dateStart = null;
    state.filters.dateEnd = null;

    document.getElementById('filter-unitup').value = 'ALL';
    document.getElementById('filter-alasan').value = 'ALL';
    document.querySelectorAll('#filter-layanan-group .segment-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.value === 'ALL');
    });
    setDatePreset('all');
  });

  // 6. Granularity Toggle for Trend Chart
  document.querySelectorAll('.toggle-btn[data-granularity]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.toggle-btn[data-granularity]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.charts.trendGranularity = btn.dataset.granularity;
      renderTrendChart();
    });
  });

  // 7. Search Box
  const searchInput = document.getElementById('table-search');
  searchInput?.addEventListener('input', (e) => {
    state.table.searchTerm = e.target.value;
    state.table.currentPage = 1;
    renderTable();
  });

  document.getElementById('btn-clear-search')?.addEventListener('click', () => {
    if (searchInput) searchInput.value = '';
    state.table.searchTerm = '';
    state.table.currentPage = 1;
    renderTable();
  });

  // 8. Sorting Table Columns
  document.querySelectorAll('.pln-table th.sortable').forEach(th => {
    th.addEventListener('click', () => {
      const col = th.dataset.col;
      if (state.table.sortColumn === col) {
        state.table.sortDirection = state.table.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        state.table.sortColumn = col;
        state.table.sortDirection = 'asc';
      }
      renderTable();
    });
  });

  // 9. Pagination Controls
  document.getElementById('page-size-select')?.addEventListener('change', (e) => {
    state.table.pageSize = parseInt(e.target.value, 10);
    state.table.currentPage = 1;
    renderTable();
  });

  document.getElementById('btn-first-page')?.addEventListener('click', () => {
    state.table.currentPage = 1;
    renderTable();
  });

  document.getElementById('btn-prev-page')?.addEventListener('click', () => {
    state.table.currentPage--;
    renderTable();
  });

  document.getElementById('btn-next-page')?.addEventListener('click', () => {
    state.table.currentPage++;
    renderTable();
  });

  document.getElementById('btn-last-page')?.addEventListener('click', () => {
    const total = getProcessedTableData().length;
    state.table.currentPage = Math.ceil(total / state.table.pageSize);
    renderTable();
  });

  // 10. Export to CSV
  document.getElementById('btn-export-csv')?.addEventListener('click', exportFilteredDataToCSV);

  // 11. Modal Closers
  document.getElementById('btn-close-modal')?.addEventListener('click', closeModals);
  document.getElementById('btn-close-sync-modal')?.addEventListener('click', closeModals);
  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModals();
    });
  });

  // 12. Sync Modal Opener
  document.getElementById('btn-sync-data')?.addEventListener('click', () => {
    document.getElementById('sync-modal').classList.add('active');
  });

  // 13. File Input for New CSV
  document.getElementById('csv-file-input')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (window.Papa) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.data && results.data.length > 0) {
            processDataset(results.data);
            closeModals();
            alert(`Berhasil memuat ${formatNum(results.data.length)} data dari file baru!`);
          }
        }
      });
    }
  });

  // 14. Reload Default Data
  document.getElementById('btn-reload-default')?.addEventListener('click', async () => {
    await loadInitialData();
    closeModals();
  });
}

// -------------------------------------------------------------
// EXPORT FILTERED DATA TO CSV
// -------------------------------------------------------------
function exportFilteredDataToCSV() {
  const data = getProcessedTableData();
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
  link.setAttribute('download', `PLN_Penggantian_kWh_Meter_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
