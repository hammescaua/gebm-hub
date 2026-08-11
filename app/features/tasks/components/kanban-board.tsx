"use client"

import { useState } from "react"

import type {
    Task,
    TaskStatus,
} from "@/types/task"

import type {
    TaskFormData,
} from "../schemas/task-schema"

import { KanbanColumn } from "./kanban-column"
import { TaskForm } from "./task-form"

import {
    mockTasks,
    columns,
} from "../data/mock-tasks"

import {
    DndContext,
    PointerSensor,
    KeyboardSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core"

import {
    arrayMove,
    sortableKeyboardCoordinates,
} from "@dnd-kit/sortable"

function isTaskStatus(
    value: string
): value is TaskStatus {
    return (
        value === "TODO" ||
        value === "IN_PROGRESS" ||
        value === "DONE"
    )
}

export default function KanbanBoard() {

    const [tasks, setTasks] =
        useState<Task[]>(mockTasks)

    const [isCreateModalOpen, setIsCreateModalOpen] =
        useState(false)

    const [editingTask, setEditingTask] =
        useState<Task | null>(null)

    const sensors = useSensors(
        useSensor(
            PointerSensor,
            {
                activationConstraint: {
                    distance: 5,
                },
            }
        ),

        useSensor(
            KeyboardSensor,
            {
                coordinateGetter:
                    sortableKeyboardCoordinates,
            }
        )
    )

    function moveTask(
        taskId: string,
        newStatus: TaskStatus,
        overId?: string
    ) {
        setTasks((currentTasks) => {
            const task = currentTasks.find(
                (task) => task.id === taskId
            )

            if (!task) {
                return currentTasks
            }

            if (task.status === newStatus) {
                return currentTasks
            }

            const sourceTasks = currentTasks
                .filter(
                    (item) =>
                        item.status === task.status &&
                        item.id !== taskId
                )
                .sort(
                    (a, b) =>
                        a.position - b.position
                )

            const destinationTasks =
                currentTasks
                    .filter(
                        (item) =>
                            item.status ===
                            newStatus
                    )
                    .sort(
                        (a, b) =>
                            a.position - b.position
                    )

            const targetIndex = overId
                ? destinationTasks.findIndex(
                    (item) =>
                        item.id === overId
                )
                : destinationTasks.length

            const insertIndex =
                targetIndex === -1
                    ? destinationTasks.length
                    : targetIndex

            destinationTasks.splice(
                insertIndex,
                0,
                {
                    ...task,
                    status: newStatus,
                }
            )

            const updatedSource =
                sourceTasks.map(
                    (item, index) => ({
                        ...item,
                        position: index,
                    })
                )

            const updatedDestination =
                destinationTasks.map(
                    (item, index) => ({
                        ...item,
                        position: index,
                    })
                )

            const updatedTasks = new Map(
                [
                    ...updatedSource,
                    ...updatedDestination,
                ].map((item) => [
                    item.id,
                    item,
                ])
            )

            return currentTasks.map(
                (item) =>
                    updatedTasks.get(item.id) ??
                    item
            )
        })
    }

    function reorderTasks(
        activeId: string,
        overId: string
    ) {
        setTasks((currentTasks) => {
            const activeTask = currentTasks.find(
                (task) => task.id === activeId
            )

            const overTask = currentTasks.find(
                (task) => task.id === overId
            )

            if (!activeTask || !overTask) {
                return currentTasks
            }

            if (
                activeTask.status !==
                overTask.status
            ) {
                return currentTasks
            }

            const columnTasks = currentTasks
                .filter(
                    (task) =>
                        task.status ===
                        activeTask.status
                )
                .sort(
                    (a, b) =>
                        a.position - b.position
                )

            const oldIndex =
                columnTasks.findIndex(
                    (task) =>
                        task.id === activeId
                )

            const newIndex =
                columnTasks.findIndex(
                    (task) =>
                        task.id === overId
                )

            if (
                oldIndex === -1 ||
                newIndex === -1 ||
                oldIndex === newIndex
            ) {
                return currentTasks
            }

            const reorderedTasks = arrayMove(
                columnTasks,
                oldIndex,
                newIndex
            )

            const positionById =
                new Map(
                    reorderedTasks.map(
                        (task, index) => [
                            task.id,
                            index,
                        ]
                    )
                )

            return currentTasks.map(
                (task) => {
                    const position =
                        positionById.get(
                            task.id
                        )

                    if (
                        position === undefined
                    ) {
                        return task
                    }

                    return {
                        ...task,
                        position,
                    }
                }
            )
        })
    }

    function createTask(
        data: TaskFormData
    ) {
        setTasks((currentTasks) => {
            const todoTasks =
                currentTasks.filter(
                    (task) =>
                        task.status === "TODO"
                )

            const newTask: Task = {
                id: crypto.randomUUID(),
                title: data.title,
                description:
                    data.description || undefined,
                priority: data.priority,
                status: "TODO",
                position: todoTasks.length,
                assignee:
                    data.assignee || undefined,
                dueDate:
                    data.dueDate || undefined,
            }

            return [
                ...currentTasks,
                newTask,
            ]
        })
    }

    function updateTask(
        taskId: string,
        data: TaskFormData
    ) {
        setTasks((currentTasks) =>
            currentTasks.map((task) =>
                task.id === taskId
                    ? {
                        ...task,
                        title: data.title,
                        description:
                            data.description ||
                            undefined,
                        priority: data.priority,
                        assignee:
                            data.assignee ||
                            undefined,
                        dueDate:
                            data.dueDate ||
                            undefined,
                    }
                    : task
            )
        )
    }

    function deleteTask(
        taskId: string
    ) {
        setTasks((currentTasks) => {
            const task = currentTasks.find(
                (item) =>
                    item.id === taskId
            )

            if (!task) {
                return currentTasks
            }

            return currentTasks
                .filter(
                    (item) =>
                        item.id !== taskId
                )
                .map((item) => {
                    if (
                        item.status !==
                        task.status
                    ) {
                        return item
                    }

                    if (
                        item.position >
                        task.position
                    ) {
                        return {
                            ...item,
                            position:
                                item.position - 1,
                        }
                    }

                    return item
                })
        })
    }

    function handleDragEnd(
        event: DragEndEvent
    ) {
        const { active, over } = event

        if (!over) {
            return
        }

        const activeId =
            String(active.id)

        const overId =
            String(over.id)

        if (activeId === overId) {
            return
        }

        const activeTask =
            tasks.find(
                (task) =>
                    task.id === activeId
            )

        const overTask =
            tasks.find(
                (task) =>
                    task.id === overId
            )

        if (!activeTask) {
            return
        }

        // Reordenar dentro da mesma coluna
        if (
            overTask &&
            activeTask.status ===
            overTask.status
        ) {
            reorderTasks(
                activeId,
                overId
            )

            return
        }

        // Mover para outra coluna
        const targetStatus =
            overTask?.status ?? overId

        if (
            !isTaskStatus(
                targetStatus
            )
        ) {
            return
        }

        moveTask(
            activeId,
            targetStatus,
            overTask?.id
        )
    }

    return (
        <div>
            <DndContext
                sensors={sensors}
                onDragEnd={handleDragEnd}
            >
                {columns.map((column) => (
                    <KanbanColumn
                        key={column.id}
                        id={column.id}
                        title={column.title}
                        tasks={tasks
                            .filter((task) => task.status === column.id)
                            .sort((a, b) => a.position - b.position)
                        }
                        onEdit={setEditingTask}
                        onDelete={deleteTask}
                    />
                ))}
            </DndContext>
            <div>
                <button
                    type="button"
                    onClick={() =>
                        setIsCreateModalOpen(true)
                    }
                >
                    + Nova tarefa
                </button>
                {isCreateModalOpen && (
                    <TaskForm
                        onSubmit={(data) => {
                            createTask(data)
                            setIsCreateModalOpen(false)
                        }}
                    />
                )}
            </div>
            <div>
                {editingTask && (
                    <TaskForm
                        defaultValues={{
                            title: editingTask.title,
                            description:
                                editingTask.description ?? "",
                            priority: editingTask.priority,
                            assignee:
                                editingTask.assignee ?? "",
                            dueDate:
                                editingTask.dueDate ?? "",
                        }}
                        submitLabel="Salvar alterações"
                        onSubmit={(data) => {
                            updateTask(
                                editingTask.id,
                                data
                            )

                            setEditingTask(null)
                        }}
                    />
                )}
            </div>
        </div>
    )
}
