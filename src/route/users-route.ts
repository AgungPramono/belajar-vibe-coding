import { Elysia } from "elysia";
import { createUser } from "../service/users-service";

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
);
