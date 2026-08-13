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
} from "../data/kanban-columns"

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


    /*
     * ============================================================
     * DND SENSORS
     * ============================================================
     */

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
     * CREATE TASK
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

            alert(
                "Não foi possível criar a tarefa."
            )

        } finally {
            setIsSubmitting(false)
        }
    }


    /*
     * ============================================================
     * UPDATE TASK
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

        const previousTask =
            editingTask

        try {
            setIsSubmitting(true)

            const updatedTask =
                await updateTask(
                    taskId,
                    data
                )

            setTasks((currentTasks) =>
                currentTasks.map(
                    (task) =>
                        task.id === taskId
                            ? {
                                ...updatedTask,
                                position:
                                    task.position,
                            }
                            : task
                )
            )

            setEditingTask(null)

        } catch (error) {
            console.error(
                "Erro ao atualizar tarefa:",
                error
            )

            setTasks((currentTasks) =>
                currentTasks.map(
                    (task) =>
                        task.id === taskId
                            ? previousTask
                            : task
                )
            )

            alert(
                "Não foi possível atualizar a tarefa."
            )

        } finally {
            setIsSubmitting(false)
        }
    }


    /*
     * ============================================================
     * DELETE TASK
     * ============================================================
     */

    async function handleDeleteTask() {

        if (!deletingTask) {
            return
        }

        const taskToDelete =
            deletingTask

        const previousTasks =
            tasks

        try {
            setIsSubmitting(true)

            /*
             * Atualização otimista.
             *
             * A tarefa desaparece imediatamente
             * da interface.
             */
            setTasks((currentTasks) =>
                currentTasks
                    .filter(
                        (task) =>
                            task.id !==
                            taskToDelete.id
                    )
                    .map((task) => {

                        if (
                            task.status !==
                            taskToDelete.status
                        ) {
                            return task
                        }

                        if (
                            task.position >
                            taskToDelete.position
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

            await deleteTask(
                taskToDelete.id
            )

            setDeletingTask(null)

        } catch (error) {

            console.error(
                "Erro ao excluir tarefa:",
                error
            )

            /*
             * Rollback.
             */
            setTasks(previousTasks)

            alert(
                "Não foi possível excluir a tarefa."
            )

        } finally {
            setIsSubmitting(false)
        }
    }


    /*
     * ============================================================
     * REORDER LOCAL
     * ============================================================
     */

    function buildReorderedTasks(
        currentTasks: Task[],
        activeId: string,
        overId: string
    ): Task[] {

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

        const reordered =
            arrayMove(
                columnTasks,
                oldIndex,
                newIndex
            )

        const positionById =
            new Map(
                reordered.map(
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
    }


    /*
     * ============================================================
     * MOVE BETWEEN COLUMNS
     * ============================================================
     */

    function buildMovedTasks(
        currentTasks: Task[],
        taskId: string,
        newStatus: TaskStatus,
        overId?: string
    ): Task[] {

        const task =
            currentTasks.find(
                (item) =>
                    item.id === taskId
            )

        if (!task) {
            return currentTasks
        }

        /*
         * Se já está na mesma coluna,
         * não precisamos fazer move.
         */
        if (
            task.status ===
            newStatus
        ) {
            return currentTasks
        }

        const sourceTasks =
            currentTasks
                .filter(
                    (item) =>
                        item.status ===
                        task.status &&
                        item.id !==
                        taskId
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

        let insertIndex =
            destinationTasks.length

        if (overId) {

            const overIndex =
                destinationTasks.findIndex(
                    (item) =>
                        item.id ===
                        overId
                )

            if (
                overIndex !== -1
            ) {
                insertIndex =
                    overIndex
            }
        }

        destinationTasks.splice(
            insertIndex,
            0,
            {
                ...task,
                status:
                    newStatus,
            }
        )

        const normalizedSource =
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

        const normalizedDestination =
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

        const updatedById =
            new Map(
                [
                    ...normalizedSource,
                    ...normalizedDestination,
                ].map(
                    (item) => [
                        item.id,
                        item,
                    ]
                )
            )

        return currentTasks.map(
            (item) =>
                updatedById.get(
                    item.id
                ) ?? item
        )
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
                    item.id ===
                    taskId
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
            activeId ===
            overId
        ) {
            return
        }

        const currentTasks =
            tasks

        const activeTask =
            currentTasks.find(
                (task) =>
                    task.id ===
                    activeId
            )

        if (!activeTask) {
            return
        }

        const overTask =
            currentTasks.find(
                (task) =>
                    task.id ===
                    overId
            )


        /*
         * ========================================================
         * REORDER DENTRO DA MESMA COLUNA
         * ========================================================
         */

        if (
            overTask &&
            activeTask.status ===
            overTask.status
        ) {

            const previousTasks =
                currentTasks

            const updatedTasks =
                buildReorderedTasks(
                    currentTasks,
                    activeId,
                    overId
                )

            if (
                updatedTasks ===
                currentTasks
            ) {
                return
            }

            /*
             * UI otimista.
             */
            setTasks(
                updatedTasks
            )

            const reorderedTask =
                updatedTasks.find(
                    (task) =>
                        task.id ===
                        activeId
                )

            if (!reorderedTask) {
                return
            }

            try {

                await moveTask({
                    taskId:
                        activeId,

                    status:
                        reorderedTask.status,

                    position:
                        reorderedTask.position,
                })

            } catch (error) {

                console.error(
                    "Erro ao reordenar tarefa:",
                    error
                )

                /*
                 * Rollback.
                 */
                setTasks(
                    previousTasks
                )

                alert(
                    "Não foi possível salvar a nova posição."
                )
            }

            return
        }


        /*
         * ========================================================
         * MOVER PARA OUTRA COLUNA
         * ========================================================
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
            currentTasks

        const updatedTasks =
            buildMovedTasks(
                currentTasks,
                activeId,
                targetStatus,
                overTask?.id
            )

        if (
            updatedTasks ===
            currentTasks
        ) {
            return
        }

        /*
         * UI otimista.
         */
        setTasks(
            updatedTasks
        )

        const movedTask =
            updatedTasks.find(
                (task) =>
                    task.id ===
                    activeId
            )

        if (!movedTask) {
            return
        }

        try {

            await moveTask({
                taskId:
                    activeId,

                status:
                    movedTask.status,

                position:
                    movedTask.position,
            })

        } catch (error) {

            console.error(
                "Erro ao mover tarefa:",
                error
            )

            /*
             * Rollback.
             */
            setTasks(
                previousTasks
            )

            alert(
                "Não foi possível mover a tarefa."
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

            {/* ==================================================
                HEADER
            ================================================== */}

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


            {/* ==================================================
                KANBAN
            ================================================== */}

            <DndContext
                sensors={
                    sensors
                }
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
                                tasks={
                                    tasks
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
                                        )
                                }
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


                {/* ==================================================
                    DRAG OVERLAY
                ================================================== */}

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