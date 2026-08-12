"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

import type { Task } from "@/types/task"

import TaskCardContent from "./task-card-content"

type TaskCardProps = {
    task: Task
    onEdit: (task: Task) => void
    onDelete: (task: Task) => void
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
        isDragging,
    } = useSortable({
        id: task.id,
    })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    return (
        <article
            ref={setNodeRef}
            style={style}
            className={[
                "group relative rounded-xl border",
                "border-white/10 bg-zinc-900/80",
                "p-4 shadow-sm",
                "transition-all duration-200",
                "hover:border-white/20",
                "hover:bg-zinc-900",
                "hover:shadow-lg",
                isDragging
                    ? "z-50 opacity-40"
                    : "",
            ].join(" ")}
        >
            <TaskCardContent
                task={task}
                onEdit={onEdit}
                onDelete={onDelete}
                dragHandleProps={{
                    attributes,
                    listeners,
                }}
            />
        </article>
    )
}
