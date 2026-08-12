"use client"

import { useDroppable } from "@dnd-kit/core"
import {
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable"

import type {
    Task,
    TaskStatus,
} from "@/types/task"

import { TaskCard } from "./task-card"

type KanbanColumnProps = {
    id: TaskStatus
    title: string
    tasks: Task[]
    onEdit: (task: Task) => void
    onDelete: (task: Task) => void
}

export function KanbanColumn({
    id,
    title,
    tasks,
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
        <section
            ref={setNodeRef}
            aria-label={`Coluna ${title}`}
            className={[
                "flex min-h-125 flex-col",
                "rounded-xl border",
                "border-white/10",
                "bg-zinc-950/60",
                "p-3",
                "transition-all duration-200",
                isOver
                    ? "border-white/20 bg-zinc-900/80 ring-1 ring-white/10"
                    : "",
            ].join(" ")}
        >
            {/* Column header */}
            <header className="mb-3 flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold text-zinc-100">
                        {title}
                    </h2>

                    <span
                        className="
                        inline-flex min-w-6 items-center
                        justify-center rounded-md
                        bg-white/5 px-1.5 py-0.5
                        text-xs font-medium
                        text-zinc-400
                    "
                    >
                        {tasks.length}
                    </span>
                </div>
            </header>

            {/* Sortable tasks */}
            <SortableContext
                items={tasks.map(
                    (task) => task.id
                )}
                strategy={
                    verticalListSortingStrategy
                }
            >
                <div
                    className="
                    flex min-h-0 flex-1 flex-col gap-3
                "
                >
                    {tasks.length === 0 ? (
                        <div
                            className={[
                                "flex min-h-32 flex-1",
                                "items-center justify-center",
                                "rounded-lg border border-dashed",
                                "border-white/10",
                                "text-center text-sm",
                                "text-zinc-600",
                                "transition-colors",
                                isOver
                                    ? "border-white/20 text-zinc-400"
                                    : "",
                            ].join(" ")}
                        >
                            {isOver
                                ? "Solte a tarefa aqui"
                                : "Nenhuma tarefa"}
                        </div>
                    ) : (
                        tasks.map((task) => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                onEdit={onEdit}
                                onDelete={onDelete}
                            />
                        ))
                    )}
                </div>
            </SortableContext>
        </section>
    )
}
