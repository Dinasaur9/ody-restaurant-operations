import { createApp } from "./app";
import { createDatabase } from "./db/client";
import type { Env } from "./env";

export default {
  fetch(request: Request, env: Env, executionContext: ExecutionContext) {
    const app = createApp(createDatabase(env.DATABASE_URL));
    return app.fetch(request, env, executionContext);
  },
};
