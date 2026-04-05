import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "../db";
import { users } from "../db/schema";

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
