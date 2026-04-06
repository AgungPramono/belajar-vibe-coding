import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { usersRoute } from "./route/users-route";

export const app = new Elysia()
  .use(swagger({
    path: '/swagger',
    documentation: {
      info: {
        title: 'Belajar Vibe Coding API',
        version: '1.0.0',
        description: 'API Documentation untuk fitur User Authentication'
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        }
      }
    }
  }))
  .use(usersRoute);

if (process.env.NODE_ENV !== "test") {
  app.listen(3000);
  console.log(`Server running at http://localhost:${app.server?.port}`);
  console.log("Routes:", app.routes.map(r => `${r.method} ${r.path}`));
}

