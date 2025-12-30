import "dotenv/config";
import { defineConfig } from "prisma/config";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

export default defineConfig({
  schema: "prisma/schema.prisma",
  adapter, // required in Prisma 7
  migrations: {
    path: "prisma/migrations",
  },
});