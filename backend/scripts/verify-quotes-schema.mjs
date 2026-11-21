import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

import { PrismaClient } from "@prisma/client";

const backendDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);

dotenv.config({
  path: path.join(backendDir, ".env"),
});

if (!process.env.DATABASE_URL) {
  console.error(
    "ERROR: DATABASE_URL no está definida (revisá backend/.env en el servidor)."
  );
  process.exit(1);
}

const prisma = new PrismaClient();

const quoteInclude = {
  user: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
    },
  },
  checkoutSession: {
    select: {
      id: true,
      status: true,
    },
  },
  images: {
    orderBy: {
      sortOrder: "asc",
    },
  },
};

try {
  await prisma.$queryRaw`
    SELECT "quoteId" FROM "CheckoutSession" LIMIT 0
  `;

  await prisma.quoteRequest.findMany({
    take: 1,
    include: quoteInclude,
  });

  await prisma.quoteRequest.count({
    where: { status: "PENDING" },
  });

  console.log(
    "OK: cotizaciones verificadas contra",
    new URL(process.env.DATABASE_URL).host
  );
} catch (error) {
  console.error(
    "ERROR: la base de datos de cotizaciones no coincide con el código."
  );
  console.error(error);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}