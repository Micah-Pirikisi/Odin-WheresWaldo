// src/lib/prisma.js
import "dotenv/config";
import pkg from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const { PrismaClient } = pkg;

// Aiven requires SSL - ensure the connection string includes the SSL requirement
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("ERROR: DATABASE_URL environment variable is not set");
  process.exit(1);
}

let prisma;
try {
  prisma = new PrismaClient({
    adapter: new PrismaPg({
      connectionString: databaseUrl,
      ssl: { rejectUnauthorized: false },
    }),
  });
  console.log("✓ Prisma Client initialized");
} catch (err) {
  console.error("ERROR: Failed to initialize Prisma Client:", err.message);
  process.exit(1);
}

export default prisma;
