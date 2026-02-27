# 🏫 Pembagi Jam Pelajaran SD/MI

Sistem pembagian otomatis jam pelajaran untuk Sekolah Dasar/Madrasah Ibtidaiyah berbasis Google Apps Script Web App.

![Dashboard Preview](https://img.shields.io/badge/Version-1.0.0-green)
![License](https://img.shields.io/badge/License-MIT-blue)

---

## ✨ Fitur Utama

### 📊 Dashboard
- Statistik real-time (Total Guru, Kelas, Mapel, Jam Terjadwal)
- Quick access untuk generate jadwal
- Informasi distribusi guru kelas dan guru mapel

### 👥 Manajemen Data Guru
- CRUD (Create, Read, Update, Delete) data guru
- Pilihan jenis guru: Guru Kelas / Guru Mapel
- Setting maksimal jam mengajar per minggu
- Status aktif/nonaktif

### 🏫 Manajemen Data Kelas
- CRUD data kelas (Kelas 1-6 dengan paralel A, B, dst)
- Setting jumlah jam per hari
- Penugasan guru kelas

### 📚 Struktur Mata Pelajaran
- Konfigurasi jam pelajaran per tingkat (1-3 dan 4-6)
- Kategori mapel (Guru Kelas / Guru Mapel)
- Pilihan warna untuk visualisasi jadwal

### 📅 Generate Jadwal Otomatis
- Algoritma anti-bentrok jadwal guru
- Distribusi jam sesuai konfigurasi
- Prioritas guru kelas sebelum guru mapel
- Randomisasi untuk variasi

### 📋 Tampilan Jadwal
- Grid view per kelas (Hari x Jam)
- Filter berdasarkan kelas
- Color-coded per mata pelajaran
- Export ke Excel/CSV
- Print-friendly layout

### 🎨 UI/UX Modern
- Desain responsif (mobile-friendly)
- Dark mode support
- Toast notifications
- Loading animations
- Card-based layout
- Material Icons

---

## 🚀 Cara Deploy (Langkah Demi Langkah)

### Langkah 1: Buat Google Spreadsheet Baru

1. Buka [Google Sheets](https://sheets.google.com)
2. Klik **+ Blank** untuk membuat spreadsheet baru
3. Beri nama spreadsheet, contoh: **"Pembagi Jam Pelajaran SD"**

### Langkah 2: Buka Apps Script Editor

1. Di spreadsheet, klik menu **Extensions** → **Apps Script**
2. Editor Apps Script akan terbuka di tab baru

### Langkah 3: Copy File Code.gs

1. Di editor Apps Script, Anda akan melihat file `Code.gs` kosong
2. Hapus semua isi default
3. Copy seluruh isi dari file `Code.gs` dari repository ini
4. Paste ke editor Apps Script
5. Klik **Save** (ikon disket) atau tekan `Ctrl+S`

### Langkah 4: Copy File Index.html

1. Di sidebar kiri editor Apps Script, klik tanda **+** di sebelah **Files**
2. Pilih **HTML**
3. Beri nama file: `Index` (tanpa .html)
4. Hapus isi default
5. Copy seluruh isi dari file `Index.html` dari repository ini
6. Paste ke editor
7. Klik **Save**

### Langkah 5: Jalankan Setup Database

1. Di editor Apps Script, pastikan file `Code.gs` terbuka
2. Di toolbar atas, pilih fungsi **setupDatabase** dari dropdown (sebelah tombol Debug)
3. Klik tombol **Run** (▶️)
4. Jika muncul permintaan izin:
   - Klik **Review Permissions**
   - Pilih akun Google Anda
   - Klik **Advanced** → **Go to (Untitled project) (unsafe)**
   - Klik **Allow**
5. Tunggu hingga muncul "Execution completed"
6. Kembali ke Google Sheets, Anda akan melihat sheet-sheet baru telah dibuat:
   - Data Guru
   - Data Kelas
   - Struktur Mapel
   - Hasil Jadwal
   - Settings

### Langkah 6: Deploy sebagai Web App

1. Di editor Apps Script, klik tombol **Deploy** (kanan atas)
2. Pilih **New deployment**
3. Klik ikon roda gigi ⚙️ → Pilih **Web app**
4. Isi konfigurasi:
   - **Description**: `Pembagi Jam Pelajaran v1.0`
   - **Execute as**: `Me` (email Anda)
   - **Who has access**: `Anyone` (atau `Anyone with Google account` untuk lebih aman)
5. Klik **Deploy**
6. Salin **Web app URL** yang muncul

### Langkah 7: Akses Aplikasi

1. Buka **Web app URL** di browser
2. Login dengan password default: `admin123`
3. Mulai input data guru, kelas, dan mapel
4. Generate jadwal otomatis!

---

## 🔐 Keamanan

### Mengubah Password Admin

1. Buka Google Sheets
2. Pergi ke sheet **Settings**
3. Ubah value pada row `admin_password`
4. Atau melalui Web App (fitur akan ditambahkan di versi selanjutnya)

### Rekomendasi Akses

- Untuk penggunaan internal sekolah: Pilih `Anyone with Google account`
- Untuk penggunaan publik: Pilih `Anyone`
- Simpan Web app URL dan bagikan ke guru/staf yang berkepentingan

---

## 📖 Cara Penggunaan

### 1. Input Data Guru

1. Buka menu **Data Guru**
2. Klik **Tambah Guru**
3. Isi form:
   - Nama Guru
   - Jenis Guru (Guru Kelas / Guru Mapel)
   - Jika Guru Mapel → pilih mata pelajaran
   - Maksimal Jam per Minggu (default: 24)
4. Klik **Simpan**

### 2. Input Data Kelas

1. Buka menu **Data Kelas**
2. Klik **Tambah Kelas**
3. Isi form:
   - Nama Kelas (contoh: Kelas 1A)
   - Tingkat (1-6)
   - Jam per Hari (default: 6)
   - Pilih Guru Kelas (opsional)
4. Klik **Simpan**

### 3. Konfigurasi Mata Pelajaran

1. Buka menu **Struktur Mapel**
2. Edit mapel yang sudah ada atau tambah baru
3. Atur jumlah jam per minggu untuk:
   - Kelas 1-3 (Kls 1-3)
   - Kelas 4-6 (Kls 4-6)
4. Pilih kategori dan warna

### 4. Generate Jadwal

1. Buka **Dashboard**
2. Klik **Generate Jadwal**
3. Tunggu proses selesai (akan ada loading indicator)
4. Jadwal otomatis tersimpan

### 5. Lihat & Export Jadwal

1. Buka menu **Jadwal Pelajaran**
2. Filter berdasarkan kelas jika perlu
3. Klik **Print** untuk cetak
4. Klik **Export Excel** untuk download CSV

---

## 🎨 Customization

### Mengubah Warna Tema

Edit di file `Index.html`, bagian `:root` CSS variables:

```css
:root {
  --primary-color: #4CAF50;    /* Warna utama (hijau) */
  --secondary-color: #2196F3;  /* Warna sekunder (biru) */
  --accent-color: #FF9800;     /* Warna accent (orange) */
}
```

### Mengubah Logo

Cari dan ganti icon `school` dengan icon Material Icons lainnya:

```html
<span class="material-icons-round">your_icon_name</span>
```

Daftar icon: [Material Icons](https://fonts.google.com/icons)

---

## 📁 Struktur File

```
pembagi-jam-pelajaran/
├── Code.gs              # Server-side Google Apps Script
├── Index.html           # Frontend (HTML + CSS + JavaScript)
└── README.md            # Dokumentasi
```

---

## 🔧 Troubleshooting

### Error: "Exception: You do not have permission"

- Pastikan Anda login dengan akun Google yang sama dengan pemilik spreadsheet
- Jalankan ulang fungsi `setupDatabase`
- Cek permission saat deploy

### Error: "Service is currently unavailable"

- Tunggu beberapa saat dan refresh halaman
- Apps Script memiliki quota limit, tunggu beberapa menit

### Data tidak muncul

- Refresh halaman (klik tombol Refresh di top bar)
- Pastikan data sudah tersimpan di Google Sheets
- Cek console browser untuk error (F12)

### Generate jadwal gagal

- Pastikan ada minimal 1 guru dan 1 kelas
- Cek maksimal jam guru tidak terlalu rendah
- Reset jadwal dan coba generate ulang

---

## 📊 Struktur Database

### Sheet: Data Guru
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| ID | Text | Unique ID (GURU001, dst) |
| Nama Guru | Text | Nama lengkap guru |
| Jenis Guru | Text | Guru Kelas / Guru Mapel |
| Mata Pelajaran | Text | Mapel yang diampu |
| Maksimal Jam/Minggu | Number | Kuota jam mengajar |
| Status | Text | Aktif / Nonaktif |
| Created At | Date | Tanggal dibuat |

### Sheet: Data Kelas
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| ID | Text | Unique ID (KLS001, dst) |
| Nama Kelas | Text | Nama kelas (1A, 2B, dst) |
| Tingkat | Number | 1-6 |
| Jumlah Jam/Hari | Number | Jam pelajaran per hari |
| Guru Kelas | Text | Nama guru kelas |
| Status | Text | Aktif / Nonaktif |

### Sheet: Struktur Mapel
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| ID | Text | Unique ID (MAPEL001, dst) |
| Mata Pelajaran | Text | Nama mapel |
| Jam/Minggu (Kls 1-3) | Number | Alokasi jam kelas rendah |
| Jam/Minggu (Kls 4-6) | Number | Alokasi jam kelas tinggi |
| Kategori | Text | Guru Kelas / Guru Mapel |
| Warna | Text | Hex color code |

### Sheet: Hasil Jadwal
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| ID Jadwal | Text | Unique ID |
| Kelas | Text | ID Kelas |
| Hari | Text | Senin - Sabtu |
| Jam Ke- | Number | Urutan jam |
| Mata Pelajaran | Text | Nama mapel |
| Guru | Text | Nama guru pengampu |
| Tanggal Generate | Date | Timestamp generate |
| Status | Text | Aktif / Nonaktif |

---

## 🎯 Algoritma Generate Jadwal

Sistem menggunakan algoritma greedy dengan prioritas:

1. **Prioritas Guru Kelas**: Guru kelas mendapat prioritas untuk mapel umum
2. **Anti Bentrok**: Cek ketersediaan guru per slot hari-jam
3. **Kuota Jam**: Tidak melebihi maksimal jam guru
4. **Distribusi Merata**: Mapel tersebar di hari yang berbeda
5. **Randomisasi**: Jika ada multiple pilihan, dipilih secara acak

---

## 📝 Changelog

### Version 1.0.0
- ✅ Initial release
- ✅ CRUD Data Guru, Kelas, Mapel
- ✅ Generate jadwal otomatis
- ✅ Dashboard statistik
- ✅ Dark mode
- ✅ Export Excel & Print
- ✅ Toast notifications
- ✅ Responsive design

---

## 🤝 Kontribusi

Untuk kontribusi, silakan fork repository ini dan buat pull request.

---

## 📄 License

MIT License - Silakan digunakan dan dimodifikasi untuk keperluan sekolah.

---

## 📞 Support

Jika ada pertanyaan atau masalah:
1. Cek bagian Troubleshooting di README ini
2. Pastikan semua langkah deploy sudah diikuti dengan benar
3. Periksa Google Sheets untuk memastikan data tersimpan

---

**Dibuat dengan ❤️ untuk pendidikan Indonesia**
