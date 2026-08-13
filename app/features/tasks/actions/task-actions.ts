"use server"

import { prisma } from "@/lib/prisma"

import type {
    Task,
    TaskStatus,
} from "@/types/task"

import type {
    TaskFormData,
} from "../schemas/task-schema"

import { mapTaskToUI } from "../data/task-mappers"

async function getTasksFromTransaction(
    tx: Parameters<
        Parameters<
            typeof prisma.$transaction
        >[0]
    >[0]
): Promise<Task[]> {
    const tasks = await tx.task.findMany({
        orderBy: [
            { status: "asc" },
            { position: "asc" },
        ],
    })

    return tasks.map(mapTaskToUI)
}

export async function getTasks(): Promise<Task[]> {
    const tasks = await prisma.task.findMany({
        orderBy: [
            { status: "asc" },
            { position: "asc" },
        ],
    })

    return tasks.map(mapTaskToUI)
}

export async function createTask(
    data: TaskFormData
): Promise<Task> {
    const lastTask = await prisma.task.findFirst({
        where: { status: "TODO" },
        orderBy: { position: "desc" },
    })

    const position = lastTask ? lastTask.position + 1 : 0

    const task = await prisma.task.create({
        data: {
            title: data.title,
            description: data.description || null,
            priority: data.priority,
            status: "TODO",
            position,
            assignee: data.assignee || null,
            dueDate: data.dueDate
                ? new Date(`${data.dueDate}T00:00:00`)
                : null,
        },
    })

    return mapTaskToUI(task)
}

export async function updateTask(
    taskId: string,
    data: TaskFormData
): Promise<Task> {
    const task = await prisma.task.update({
        where: { id: taskId },
        data: {
            title: data.title,
            description: data.description || null,
            priority: data.priority,
            assignee: data.assignee || null,
            dueDate: data.dueDate
                ? new Date(`${data.dueDate}T00:00:00`)
                : null,
        },
    })

    return mapTaskToUI(task)
}

type MoveTaskInput = {
    taskId: string
    status: TaskStatus
    position: number
}

export async function moveTask({
    taskId,
    status: newStatus,
    position: newPosition,
}: MoveTaskInput): Promise<Task[]> {
    return prisma.$transaction(async (tx) => {
        const task = await tx.task.findUnique({
            where: { id: taskId },
        })

        if (!task) {
            throw new Error("Tarefa não encontrada.")
        }

        const oldStatus = task.status
        const oldPosition = task.position

        /*
         * --------------------------------------------------
         * MESMA COLUNA: Reordenação O(1) com batch updates
         * --------------------------------------------------
         */
        if (oldStatus === newStatus) {
            const columnCount = await tx.task.count({
                where: { status: oldStatus },
            })
            const targetPosition = Math.max(0, Math.min(newPosition, columnCount - 1))

            if (oldPosition !== targetPosition) {
                if (oldPosition < targetPosition) {
                    // Mover para baixo: ajusta os itens entre oldPosition e targetPosition
                    await tx.task.updateMany({
                        where: {
                            status: oldStatus,
                            position: {
                                gt: oldPosition,
                                lte: targetPosition,
                            },
                        },
                        data: {
                            position: { decrement: 1 },
                        },
                    })
                } else {
                    // Mover para cima: ajusta os itens entre targetPosition e oldPosition
                    await tx.task.updateMany({
                        where: {
                            status: oldStatus,
                            position: {
                                gte: targetPosition,
                                lt: oldPosition,
                            },
                        },
                        data: {
                            position: { increment: 1 },
                        },
                    })
                }

                await tx.task.update({
                    where: { id: taskId },
                    data: { position: targetPosition },
                })
            }

            return getTasksFromTransaction(tx)
        }

        /*
         * --------------------------------------------------
         * OUTRA COLUNA: Reordenação O(1) entre colunas
         * --------------------------------------------------
         */
        const destCount = await tx.task.count({
            where: { status: newStatus },
        })
        const targetPosition = Math.max(0, Math.min(newPosition, destCount))

        // 1. Reorganiza a coluna de origem (decrementa posições após oldPosition)
        await tx.task.updateMany({
            where: {
                status: oldStatus,
                position: { gt: oldPosition },
            },
            data: {
                position: { decrement: 1 },
            },
        })

        // 2. Abre espaço na coluna de destino (incrementa posições >= targetPosition)
        await tx.task.updateMany({
            where: {
                status: newStatus,
                position: { gte: targetPosition },
            },
            data: {
                position: { increment: 1 },
            },
        })

        // 3. Atualiza a tarefa movida para o novo status e posição
        await tx.task.update({
            where: { id: taskId },
            data: {
                status: newStatus,
                position: targetPosition,
            },
        })

        return getTasksFromTransaction(tx)
    })
}

export async function deleteTask(
    taskId: string
): Promise<void> {
    const task = await prisma.task.findUnique({
        where: { id: taskId },
    })

    if (!task) {
        return
    }

    await prisma.$transaction(async (tx) => {
        await tx.task.delete({
            where: { id: taskId },
        })

        await tx.task.updateMany({
            where: {
                status: task.status,
                position: { gt: task.position },
            },
            data: {
                position: { decrement: 1 },
            },
        })
    })
}