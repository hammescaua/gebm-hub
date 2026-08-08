import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

// Em desenvolvimento o Next recarrega os arquivos a cada mudança ("hot reload").
// Sem este truque do globalThis, cada recarga criaria uma conexão nova com o banco
// até o Postgres recusar. Guardamos uma instância única e reaproveitamos.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
    });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
