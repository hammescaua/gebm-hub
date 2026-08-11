import { z } from "zod"

export const taskFormSchema = z.object({
    title: z
        .string()
        .min(1, "O título é obrigatório")
        .max(100, "O título deve ter no máximo 100 caracteres"),

    description: z
        .string()
        .max(
            1000,
            "A descrição deve ter no máximo 1000 caracteres"
        )
        .optional(),

    priority: z.enum([
        "LOW",
        "MEDIUM",
        "HIGH",
    ]),

    assignee: z
        .string()
        .optional(),

    dueDate: z
        .string()
        .optional(),
})

export type TaskFormData =
    z.infer<typeof taskFormSchema>