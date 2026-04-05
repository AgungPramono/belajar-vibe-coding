# Issue: Implementasi API Logout User

## Deskripsi

Buatkan API endpoint untuk logout user. Endpoint ini akan menghapus session (token) dari tabel `sessions` sehingga token tersebut tidak bisa digunakan lagi.

---

## Konteks Project

Project ini menggunakan stack:
- **Runtime:** Bun
- **Framework:** ElysiaJS
- **ORM:** Drizzle ORM
- **Database:** MySQL

### Schema yang Sudah Ada

**File:** `src/db/schema.ts`

```ts
// Tabel users
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Tabel sessions (menyimpan token login)
export const sessions = mysqlTable("sessions", {
  id: int("id").autoincrement().primaryKey(),
  token: varchar("token", { length: 255 }).notNull(),
  userId: int("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

### Endpoint yang Sudah Ada

| Method | Endpoint              | Fungsi                          |
| ------ | --------------------- | ------------------------------- |
| POST   | /api/users            | Registrasi user baru            |
| POST   | /api/users/login      | Login user (return token)       |
| POST   | /api/users/current    | Get data user yang sedang login |

### Alur Login yang Sudah Ada

1. User login via `POST /api/users/login` dengan email & password
2. Server memvalidasi credential
3. Server membuat token (UUID) dan menyimpannya di tabel `sessions` dengan `user_id`
4. Server mengembalikan token ke client

**Saat logout, token ini akan dihapus dari tabel `sessions`.**

---

## API Endpoint yang Akan Dibuat

**Endpoint:** `POST /api/users/logout`

**Headers:**
```
Authorization: Bearer <token>
```

> Token diambil dari response login (`POST /api/users/login`).

**Response Body (Success - 200):**
```json
{
  "data": "OK"
}
```

> Jika sukses logout, session dengan token tersebut akan **dihapus** dari tabel `sessions`.

**Response Body (Error - 401):**
```json
{
  "error": "Unauthorized"
}
```

> Dikembalikan jika token tidak ada, format header salah, atau token tidak ditemukan di database.

---

## Struktur Folder & File

```
src/
├── db/
│   ├── index.ts          (sudah ada - koneksi database - TIDAK perlu diubah)
│   └── schema.ts         (sudah ada - schema database - TIDAK perlu diubah)
├── route/
│   └── users-route.ts    (sudah ada - perlu ditambah endpoint baru)
├── service/
│   └── users-service.ts  (sudah ada - perlu ditambah fungsi baru)
└── index.ts              (sudah ada - TIDAK perlu diubah)
```

- `src/route/` : berisi routing ElysiaJS
- `src/service/` : berisi logic bisnis aplikasi

---

## Tahapan Implementasi

### Tahap 1: Tambah fungsi `logoutUser` di `src/service/users-service.ts`

Buka file `src/service/users-service.ts`. Di file ini sudah ada fungsi `getCurrentUser`, `createUser`, dan `loginUser`.

**Tambahkan fungsi baru `logoutUser(token: string)` dengan logika berikut:**

1. Ambil nilai `token` dari parameter fungsi
2. Cari session di tabel `sessions` yang memiliki token tersebut:
   ```ts
   const session = await db.select().from(sessions).where(eq(sessions.token, token));
   ```
3. Jika session **tidak ditemukan** (array kosong), throw error dengan pesan `"Unauthorized"`
4. Jika session **ditemukan**, hapus session tersebut dari tabel `sessions`:
   ```ts
   await db.delete(sessions).where(eq(sessions.token, token));
   ```
5. Return string `"OK"`

**Contoh fungsi lengkap:**

```ts
export async function logoutUser(token: string) {
  const session = await db.select().from(sessions).where(eq(sessions.token, token));

  if (session.length === 0) {
    throw new Error("Unauthorized");
  }

  await db.delete(sessions).where(eq(sessions.token, token));

  return "OK";
}
```

**Penting:**
- Import `sessions` dari `../db/schema` sudah ada di baris import yang ada, jadi **tidak perlu** menambah import baru
- Gunakan `db.delete()` dari Drizzle ORM untuk menghapus row
- Pastikan fungsi `logoutUser` di-**export** agar bisa digunakan di route

---

### Tahap 2: Tambah endpoint `POST /api/users/logout` di `src/route/users-route.ts`

Buka file `src/route/users-route.ts`. Di file ini sudah ada route `POST /`, `POST /login`, dan `POST /current`.

**Tambahkan route baru dengan cara chaining `.post("/logout", ...)` pada instance Elysia yang sudah ada.**

1. Tambahkan import `logoutUser` di baris import yang sudah ada:
   ```ts
   import { createUser, loginUser, getCurrentUser, logoutUser } from "../service/users-service";
   ```

2. Tambahkan route baru setelah route `/current` yang sudah ada, dengan cara menambah `.post("/logout", ...)`:
   ```ts
   .post("/logout", async ({ request, set }) => {
     try {
       const authHeader = request.headers.get("authorization");
       if (!authHeader || !authHeader.startsWith("Bearer ")) {
         set.status = 401;
         return { error: "Unauthorized" };
       }
       const token = authHeader.replace("Bearer ", "");
       const result = await logoutUser(token);
       return { data: result };
     } catch (error) {
       set.status = 401;
       return { error: "Unauthorized" };
     }
   })
   ```

**Penting:**
- Pola handler ini **sama persis** dengan route `/current` yang sudah ada, bedanya hanya memanggil `logoutUser` bukan `getCurrentUser`
- Pastikan chaining `.post(...)` ditambahkan **sebelum** semicolon (`;`) penutup
- Status code untuk semua error di endpoint ini adalah **401** (bukan 400)
- Gunakan `request` dari context ElysiaJS untuk mengakses headers

---

### Tahap 3: Testing

Jalankan server:

```bash
bun run dev
```

**Test 1 - Login dulu untuk mendapatkan token:**

```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"agung@mail.com","password":"rahasia"}'
```

Catat token dari response, contoh: `"data": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"`

