import { Task } from '@/types/task';
import TaskStatusBadge from '@/Components/Tasks/TaskStatusBadge';
import TaskPriorityBadge from '@/Components/Tasks/TaskPriorityBadge';
import TaskAttachmentUpload from '@/Components/Tasks/TaskAttachmentUpload';
import TaskAttachmentList from '@/Components/Tasks/TaskAttachmentList';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/Components/ui/sheet';
import { Button } from '@/Components/ui/button';
import {
    Calendar,
    Paperclip,
    Edit,
    Trash2,
    AlertTriangle,
    FileText,
} from 'lucide-react';

interface TaskDetailSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    task: Task | null;
    projectName?: string;
    onEdit: (task: Task) => void;
    onDelete: (task: Task) => void;
}

export default function TaskDetailSheet({
    open,
    onOpenChange,
    task,
    projectName,
    onEdit,
    onDelete,
}: TaskDetailSheetProps) {
    if (!task) return null;

    const attachments = task.attachments || [];

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-md p-0 flex flex-col justify-between overflow-y-auto">
                <div>
                    {/* Header */}
                    <SheetHeader className="p-6 border-b border-border/60 bg-muted/10 space-y-3">
                        <div className="flex items-center gap-2 flex-wrap">
                            <TaskStatusBadge status={task.status} label={task.status_label} />
                            <TaskPriorityBadge priority={task.priority} label={task.priority_label} />
                            {task.is_overdue && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-destructive bg-destructive/10 px-2 py-0.5 rounded-full border border-destructive/20">
                                    <AlertTriangle className="size-3" />
                                    Terlambat
                                </span>
                            )}
                        </div>

                        <SheetTitle className="font-heading text-xl font-bold text-foreground leading-snug">
                            {task.title}
                        </SheetTitle>

                        {projectName && (
                            <SheetDescription className="text-xs text-muted-foreground">
                                Bagian dari proyek <span className="font-semibold text-foreground">{projectName}</span>
                            </SheetDescription>
                        )}
                    </SheetHeader>

                    {/* Body Info */}
                    <div className="p-6 space-y-6">
                        {/* Meta properties grid */}
                        <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-muted/20 border border-border/50 text-xs">
                            <div className="space-y-1">
                                <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                                    <Calendar className="size-3.5 text-primary" />
                                    Tenggat Waktu
                                </span>
                                <p className={`font-semibold ${task.is_overdue ? 'text-destructive' : 'text-foreground'}`}>
                                    {task.deadline_formatted || 'Tanpa tenggat'}
                                </p>
                            </div>

                            <div className="space-y-1">
                                <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                                    <Paperclip className="size-3.5 text-primary" />
                                    Lampiran File
                                </span>
                                <p className="font-semibold text-foreground">
                                    {attachments.length} File
                                </p>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                <FileText className="size-3.5 text-primary" />
                                Deskripsi Tugas
                            </h4>
                            <div className="p-4 rounded-2xl bg-background border border-border/60 text-sm text-foreground leading-relaxed whitespace-pre-wrap min-h-[4rem]">
                                {task.description || (
                                    <span className="text-muted-foreground italic text-xs">
                                        Tidak ada deskripsi tambahan untuk tugas ini.
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Attachments Upload & List Section */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                    <Paperclip className="size-3.5 text-primary" />
                                    Lampiran File ({attachments.length})
                                </h4>
                            </div>

                            {/* Upload Area */}
                            <TaskAttachmentUpload taskId={task.id} />

                            {/* Attachments List */}
                            <div className="pt-2">
                                <TaskAttachmentList attachments={attachments} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <SheetFooter className="p-6 border-t border-border/60 bg-muted/10 flex-row gap-3 sm:justify-between">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            onOpenChange(false);
                            onDelete(task);
                        }}
                        className="rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive border-border gap-1.5"
                    >
                        <Trash2 className="size-4" />
                        Hapus
                    </Button>

                    <Button
                        size="sm"
                        onClick={() => {
                            onOpenChange(false);
                            onEdit(task);
                        }}
                        className="rounded-xl gap-1.5"
                    >
                        <Edit className="size-4" />
                        Edit Tugas
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
