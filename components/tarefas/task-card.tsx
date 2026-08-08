import { ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Task, TaskPriority } from "@/types";

const PRIORITY_LABEL: Record<TaskPriority, string> = {
    low: "baixa",
    medium: "média",
    high: "alta",
};

const PRIORITY_VARIANT: Record<TaskPriority, "outline" | "secondary" | "destructive"> = {
    low: "outline",
    medium: "secondary",
    high: "destructive",
};

type TaskCardProps = {
    task: Task;
    onMove: (taskId: string, direction: "left" | "right") => void;
};

export default function TaskCard({ task, onMove }: TaskCardProps) {
    const isDone = task.status === "done";
    const isTodo = task.status === "todo";

    return (
        <article className="rounded-lg border bg-card p-3 shadow-xs transition-shadow hover:shadow-sm">
            <div className="flex items-start justify-between gap-2">
                <p className={cn("text-sm font-medium leading-snug", isDone && "text-muted-foreground line-through")}>
                    {task.title}
                </p>
                <Badge variant={PRIORITY_VARIANT[task.priority]} className="shrink-0 text-[10px]">
                    {PRIORITY_LABEL[task.priority]}
                </Badge>
            </div>

            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{task.description}</p>

            <div className="mt-3 flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground truncate">
                    {task.assignee}
                    {task.dueDate && !isDone && ` · ${task.dueDate}`}
                </span>

                <div className="flex gap-1 shrink-0">
                    <Button
                        variant="outline"
                        size="icon-xs"
                        aria-label="Mover para a coluna anterior"
                        disabled={isTodo}
                        onClick={() => onMove(task.id, "left")}
                    >
                        <ChevronLeft className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon-xs"
                        aria-label="Mover para a próxima coluna"
                        disabled={isDone}
                        onClick={() => onMove(task.id, "right")}
                    >
                        <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </div>
        </article>
    );
}
