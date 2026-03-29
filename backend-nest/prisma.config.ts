import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Use DIRECT_URL (port 5432) for CLI commands (db push, migrate)
    // This bypasses pgBouncer which hangs on schema operations
    url: env("DIRECT_URL"),
  },
});
