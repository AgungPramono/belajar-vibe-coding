# Project Setup: Bun + ElysiaJS + Drizzle + MySQL

## Overview

Buat REST API project baru menggunakan Bun sebagai runtime, ElysiaJS sebagai web framework, Drizzle sebagai ORM, dan MySQL sebagai database.

---

## Tasks

### 1. Inisialisasi Project
- Buat project baru dengan `bun init`
- Setup `package.json` dengan scripts: `dev`, `start`, `db:generate`, `db:migrate`

### 2. Install Dependencies
- `elysia` — web framework
- `drizzle-orm` + `mysql2` — ORM dan MySQL driver
- `drizzle-kit` (devDependency) — untuk migration dan schema generation

### 3. Konfigurasi Database
- Buat file koneksi database (contoh: `src/db/index.ts`)
- Gunakan environment variable untuk DB credentials (`.env`)
- Buat `drizzle.config.ts` untuk konfigurasi drizzle-kit

### 4. Buat Schema
- Buat minimal 1 contoh table/schema di `src/db/schema.ts`
- Generate migration dengan `drizzle-kit generate`
- Jalankan migration dengan `drizzle-kit migrate`

### 5. Setup ElysiaJS App
- Buat entry point di `src/index.ts`
- Daftarkan minimal 1 route contoh (CRUD sederhana) yang terhubung ke database
- Jalankan server dengan Bun

---

## Acceptance Criteria

- Server bisa dijalankan dengan `bun run dev`
- Bisa konek ke MySQL
- Minimal ada 1 endpoint yang baca/tulis data dari database