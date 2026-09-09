import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { router } from '@inertiajs/react';
import { Project, ProjectStatusType } from '@/types/project';
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

const projectSchema = z.object({
    name: z.string().min(1, 'Nama proyek wajib diisi.').max(255, 'Nama proyek maksimal 255 karakter.'),
    description: z.string().max(5000, 'Deskripsi maksimal 5000 karakter.').optional(),
    deadline: z.string().min(1, 'Tenggat waktu wajib diisi.'),
    status: z.enum(['planning', 'in_progress', 'completed', 'on_hold']),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

interface ProjectDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    project?: Project | null;
}

export default function ProjectDialog({
    open,
    onOpenChange,
    project,
}: ProjectDialogProps) {
    const isEdit = !!project;

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<ProjectFormValues>({
        resolver: zodResolver(projectSchema),
        defaultValues: {
            name: '',
            description: '',
            deadline: format(new Date(), 'yyyy-MM-dd'),
            status: 'planning',
        },
    });

    const selectedStatus = watch('status');

    useEffect(() => {
        if (open) {
            if (project) {
                reset({
                    name: project.name,
                    description: project.description || '',
                    deadline: project.deadline || format(new Date(), 'yyyy-MM-dd'),
                    status: project.status,
                });
            } else {
                reset({
                    name: '',
                    description: '',
                    deadline: format(new Date(), 'yyyy-MM-dd'),
                    status: 'planning',
                });
            }
        }
    }, [open, project, reset]);

    const onSubmit = (values: ProjectFormValues) => {
        if (isEdit && project) {
            router.put(route('projects.update', project.id), values, {
                preserveScroll: true,
                onSuccess: () => {
                    onOpenChange(false);
                },
                onError: (serverErrors) => {
                    Object.keys(serverErrors).forEach((key) => {
                        setError(key as keyof ProjectFormValues, {
                            type: 'server',
                            message: serverErrors[key],
                        });
                    });
                },
            });
        } else {
            router.post(route('projects.store'), values, {
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    onOpenChange(false);
                },
                onError: (serverErrors) => {
                    Object.keys(serverErrors).forEach((key) => {
                        setError(key as keyof ProjectFormValues, {
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
                        {isEdit ? 'Edit Proyek' : 'Buat Proyek Baru'}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                        {isEdit
                            ? 'Perbarui detail dan informasi tenggat waktu proyek Anda.'
                            : 'Isi informasi berikut untuk menambahkan proyek baru ke workspace Anda.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
                    {/* Project Name */}
                    <div className="space-y-1.5">
                        <Label htmlFor="name" className="text-xs font-semibold">
                            Nama Proyek <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="name"
                            placeholder="Contoh: Redesign Aplikasi Mobile"
                            className={`rounded-xl ${errors.name ? 'border-destructive focus-visible:ring-destructive/20' : ''}`}
                            {...register('name')}
                        />
                        {errors.name && (
                            <p className="text-xs text-destructive font-medium">{errors.name.message}</p>
                        )}
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                        <Label htmlFor="description" className="text-xs font-semibold">
                            Deskripsi (Opsional)
                        </Label>
                        <Textarea
                            id="description"
                            placeholder="Jelaskan tujuan utama, ruang lingkup, atau catatan penting proyek ini..."
                            rows={3}
                            className={`rounded-xl resize-none ${errors.description ? 'border-destructive focus-visible:ring-destructive/20' : ''}`}
                            {...register('description')}
                        />
                        {errors.description && (
                            <p className="text-xs text-destructive font-medium">{errors.description.message}</p>
                        )}
                    </div>

                    {/* Deadline & Status in 2-columns grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="deadline" className="text-xs font-semibold">
                                Tenggat Waktu <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="deadline"
                                type="date"
                                className={`rounded-xl ${errors.deadline ? 'border-destructive focus-visible:ring-destructive/20' : ''}`}
                                {...register('deadline')}
                            />
                            {errors.deadline && (
                                <p className="text-xs text-destructive font-medium">{errors.deadline.message}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="status" className="text-xs font-semibold">
                                Status <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={selectedStatus}
                                onValueChange={(val) => {
                                    if (val) {
                                        setValue('status', val as ProjectStatusType, { shouldValidate: true });
                                    }
                                }}
                            >
                                <SelectTrigger id="status" className="rounded-xl w-full">
                                    <SelectValue placeholder="Pilih status..." />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="planning">Planning</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="on_hold">On Hold</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.status && (
                                <p className="text-xs text-destructive font-medium">{errors.status.message}</p>
                            )}
                        </div>
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
                            {isEdit ? 'Simpan Perubahan' : 'Buat Proyek'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
