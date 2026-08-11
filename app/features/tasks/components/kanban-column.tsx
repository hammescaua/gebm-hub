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
    onDelete: (taskId: string) => void
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
            data-over={isOver}
        >
            <header>
                <h2>{title}</h2>

                <span>
                    {tasks.length}
                </span>
            </header>

            <SortableContext
                items={tasks.map(
                    (task) => task.id
                )}
                strategy={
                    verticalListSortingStrategy
                }
            >
                <div>
                    {tasks.map(
                        (task) => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                onEdit={
                                    onEdit
                                }
                                onDelete={
                                    onDelete
                                }
                            />
                        )
                    )}
                </div>
            </SortableContext>
        </section>
    )
}