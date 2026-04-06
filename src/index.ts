import { Elysia } from "elysia";
import { usersRoute } from "./route/users-route";

export const app = new Elysia()
  .use(usersRoute);

if (process.env.NODE_ENV !== "test") {
  app.listen(3000);
  console.log(`Server running at http://localhost:${app.server?.port}`);
}

