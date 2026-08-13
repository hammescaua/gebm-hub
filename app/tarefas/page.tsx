import { getTasks } from "@/app/features/tasks/actions/task-actions"
import KanbanBoard from "@/app/features/tasks/components/kanban-board"

export default async function TasksPage() {
    const tasks = await getTasks()

    return (
        <KanbanBoard initialTasks={tasks} />
    )
}