# Task: Implementasi Unit Test untuk User API

## Deskripsi
Buatkan unit test untuk semua API (User API) yang tersedia pada aplikasi ini menggunakan `bun test`. Pastikan seluruh testing disimpan dalam folder `test/`.

## Aturan Umum (Penting)
1. Gunakan testing framework bawaan dari `bun test`.
2. Letakkan file test di dalam folder `test/`.
3. **Penting:** Setiap sebelum menjalankan skenario test, harapkan untuk **menghapus semua data** (truncate/delete) di tabel terkait terlebih dahulu agar state selalu bersih dan konsisten.
4. Implementasikan skenario-skenario berikut selengkap mungkin berdasarkan response error/success yang telah disediakan oleh API.

## Skenario yang Harus Ditulis

### 1. Register User API (`POST /api/users/`)
- Mendaftarkan user baru dengan data valid (harus sukses dan mengembalikan status 201).
- Mendaftarkan user baru dengan nama kosong.
- Mendaftarkan user baru dengan nama lebih dari 255 karakter.
- Mendaftarkan user baru dengan email kosong.
- Mendaftarkan user baru dengan email lebih dari 255 karakter.
- Mendaftarkan user baru dengan password kurang dari 6 karakter.
- Mendaftarkan user baru dengan email yang sudah terdaftar sebelumnya (duplicate email).

### 2. Login User API (`POST /api/users/login`)
- Login dengan email dan password yang benar (harus sukses dan mengembalikan token).
- Login dengan email yang belum terdaftar.
- Login dengan password yang salah.
- Login dengan format email tidak valid atau kosong.

### 3. Get Current User API (`GET /api/users/current`)
- Mengambil data current user dengan menyertakan Bearer token yang valid (harus sukses dan mengembalikan data user).
- Mengambil data current user tanpa mengirimkan header Authorization.
- Mengambil data current user dengan token yang tidak valid atau salah format.

### 4. Logout User API (`DELETE /api/users/logout`)
- Melakukan logout dengan menyertakan Bearer token yang valid (harus sukses).
- Melakukan logout tanpa mengirimkan token atau token dikosongkan.
- Melakukan logout dengan token yang tidak valid.

## Catatan Tambahan
Issue ini difokuskan pada "apa" saja skenario yang harus diuji. Silakan programmer atau model AI selanjutnya yang memikirkan dan mengimplementasikan detail teknis pengujian serta mock/setup database yang dibutuhkan.
