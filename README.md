# ⚡ PLN kWh Meter Replacement Dashboard (Ganti Meter Salatiga)

Aplikasi Web Dashboard Monitoring dan Analitik Penggantian kWh Meter PLN yang modern, cepat, interaktif, dan minimalis. Dibangun menggunakan **React**, **Tailwind CSS**, **Lucide Icons**, dan **Chart.js**, terhubung langsung secara realtime dengan **Google Spreadsheet Database via Google Apps Script Web App API**.

---

## 🎨 Design System
* **60 : 30 : 10 Color Rule**:
  - **60% Dominan (Base)**: Slate Dark Navy (`#070F1E`, `#0B1728`) / Soft Slate Light (`#F8FAFC`).
  - **30% Sekunder (Structure & Cards)**: Surface Card Panels (`#102238`, `#162B45`, border `#1E3A5F`).
  - **10% Aksen (Brand Identity)**: *PLN Electric Cyan* (`#00A2B9` & `#00C2CB`) dan *PLN Petir Yellow* (`#FFC107`).
* **4px Grid Rule**: Seluruh dimensi padding, margin, gap, radii, dan typography konsisten mengikuti kelipatan 4px.

---

## 🚀 Fitur Utama

1. **4 Filter Analitik**:
   - **Unit ULP (Kolom D)**: Filter unit pelayanan kerja.
   - **Tanggal Remaja (Kolom AA)**: Date range calendar selector + preset instan (*Semua*, *2024*, *2025*, *2026*, *30 Hari Terakhir*).
   - **Alasan Ganti Meter (Kolom AF)**: Filter kategori penyebab penggantian meter.
   - **Jenis kWh Meter (Kolom BA)**: Segmented toggle (*Semua*, *Prabayar*, *Paskabayar*, *AMR/AMI*).

2. **Executive KPI Cards**:
   - Total Unit Penggantian (Realtime counter & persentase).
   - Meter Prabayar (LPB) & Rasio Bar.
   - Meter Paskabayar & Rasio Bar.
   - Alasan Penggantian Terbanyak.

3. **Visual Analytics (Chart.js)**:
   - **Tren Penggantian per Tanggal Remaja**: Interactive Area/Line Chart dengan toggle agregasi *Bulanan* & *Harian*.
   - **Distribusi Alasan Penggantian**: Doughnut Chart proporsi alasan ganti meter dengan tooltip berdaya kontras tinggi.

4. **Interactive Data Grid**:
   - Pencarian instan (IDPEL, Nama, Nomor Meter, Petugas, Alasan, Tarif).
   - Sorting kolom multi-arah dan pagination responsif.
   - Pop-up modal rincian detail data pelanggan.
   - **Ekspor CSV**: Mengunduh data terfilter dengan encoding UTF-8 BOM yang langsung rapi di Microsoft Excel.

5. **Integrasi Google Spreadsheet & Google Apps Script**:
   - **1-Click Direct Sync**: Tombol sinkronisasi realtime tanpa popup yang langsung menarik data dari Google Spreadsheet.
   - **Upload Excel (.xlsx, .xls, .csv)**: Fitur unggah file Excel dengan auto-mapping 67 kolom resmi PLN, generator template Excel resmi, dan opsi *Append (Tambah)* vs *Overwrite (Timpa)* langsung ke Google Spreadsheet.

---

## 🛠️ Instalasi & Menjalankan Lokal

```bash
# 1. Clone repository
git clone https://github.com/salkot25/ganmet_slg.git
cd ganmet_slg

# 2. Install dependencies
npm install

# 3. Jalankan server development
npm run dev

# 4. Build production
npm run build
```

---

## 📝 Setup Backend Google Apps Script

1. Buka Google Spreadsheet target.
2. Masuk ke menu **Extensions > Apps Script**.
3. Salin kode dari file `google_apps_script/Code.gs` ke editor Apps Script.
4. Klik **Deploy > New deployment > Web app**:
   - **Execute as**: `Me`
   - **Who has access**: `Anyone`
5. Salin Web app URL dan masukkan ke konfigurasi `src/constants/appConfig.js`.

---

© 2026 PT PLN (Persero) - Ganti Meter Salatiga.
