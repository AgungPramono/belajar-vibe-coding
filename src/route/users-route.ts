import { Elysia } from "elysia";
import { createUser, loginUser, getCurrentUser } from "../service/users-service";

export const usersRoute = new Elysia({ prefix: "/api/users" }).post(
  "/",
  async ({ body, set }) => {
    try {
      const { name, email, password } = body as {
        name: string;
        email: string;
        password: string;
      };
      await createUser(name, email, password);
      return { data: "OK" };
    } catch (error) {
      set.status = 400;
      return { error: (error as Error).message };
    }
  }
)
  .post("/login", async ({ body, set }) => {
    try {
      const { email, password } = body as {
        email: string;
        password: string;
      };
      const token = await loginUser(email, password);
      return { data: token };
    } catch (error) {
      set.status = 400;
      return { error: (error as Error).message };
    }
  })
  .post("/current", async ({ request, set }) => {
    try {
      const authHeader = request.headers.get("authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        set.status = 401;
        return { error: "Unauthorized" };
      }
      const token = authHeader.replace("Bearer ", "");
      const user = await getCurrentUser(token);
      return { data: user };
    } catch (error) {
      set.status = 401;
      return { error: "Unauthorized" };
    }
  });
