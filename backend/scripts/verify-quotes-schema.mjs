import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

try {
  await prisma.$queryRaw`
    SELECT "id", "contactPhone", "widthMm", "heightMm", "quantity"
    FROM "QuoteRequest"
    LIMIT 0
  `;

  await prisma.$queryRaw`
    SELECT "id" FROM "QuoteRequestImage" LIMIT 0
  `;

  console.log("OK: esquema de cotizaciones verificado.");
} catch (error) {
  console.error(
    "ERROR: falta el esquema de cotizaciones en la base de datos."
  );
  console.error(error);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}