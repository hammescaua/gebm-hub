import type { Task } from "@/types/task"

type DatabaseTask = {
    id: string
    title: string
    description: string | null
    priority: Task["priority"]
    status: Task["status"]
    position: number
    assignee: string | null
    dueDate: Date | null
}

export function mapTaskToUI(
    task: DatabaseTask
): Task {
    return {
        id: task.id,
        title: task.title,
        description:
            task.description ?? undefined,
        priority: task.priority,
        status: task.status,
        position: task.position,
        assignee:
            task.assignee ?? undefined,
        dueDate: task.dueDate
            ? task.dueDate
                .toISOString()
                .split("T")[0]
            : undefined,
    }
}