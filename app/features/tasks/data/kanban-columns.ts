import type { KanbanColumn } from "@/types/task"

export const columns: KanbanColumn[] = [
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
]