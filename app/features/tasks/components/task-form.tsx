"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import {
    taskFormSchema,
    type TaskFormData,
} from "../schemas/task-schema"

type TaskFormProps = {
    defaultValues?: Partial<TaskFormData>
    submitLabel?: string
    onSubmit: (
        data: TaskFormData
    ) => void
}

export function TaskForm({
    defaultValues,
    submitLabel = "Criar tarefa",
    onSubmit,
}: TaskFormProps) {

    const {
        register,
        handleSubmit,
        formState: {
            errors,
            isSubmitting,
        },
    } = useForm<TaskFormData>({
        resolver:
            zodResolver(taskFormSchema),

        defaultValues: {
            title: "",
            description: "",
            priority: "MEDIUM",
            assignee: "",
            dueDate: "",
            ...defaultValues,
        },
    })

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
        >
            <div>
                <label htmlFor="title">
                    Título
                </label>

                <input
                    id="title"
                    {...register("title")}
                />

                {errors.title && (
                    <p>
                        {errors.title.message}
                    </p>
                )}
            </div>

            <div>
                <label htmlFor="description">
                    Descrição
                </label>

                <textarea
                    id="description"
                    {...register("description")}
                />

                {errors.description && (
                    <p>
                        {errors.description.message}
                    </p>
                )}
            </div>

            <div>
                <label htmlFor="priority">
                    Prioridade
                </label>

                <select
                    id="priority"
                    {...register("priority")}
                >
                    <option value="LOW">
                        Baixa
                    </option>

                    <option value="MEDIUM">
                        Média
                    </option>

                    <option value="HIGH">
                        Alta
                    </option>
                </select>
            </div>

            <div>
                <label htmlFor="assignee">
                    Responsável
                </label>

                <input
                    id="assignee"
                    {...register("assignee")}
                />
            </div>

            <div>
                <label htmlFor="dueDate">
                    Prazo
                </label>

                <input
                    id="dueDate"
                    type="date"
                    {...register("dueDate")}
                />
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
            >
                Criar tarefa
            </button>

            <button
                type="submit"
                disabled={isSubmitting}
            >
                {isSubmitting
                    ? "Salvando..."
                    : submitLabel}
            </button>
        </form>
    )
}