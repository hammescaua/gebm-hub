import KanbanBoard from "@/components/tarefas/kanban-board";
import { mockTasks } from "@/lib/mock-tasks";

export default function TarefasPage() {
    return (
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold tracking-tight">Tarefas</h1>
                <p className="text-sm text-muted-foreground">
                    O quadro de atividades do grêmio — mova as tarefas com as setas
                </p>
            </div>
            <KanbanBoard initialTasks={mockTasks} />
        </main>
    );
}
