import { Elysia } from "elysia";
import { createUser, loginUser } from "../service/users-service";

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
  });
