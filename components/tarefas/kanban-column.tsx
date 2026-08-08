import type { Task, TaskStatus } from "@/types";
import TaskCard from "./task-card";

const COLUMN_TITLES: Record<TaskStatus, string> = {
    todo: "A fazer",
    progress: "Fazendo",
    done: "Feito",
};

type KanbanColumnProps = {
    status: TaskStatus;
    tasks: Task[];
    onMove: (taskId: string, direction: "left" | "right") => void;
};

export default function KanbanColumn({ status, tasks, onMove }: KanbanColumnProps) {
    return (
        <section className="flex flex-col gap-2.5 self-start rounded-xl bg-muted/60 p-3 border border-border/40">
            <header className="flex items-center justify-between px-1 py-0.5">
                <h2 className="text-sm font-semibold tracking-tight">{COLUMN_TITLES[status]}</h2>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-background text-xs font-medium text-muted-foreground shadow-xs">
                    {tasks.length}
                </span>
            </header>

            <div className="flex flex-col gap-2 min-h-30">
                {tasks.map((task) => (
                    <TaskCard key={task.id} task={task} onMove={onMove} />
                ))}

                {tasks.length === 0 && (
                    <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed p-6 text-center">
                        <p className="text-xs text-muted-foreground">Nenhuma tarefa aqui</p>
                    </div>
                )}
            </div>
        </section>
    );
}
