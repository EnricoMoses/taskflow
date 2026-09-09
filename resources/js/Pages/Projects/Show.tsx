import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Project } from '@/types/project';
import ProjectStatusBadge from '@/Components/Projects/ProjectStatusBadge';
import ProjectDialog from '@/Components/Projects/ProjectDialog';
import { Button } from '@/Components/ui/button';
import { Progress } from '@/Components/ui/progress';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/Components/ui/alert-dialog';
import {
    ChevronLeft,
    Calendar,
    CheckCircle2,
    Edit,
    Trash2,
    AlertTriangle,
    Kanban,
    Plus,
    Clock
} from 'lucide-react';

interface ProjectShowProps {
    project: Project;
}

export default function Show({ project }: ProjectShowProps) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(route('projects.destroy', project.id), {
            onFinish: () => {
                setIsDeleting(false);
                setDeleteAlertOpen(false);
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title={`${project.name} - TaskFlow`} />

            <div className="space-y-8">
                {/* Back Link */}
                <div>
                    <Link
                        href={route('projects.index')}
                        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground font-medium transition-colors"
                    >
                        <ChevronLeft className="size-4" />
                        Kembali ke Semua Proyek
                    </Link>
                </div>

                {/* Project Header Banner */}
                <div className="bg-card border border-border/70 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="space-y-2 max-w-3xl">
                            <div className="flex items-center gap-2.5 flex-wrap">
                                <ProjectStatusBadge status={project.status} label={project.status_label} />
                                {project.is_overdue && (
                                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-destructive bg-destructive/10 px-2.5 py-0.5 rounded-full border border-destructive/20">
                                        <AlertTriangle className="size-3.5" />
                                        Terlambat
                                    </span>
                                )}
                            </div>
                            <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                                {project.name}
                            </h1>
                            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                                {project.description || 'Tidak ada deskripsi untuk proyek ini.'}
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0 self-start">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setDialogOpen(true)}
                                className="rounded-xl gap-1.5"
                            >
                                <Edit className="size-3.5" />
                                Edit
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setDeleteAlertOpen(true)}
                                className="rounded-xl gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive border-border"
                            >
                                <Trash2 className="size-3.5" />
                                Hapus
                            </Button>
                        </div>
                    </div>

                    {/* Stats & Progress Bar in Header */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-border/60">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <Calendar className="size-5" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-medium">Tenggat Waktu</p>
                                <p className="text-sm font-semibold text-foreground">{project.deadline_formatted}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                <CheckCircle2 className="size-5" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-medium">Tugas Selesai</p>
                                <p className="text-sm font-semibold text-foreground">
                                    {project.completed_tasks_count} dari {project.tasks_count} Tugas
                                </p>
                            </div>
                        </div>

                        <div className="space-y-1.5 flex flex-col justify-center">
                            <div className="flex items-center justify-between text-xs">
                                <span className="font-medium text-muted-foreground">Kemajuan Proyek</span>
                                <span className="font-bold text-foreground">{project.progress_percentage}%</span>
                            </div>
                            <Progress value={project.progress_percentage} className="h-2 rounded-full" />
                        </div>
                    </div>
                </div>

                {/* Kanban Board Container (Ready for Prompt 3) */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Kanban className="size-5 text-primary" />
                            <h2 className="font-heading text-lg font-bold text-foreground">Board Kanban</h2>
                        </div>
                    </div>

                    {/* Placeholder container for prompt 3 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Todo Column */}
                        <div className="bg-muted/30 border border-border/60 rounded-2xl p-4 space-y-3">
                            <div className="flex items-center justify-between font-medium text-sm text-foreground pb-2 border-b border-border/50">
                                <span className="flex items-center gap-2 font-semibold">
                                    <span className="size-2 rounded-full bg-slate-400" />
                                    To-do
                                </span>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-muted font-bold text-muted-foreground">
                                    {project.todo_tasks_count}
                                </span>
                            </div>
                            <div className="py-8 text-center text-xs text-muted-foreground">
                                Belum ada tugas di kolom To-do
                            </div>
                        </div>

                        {/* In Progress Column */}
                        <div className="bg-muted/30 border border-border/60 rounded-2xl p-4 space-y-3">
                            <div className="flex items-center justify-between font-medium text-sm text-foreground pb-2 border-b border-border/50">
                                <span className="flex items-center gap-2 font-semibold">
                                    <span className="size-2 rounded-full bg-amber-500" />
                                    In Progress
                                </span>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-muted font-bold text-muted-foreground">
                                    {project.in_progress_tasks_count}
                                </span>
                            </div>
                            <div className="py-8 text-center text-xs text-muted-foreground">
                                Belum ada tugas di kolom In Progress
                            </div>
                        </div>

                        {/* Done Column */}
                        <div className="bg-muted/30 border border-border/60 rounded-2xl p-4 space-y-3">
                            <div className="flex items-center justify-between font-medium text-sm text-foreground pb-2 border-b border-border/50">
                                <span className="flex items-center gap-2 font-semibold">
                                    <span className="size-2 rounded-full bg-emerald-500" />
                                    Done
                                </span>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-muted font-bold text-muted-foreground">
                                    {project.completed_tasks_count}
                                </span>
                            </div>
                            <div className="py-8 text-center text-xs text-muted-foreground">
                                Belum ada tugas di kolom Done
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Project Dialog */}
            <ProjectDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                project={project}
            />

            {/* Delete Alert Dialog */}
            <AlertDialog
                open={deleteAlertOpen}
                onOpenChange={setDeleteAlertOpen}
            >
                <AlertDialogContent className="rounded-2xl p-6 sm:max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="font-heading text-lg font-semibold text-destructive flex items-center gap-2">
                            <AlertTriangle className="size-5" />
                            Hapus Proyek?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-sm text-muted-foreground pt-1">
                            Apakah Anda yakin ingin menghapus proyek{' '}
                            <span className="font-semibold text-foreground">
                                "{project.name}"
                            </span>
                            ? Tindakan ini akan menghapus seluruh tugas dan lampiran di dalamnya secara permanen.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="pt-3">
                        <AlertDialogCancel
                            disabled={isDeleting}
                            className="rounded-xl"
                        >
                            Batal
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                        >
                            {isDeleting ? 'Menghapus...' : 'Ya, Hapus Proyek'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AuthenticatedLayout>
    );
}
