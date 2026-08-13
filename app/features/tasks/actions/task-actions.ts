"use server"

import { prisma } from "@/lib/prisma"

import type {
    Task,
    TaskPriority,
    TaskStatus,
} from "@/types/task"

import type {
    TaskFormData,
} from "../schemas/task-schema"

/**
 * Representação do Task que vem do Prisma.
 *
 * Mantemos a conversão em um único lugar porque:
 * - Prisma trabalha com Date
 * - o frontend trabalha com YYYY-MM-DD
 * - campos opcionais no frontend usam undefined
 */
type PrismaTask = {
    id: string
    title: string
    description: string | null
    priority: TaskPriority
    status: TaskStatus
    position: number
    assignee: string | null
    dueDate: Date | null
    createdAt: Date
    updatedAt: Date
}

/**
 * Converte o objeto do Prisma para o formato
 * utilizado pelo frontend.
 */
function serializeTask(
    task: PrismaTask
): Task {
    return {
        id: task.id,

        title: task.title,

        description:
            task.description ??
            undefined,

        priority: task.priority,

        status: task.status,

        position: task.position,

        assignee:
            task.assignee ??
            undefined,

        dueDate: task.dueDate
            ? task.dueDate
                .toISOString()
                .slice(0, 10)
            : undefined,
    }
}

/**
 * Busca todas as tarefas.
 *
 * A ordenação é feita pelo banco:
 * 1. coluna/status
 * 2. posição dentro da coluna
 */
export async function getTasks(): Promise<
    Task[]
> {
    const tasks =
        await prisma.task.findMany({
            orderBy: [
                {
                    status: "asc",
                },
                {
                    position: "asc",
                },
            ],
        })

    return tasks.map(
        serializeTask
    )
}

/**
 * Cria uma nova tarefa.
 *
 * Novas tarefas sempre começam em TODO
 * e são adicionadas no final da coluna.
 */
export async function createTask(
    data: TaskFormData
): Promise<Task> {
    const lastTask =
        await prisma.task.findFirst({
            where: {
                status: "TODO",
            },

            orderBy: {
                position: "desc",
            },
        })

    const position =
        lastTask
            ? lastTask.position + 1
            : 0

    const task =
        await prisma.task.create({
            data: {
                title: data.title,

                description:
                    data.description ||
                    null,

                priority:
                    data.priority,

                status: "TODO",

                position,

                assignee:
                    data.assignee ||
                    null,

                dueDate: data.dueDate
                    ? new Date(
                        `${data.dueDate}T00:00:00`
                    )
                    : null,
            },
        })

    return serializeTask(task)
}

/**
 * Atualiza os dados da tarefa.
 *
 * O status e a posição não são alterados aqui.
 * Isso é importante porque edição de conteúdo
 * e movimentação no Kanban são responsabilidades
 * diferentes.
 */
export async function updateTask(
    taskId: string,
    data: TaskFormData
): Promise<Task> {
    const task =
        await prisma.task.update({
            where: {
                id: taskId,
            },

            data: {
                title: data.title,

                description:
                    data.description ||
                    null,

                priority:
                    data.priority,

                assignee:
                    data.assignee ||
                    null,

                dueDate: data.dueDate
                    ? new Date(
                        `${data.dueDate}T00:00:00`
                    )
                    : null,
            },
        })

    return serializeTask(task)
}

/**
 * Move uma tarefa para outra coluna.
 *
 * Também reorganiza as posições da coluna
 * de origem e da coluna de destino.
 */
export async function moveTask(
    taskId: string,
    newStatus: TaskStatus,
    overId?: string
): Promise<Task[]> {
    return prisma.$transaction(
        async (tx) => {
            const task =
                await tx.task.findUnique({
                    where: {
                        id: taskId,
                    },
                })

            if (!task) {
                throw new Error(
                    "Tarefa não encontrada."
                )
            }

            /**
             * Se a tarefa já está na coluna
             * destino, não fazemos nada aqui.
             *
             * A operação de reorder fica
             * separada.
             */
            if (
                task.status ===
                newStatus
            ) {
                return getTasksFromTransaction(
                    tx
                )
            }

            /**
             * Tarefas restantes na coluna
             * de origem.
             */
            const sourceTasks =
                await tx.task.findMany({
                    where: {
                        status:
                            task.status,

                        id: {
                            not: taskId,
                        },
                    },

                    orderBy: {
                        position: "asc",
                    },
                })

            /**
             * Tarefas da coluna de destino.
             */
            const destinationTasks =
                await tx.task.findMany({
                    where: {
                        status:
                            newStatus,
                    },

                    orderBy: {
                        position: "asc",
                    },
                })

            /**
             * Descobrimos onde inserir a tarefa.
             *
             * Se overId existir, inserimos antes
             * da tarefa sobre a qual ela foi solta.
             *
             * Caso contrário, colocamos no final.
             */
            const targetIndex =
                overId
                    ? destinationTasks.findIndex(
                        (item) =>
                            item.id ===
                            overId
                    )
                    : -1

            const insertIndex =
                targetIndex >= 0
                    ? targetIndex
                    : destinationTasks.length

            destinationTasks.splice(
                insertIndex,
                0,
                {
                    ...task,
                    status: newStatus,
                }
            )

            /**
             * Recalcula as posições da
             * coluna de origem.
             */
            for (
                let index = 0;
                index <
                sourceTasks.length;
                index++
            ) {
                await tx.task.update({
                    where: {
                        id:
                            sourceTasks[
                                index
                            ].id,
                    },

                    data: {
                        position: index,
                    },
                })
            }

            /**
             * Recalcula as posições da
             * coluna de destino.
             */
            for (
                let index = 0;
                index <
                destinationTasks.length;
                index++
            ) {
                const item =
                    destinationTasks[
                    index
                    ]

                await tx.task.update({
                    where: {
                        id: item.id,
                    },

                    data: {
                        status:
                            newStatus,

                        position:
                            index,
                    },
                })
            }

            return getTasksFromTransaction(
                tx
            )
        }
    )
}

