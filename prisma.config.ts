import * as path from "node:path";
import * as dotenv from "dotenv";
import { defineConfig } from "prisma/config";

dotenv.config({ path: path.resolve(__dirname, ".env") });

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL no está definida. Revisá apps/api/.env");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: { url },
});