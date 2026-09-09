import React from 'react';
import { Task, TaskStatusType } from '@/types/task';
import TaskPriorityBadge from '@/Components/Tasks/TaskPriorityBadge';
import { Card } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import {
    Calendar,
    Paperclip,
    MoreVertical,
    Edit,
    Trash2,
    AlertTriangle,
    ArrowRightCircle,
} from 'lucide-react';

interface TaskCardProps {
    task: Task;
    onClick: (task: Task) => void;
    onEdit: (task: Task) => void;
    onDelete: (task: Task) => void;
    onStatusChange?: (task: Task, newStatus: TaskStatusType) => void;
}

export default function TaskCard({
    task,
    onClick,
    onEdit,
    onDelete,
    onStatusChange,
}: TaskCardProps) {
    return (
        <Card
            onClick={() => onClick(task)}
            className="group relative cursor-pointer rounded-2xl border border-border/70 bg-card p-4 shadow-xs hover:shadow-md hover:border-primary/40 transition-all duration-200 space-y-3 select-none"
        >
            {/* Header: Priority & Quick Options */}
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <TaskPriorityBadge priority={task.priority} label={task.priority_label} />
                    {task.is_overdue && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-destructive bg-destructive/10 px-1.5 py-0.5 rounded-md">
                            <AlertTriangle className="size-3" />
                            Terlambat
                        </span>
                    )}
                </div>

                <div onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            render={
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-7 rounded-lg text-muted-foreground hover:text-foreground opacity-70 group-hover:opacity-100 transition-opacity"
                                >
                                    <MoreVertical className="size-3.5" />
                                    <span className="sr-only">Menu Tugas</span>
                                </Button>
                            }
                        />
                        <DropdownMenuContent align="end" className="w-44 rounded-xl p-1.5 shadow-lg">
                            <DropdownMenuItem
                                onClick={() => onEdit(task)}
                                className="cursor-pointer rounded-lg flex items-center gap-2"
                            >
                                <Edit className="size-3.5 text-muted-foreground" />
                                Edit Tugas
                            </DropdownMenuItem>

                            {onStatusChange && (
                                <>
                                    <DropdownMenuSeparator />
                                    {task.status !== 'todo' && (
                                        <DropdownMenuItem
                                            onClick={() => onStatusChange(task, 'todo')}
                                            className="cursor-pointer rounded-lg flex items-center gap-2 text-xs"
                                        >
                                            <ArrowRightCircle className="size-3.5 text-slate-500" />
                                            Pindah ke To-do
                                        </DropdownMenuItem>
                                    )}
                                    {task.status !== 'in_progress' && (
                                        <DropdownMenuItem
                                            onClick={() => onStatusChange(task, 'in_progress')}
                                            className="cursor-pointer rounded-lg flex items-center gap-2 text-xs"
                                        >
                                            <ArrowRightCircle className="size-3.5 text-amber-500" />
                                            Pindah ke In Progress
                                        </DropdownMenuItem>
                                    )}
                                    {task.status !== 'done' && (
                                        <DropdownMenuItem
                                            onClick={() => onStatusChange(task, 'done')}
                                            className="cursor-pointer rounded-lg flex items-center gap-2 text-xs"
                                        >
                                            <ArrowRightCircle className="size-3.5 text-emerald-500" />
                                            Pindah ke Done
                                        </DropdownMenuItem>
                                    )}
                                </>
                            )}

                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => onDelete(task)}
                                variant="destructive"
                                className="cursor-pointer rounded-lg text-destructive focus:text-destructive flex items-center gap-2"
                            >
                                <Trash2 className="size-3.5" />
                                Hapus Tugas
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Title & Description preview */}
            <div className="space-y-1">
                <h4 className="font-heading font-semibold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {task.title}
                </h4>
                {task.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {task.description}
                    </p>
                )}
            </div>

            {/* Footer: Deadline & Attachments count */}
            <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[11px] text-muted-foreground">
                <div className={`flex items-center gap-1.5 ${task.is_overdue ? 'text-destructive font-semibold' : ''}`}>
                    {task.deadline_formatted ? (
                        <>
                            <Calendar className="size-3" />
                            <span>{task.deadline_formatted}</span>
                        </>
                    ) : (
                        <span className="text-muted-foreground/60">Tanpa tenggat</span>
                    )}
                </div>

                {task.attachments_count > 0 && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                        <Paperclip className="size-3" />
                        <span className="font-medium">{task.attachments_count}</span>
                    </div>
                )}
            </div>
        </Card>
    );
}
