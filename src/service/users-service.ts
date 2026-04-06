import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { db } from "../db";
import { users, sessions } from "../db/schema";

/**
 * Mendapatkan data pengguna yang sedang aktif berdasarkan token sesi.
 * Akan melempar error "Unauthorized" jika token tidak valid atau pengguna tidak ditemukan.
 * 
 * @param token Token sesi dari pengguna yang terautentikasi.
 * @returns Object berisi id, nama, email, dan tanggal pembuatan akun.
 */
export async function getCurrentUser(token: string) {
  const session = await db.select().from(sessions).where(eq(sessions.token, token));

  if (session.length === 0) {
    throw new Error("Unauthorized");
  }

  const user = await db.select().from(users).where(eq(users.id, session[0]!.userId));

  if (user.length === 0) {
    throw new Error("Unauthorized");
  }

  return {
    id: String(user[0]!.id),
    name: user[0]!.name,
    email: user[0]!.email,
    created_at: user[0]!.createdAt,
  };
}

/**
 * Mendaftarkan pengguna (user) baru ke dalam sistem (Registrasi).
 * Melakukan validasi format input, mengecek ketersediaan email, 
 * dan melakukan hashing pada password sebelum menyimpannya ke database.
 * 
 * @param name Nama lengkap pengguna (wajib, max 255 karakter).
 * @param email Alamat email pengguna (wajib, unik, max 255 karakter).
 * @param password Kata sandi untuk login (wajib, minimal 6 karakter).
 * @returns String "OK" jika pengguna berhasil dibuat.
 */
export async function createUser(
  name: string,
  email: string,
  password: string
) {
  if (!name || name.trim().length === 0) {
    throw new Error("Nama tidak boleh kosong");
  }
  if (name.length > 255) {
    throw new Error("Nama maksimal 255 karakter");
  }
  if (!email || email.trim().length === 0) {
    throw new Error("Email tidak boleh kosong");
  }
  if (email.length > 255) {
    throw new Error("Email maksimal 255 karakter");
  }
  if (!password || password.length < 6) {
    throw new Error("Password minimal 6 karakter");
  }

  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, email));

  if (existing.length > 0) {
    throw new Error("email sudah terdaftar");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await db.insert(users).values({
    name,
    email,
    password: hashedPassword,
  });

  return "OK";
}

/**
 * Menghapus sesi aktif pengguna dari database (Logout).
 * 
 * @param token Token sesi yang ingin invalidasi / dihapus.
 * @returns String "OK" jika sesi berhasil dihapus.
 */
export async function logoutUser(token: string) {
  const result = await db.delete(sessions).where(eq(sessions.token, token));

  if (result[0].affectedRows === 0) {
    throw new Error("Unauthorized");
  }

  return "OK";
}

/**
 * Melakukan autentikasi kredensial pengguna (Login).
 * Memeriksa kecocokan email dan mencocokkan hash password. Jika kredensial valid,
 * sistem akan membuatkan sesi (token) baru untuk pengguna tersebut.
 * 
 * @param email Email pengguna yang telah terdaftar.
 * @param password Kata sandi pengguna.
 * @returns Token string (UUID) otorisasi sesi yang sah.
 */
export async function loginUser(email: string, password: string) {
  const result = await db.select().from(users).where(eq(users.email, email));

  if (result.length === 0) {
    throw new Error("Email atau Password Salah");
  }

  const user = result[0]!;
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new Error("Email atau Password Salah");
  }

  const token = randomUUID();

  await db.insert(sessions).values({ token, userId: user.id! });

  return token;
}
