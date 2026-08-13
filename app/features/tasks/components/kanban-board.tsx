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
    columns,
} from "../data/mock-tasks"

import {
    createTask,
    updateTask,
    deleteTask,
    moveTask,
} from "../actions/task-actions"

import { KanbanColumn } from "./kanban-column"
import { TaskForm } from "./task-form"
import TaskCardContent from "./task-card-content"

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

type KanbanBoardProps = {
    initialTasks: Task[]
}

export default function KanbanBoard({
    initialTasks,
}: KanbanBoardProps) {
    const [tasks, setTasks] =
        useState<Task[]>(initialTasks)

    const [activeTask, setActiveTask] =
        useState<Task | null>(null)

    const [isCreateModalOpen, setIsCreateModalOpen] =
        useState(false)

    const [editingTask, setEditingTask] =
        useState<Task | null>(null)

    const [deletingTask, setDeletingTask] =
        useState<Task | null>(null)

    const [isSubmitting, setIsSubmitting] =
        useState(false)

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

    /*
     * ============================================================
     * CREATE
     * ============================================================
     */

    async function handleCreateTask(
        data: TaskFormData
    ) {
        try {
            setIsSubmitting(true)

            const newTask =
                await createTask(data)

            setTasks((currentTasks) => [
                ...currentTasks,
                newTask,
            ])

            setIsCreateModalOpen(false)
        } catch (error) {
            console.error(
                "Erro ao criar tarefa:",
                error
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    /*
     * ============================================================
     * UPDATE
     * ============================================================
     */

    async function handleUpdateTask(
        data: TaskFormData
    ) {
        if (!editingTask) {
            return
        }

        const taskId =
            editingTask.id

        try {
            setIsSubmitting(true)

            const updatedTask =
                await updateTask(
                    taskId,
                    data
                )

            setTasks((currentTasks) =>
                currentTasks.map((task) =>
                    task.id === taskId
                        ? updatedTask
                        : task
                )
            )

            setEditingTask(null)
        } catch (error) {
            console.error(
                "Erro ao atualizar tarefa:",
                error
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    /*
     * ============================================================
     * DELETE
     * ============================================================
     */

    async function handleDeleteTask() {
        if (!deletingTask) {
            return
        }

        const taskId =
            deletingTask.id

        try {
            setIsSubmitting(true)

            await deleteTask(taskId)

            setTasks((currentTasks) =>
                currentTasks
                    .filter(
                        (task) =>
                            task.id !== taskId
                    )
                    .map((task) => {
                        if (
                            task.status !==
                            deletingTask.status
                        ) {
                            return task
                        }

                        if (
                            task.position >
                            deletingTask.position
                        ) {
                            return {
                                ...task,
                                position:
                                    task.position - 1,
                            }
                        }

                        return task
                    })
            )

            setDeletingTask(null)
        } catch (error) {
            console.error(
                "Erro ao excluir tarefa:",
                error
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    /*
     * ============================================================
     * LOCAL REORDER
     * ============================================================
     *
     * Primeiro atualizamos a UI.
     * Depois persistimos no banco.
     */

    function reorderTasksLocally(
        activeId: string,
        overId: string
    ) {
        setTasks((currentTasks) => {
            const activeTask =
                currentTasks.find(
                    (task) =>
                        task.id === activeId
                )

            const overTask =
                currentTasks.find(
                    (task) =>
                        task.id === overId
                )

            if (
                !activeTask ||
                !overTask
            ) {
                return currentTasks
            }

            if (
                activeTask.status !==
                overTask.status
            ) {
                return currentTasks
            }

            const columnTasks =
                currentTasks
                    .filter(
                        (task) =>
                            task.status ===
                            activeTask.status
                    )
                    .sort(
                        (a, b) =>
                            a.position -
                            b.position
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

            const reorderedTasks =
                arrayMove(
                    columnTasks,
                    oldIndex,
                    newIndex
                )

            const positionById =
                new Map(
                    reorderedTasks.map(
                        (
                            task,
                            index
                        ) => [
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
                        position ===
                        undefined
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

    /*
     * ============================================================
     * MOVE BETWEEN COLUMNS
     * ============================================================
     */

    function moveTaskLocally(
        taskId: string,
        newStatus: TaskStatus,
        overId?: string
    ) {
        setTasks((currentTasks) => {
            const task =
                currentTasks.find(
                    (item) =>
                        item.id === taskId
                )

            if (!task) {
                return currentTasks
            }

            const sourceTasks =
                currentTasks
                    .filter(
                        (item) =>
                            item.status ===
                            task.status &&
                            item.id !== taskId
                    )
                    .sort(
                        (a, b) =>
                            a.position -
                            b.position
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
                            a.position -
                            b.position
                    )

            const targetIndex =
                overId
                    ? destinationTasks.findIndex(
                        (item) =>
                            item.id ===
                            overId
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
                    (
                        item,
                        index
                    ) => ({
                        ...item,
                        position:
                            index,
                    })
                )

            const updatedDestination =
                destinationTasks.map(
                    (
                        item,
                        index
                    ) => ({
                        ...item,
                        status:
                            newStatus,
                        position:
                            index,
                    })
                )

            const updatedTasks =
                new Map(
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
                    updatedTasks.get(
                        item.id
                    ) ?? item
            )
        })
    }

    /*
     * ============================================================
     * DRAG START
     * ============================================================
     */

    function handleDragStart(
        event: DragStartEvent
    ) {
        const taskId =
            String(event.active.id)

        const task =
            tasks.find(
                (item) =>
                    item.id === taskId
            )

        if (!task) {
            return
        }

        setActiveTask(task)
    }

    /*
     * ============================================================
     * DRAG END
     * ============================================================
     */

    async function handleDragEnd(
        event: DragEndEvent
    ) {
        const {
            active,
            over,
        } = event

        setActiveTask(null)

        if (!over) {
            return
        }

        const activeId =
            String(active.id)

        const overId =
            String(over.id)

        if (
            activeId === overId
        ) {
            return
        }

        const activeTask =
            tasks.find(
                (task) =>
                    task.id ===
                    activeId
            )

        const overTask =
            tasks.find(
                (task) =>
                    task.id ===
                    overId
            )

        if (!activeTask) {
            return
        }

        /*
         * --------------------------------------------------------
         * REORDER DENTRO DA MESMA COLUNA
         * --------------------------------------------------------
         */

        if (
            overTask &&
            activeTask.status ===
            overTask.status
        ) {
            const previousTasks =
                tasks

            reorderTasksLocally(
                activeId,
                overId
            )

            const reorderedColumn =
                tasks
                    .filter(
                        (task) =>
                            task.status ===
                            activeTask.status
                    )
                    .sort(
                        (a, b) =>
                            a.position -
                            b.position
                    )

            const oldIndex =
                reorderedColumn.findIndex(
                    (task) =>
                        task.id ===
                        activeId
                )

            const newIndex =
                reorderedColumn.findIndex(
                    (task) =>
                        task.id ===
                        overId
                )

            if (
                oldIndex === -1 ||
                newIndex === -1
            ) {
                return
            }

            try {
                await moveTask({
                    taskId: activeId,
                    status:
                        activeTask.status,
                    position:
                        newIndex,
                })
            } catch (error) {
                console.error(
                    "Erro ao reordenar tarefa:",
                    error
                )

                setTasks(
                    previousTasks
                )
            }

            return
        }

        /*
         * --------------------------------------------------------
         * MOVER PARA OUTRA COLUNA
         * --------------------------------------------------------
         */

        const targetStatus =
            overTask?.status ??
            overId

        if (
            !isTaskStatus(
                targetStatus
            )
        ) {
            return
        }

        const previousTasks =
            tasks

        moveTaskLocally(
            activeId,
            targetStatus,
            overTask?.id
        )

        const updatedTask =
            tasks.find(
                (task) =>
                    task.id ===
                    activeId
            )

        if (!updatedTask) {
            return
        }

        try {
            await moveTask({
                taskId: activeId,
                status:
                    targetStatus,
                position:
                    updatedTask.position,
            })
        } catch (error) {
            console.error(
                "Erro ao mover tarefa:",
                error
            )

            setTasks(
                previousTasks
            )
        }
    }

    /*
     * ============================================================
     * DRAG CANCEL
     * ============================================================
     */

    function handleDragCancel(
        _event: DragCancelEvent
    ) {
        setActiveTask(null)
    }

    /*
     * ============================================================
     * RENDER
     * ============================================================
     */

    return (
        <div className="space-y-6">
            {/* Board header */}

            <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
                        Tarefas
                    </h1>

                    <p className="mt-1 text-sm text-zinc-500">
                        Organize e acompanhe
                        as atividades do
                        GEBM.
                    </p>
                </div>

                <Button
                    type="button"
                    disabled={
                        isSubmitting
                    }
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
                onDragStart={
                    handleDragStart
                }
                onDragEnd={
                    handleDragEnd
                }
                onDragCancel={
                    handleDragCancel
                }
                collisionDetection={
                    closestCorners
                }
            >
                <div className="grid gap-4 md:grid-cols-3">
                    {columns.map(
                        (column) => (
                            <KanbanColumn
                                key={
                                    column.id
                                }
                                id={
                                    column.id
                                }
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

                <DragOverlay>
                    {activeTask ? (
                        <article className="rotate-2 rounded-xl border border-white/15 bg-zinc-900 p-4 shadow-2xl shadow-black/40">
                            <TaskCardContent
                                task={
                                    activeTask
                                }
                            />
                        </article>
                    ) : null}
                </DragOverlay>
            </DndContext>

            {/* ==================================================
                CREATE DIALOG
            ================================================== */}

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
                        onSubmit={
                            handleCreateTask
                        }
                        onCancel={() =>
                            setIsCreateModalOpen(
                                false
                            )
                        }
                        disabled={
                            isSubmitting
                        }
                    />
                </DialogContent>
            </Dialog>

            {/* ==================================================
                EDIT DIALOG
            ================================================== */}

            <Dialog
                open={
                    editingTask !==
                    null
                }
                onOpenChange={(
                    open
                ) => {
                    if (!open) {
                        setEditingTask(
                            null
                        )
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
                            onSubmit={
                                handleUpdateTask
                            }
                            onCancel={() =>
                                setEditingTask(
                                    null
                                )
                            }
                            disabled={
                                isSubmitting
                            }
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* ==================================================
                DELETE CONFIRMATION
            ================================================== */}

            <AlertDialog
                open={
                    deletingTask !==
                    null
                }
                onOpenChange={(
                    open
                ) => {
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
                        <AlertDialogCancel
                            disabled={
                                isSubmitting
                            }
                        >
                            Cancelar
                        </AlertDialogCancel>

                        <AlertDialogAction
                            variant="destructive"
                            disabled={
                                isSubmitting
                            }
                            onClick={
                                handleDeleteTask
                            }
                        >
                            Excluir tarefa
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}