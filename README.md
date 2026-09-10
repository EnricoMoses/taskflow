# TaskFlow — Project & Task Management Application

TaskFlow adalah aplikasi manajemen proyek dan tugas modern berbasis web yang dirancang untuk mempermudah pelacakan alur kerja, pengelolaan proyek, kolaborasi tugas dengan Kanban board interaktif, serta monitoring performa kerja secara real-time.

---

## 🚀 Tech Stack

- **Backend:** Laravel 12 (PHP 8.2+)
- **Frontend:** React 19, Inertia.js (TypeScript-first)
- **UI & Styling:** Tailwind CSS, shadcn/ui, Lucide React, Recharts
- **Drag & Drop:** `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`
- **Database:** PostgreSQL / MySQL (SQLite in-memory for testing)
- **Testing:** PHPUnit / Pest Feature & Unit Testing

---

## ✨ Fitur Utama

1. **Dashboard Ringkasan & Analitik**
   - Kartu metrik: Total Proyek, Total Tugas, Tugas Selesai, dan Tugas Terlambat (Overdue).
   - Visualisasi grafik: Distribusi status tugas (Donut Chart) & status proyek (Bar Chart).
   - Widget Deadline Terdekat & Tugas Terlambat yang dapat diklik langsung ke detail proyek/tugas.
   - List Proyek Terbaru dengan visual progress bar.

2. **Manajemen Proyek (CRUD & Otorisasi)**
   - Pembuatan, pembaruan, dan penghapusan proyek dengan konfirmasi aman.
   - Perhitungan persentase progres dinamis berdasarkan penyelesaian tugas.
   - Otorisasi ketat via `ProjectPolicy` (setiap pengguna hanya dapat mengakses proyek miliknya).

3. **Kanban Board Interaktif dengan Drag & Drop**
   - Tampilan kolom status: **Todo**, **In Progress**, dan **Done**.
   - Drag and Drop tugas antar kolom dan reorder tugas dengan *optimistic UI update*.
   - Dukungan aksesibilitas keyboard dan tombol pemindahan status cepat untuk perangkat mobile.
   - Urutan tugas tersimpan di database via batch reorder transaction.

4. **Manajemen & Filter Tugas Lintas Proyek (All Tasks)**
   - Halaman daftar semua tugas dengan pencarian teks (debounce search).
   - Filter multi-kriteria: Status tugas, Tingkat prioritas (Low, Medium, High), dan Rentang tanggal deadline (*date range picker*).
   - Sinkronisasi filter ke URL query string (shareable & browser back/forward friendly).

5. **Upload & Manajemen Lampiran Tugas (Attachments)**
   - Upload file hingga **10 MB** dengan validasi MIME types (`pdf, doc, docx, xls, xlsx, png, jpg, jpeg, zip`).
   - Drag-and-drop file uploader dengan progress preview.
   - Download file aman dan penghapusan fisik file otomatis saat dihapus.

6. **Dukungan Dark Mode Penuh**
   - Toggle tema: Light, Dark, dan System (mengikuti preferensi OS).
   - Transisi warna halus dan kontras warna optimal pada seluruh komponen.

---

## 🛠️ Panduan Instalasi Lokal

Ikuti langkah-langkah berikut untuk menjalankan TaskFlow di lingkungan pengembangan lokal:

### 1. Prasyarat
Pastikan sistem Anda telah terpasang:
- PHP >= 8.2 & Composer
- Node.js >= 18 & npm
- PostgreSQL atau MySQL lokal
- Git

### 2. Clone Repository
```bash
git clone https://github.com/EnricoMoses/taskflow.git
cd taskflow
```

### 3. Install Dependensi Backend & Frontend
```bash
composer install
npm install
```

### 4. Konfigurasi Environment
Salin file `.env.example` menjadi `.env` dan generate application key:
```bash
cp .env.example .env
php artisan key:generate
```

Sesuaikan konfigurasi database pada `.env`, contoh untuk MySQL / PostgreSQL:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=taskflow
DB_USERNAME=root
DB_PASSWORD=
```

### 5. Migrasi Database & Storage Symlink
Jalankan migrasi database dan buat tautan storage untuk lampiran file:
```bash
php artisan migrate
php artisan storage:link
```

### 6. Menjalankan Server Pengembangan
Jalankan backend Laravel dan frontend Vite development server:

**Terminal 1 (Backend):**
```bash
php artisan serve
```

**Terminal 2 (Frontend):**
```bash
npm run dev
```

Buka browser di `http://127.0.0.1:8000`. Anda dapat mendaftarkan akun baru melalui menu Register.

---

## 🧪 Menjalankan Automated Tests

Aplikasi TaskFlow dilengkapi dengan automated feature tests lengkap (Project CRUD, Task CRUD, Attachment upload & validation, Authorization checks, Dashboard analytics).

Jalankan seluruh test suite dengan:
```bash
php artisan test
```

---

## ⚙️ Catatan Konfigurasi Upload File

Fitur lampiran mendukung file hingga **10 MB**. Pastikan pengaturan PHP Anda (`php.ini`) mengizinkan ukuran upload tersebut:
```ini
upload_max_filesize = 10M
post_max_size = 12M
memory_limit = 256M
```

---

## 🌐 Demo & Tautan Terkait

- **Live Demo:** *[Link Demo akan diperbarui setelah deployment]*
- **Repository:** [https://github.com/EnricoMoses/taskflow](https://github.com/EnricoMoses/taskflow)

---

## 📄 Lisensi

Proyek ini dibuat untuk keperluan seleksi/evaluasi dan didistribusikan di bawah lisensi [MIT](LICENSE).
