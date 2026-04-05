import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { db } from "../db";
import { users, sessions } from "../db/schema";

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

  const user = result[0]!;
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new Error("Email atau Password Salah");
  }

  const token = randomUUID();

  await db.insert(sessions).values({ token, userId: user.id! });

  return token;
}
