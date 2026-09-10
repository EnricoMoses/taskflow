import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Task, TaskStatusType } from '@/types/task';
import SortableTaskCard from '@/Components/Tasks/SortableTaskCard';
import { Button } from '@/Components/ui/button';
import { Plus } from 'lucide-react';
import { cn } from 'cn';

interface KanbanColumnProps {
    title: string;
    status: TaskStatusType;
    tasks: Task[];
    icon: React.ReactNode;
    onAddTask: (status: TaskStatusType) => void;
    onCardClick: (task: Task) => void;
    onCardEdit: (task: Task) => void;
    onCardDelete: (task: Task) => void;
    onCardStatusChange?: (task: Task, newStatus: TaskStatusType) => void;
}

export default function KanbanColumn({
    title,
    status,
    tasks,
    icon,
    onAddTask,
    onCardClick,
    onCardEdit,
    onCardDelete,
    onCardStatusChange,
}: KanbanColumnProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: status,
        data: {
            type: 'Column',
            status,
        },
    });

    const taskIds = tasks.map((t) => t.id);

    return (
        <div
            ref={setNodeRef}
            className={cn(
                'flex flex-col bg-muted/30 border rounded-2xl p-4 space-y-3 min-h-[450px] transition-colors duration-200',
                isOver ? 'border-primary/60 bg-primary/5 shadow-sm ring-2 ring-primary/20' : 'border-border/70'
            )}
        >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
                <div className="flex items-center gap-2">
                    {icon}
                    <h3 className="font-heading font-semibold text-sm text-foreground">{title}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted font-bold text-muted-foreground">
                        {tasks.length}
                    </span>
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onAddTask(status)}
                    className="size-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                    title={`Tambah tugas ke ${title}`}
                >
                    <Plus className="size-4" />
                </Button>
            </div>

            {/* Droppable Sortable Cards List */}
            <div className="flex-1 space-y-3 overflow-y-auto max-h-[calc(100vh-380px)] pr-0.5 min-h-[120px]">
                <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
                    {tasks.length > 0 ? (
                        tasks.map((task) => (
                            <SortableTaskCard
                                key={task.id}
                                task={task}
                                onClick={onCardClick}
                                onEdit={onCardEdit}
                                onDelete={onCardDelete}
                                onStatusChange={onCardStatusChange}
                            />
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center rounded-xl border border-dashed border-border/70 bg-card/40 space-y-2 h-full min-h-[160px]">
                            <p className="text-xs text-muted-foreground">Tarik tugas ke sini atau tambah baru</p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onAddTask(status)}
                                className="rounded-lg text-xs h-7 px-2.5"
                            >
                                <Plus className="size-3 mr-1" />
                                Tambah
                            </Button>
                        </div>
                    )}
                </SortableContext>
            </div>
        </div>
    );
}
