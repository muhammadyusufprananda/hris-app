# HRIS Management System

Aplikasi desktop manajemen HR yang berjalan secara lokal menggunakan Electron + React + sql.js (SQLite murni JavaScript).

## Cara Menjalankan

### Prasyarat
- Node.js versi 18 atau lebih baru (v24 juga OK)
- npm

> **Tidak perlu Visual Studio, tidak perlu compile apapun.**

### Instalasi

```bash
# 1. Masuk ke folder proyek
cd hris-app

# 2. Install semua dependensi
npm install
```

Jika ada error `EBUSY` atau `EPERM` di Windows, coba:
```bash
# Tutup semua program lain, lalu jalankan di PowerShell sebagai Administrator:
npm install --legacy-peer-deps
```

### Jalankan Mode Development

```bash
npm start
```

Ini akan membuka jendela Electron setelah React dev server siap.

### Build ke .exe (Windows)

```bash
npm run pack
```

File installer `.exe` akan tersedia di folder `dist/`.

---

## Kenapa sql.js?

`better-sqlite3` memerlukan kompilasi C++ (Visual Studio Build Tools di Windows).
`sql.js` adalah SQLite yang dikompilasi ke WebAssembly — murni JavaScript, tidak butuh tools tambahan apapun.

---

## Struktur Proyek

```
hris-app/
├── electron.js         ← Proses utama Electron (database, IPC)
├── preload.js          ← Jembatan API ke React
├── src/
│   ├── App.js
│   ├── App.css
│   └── pages/
│       ├── Dashboard.js
│       ├── KaryawanList.js
│       └── KaryawanForm.js
├── public/
│   └── index.html
└── hris.db             ← Database SQLite (dibuat otomatis saat pertama jalan)
```

## Modul yang Ada (v1.0)
- [x] Dashboard (statistik ringkasan)
- [x] Data Karyawan (CRUD lengkap, search, filter, export Excel)

## Modul Berikutnya
- [ ] MCU Karyawan
- [ ] Kompetensi Karyawan
- [ ] Invoice
