# Plano do hub do grêmio (gebm-hub)

> Guia vivo do projeto. Vamos marcando os checkboxes conforme avançamos.
> Regra do jogo em cada passo: Claude explica o conceito → construímos juntos → **você altera algo sozinho** pra fixar.

## O que é

Plataforma web para organizar o grêmio estudantil: membros, eventos, tarefas, caixa e comunicação interna. Primeiro para a diretoria usar; depois ganha login por cargo.

**Stack:** Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4 + shadcn/ui + Prisma 7 + PostgreSQL.
**Convenção:** código em inglês, conteúdo/interface em português.

## Telas do MVP

| Tela | Rota | Resumo |
|---|---|---|
| Dashboard | `/` | Resumo geral: próximos eventos, tarefas, saldo, último aviso |
| Membros | `/membros` | Lista com cargo e turma; adicionar, editar, remover |
| Eventos | `/eventos` | Cards com data, local, status e responsáveis |
| Tarefas | `/tarefas` | Quadro a fazer / fazendo / feito, com prazo e responsável |
| Caixa | `/caixa` | Entradas e saídas, saldo calculado automaticamente |
| Mural | `/mural` | Avisos internos, mais recente primeiro |

**Futuro (pós-MVP):** login com permissões por cargo, atas de reunião, enquetes para os alunos.

## Modelo de dados

- **Task** *(já no schema do Prisma)*: title, description, status (todo | progress | done), priority (low | medium | high), assignee?, dueDate?, createdAt
- **User** *(você modelou em `types/index.tsx`)*: name, email, role (enum `Role` com os cargos reais do grêmio), team?, createdAt
- **Team** *(você modelou)*: name, description?, code (código de convite), members
- **Evento, Movimentação (caixa), Aviso (mural):** ainda a modelar, quando fizermos essas telas

> User/Team/Role hoje são só types do TypeScript — eles entram no schema do Prisma na fase 4 (login). Detalhe pra lembrar: enums do Prisma não aceitam hífen nem acento nos valores, então `"VICE-PRESIDENTE"` vai precisar de um ajuste (`@map` ou valor `VICE_PRESIDENTE`).

---

## Fase 1 — maquete (telas estáticas com dados de mentira)

- [x] **1. Criar o projeto** ✓ feito por você (gebm-hub, com shadcn/ui de bônus)
- [x] **2. `git init` + primeiro commit** ✓ (veio do create-next-app)
- [ ] **3. Limpar a página inicial** — a home ainda é o template padrão do Next
- [ ] **4. Layout com menu lateral** — header/footer existem como esqueleto, falta o conteúdo
- [ ] **5. Criar as 6 rotas** — feita até agora: `/tarefas`
- [ ] **6. Dados mock + tela de membros** — mock de tarefas já existe (`lib/mock-tasks.ts`); falta o de membros
- [ ] **7. Telas de eventos e mural** com componentes de card
- [x] **8. Tela de tarefas (quadro)** ✓ 31 jul — kanban com 3 colunas, prioridade, responsável e prazo
- [ ] **9. Tela do caixa** com saldo calculado → aprende: derivar dados (`reduce`)
- [ ] **10. Dashboard** juntando o resumo de tudo → aprende: composição

## Fase 2 — interatividade (os botões funcionam)

- [ ] **11. Primeiro `useState`** → ✓ antecipado no quadro (`kanban-board.tsx`); falta aplicar no mural (publicar aviso)
- [ ] **12. Formulário de novo membro** → aprende: formulários controlados
- [ ] **13. Criar evento e mover tarefa** → mover já funciona (em memória); falta criar tarefa/evento
- [ ] **14. Lançar entrada/saída no caixa** → aprende: números e formatação de moeda

## Fase 3 — dados de verdade (nada se perde)

- ~~15. localStorage~~ — **pulamos**: você já tem PostgreSQL, fomos direto pro banco de verdade
- [ ] **16. Banco PostgreSQL + Prisma** → **EM ANDAMENTO**: schema pronto (`prisma/schema.prisma`), client gerado. Falta: colocar sua senha no `.env` e rodar `npx prisma migrate dev --name init`
- [ ] **17. Server actions:** o quadro lê e grava no banco → aprende: servidor vs navegador

## Fase 4 — login e cargos

- [ ] **18. Login com Auth.js** → aprende: autenticação e sessão (bcryptjs já instalado por você)
- [ ] **19. Permissões por cargo** usando seu enum `Role` → aprende: autorização

## Fase 5 — no ar

- [ ] **20. Subir o código pro GitHub** → aprende: repositório remoto
- [ ] **21. Deploy na Vercel** (trocando o banco local por um da nuvem) → aprende: produção vs desenvolvimento
