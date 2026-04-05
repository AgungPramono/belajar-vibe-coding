# Issue: Implementasi API Registrasi User Baru

## Deskripsi

Buatkan API endpoint untuk registrasi user baru dengan hashing password menggunakan bcrypt.

---

## 1. Update Tabel Users

Tabel `users` sudah ada di `src/db/schema.ts`, tetapi perlu ditambahkan kolom berikut:

| Kolom      | Tipe             | Constraint                                      |
| ---------- | ---------------- | ----------------------------------------------- |
| id         | int              | autoincrement, primary key (sudah ada)          |
| name       | varchar(255)     | not null (sudah ada)                            |
| email      | varchar(255)     | not null, unique (sudah ada)                    |
| password   | varchar(255)     | not null (BARU - berisi hash bcrypt)            |
| created_at | timestamp        | default current_timestamp (sudah ada)           |
| updated_at | timestamp        | default current_timestamp on update (BARU)      |

## 2. API Endpoint

**Endpoint:** `POST /api/users`

**Request Body:**
```json
{
  "name": "agung",
  "email": "agung@mail.com",
  "password": "rahasia"
}
```

**Response Body (sukses):**
```json
{
  "data": "OK"
}
```

**Response Body (error - email duplikat):**
```json
{
  "error": "email sudah terdaftar"
}
```

## 3. Struktur Folder & File

```
src/
├── db/
│   ├── index.ts        (sudah ada - koneksi database)
│   └── schema.ts       (sudah ada - perlu diupdate)
├── route/
│   └── users-route.ts  (BARU)
├── service/
│   └── users-service.ts (BARU)
└── index.ts            (sudah ada - perlu diupdate)
```

- `src/route/` : berisi routing Elysia JS
- `src/service/` : berisi logic bisnis aplikasi

---

## Tahapan Implementasi

### Tahap 1: Install dependency bcrypt

Jalankan perintah berikut untuk menginstall package bcrypt:

```bash
bun add bcryptjs
bun add -d @types/bcryptjs
```

> Gunakan `bcryptjs` (versi pure JS) agar kompatibel dengan Bun runtime.

---

### Tahap 2: Update schema `src/db/schema.ts`

Tambahkan kolom `password` dan `updatedAt` pada tabel users.

**File:** `src/db/schema.ts`

```ts
import { mysqlTable, int, varchar, timestamp } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});
```

Setelah update schema, jalankan migrasi:

```bash
bunx drizzle-kit generate
bunx drizzle-kit migrate
```

---

### Tahap 3: Buat service `src/service/users-service.ts`

File ini berisi logic bisnis untuk registrasi user.

**File:** `src/service/users-service.ts`

Yang harus dilakukan:
1. Import `db` dari `src/db/index.ts`
2. Import `users` dari `src/db/schema.ts`
3. Import `bcryptjs` untuk hashing password
4. Import `eq` dari `drizzle-orm` untuk query condition
5. Buat fungsi `createUser(name: string, email: string, password: string)` yang:
   - Cek apakah email sudah terdaftar di database menggunakan `db.select().from(users).where(eq(users.email, email))`
   - Jika email sudah ada, throw error dengan pesan `"email sudah terdaftar"`
   - Jika belum ada, hash password menggunakan `bcryptjs.hash(password, 10)`
   - Insert user baru ke database menggunakan `db.insert(users).values({ name, email, password: hashedPassword })`
   - Return `"OK"`
6. Export fungsi `createUser`

---

### Tahap 4: Buat route `src/route/users-route.ts`

File ini berisi routing untuk endpoint user.

**File:** `src/route/users-route.ts`

Yang harus dilakukan:
1. Import `Elysia` dari `elysia`
2. Import fungsi `createUser` dari `src/service/users-service.ts`
3. Buat instance `Elysia` dengan prefix `/api/users`
4. Tambahkan route `POST /` yang:
   - Ambil `name`, `email`, `password` dari request body
   - Panggil `createUser(name, email, password)`
   - Jika sukses, return `{ data: "OK" }`
   - Jika error, return `{ error: error.message }` dengan status code 400
5. Export route tersebut

---

### Tahap 5: Daftarkan route di `src/index.ts`

Update file entry point untuk menggunakan route yang sudah dibuat.

**File:** `src/index.ts`

Yang harus dilakukan:
1. Import `usersRoute` dari `src/route/users-route.ts`
2. Gunakan `.use(usersRoute)` pada instance Elysia

Contoh hasil akhir:

```ts
import { Elysia } from "elysia";
import { usersRoute } from "./route/users-route";

const app = new Elysia()
  .use(usersRoute)
  .listen(3000);

console.log(`Server running at http://localhost:${app.server?.port}`);
```

---

### Tahap 6: Testing

Setelah semua tahap selesai, jalankan server dan test endpoint:

```bash
bun run dev
```

**Test dengan curl:**

```bash
# Test registrasi user baru (harus return {"data":"OK"})
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"agung","email":"agung@mail.com","password":"rahasia"}'

# Test email duplikat (harus return {"error":"email sudah terdaftar"})
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"agung2","email":"agung@mail.com","password":"rahasia"}'
```

---

## Checklist

- [ ] Install dependency `bcryptjs` dan `@types/bcryptjs`
- [ ] Update schema di `src/db/schema.ts` (tambah kolom `password` dan `updatedAt`)
- [ ] Jalankan migrasi database (`drizzle-kit generate` dan `drizzle-kit migrate`)
- [ ] Buat file `src/service/users-service.ts`
- [ ] Buat file `src/route/users-route.ts`
- [ ] Update `src/index.ts` untuk register route
- [ ] Test endpoint `POST /api/users` - registrasi sukses
- [ ] Test endpoint `POST /api/users` - email duplikat