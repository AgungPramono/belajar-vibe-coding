import { Elysia } from "elysia";
import { usersRoute } from "./route/users-route";

const app = new Elysia()
  .use(usersRoute)
  .listen(3000);

console.log(`Server running at http://localhost:${app.server?.port}`);
