"use client"

import { useState } from "react"

import {
    DndContext,
    DragOverlay,
    PointerSensor,
    KeyboardSensor,
    closestCorners,
    useSensor,
    useSensors,
    type DragStartEvent,
    type DragEndEvent,
    type DragCancelEvent,
} from "@dnd-kit/core"

import {
    arrayMove,
    sortableKeyboardCoordinates,
} from "@dnd-kit/sortable"

import type {
    Task,
    TaskStatus,
} from "@/types/task"

import type {
    TaskFormData,
} from "../schemas/task-schema"

import {
    mockTasks,
    columns,
} from "../data/mock-tasks"

import { KanbanColumn } from "./kanban-column"
import { TaskForm } from "./task-form"

import { Button } from "@/components/ui/button"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

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

    const [activeTask, setActiveTask] =
        useState<Task | null>(null)

    const [isCreateModalOpen, setIsCreateModalOpen] =
        useState(false)

    const [editingTask, setEditingTask] =
        useState<Task | null>(null)

    const [deletingTask, setDeletingTask] =
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
                            item.status === newStatus
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
                    data.description ||
                    undefined,
                priority: data.priority,
                status: "TODO",
                position: todoTasks.length,
                assignee:
                    data.assignee ||
                    undefined,
                dueDate:
                    data.dueDate ||
                    undefined,
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
                        priority:
                            data.priority,
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

    function handleDragStart(
        event: DragStartEvent
    ) {
        const taskId = String(event.active.id)

        const task = tasks.find(
            (task) => task.id === taskId
        )

        if (!task) {
            return
        }

        setActiveTask(task)
    }

    function handleDragEnd(
        event: DragEndEvent
    ) {
        const {
            active,
            over,
        } = event

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

        // Reorder inside the same column.
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

        // Move to another column.
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

    function handleDragCancel(
        _event: DragCancelEvent
    ) {
        setActiveTask(null)
    }

    return (
        <div className="space-y-6">
            {/* Board header */}
            <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
                        Tarefas
                    </h1>

                    <p className="mt-1 text-sm text-zinc-500">
                        Organize e acompanhe as
                        atividades do GEBM.
                    </p>
                </div>

                <Button
                    type="button"
                    onClick={() =>
                        setIsCreateModalOpen(
                            true
                        )
                    }
                >
                    + Nova tarefa
                </Button>
            </header>

            {/* Kanban board */}
            <DndContext
                sensors={sensors}
                onDragEnd={handleDragEnd}
                collisionDetection={
                    closestCorners
                }
            >
                <div className="grid gap-4 md:grid-cols-3">
                    {columns.map(
                        (column) => (
                            <KanbanColumn
                                key={column.id}
                                id={column.id}
                                title={
                                    column.title
                                }
                                tasks={tasks
                                    .filter(
                                        (
                                            task
                                        ) =>
                                            task.status ===
                                            column.id
                                    )
                                    .sort(
                                        (
                                            a,
                                            b
                                        ) =>
                                            a.position -
                                            b.position
                                    )}
                                onEdit={
                                    setEditingTask
                                }
                                onDelete={
                                    setDeletingTask
                                }
                            />
                        )
                    )}
                </div>
            </DndContext>

            {/* Create task dialog */}
            <Dialog
                open={
                    isCreateModalOpen
                }
                onOpenChange={
                    setIsCreateModalOpen
                }
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Nova tarefa
                        </DialogTitle>

                        <DialogDescription>
                            Crie uma nova
                            tarefa para o
                            GEBM.
                        </DialogDescription>
                    </DialogHeader>

                    <TaskForm
                        onSubmit={(data) => {
                            createTask(data)
                            setIsCreateModalOpen(
                                false
                            )
                        }}
                        onCancel={() =>
                            setIsCreateModalOpen(
                                false
                            )
                        }
                    />
                </DialogContent>
            </Dialog>

            {/* Edit task dialog */}
            <Dialog
                open={
                    editingTask !== null
                }
                onOpenChange={(open) => {
                    if (!open) {
                        setEditingTask(null)
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Editar tarefa
                        </DialogTitle>

                        <DialogDescription>
                            Atualize as
                            informações da
                            tarefa.
                        </DialogDescription>
                    </DialogHeader>

                    {editingTask && (
                        <TaskForm
                            defaultValues={{
                                title:
                                    editingTask.title,

                                description:
                                    editingTask.description ??
                                    "",

                                priority:
                                    editingTask.priority,

                                assignee:
                                    editingTask.assignee ??
                                    "",

                                dueDate:
                                    editingTask.dueDate ??
                                    "",
                            }}
                            submitLabel="Salvar alterações"
                            onSubmit={(data) => {
                                updateTask(
                                    editingTask.id,
                                    data
                                )

                                setEditingTask(
                                    null
                                )
                            }}
                            onCancel={() =>
                                setEditingTask(
                                    null
                                )
                            }
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete confirmation */}
            <AlertDialog
                open={
                    deletingTask !== null
                }
                onOpenChange={(open) => {
                    if (!open) {
                        setDeletingTask(
                            null
                        )
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Excluir tarefa?
                        </AlertDialogTitle>

                        <AlertDialogDescription>
                            {deletingTask
                                ? `A tarefa "${deletingTask.title}" será excluída permanentemente. Essa ação não poderá ser desfeita.`
                                : "Essa ação não poderá ser desfeita."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel>
                            Cancelar
                        </AlertDialogCancel>

                        <AlertDialogAction
                            variant="destructive"
                            onClick={() => {
                                if (
                                    deletingTask
                                ) {
                                    deleteTask(
                                        deletingTask.id
                                    )
                                }

                                setDeletingTask(
                                    null
                                )
                            }}
                        >
                            Excluir tarefa
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
