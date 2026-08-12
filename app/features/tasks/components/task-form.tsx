"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import {
    taskFormSchema,
    type TaskFormData,
} from "../schemas/task-schema"

import {
    Input,
} from "@/components/ui/input"

import {
    Textarea,
} from "@/components/ui/textarea"

import {
    Button,
} from "@/components/ui/button"

import {
    Label,
} from "@/components/ui/label"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

type TaskFormProps = {
    defaultValues?: Partial<TaskFormData>
    submitLabel?: string
    onSubmit: (
        data: TaskFormData
    ) => void
    onCancel?: () => void
}

export function TaskForm({
    defaultValues,
    submitLabel = "Criar tarefa",
    onSubmit,
    onCancel,
}: TaskFormProps) {
    const {
        register,
        handleSubmit,
        setValue,
        watch,
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

    const priority =
        watch("priority")

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
        >
            {/* Título */}
            <div className="space-y-2">
                <Label htmlFor="title">
                    Título
                </Label>

                <Input
                    id="title"
                    placeholder="Ex.: Criar cartaz do evento"
                    {...register("title")}
                />

                {errors.title && (
                    <p className="text-sm text-destructive">
                        {errors.title.message}
                    </p>
                )}
            </div>

            {/* Descrição */}
            <div className="space-y-2">
                <Label htmlFor="description">
                    Descrição
                </Label>

                <Textarea
                    id="description"
                    placeholder="Descreva o que precisa ser feito..."
                    rows={4}
                    {...register("description")}
                />

                {errors.description && (
                    <p className="text-sm text-destructive">
                        {errors.description.message}
                    </p>
                )}
            </div>

            {/* Prioridade */}
            <div className="space-y-2">
                <Label>
                    Prioridade
                </Label>

                <Select
                    value={priority}
                    onValueChange={(value) =>
                        setValue(
                            "priority",
                            value as TaskFormData["priority"]
                        )
                    }
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                        <SelectItem value="LOW">
                            Baixa
                        </SelectItem>

                        <SelectItem value="MEDIUM">
                            Média
                        </SelectItem>

                        <SelectItem value="HIGH">
                            Alta
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Responsável */}
            <div className="space-y-2">
                <Label htmlFor="assignee">
                    Responsável
                </Label>

                <Input
                    id="assignee"
                    placeholder="Nome do responsável"
                    {...register("assignee")}
                />
            </div>

            {/* Prazo */}
            <div className="space-y-2">
                <Label htmlFor="dueDate">
                    Prazo
                </Label>

                <Input
                    id="dueDate"
                    type="date"
                    {...register("dueDate")}
                />
            </div>

            {/* Ações */}
            <div className="flex justify-end gap-2">
                {onCancel && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                    >
                        Cancelar
                    </Button>
                )}

                <Button
                    type="submit"
                    disabled={isSubmitting}
                >
                    {isSubmitting
                        ? "Salvando..."
                        : submitLabel}
                </Button>
            </div>
        </form>
    )
}