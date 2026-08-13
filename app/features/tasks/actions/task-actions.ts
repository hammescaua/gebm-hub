"use server"

import { prisma } from "@/lib/prisma"

import type {
    Task,
    TaskStatus,
    TaskPriority,
} from "@/types/task"

import type {
    TaskFormData,
} from "../schemas/task-schema"

function serializeTask(task: {
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
}): Task {
    return {
        id: task.id,
        title: task.title,
        description:
            task.description ?? undefined,
        priority: task.priority,
        status: task.status,
        position: task.position,
        assignee:
            task.assignee ?? undefined,
        dueDate: task.dueDate
            ? task.dueDate
                .toISOString()
                .slice(0, 10)
            : undefined,
    }
}

export async function getTasks(): Promise<Task[]> {
    const tasks = await prisma.task.findMany({
        orderBy: [
            {
                status: "asc",
            },
            {
                position: "asc",
            },
        ],
    })

    return tasks.map(serializeTask)
}

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

    const task =
        await prisma.task.create({
            data: {
                title: data.title,
                description:
                    data.description || null,
                priority: data.priority,
                status: "TODO",
                position:
                    lastTask
                        ? lastTask.position + 1
                        : 0,
                assignee:
                    data.assignee || null,
                dueDate: data.dueDate
                    ? new Date(
                        `${data.dueDate}T00:00:00`
                    )
                    : null,
            },
        })

    return serializeTask(task)
}

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
                    data.description || null,
                priority: data.priority,
                assignee:
                    data.assignee || null,
                dueDate: data.dueDate
                    ? new Date(
                        `${data.dueDate}T00:00:00`
                    )
                    : null,
            },
        })

    return serializeTask(task)
}

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
                    status: task.status,
                    position: {
                        gt: task.position,
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