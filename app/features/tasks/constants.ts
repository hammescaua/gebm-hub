import { Badge } from "@/components/ui/badge"
import type {
    TaskPriority,
    TaskStatus,
} from "@/types/task"

type BadgeProps = React.ComponentProps<typeof Badge>

export const priorityLabels: Record<
    TaskPriority,
    string
> = {
    LOW: "Baixa",
    MEDIUM: "Média",
    HIGH: "Alta",
}

export const priorityVariants: Record<
    TaskPriority,
    BadgeProps["variant"]> = {
    LOW: "secondary",
    MEDIUM: "outline",
    HIGH: "destructive",
}

export const statusLabels: Record<
    TaskStatus,
    string
> = {
    TODO: "A fazer",
    IN_PROGRESS: "Em andamento",
    DONE: "Concluído",
}
