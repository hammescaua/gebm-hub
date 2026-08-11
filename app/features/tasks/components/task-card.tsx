"use client"

import {
    useSortable,
} from "@dnd-kit/sortable"

import {
    CSS,
} from "@dnd-kit/utilities"

import type {
    Task,
} from "@/types/task"

type TaskCardProps = {
    task: Task
    onEdit: (task: Task) => void
    onDelete: (taskId: string) => void
}

export function TaskCard({
    task,
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
        transform:
            CSS.Transform.toString(
                transform
            ),
        transition,
    }

    return (
        <article
            ref={setNodeRef}
            style={style}
            {...attributes}
        >
            <div>
                <button
                    type="button"
                    {...listeners}
                    aria-label={`Arrastar ${task.title}`}
                >
                    ⋮⋮
                </button>

                <h3>
                    {task.title}
                </h3>
            </div>

            {task.description && (
                <p>
                    {task.description}
                </p>
            )}

            <p>
                Prioridade:{" "}
                {task.priority}
            </p>

            {task.assignee && (
                <p>
                    Responsável:{" "}
                    {task.assignee}
                </p>
            )}

            {task.dueDate && (
                <p>
                    Prazo:{" "}
                    {task.dueDate}
                </p>
            )}

            <div>
                <button
                    type="button"
                    onClick={() =>
                        onEdit(task)
                    }
                >
                    Editar
                </button>

                <button
                    type="button"
                    onClick={() =>
                        onDelete(
                            task.id
                        )
                    }
                >
                    Excluir
                </button>
            </div>
        </article>
    )
}