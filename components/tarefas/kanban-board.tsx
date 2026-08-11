"use client"

import { useState } from "react"
import { KanbanColumn } from "./kanban-column"
import { Task, KanbanColumn as KanbanColumnType, TaskStatus } from "@/types/task"
import { DndContext, type DragEndEvent } from "@dnd-kit/core"
import { arrayMove } from "@dnd-kit/sortable"
import { TaskFormData } from "@/app/features/tasks/schemas/task-schema"
import { TaskForm } from "@/app/features/tasks/components/task-form"

const initialTasks: Task[] = [
    {
        id: "1",
        title: "Criar cartaz",
        description: "Criar arte para divulgação do evento",
        priority: "HIGH",
        status: "TODO",
        position: 0,
        assignee: "João",
        dueDate: "2026-08-12",
    },
    {
        id: "2",
        title: "Organizar reunião",
        description: "Definir pauta da próxima reunião",
        priority: "MEDIUM",
        status: "IN_PROGRESS",
        position: 0,
        assignee: "Maria",
        dueDate: "2026-08-15",
    },
    {
        id: "3",
        title: "Comprar materiais",
        priority: "LOW",
        position: 0,
        status: "DONE",
        assignee: "Pedro",
    },
]

const columns: KanbanColumnType[] = [
    {
        id: "TODO",
        title: "A fazer",
    },
    {
        id: "IN_PROGRESS",
        title: "Em andamento",
    },
    {
        id: "DONE",
        title: "Concluído",
    },
] as const

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

    const [tasks, setTasks] = useState<Task[]>(initialTasks)

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

    const [editingTask, setEditingTask] = useState<Task | null>(null)

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

            const sourceStatus = task.status

            if (sourceStatus === newStatus) {
                return currentTasks
            }

            const sourceTasks = currentTasks
                .filter(
                    (task) =>
                        task.status === sourceStatus &&
                        task.id !== taskId
                )
                .sort(
                    (a, b) => a.position - b.position
                )

            const destinationTasks = currentTasks
                .filter(
                    (task) =>
                        task.status === newStatus
                )
                .sort(
                    (a, b) => a.position - b.position
                )

            const destinationIndex = overId
                ? destinationTasks.findIndex(
                    (task) => task.id === overId
                )
                : destinationTasks.length

            const newDestinationIndex =
                destinationIndex === -1
                    ? destinationTasks.length
                    : destinationIndex

            const movedTask = {
                ...task,
                status: newStatus,
            }

            destinationTasks.splice(
                newDestinationIndex,
                0,
                movedTask
            )

            const updatedSourceTasks =
                sourceTasks.map((task, index) => ({
                    ...task,
                    position: index,
                }))

            const updatedDestinationTasks =
                destinationTasks.map((task, index) => ({
                    ...task,
                    position: index,
                }))

            const updatedIds = new Set([
                ...updatedSourceTasks.map(
                    (task) => task.id
                ),
                ...updatedDestinationTasks.map(
                    (task) => task.id
                ),
            ])

            return currentTasks.map((task) => {
                if (!updatedIds.has(task.id)) {
                    return task
                }

                return (
                    updatedSourceTasks.find(
                        (item) => item.id === task.id
                    ) ??
                    updatedDestinationTasks.find(
                        (item) => item.id === task.id
                    )!
                )
            })
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

            if (activeTask.status !== overTask.status) {
                return currentTasks
            }

            const columnTasks = currentTasks
                .filter(
                    (task) =>
                        task.status === activeTask.status
                )
                .sort(
                    (a, b) => a.position - b.position
                )

            const oldIndex = columnTasks.findIndex(
                (task) => task.id === activeId
            )

            const newIndex = columnTasks.findIndex(
                (task) => task.id === overId
            )

            if (oldIndex === newIndex) {
                return currentTasks
            }

            const reorderedTasks = arrayMove(
                columnTasks,
                oldIndex,
                newIndex
            )

            return currentTasks.map((task) => {
                const newIndex = reorderedTasks.findIndex(
                    (item) => item.id === task.id
                )

                if (newIndex === -1) {
                    return task
                }

                return {
                    ...task,
                    position: newIndex,
                }
            })
        })
    }

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event

        if (!over) {
            return
        }

        const activeId = String(active.id)
        const overId = String(over.id)

        if (activeId === overId) {
            return
        }

        const activeTask = tasks.find(
            (task) => task.id === activeId
        )

        const overTask = tasks.find(
            (task) => task.id === overId
        )

        if (!activeTask) {
            return
        }

        // Dentro da mesma coluna
        if (
            overTask &&
            activeTask.status === overTask.status
        ) {
            reorderTasks(activeId, overId)
            return
        }

        // Para outra coluna
        const targetStatus = overTask
            ? overTask.status
            : overId

        if (!isTaskStatus(targetStatus)) {
            return
        }

        moveTask(
            activeId,
            targetStatus,
            overTask?.id
        )
    }

    function createTask(data: TaskFormData) {
        setTasks((currentTasks) => {
            const todoTasks = currentTasks.filter(
                (task) => task.status === "TODO"
            )

            const newTask: Task = {
                id: crypto.randomUUID(),
                title: data.title,
                description: data.description,
                priority: data.priority,
                status: "TODO",
                position: todoTasks.length,
                assignee: data.assignee,
                dueDate: data.dueDate,
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
            currentTasks.map((task) => {
                if (task.id !== taskId) {
                    return task
                }

                return {
                    ...task,
                    title: data.title,
                    description: data.description,
                    priority: data.priority,
                    assignee: data.assignee,
                    dueDate: data.dueDate,
                }
            })
        )
    }

    function deleteTask(taskId: string) {
        setTasks((currentTasks) =>
            currentTasks.filter(
                (task) => task.id !== taskId
            )
        )
    }

    return (
        <div>
            <DndContext
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
                        onMoveTask={moveTask}
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