/**
 * Reordena uma tarefa dentro da mesma coluna.
 */
export async function reorderTask(
    taskId: string,
    overId: string
): Promise<Task[]> {
    return prisma.$transaction(
        async (tx) => {
            const task =
                await tx.task.findUnique({
                    where: {
                        id: taskId,
                    },
                })

            const overTask =
                await tx.task.findUnique({
                    where: {
                        id: overId,
                    },
                })

            if (
                !task ||
                !overTask
            ) {
                throw new Error(
                    "Tarefa não encontrada."
                )
            }

            /**
             * Reordenação entre colunas não
             * pertence a esta função.
             */
            if (
                task.status !==
                overTask.status
            ) {
                throw new Error(
                    "As tarefas pertencem a colunas diferentes."
                )
            }

            /**
             * Busca todas as tarefas da coluna
             * na ordem atual.
             */
            const columnTasks =
                await tx.task.findMany({
                    where: {
                        status:
                            task.status,
                    },

                    orderBy: {
                        position: "asc",
                    },
                })

            const oldIndex =
                columnTasks.findIndex(
                    (item) =>
                        item.id ===
                        taskId
                )

            const newIndex =
                columnTasks.findIndex(
                    (item) =>
                        item.id ===
                        overId
                )

            if (
                oldIndex === -1 ||
                newIndex === -1
            ) {
                throw new Error(
                    "Posição da tarefa não encontrada."
                )
            }

            if (
                oldIndex ===
                newIndex
            ) {
                return getTasksFromTransaction(
                    tx
                )
            }

            /**
             * Remove a tarefa da posição antiga.
             */
            const reorderedTasks =
                [...columnTasks]

            const [
                movedTask,
            ] =
                reorderedTasks.splice(
                    oldIndex,
                    1
                )

            /**
             * Calculamos novamente o índice
             * depois da remoção.
             */
            const adjustedIndex =
                oldIndex <
                    newIndex
                    ? newIndex - 1
                    : newIndex

            reorderedTasks.splice(
                adjustedIndex,
                0,
                movedTask
            )

            /**
             * Persiste todas as posições.
             */
            for (
                let index = 0;
                index <
                reorderedTasks.length;
                index++
            ) {
                await tx.task.update({
                    where: {
                        id:
                            reorderedTasks[
                                index
                            ].id,
                    },

                    data: {
                        position: index,
                    },
                })
            }

            return getTasksFromTransaction(
                tx
            )
        }
    )
}

/**
 * Exclui uma tarefa e corrige as posições
 * restantes da coluna.
 */
export async function deleteTask(
    taskId: string
): Promise<void> {
    const task =
        await prisma.task.findUnique({
            where: {
                id: taskId,
            },
        })

    if (!task) {
        return
    }

    await prisma.$transaction(
        async (tx) => {
            await tx.task.delete({
                where: {
                    id: taskId,
                },
            })

            await tx.task.updateMany({
                where: {
                    status:
                        task.status,

                    position: {
                        gt:
                            task.position,
                    },
                },

                data: {
                    position: {
                        decrement: 1,
                    },
                },
            })
        }
    )
}

/**
 * Helper utilizado dentro de uma transação.
 *
 * Não usamos o prisma global aqui porque,
 * enquanto estamos dentro de $transaction,
 * precisamos utilizar a mesma conexão/transação.
 */
async function getTasksFromTransaction(
    tx: Parameters<
        Parameters<
            typeof prisma.$transaction
        >[0]
    >[0]
): Promise<Task[]> {
    const tasks =
        await tx.task.findMany({
            orderBy: [
                {
                    status: "asc",
                },

                {
                    position: "asc",
                },
            ],
        })

    return tasks.map(
        serializeTask
    )
}