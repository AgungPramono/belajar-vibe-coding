import { Elysia, t } from "elysia";
import {
  createUser,
  loginUser,
  getCurrentUser,
  logoutUser,
} from "../service/users-service";

const SAFE_AUTH_ERRORS = new Set([
  "Nama tidak boleh kosong",
  "Nama maksimal 255 karakter",
  "Email tidak boleh kosong",
  "Email maksimal 255 karakter",
  "Password minimal 6 karakter",
  "email sudah terdaftar",
  "Email atau Password Salah",
]);

function extractBearerToken(request: Request): string | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  return authHeader.slice(7);
}

function handleClientError(error: unknown, set: { status?: number | string }) {
  const message = (error as Error).message;
  if (SAFE_AUTH_ERRORS.has(message)) {
    set.status = 400;
    return { error: message };
  }
  set.status = 500;
  return { error: "Terjadi kesalahan pada server" };
}

export const usersRoute = new Elysia({ prefix: "/api/users" })

  .post(
    "/",
    async ({ body, set }) => {
      try {
        await createUser(body.name, body.email, body.password);
        set.status = 201;
        return { data: "OK" };
      } catch (error) {
        return handleClientError(error, set);
      }
    },
    {
      body: t.Object({
        name: t.String(),
        email: t.String(),
        password: t.String(),
      }),
      response: {
        201: t.Object({
          data: t.String({ default: "OK" }),
        }),
        400: t.Object({
          error: t.String(),
        }),
      },
      detail: {
        tags: ["Users"],
        summary: "Register User Baru",
        description: "Digunakan untuk mendaftarkan pengguna baru ke database.",
      },
    }
  )

  .post(
    "/login",
    async ({ body, set }) => {
      try {
        const token = await loginUser(body.email, body.password);
        return { data: token };
      } catch (error) {
        return handleClientError(error, set);
      }
    },
    {
      body: t.Object({
        email: t.String(),
        password: t.String(),
      }),
      response: {
        200: t.Object({
          data: t.String({ default: "uuid-session-token" }),
        }),
        400: t.Object({
          error: t.String(),
        }),
      },
      detail: {
        tags: ["Users"],
        summary: "Login User",
        description:
          "Mendapatkan Bearer token yang digunakan untuk mengakses endpoint yang dilindungi.",
      },
    }
  )

  .get("/current", async ({ request, set }) => {
    try {
      const token = extractBearerToken(request);
      if (!token) {
        set.status = 401;
        return { error: "Unauthorized" };
      }
      const user = await getCurrentUser(token);
      return { data: user };
    } catch {
      set.status = 401;
      return { error: "Unauthorized" };
    }
  }, {
    response: {
      200: t.Object({
        data: t.Object({
          id: t.String(),
          name: t.String(),
          email: t.String(),
          created_at: t.Date(),
        }),
      }),
      401: t.Object({
        error: t.String({ default: "Unauthorized" }),
      }),
    },
    detail: {
      tags: ["Users"],
      summary: "Dapatkan Data Diri Pengguna Aktif",
      security: [{ bearerAuth: [] }],
    },
  })

  .delete("/logout", async ({ request, set }) => {
    try {
      const token = extractBearerToken(request);
      if (!token) {
        set.status = 401;
        return { error: "Unauthorized" };
      }
      const result = await logoutUser(token);
      return { data: result };
    } catch {
      set.status = 401;
      return { error: "Unauthorized" };
    }
  }, {
    response: {
      200: t.Object({
        data: t.String({ default: "OK" }),
      }),
      401: t.Object({
        error: t.String({ default: "Unauthorized" }),
      }),
    },
    detail: {
      tags: ["Users"],
      summary: "Logout Pengguna",
      security: [{ bearerAuth: [] }],
    },
  });
