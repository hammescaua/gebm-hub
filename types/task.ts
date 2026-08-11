export type TaskStatus =
    | "TODO"
    | "IN_PROGRESS"
    | "DONE"

export type TaskPriority =
    | "LOW"
    | "MEDIUM"
    | "HIGH"

export type Task = {
    id: string
    title: string
    description?: string
    priority: TaskPriority
    status: TaskStatus
    position: number
    assignee?: string
    dueDate?: string
}

export type KanbanColumn = {
    id: TaskStatus
    title: string
}