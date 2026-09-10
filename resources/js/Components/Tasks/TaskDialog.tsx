import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { router } from '@inertiajs/react';
import { Task, TaskPriorityType, TaskStatusType } from '@/types/task';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Label } from '@/Components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const taskSchema = z.object({
    title: z.string().min(1, 'Judul tugas wajib diisi.').max(255, 'Judul tugas maksimal 255 karakter.'),
    description: z.string().max(10000, 'Deskripsi maksimal 10000 karakter.').optional(),
    deadline: z.string().optional(),
    status: z.enum(['todo', 'in_progress', 'done']),
    priority: z.enum(['low', 'medium', 'high']),
});

type TaskFormValues = z.infer<typeof taskSchema>;

interface TaskDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    projectId?: number;
    projects?: { id: number; name: string }[];
    task?: Task | null;
    defaultStatus?: TaskStatusType;
}

export default function TaskDialog({
    open,
    onOpenChange,
    projectId: initialProjectId,
    projects,
    task,
    defaultStatus = 'todo',
}: TaskDialogProps) {
    const isEdit = !!task;
    const [selectedProjectId, setSelectedProjectId] = useState<number | undefined>(
        initialProjectId || task?.project_id || (projects && projects.length > 0 ? projects[0].id : undefined)
    );

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<TaskFormValues>({
        resolver: zodResolver(taskSchema),
        defaultValues: {
            title: '',
            description: '',
            deadline: '',
            status: defaultStatus,
            priority: 'medium',
        },
    });

    const selectedStatus = watch('status');
    const selectedPriority = watch('priority');

    useEffect(() => {
        if (open) {
            if (task) {
                reset({
                    title: task.title,
                    description: task.description || '',
                    deadline: task.deadline || '',
                    status: task.status,
                    priority: task.priority,
                });
                setSelectedProjectId(task.project_id);
            } else {
                reset({
                    title: '',
                    description: '',
                    deadline: format(new Date(), 'yyyy-MM-dd'),
                    status: defaultStatus,
                    priority: 'medium',
                });
                setSelectedProjectId(initialProjectId || (projects && projects.length > 0 ? projects[0].id : undefined));
            }
        }
    }, [open, task, defaultStatus, initialProjectId, projects, reset]);

    const onSubmit = (values: TaskFormValues) => {
        const payload = {
            ...values,
            deadline: values.deadline ? values.deadline : null,
        };

        if (isEdit && task) {
            router.put(route('tasks.update', task.id), payload, {
                preserveScroll: true,
                onSuccess: () => {
                    onOpenChange(false);
                },
                onError: (serverErrors) => {
                    Object.keys(serverErrors).forEach((key) => {
                        setError(key as keyof TaskFormValues, {
                            type: 'server',
                            message: serverErrors[key],
                        });
                    });
                },
            });
        } else {
            const targetProjectId = initialProjectId || selectedProjectId;
            if (!targetProjectId) return;

            router.post(route('tasks.store', targetProjectId), payload, {
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    onOpenChange(false);
                },
                onError: (serverErrors) => {
                    Object.keys(serverErrors).forEach((key) => {
                        setError(key as keyof TaskFormValues, {
                            type: 'server',
                            message: serverErrors[key],
                        });
                    });
                },
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[540px] rounded-2xl p-6">
                <DialogHeader className="space-y-1.5">
                    <DialogTitle className="text-xl font-heading font-semibold">
                        {isEdit ? 'Edit Tugas' : 'Tambah Tugas Baru'}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                        {isEdit
                            ? 'Perbarui detail, prioritas, atau tenggat waktu tugas ini.'
                            : 'Isi detail tugas yang ingin Anda tambahkan ke dalam proyek.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
                    {/* Project Selector (if creating from All Tasks) */}
                    {!isEdit && !initialProjectId && projects && projects.length > 0 && (
                        <div className="space-y-1.5">
                            <Label htmlFor="task-project" className="text-xs font-semibold">
                                Proyek <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={selectedProjectId ? String(selectedProjectId) : ''}
                                onValueChange={(val) => {
                                    if (val) setSelectedProjectId(Number(val));
                                }}
                            >
                                <SelectTrigger id="task-project" className="rounded-xl w-full">
                                    <SelectValue placeholder="Pilih Proyek..." />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    {projects.map((p) => (
                                        <SelectItem key={p.id} value={String(p.id)}>
                                            {p.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Task Title */}
                    <div className="space-y-1.5">
                        <Label htmlFor="task-title" className="text-xs font-semibold">
                            Judul Tugas <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="task-title"
                            placeholder="Contoh: Implementasi Form Validasi"
                            className={`rounded-xl ${errors.title ? 'border-destructive focus-visible:ring-destructive/20' : ''}`}
                            {...register('title')}
                        />
                        {errors.title && (
                            <p className="text-xs text-destructive font-medium">{errors.title.message}</p>
                        )}
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                        <Label htmlFor="task-description" className="text-xs font-semibold">
                            Deskripsi (Opsional)
                        </Label>
                        <Textarea
                            id="task-description"
                            placeholder="Tambahkan detail atau instruksi pengerjaan tugas ini..."
                            rows={3}
                            className={`rounded-xl resize-none ${errors.description ? 'border-destructive focus-visible:ring-destructive/20' : ''}`}
                            {...register('description')}
                        />
                        {errors.description && (
                            <p className="text-xs text-destructive font-medium">{errors.description.message}</p>
                        )}
                    </div>

                    {/* Priority & Status */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="task-priority" className="text-xs font-semibold">
                                Prioritas <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={selectedPriority}
                                onValueChange={(val) => {
                                    if (val) setValue('priority', val as TaskPriorityType, { shouldValidate: true });
                                }}
                            >
                                <SelectTrigger id="task-priority" className="rounded-xl w-full">
                                    <SelectValue placeholder="Pilih prioritas..." />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="low">Rendah</SelectItem>
                                    <SelectItem value="medium">Sedang</SelectItem>
                                    <SelectItem value="high">Tinggi</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.priority && (
                                <p className="text-xs text-destructive font-medium">{errors.priority.message}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="task-status" className="text-xs font-semibold">
                                Status Kolom <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={selectedStatus}
                                onValueChange={(val) => {
                                    if (val) setValue('status', val as TaskStatusType, { shouldValidate: true });
                                }}
                            >
                                <SelectTrigger id="task-status" className="rounded-xl w-full">
                                    <SelectValue placeholder="Pilih status..." />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="todo">To-do</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="done">Done</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.status && (
                                <p className="text-xs text-destructive font-medium">{errors.status.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Deadline */}
                    <div className="space-y-1.5">
                        <Label htmlFor="task-deadline" className="text-xs font-semibold">
                            Tenggat Waktu (Opsional)
                        </Label>
                        <Input
                            id="task-deadline"
                            type="date"
                            className={`rounded-xl ${errors.deadline ? 'border-destructive focus-visible:ring-destructive/20' : ''}`}
                            {...register('deadline')}
                        />
                        {errors.deadline && (
                            <p className="text-xs text-destructive font-medium">{errors.deadline.message}</p>
                        )}
                    </div>

                    <DialogFooter className="pt-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="rounded-xl"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            className="rounded-xl"
                            disabled={isSubmitting}
                        >
                            {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
                            {isEdit ? 'Simpan Perubahan' : 'Tambah Tugas'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