**Test 2 - Logout dengan token valid (harus return "OK"):**

```bash
curl -X POST http://localhost:3000/api/users/logout \
  -H "Authorization: Bearer xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

Expected response:
```json
{
  "data": "OK"
}
```

**Test 3 - Verifikasi token sudah tidak bisa dipakai lagi (harus return error 401):**

```bash
curl -X POST http://localhost:3000/api/users/current \
  -H "Authorization: Bearer xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

Expected response (karena token sudah dihapus):
```json
{
  "error": "Unauthorized"
}
```

**Test 4 - Logout tanpa header Authorization (harus return error 401):**

```bash
curl -X POST http://localhost:3000/api/users/logout
```

Expected response:
```json
{
  "error": "Unauthorized"
}
```

**Test 5 - Logout dengan token yang salah/tidak ada (harus return error 401):**

```bash
curl -X POST http://localhost:3000/api/users/logout \
  -H "Authorization: Bearer token-yang-salah"
```

Expected response:
```json
{
  "error": "Unauthorized"
}
```

**Test 6 - Logout dua kali dengan token yang sama (harus error di percobaan kedua):**

```bash
# Logout pertama - harus sukses
curl -X POST http://localhost:3000/api/users/logout \
  -H "Authorization: Bearer xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

# Logout kedua dengan token yang sama - harus error 401
curl -X POST http://localhost:3000/api/users/logout \
  -H "Authorization: Bearer xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

Expected response logout kedua:
```json
{
  "error": "Unauthorized"
}
```

---

## Checklist

- [ ] Tambah fungsi `logoutUser(token)` di `src/service/users-service.ts`
- [ ] Tambah import `logoutUser` di `src/route/users-route.ts`
- [ ] Tambah route `POST /api/users/logout` di `src/route/users-route.ts`
- [ ] Test endpoint - login dulu untuk dapat token
- [ ] Test endpoint - logout dengan token valid (response `"OK"`)
- [ ] Test endpoint - verifikasi token sudah tidak bisa dipakai setelah logout
- [ ] Test endpoint - logout tanpa header Authorization (response 401)
- [ ] Test endpoint - logout dengan token salah (response 401)
- [ ] Test endpoint - logout dua kali dengan token sama (kedua harus 401)