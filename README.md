# Belajar Vibe Coding

Aplikasi ini adalah contoh *backend* sederhana untuk manajemen pengguna (registrasi, login, autentikasi berbasis sesi, dan logout) yang dibangun menggunakan *runtime* **Bun** dan *framework* **Elysia.js**.

## Teknologi yang Digunakan

Aplikasi ini dibangun menggunakan teknologi (stack) modern dan cepat:
- **[Bun](https://bun.sh/)**: Runtime JavaScript/TypeScript modern yang sangat cepat, sekaligus berfungsi sebagai *package manager* dan *test runner*.
- **[TypeScript](https://www.typescriptlang.org/)**: Bahasa utama untuk *type-safety*.
- **[MySQL](https://www.mysql.com/)**: Sistem manajemen basis data (Database).

### Library Utama
- **[Elysia.js](https://elysiajs.com/)**: *Framework web* ringan dan sangat cepat untuk Bun.
- **[Drizzle ORM](https://orm.drizzle.team/)**: ORM modern untuk interaksi dengan database MySQL (dengan `drizzle-kit` untuk migrasi).
- **[mysql2](https://github.com/sidorares/node-mysql2)**: *Driver* koneksi ke MySQL.
- **[bcryptjs](https://www.npmjs.com/package/bcryptjs)**: Digunakan untuk *hashing* dan verifikasi *password*.

## Arsitektur & Struktur File

Aplikasi ini menggunakan pola arsitektur layer sederhana (Router -> Service -> Database) untuk memisahkan fokus fungsionalitas (*separation of concerns*).

```text
belajar-vibe-coding/
├── .env                  # Variabel environment (koneksi DB, port, dll)
├── package.json          # Konfigurasi dependensi dan script NPM/Bun
├── bun.lock              # Lockfile untuk dependensi Bun
├── drizzle.config.ts     # Konfigurasi untuk Drizzle Kit (migrasi)
├── src/                  # Kode utama aplikasi
│   ├── index.ts          # Entry point aplikasi (konfigurasi aplikasi Elysia)
│   ├── db/               # Layer Database
│   │   ├── index.ts      # Koneksi (pool) database dengan Drizzle
│   │   └── schema.ts     # Definisi struktur tabel (Schema) MySQL
│   ├── route/            # Layer Router/Controller
│   │   └── users-route.ts# Definisi HTTP endpoint beserta validasinya
│   └── service/          # Layer Business Logic
│       └── users-service.ts # Logika bisnis (register, login, cek session)
└── test/                 # Folder untuk Unit Test
    └── user.test.ts      # Skenario unit test end-to-end terhadap API User
```

## Skema Database

Aplikasi ini memiliki 2 tabel utama yang saling berelasi:

### Tabel `users`
Menyimpan informasi pengguna yang terdaftar.
- `id` (int, PK, autoincrement)
- `name` (varchar 255)
- `email` (varchar 255, unique)
- `password` (varchar 255, di-hash dengan bcrypt)
- `createdAt` (timestamp, default now)
- `updatedAt` (timestamp, default now, on update now)

### Tabel `sessions`
Menyimpan token sesi dinamis dari *user* yang aktif (telah *login*).
- `id` (int, PK, autoincrement)
- `token` (varchar 255, format UUID)
- `userId` (int, FK references `users.id`)
- `createdAt` (timestamp, default now)

## REST API (Endpoints)

| Method | Endpoint               | Keterangan                             | Authorization                    |
|--------|------------------------|----------------------------------------|----------------------------------|
| POST   | `/api/users/`          | Register / Pendaftaran pengguna baru.  | Tidak Ada                        |
| POST   | `/api/users/login`     | Login akun (mengembalikan token).      | Tidak Ada                        |
| GET    | `/api/users/current`   | Mendapatkan data user yang aktif.      | Ya (Header: `Bearer <token>`)    |
| DELETE | `/api/users/logout`    | Menghapus sesi user yang sedang aktif. | Ya (Header: `Bearer <token>`)    |

## Cara Setup Project

1. Pastikan Anda telah menginstal [Bun](https://bun.sh/) dan MySQL di komputer Anda.
2. Lakukan clone repositori ini:
   ```bash
   git clone <repo-url>
   cd belajar-vibe-coding
   ```
3. Install semua dependensi menggunakan Bun:
   ```bash
   bun install
   ```
4. Buat dan konfigurasi file `.env`. Anda bisa menyesuaikan variabel berikut dengan konfigurasi MySQL lokal Anda:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=belajar_vibe_coding
   ```
5. *(Optional)* Lakukan generate skema dan push ke tabel database menggunakan script drizzle (Pastikan database sesuai yang Anda set di `.env` sudah ada/dibuat di MySQL Anda):
   ```bash
   bun run db:generate
   bun run db:migrate
   # Tergantung konfigurasi, biasanya juga bisa menggunakan `bunx drizzle-kit push`
   ```

## Cara Menjalankan Aplikasi

Anda dapat menjalankan *development server* dengan fitur *hot-reload* bawaan dari Bun:
```bash
bun run dev
```

Atau untuk mode *production*:
```bash
bun run start
```
Secara otomatis, server akan berjalan di alamat `http://localhost:3000`.

## Cara Menjalankan Test

Proyek ini telah dilengkapi dengan unit test menyeluruh pada setiap routing yang berjalan. Untuk menjalankannya Anda cukup menjalankan script test bawaan `bun test`. *Environment variable* `NODE_ENV` harus di-set ke `"test"` agar tak terjadi bentrokan port HTTP.

```bash
$env:NODE_ENV="test"; bun test
```
*Atau* untuk sistem operasi berbasis *Unix* (Linux/Mac):
```bash
NODE_ENV=test bun test
```
Seluruh data database akan di-*clear*/truncate tiap proses pengujian jalan untuk menjamin keadaan selalu dalam kondisi awal (bersih).
