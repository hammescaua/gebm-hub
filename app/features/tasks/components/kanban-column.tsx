import { TaskCard } from "./task-card"
import { TaskPriority, TaskStatus, Task } from "@/types/task"
import { useDroppable } from "@dnd-kit/core"
import { SortableContext } from "@dnd-kit/sortable"

type KanbanColumnProps = {
    id: TaskStatus
    title: string
    tasks: Task[]
    onMoveTask: (
        taskId: string,
        newStatus: TaskStatus
    ) => void
    onEdit: (task: Task) => void;
    onDelete: (taskId: string) => void;
}

export function KanbanColumn({
    id,
    title,
    tasks,
    onMoveTask,
    onEdit,
    onDelete,
}: KanbanColumnProps) {

    const {
        setNodeRef,
        isOver,
    } = useDroppable({
        id,
    })

    return (
        <section ref={setNodeRef}>
            <header>
                <h2>{title}</h2>
                <span>{tasks.length}</span>
            </header>
            <SortableContext
                items={tasks.map((task) => task.id)}
            >
                <div>
                    {tasks.map((task) => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            onMoveTask={onMoveTask}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            </SortableContext>
        </section>
    )
}