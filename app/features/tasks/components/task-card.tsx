import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import type {
    Task,
    TaskStatus,
} from "@/types/task"

type TaskCardProps = {
    task: Task;
    onMoveTask: (
        taskId: string,
        newStatus: TaskStatus
    ) => void;
    onEdit: (task: Task) => void;
    onDelete: (taskId: string) => void;
}

export function TaskCard({
    task,
    onMoveTask,
    onEdit,
    onDelete,
}: TaskCardProps) {

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({
        id: task.id,
    })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    return (
        <article
            className="text-white"
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
        >
            <h3>{task.title}</h3>

            {task.description && (
                <p>{task.description}</p>
            )}

            <p>
                Prioridade: {task.priority}
            </p>

            {task.assignee && (
                <p>
                    Responsável: {task.assignee}
                </p>
            )}

            {task.dueDate && (
                <p>
                    Prazo: {task.dueDate}
                </p>
            )}

            {/* Botões temporários */}
            <div>
                {task.status !== "TODO" && (
                    <button
                        onClick={() =>
                            onMoveTask(
                                task.id,
                                "TODO"
                            )
                        }
                    >
                        A fazer
                    </button>
                )}

                {task.status !== "IN_PROGRESS" && (
                    <button
                        onClick={() =>
                            onMoveTask(
                                task.id,
                                "IN_PROGRESS"
                            )
                        }
                    >
                        Em andamento
                    </button>
                )}

                {task.status !== "DONE" && (
                    <button
                        onClick={() =>
                            onMoveTask(
                                task.id,
                                "DONE"
                            )
                        }
                    >
                        Concluído
                    </button>
                )}

                <button
                    onClick={() => onEdit(task)}
                >
                    Editar
                </button>

                <button
                    onClick={() => onDelete(task.id)}
                >
                    Excluir
                </button>
            </div>
        </article>
    )
}