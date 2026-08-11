import { Task, KanbanColumn as KanbanColumnType } from "@/types/task"

export const mockTasks: Task[] = [
    {
        id: "1",
        title: "Criar cartaz",
        description: "Criar arte para divulgação do evento",
        priority: "HIGH",
        status: "TODO",
        position: 0,
        assignee: "João",
        dueDate: "2026-08-12",
    },
    {
        id: "2",
        title: "Organizar reunião",
        description: "Definir pauta da próxima reunião",
        priority: "MEDIUM",
        status: "IN_PROGRESS",
        position: 0,
        assignee: "Maria",
        dueDate: "2026-08-15",
    },
    {
        id: "3",
        title: "Comprar materiais",
        priority: "LOW",
        position: 0,
        status: "DONE",
        assignee: "Pedro",
    },
]

export const columns: KanbanColumnType[] = [
    {
        id: "TODO",
        title: "A fazer",
    },
    {
        id: "IN_PROGRESS",
        title: "Em andamento",
    },
    {
        id: "DONE",
        title: "Concluído",
    },
] as const