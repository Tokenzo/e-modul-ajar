# Aplikasi Absensi Siswa & Jurnal Mengajar Canggih

Aplikasi web modern untuk manajemen absensi siswa dan jurnal mengajar yang dapat bekerja secara **offline** maupun **online**.

## 🚀 Fitur Utama

### 1. **Absensi Siswa**
- Input absensi harian dengan status: Hadir (H), Sakit (S), Izin (I), Alpha (A)
- Filter berdasarkan kelas dan mata pelajaran
- Tampilan grid yang responsif dan mudah digunakan
- Penyimpanan otomatis ke database lokal

### 2. **Jurnal Mengajar Canggih**
- Pencatatan materi pembelajaran
- Kompetensi dasar
- Metode pembelajaran (Ceramah, Diskusi, Praktikum, PBL, PjBL, dll)
- Media pembelajaran
- Catatan khusus proses pembelajaran
- Kendala/hambatan
- Rencana tindak lanjut

### 3. **Laporan & Rekapitulasi**
- Laporan absensi per periode
- Laporan jurnal mengajar
- Filter berdasarkan tanggal, kelas, dan mata pelajaran
- Export ke Excel (CSV)
- Export ke PDF (via print dialog)

### 4. **Manajemen Data**
- CRUD data siswa (NIS, Nama, Kelas)
- Data guru (Nama, NIP)
- Import/Export data siswa
- Backup & Restore semua data
- Hapus semua data dengan konfirmasi

### 5. **Mode Offline/Online**
- Bekerja tanpa koneksi internet
- Data disimpan di browser menggunakan IndexedDB
- Service Worker untuk caching
- Deteksi status koneksi otomatis
- Notifikasi saat offline

### 6. **Progressive Web App (PWA)**
- Dapat diinstall di perangkat mobile/desktop
- Tampilan seperti aplikasi native
- Theme color customizable
- Manifest.json untuk instalasi

## 📁 Struktur Folder

```
siswa-absensi/
├── index.html          # File utama HTML
├── manifest.json       # PWA Manifest
├── sw.js              # Service Worker
├── css/
│   └── style.css      # Styling aplikasi
├── js/
│   ├── app.js         # Logika aplikasi utama
│   ├── database.js    # Database Manager (IndexedDB)
│   └── utils.js       # Fungsi-fungsi utility
├── icons/             # Icon untuk PWA
└── data/              # Folder untuk backup data
```

## 🛠️ Teknologi

- **HTML5** - Struktur aplikasi
- **CSS3** - Styling dengan gradient dan animasi
- **JavaScript (ES6+)** - Logika aplikasi
- **IndexedDB** - Database offline
- **Service Worker** - Caching dan mode offline
- **PWA** - Progressive Web App

## 💻 Cara Menggunakan

### Instalasi Manual
1. Download atau clone repository ini
2. Buka folder `siswa-absensi`
3. Buka file `index.html` di browser modern (Chrome, Firefox, Edge, Safari)

### Menjalankan dengan Local Server (Recommended)
```bash
# Menggunakan Python 3
cd siswa-absensi
python -m http.server 8000

# Atau menggunakan Node.js (http-server)
npx http-server -p 8000
```

Kemudian buka browser dan akses: `http://localhost:8000`

### Instalasi sebagai PWA
1. Buka aplikasi di browser yang mendukung PWA
2. Klik icon "Install" atau "Add to Home Screen"
3. Aplikasi akan terinstall dan dapat diakses dari home screen

## 📖 Panduan Penggunaan

### Pertama Kali Menggunakan
1. Buka menu **Pengaturan**
2. Isi data guru (Nama dan NIP)
3. Tambah data siswa satu per satu atau import dari file JSON
4. Mulai menggunakan fitur absensi dan jurnal

### Input Absensi
1. Pilih menu **Absensi**
2. Pilih tanggal, kelas, dan mata pelajaran
3. Daftar siswa akan muncul otomatis berdasarkan kelas
4. Pilih status kehadiran untuk setiap siswa
5. Klik **Simpan Absensi**

### Input Jurnal Mengajar
1. Pilih menu **Jurnal Mengajar**
2. Isi semua field yang diperlukan
3. Klik **Simpan Jurnal**

### Generate Laporan
1. Pilih menu **Laporan**
2. Pilih jenis laporan (Absensi/Jurnal)
3. Tentukan periode tanggal dan kelas
4. Klik **Generate Laporan**
5. Export ke Excel atau PDF jika diperlukan

### Backup Data
1. Buka menu **Pengaturan**
2. Scroll ke bagian **Backup & Restore**
3. Klik **Backup Data** untuk download semua data
4. Simpan file backup di tempat aman

### Restore Data
1. Buka menu **Pengaturan**
2. Klik **Restore Data**
3. Pilih file backup yang telah disimpan
4. Konfirmasi restore

## 🔒 Keamanan Data

- Semua data disimpan lokal di browser (IndexedDB)
- Tidak ada data yang dikirim ke server
- Backup data tersimpan di perangkat pengguna
- Clear all data tersedia dengan konfirmasi ganda

## 🌐 Kompatibilitas Browser

- ✅ Google Chrome (Recommended)
- ✅ Mozilla Firefox
- ✅ Microsoft Edge
- ✅ Safari
- ✅ Opera

## 📱 Responsive Design

Aplikasi ini fully responsive dan dapat digunakan di:
- Desktop/Laptop
- Tablet
- Smartphone

## 🎨 Customization

Untuk mengubah tema warna, edit file `css/style.css`:
```css
/* Ubah gradient warna di bagian body */
body {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Ubah warna tombol */
.btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

## 🐛 Troubleshooting

### Data tidak tersimpan
- Pastikan browser mendukung IndexedDB
- Coba clear cache browser dan reload
- Gunakan browser modern (Chrome/Firefox/Edge)

### Mode offline tidak berfungsi
- Pastikan Service Worker terdaftar dengan benar
- Akses aplikasi minimal 2 kali online sebelum offline
- Clear Service Worker dan reload

### PWA tidak bisa diinstall
- Pastikan mengakses via HTTPS atau localhost
- Browser harus mendukung PWA
- Manifest.json dan Service Worker harus valid

## 📝 Format Import Siswa

File JSON untuk import siswa:
```json
[
  {
    "nis": "12345",
    "nama": "Ahmad Dani",
    "kelas": "X-A"
  },
  {
    "nis": "12346",
    "nama": "Budi Santoso",
    "kelas": "X-A"
  }
]
```

## 📄 License

Aplikasi ini dibuat untuk keperluan pendidikan dan dapat digunakan secara gratis.

## 👨‍💻 Developer

Dibuat dengan ❤️ untuk pendidikan Indonesia

---

**Version:** 1.0  
**Last Updated:** 2024  
**Status:** Stable
