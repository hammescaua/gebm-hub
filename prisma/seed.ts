import { hashPassword } from "@/lib/auth";
import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Iniciando seeding do banco de dados...\n");

    // ─── Times ────────────────────────────────────────────────────────────────

    const teams = await Promise.all([
        prisma.team.create({
            data: {
                name: "Diretoria",
                description: "Membros da diretoria central do grêmio",
                code: "GREMIO-DIR",
            },
        }),
        prisma.team.create({
            data: {
                name: "Esportes",
                description: "Equipe responsável pelos eventos esportivos",
                code: "GREMIO-ESP",
            },
        }),
        prisma.team.create({
            data: {
                name: "Cultura",
                description: "Equipe responsável pelos eventos culturais",
                code: "GREMIO-CUL",
            },
        }),
        prisma.team.create({
            data: {
                name: "Marketing",
                description: "Equipe de comunicação e marketing do grêmio",
                code: "GREMIO-MKT",
            },
        }),
    ]);

    // teams[0] = Diretoria
    // teams[1] = Esportes
    // teams[2] = Cultura
    // teams[3] = Marketing

    console.log("✅ Times criados:", teams.map((t) => t.name).join(", "));

    // ─── Usuários ─────────────────────────────────────────────────────────────

    const sampleUsers = [
        // Diretoria central
        { name: "Marina Souza", email: "marina@gremio.escola.br", role: Role.PRESIDENTE, team: teams[0] },
        { name: "Rafael Torres", email: "rafael@gremio.escola.br", role: Role.VICE_PRESIDENTE, team: teams[0] },
        { name: "Julia Mendes", email: "julia@gremio.escola.br", role: Role.TESOUREIRO, team: teams[0] },
        { name: "Carlos Neto", email: "carlos@gremio.escola.br", role: Role.VICE_TESOUREIRO, team: teams[0] },
        { name: "Beatriz Lima", email: "bia@gremio.escola.br", role: Role.SECRETARIO, team: teams[0] },
        { name: "Lucas Pereira", email: "lucas@gremio.escola.br", role: Role.VICE_SECRETARIO, team: teams[0] },
        // Esportes
        { name: "Pedro Alves", email: "pedro@gremio.escola.br", role: Role.DIRETOR_ESPORTES, team: teams[1] },
        { name: "Fernanda Costa", email: "fernanda@gremio.escola.br", role: Role.VICE_DIRETOR_ESPORTES, team: teams[1] },
        // Cultura
        { name: "Ana Clara", email: "anaclara@gremio.escola.br", role: Role.DIRETOR_CULTURA, team: teams[2] },
        { name: "Victor Hugo", email: "victor@gremio.escola.br", role: Role.VICE_DIRETOR_CULTURA, team: teams[2] },
        // Marketing
        { name: "Isabela Ramos", email: "isa@gremio.escola.br", role: Role.DIRETOR_MARKETING, team: teams[3] },
        { name: "Thiago Melo", email: "thiago@gremio.escola.br", role: Role.VICE_DIRETOR_MARKETING, team: teams[3] },
        // Ajudantes e usuários gerais
        { name: "Camila Ferreira", email: "camila@gremio.escola.br", role: Role.AJUDANTE, team: teams[1] },
        { name: "Diego Santos", email: "diego@gremio.escola.br", role: Role.AJUDANTE, team: teams[2] },
        { name: "Larissa Gomes", email: "larissa@gremio.escola.br", role: Role.USUARIO, team: teams[0] },
    ];

    for (const userData of sampleUsers) {
        await prisma.user.create({
            data: {
                name: userData.name,
                email: userData.email,
                password: await hashPassword("gremio123"),
                role: userData.role,
                teamId: userData.team.id,
            },
        });
    }

    console.log(`✅ ${sampleUsers.length} usuários criados.`);
    console.log("\n🔑 Senha padrão de todos os usuários: gremio123");
    console.log("📌 Lembre de alterar as senhas em produção!\n");
    console.log("✅ Database seeded successfully!");
}

main()
    .catch((e) => {
        console.error("❌ Seeding error:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });