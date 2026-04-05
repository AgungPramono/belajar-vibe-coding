import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { db } from "../db";
import { users, sessions } from "../db/schema";

export async function createUser(
  name: string,
  email: string,
  password: string
) {
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

export async function loginUser(email: string, password: string) {
  const result = await db.select().from(users).where(eq(users.email, email));

  if (result.length === 0) {
    throw new Error("Email atau Password Salah");
  }

  const user = result[0];
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new Error("Email atau Password Salah");
  }

  const token = randomUUID();

  await db.insert(sessions).values({ token, userId: user.id });

  return token;
}
