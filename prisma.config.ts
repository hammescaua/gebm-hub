// Configuração do Prisma CLI (migrations, geração do client).
// O import de dotenv carrega as variáveis do arquivo .env — sem ele o CLI não enxerga a DATABASE_URL.
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
    schema: "prisma/schema.prisma",
    migrations: {
        path: "prisma/migrations",
    },
    datasource: {
        url: process.env["DATABASE_URL"],
    },
});
