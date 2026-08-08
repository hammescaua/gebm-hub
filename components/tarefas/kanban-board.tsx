"use client";

import { useState } from "react";
import type { Task, TaskStatus } from "@/types";
import KanbanColumn from "./kanban-column";

const STATUS_ORDER: TaskStatus[] = ["todo", "progress", "done"];

type KanbanBoardProps = {
    initialTasks: Task[];
};

export default function KanbanBoard({ initialTasks }: KanbanBoardProps) {
    const [tasks, setTasks] = useState<Task[]>(initialTasks);

    function moveTask(taskId: string, direction: "left" | "right") {
        setTasks((currentTasks) =>
            currentTasks.map((task) => {
                if (task.id !== taskId) return task;

                const currentIndex = STATUS_ORDER.indexOf(task.status);
                const nextIndex = currentIndex + (direction === "right" ? 1 : -1);
                const nextStatus = STATUS_ORDER[nextIndex];

                if (!nextStatus) return task;
                return { ...task, status: nextStatus };
            }),
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {STATUS_ORDER.map((status) => (
                <KanbanColumn
                    key={status}
                    status={status}
                    tasks={tasks.filter((task) => task.status === status)}
                    onMove={moveTask}
                />
            ))}
        </div>
    );
}
