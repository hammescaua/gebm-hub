import type { DraggableAttributes } from "@dnd-kit/core"
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities"

import {
    CalendarDays,
    GripVertical,
    MoreHorizontal,
    UserRound,
} from "lucide-react"

import type { Task } from "@/types/task"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
    priorityLabels,
    priorityVariants,
} from "../constants"

type TaskCardContentProps = {
    task: Task
    onEdit?: (task: Task) => void
    onDelete?: (task: Task) => void
    dragHandleProps?: {
        listeners?: SyntheticListenerMap
        attributes?: DraggableAttributes
    }
}

export default function TaskCardContent({
    task,
    onEdit,
    onDelete,
    dragHandleProps,
}: TaskCardContentProps) {
    const formattedDueDate = task.dueDate
        ? new Date(
            `${task.dueDate}T00:00:00`
        ).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "short",
        })
        : null

    return (
        <>
            {/* Header */}
            <div className="flex items-start gap-2">
                {/* Drag handle */}
                {dragHandleProps && (
                    <button
                        type="button"
                        {...dragHandleProps.attributes}
                        {...dragHandleProps.listeners}
                        aria-label={`Arrastar tarefa: ${task.title}`}
                        className="
                        mt-0.5 shrink-0 cursor-grab
                        touch-none rounded-md p-1
                        text-zinc-500
                        transition-colors
                        hover:bg-white/5 hover:text-zinc-300
                        active:cursor-grabbing
                    "
                    >
                        <GripVertical className="size-4" />
                    </button>
                )}

                {/* Title */}
                <div className="min-w-0 flex-1">
                    <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-zinc-100">
                        {task.title}
                    </h3>
                </div>

                {/* Actions */}
                {onEdit && onDelete && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                className="
                                -mr-1 -mt-1 shrink-0
                                text-zinc-500
                                hover:bg-white/5
                                hover:text-zinc-200
                            "
                            >
                                <MoreHorizontal className="size-4" />

                                <span className="sr-only">
                                    Ações da tarefa
                                </span>
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent
                            align="end"
                            className="w-36"
                        >
                            <DropdownMenuItem
                                onClick={() =>
                                    onEdit(task)
                                }
                            >
                                Editar
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                                variant="destructive"
                                onClick={() =>
                                    onDelete(task)
                                }
                            >
                                Excluir
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>

            {/* Description */}
            {task.description && (
                <p className="mt-3 line-clamp-2 text-sm leading-5 text-zinc-400">
                    {task.description}
                </p>
            )}

            {/* Priority */}
            <div className="mt-4">
                <Badge
                    variant={
                        priorityVariants[
                        task.priority
                        ]
                    }
                >
                    {priorityLabels[
                        task.priority
                    ]}
                </Badge>
            </div>

            {/* Metadata */}
            {(task.assignee || formattedDueDate) && (
                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/5 pt-3 text-xs text-zinc-500">
                    {task.assignee && (
                        <span className="flex min-w-0 items-center gap-1.5">
                            <UserRound className="size-3.5 shrink-0" />

                            <span className="truncate">
                                {task.assignee}
                            </span>
                        </span>
                    )}

                    {formattedDueDate && (
                        <span className="flex items-center gap-1.5">
                            <CalendarDays className="size-3.5 shrink-0" />

                            <span>
                                {formattedDueDate}
                            </span>
                        </span>
                    )}
                </div>
            )}
        </>
    )
}
