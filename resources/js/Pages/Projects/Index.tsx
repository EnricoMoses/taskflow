import { useState, useEffect, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Project, ProjectFilters, ProjectStatusOption } from '@/types/project';
import ProjectCard from '@/Components/Projects/ProjectCard';
import ProjectDialog from '@/Components/Projects/ProjectDialog';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
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
    Plus, 
    Search, 
    FolderKanban, 
    Filter, 
    CheckCircle2, 
    Clock, 
    AlertTriangle,
    X
} from 'lucide-react';

interface ProjectsIndexProps {
    projects: Project[];
    filters: ProjectFilters;
    statuses: ProjectStatusOption[];
}

export default function Index({
    projects,
    filters,
    statuses,
}: ProjectsIndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const isFirstRender = useRef(true);

    // Debounced search and filter handler
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const handler = setTimeout(() => {
            router.get(
                route('projects.index'),
                {
                    search: search.trim() ? search : undefined,
                    status: statusFilter !== 'all' ? statusFilter : undefined,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                }
            );
        }, 300);

        return () => clearTimeout(handler);
    }, [search, statusFilter]);

    const handleCreateClick = () => {
        setSelectedProject(null);
        setDialogOpen(true);
    };

    const handleEditClick = (project: Project) => {
        setSelectedProject(project);
        setDialogOpen(true);
    };

    const handleDeleteClick = (project: Project) => {
        setProjectToDelete(project);
    };

    const confirmDelete = () => {
        if (!projectToDelete) return;
        setIsDeleting(true);
        router.delete(route('projects.destroy', projectToDelete.id), {
            preserveScroll: true,
            onFinish: () => {
                setIsDeleting(false);
                setProjectToDelete(null);
            },
        });
    };

    const resetFilters = () => {
        setSearch('');
        setStatusFilter('all');
    };

    const hasActiveFilters = search !== '' || statusFilter !== 'all';

    // Summary statistics
    const totalProjects = projects.length;
    const completedProjects = projects.filter((p) => p.status === 'completed').length;
    const overdueProjects = projects.filter((p) => p.is_overdue).length;

    return (
        <AuthenticatedLayout>
            <Head title="Manajemen Proyek - TaskFlow" />

            <div className="space-y-8">
                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                            Proyek
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Kelola semua proyek, pantau tenggat waktu, dan pantau progres tugas tim Anda.
                        </p>
                    </div>

                    <Button
                        onClick={handleCreateClick}
                        className="rounded-xl shadow-sm gap-2 shrink-0 self-start sm:self-auto"
                    >
                        <Plus className="size-4" />
                        Buat Proyek Baru
                    </Button>
                </div>

                {/* Filters & Quick Search Bar */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 bg-card p-3.5 rounded-2xl border border-border/70 shadow-sm">
                    {/* Search Input */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari nama atau deskripsi proyek..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 pr-9 rounded-xl border-border bg-background"
                        />
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                <X className="size-4" />
                            </button>
                        )}
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center gap-2">
                        <div className="w-full md:w-48">
                            <Select
                                value={statusFilter}
                                onValueChange={(val) => setStatusFilter(val || 'all')}
                            >
                                <SelectTrigger className="rounded-xl bg-background border-border">
                                    <div className="flex items-center gap-2 truncate">
                                        <Filter className="size-3.5 text-muted-foreground" />
                                        <SelectValue placeholder="Semua Status" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="all">Semua Status</SelectItem>
                                    {statuses.map((st) => (
                                        <SelectItem key={st.value} value={st.value}>
                                            {st.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {hasActiveFilters && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={resetFilters}
                                className="rounded-xl text-xs text-muted-foreground hover:text-foreground px-2.5"
                            >
                                Reset
                            </Button>
                        )}
                    </div>
                </div>

                {/* Projects Grid or Empty State */}
                {projects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((project) => (
                            <ProjectCard
                                key={project.id}
                                project={project}
                                onEdit={handleEditClick}
                                onDelete={handleDeleteClick}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl border border-dashed border-border bg-muted/10 space-y-4">
                        <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                            <FolderKanban className="size-7" />
                        </div>
                        <div className="space-y-1.5 max-w-sm">
                            <h3 className="font-heading font-semibold text-lg text-foreground">
                                {hasActiveFilters ? 'Tidak ada proyek yang sesuai' : 'Belum ada proyek'}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {hasActiveFilters
                                    ? 'Coba sesuaikan kata kunci pencarian atau filter status Anda.'
                                    : 'Mulai dengan membuat proyek pertamamu untuk mengatur tugas dan melacak progres.'}
                            </p>
                        </div>
                        {hasActiveFilters ? (
                            <Button
                                variant="outline"
                                onClick={resetFilters}
                                className="rounded-xl mt-2"
                            >
                                Hapus Filter
                            </Button>
                        ) : (
                            <Button
                                onClick={handleCreateClick}
                                className="rounded-xl mt-2 gap-2"
                            >
                                <Plus className="size-4" />
                                Buat Proyek Pertama
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {/* Create / Edit Project Dialog */}
            <ProjectDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                project={selectedProject}
            />

            {/* Delete Confirmation Alert Dialog */}
            <AlertDialog
                open={!!projectToDelete}
                onOpenChange={(open) => !open && setProjectToDelete(null)}
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
                                "{projectToDelete?.name}"
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
                            onClick={confirmDelete}
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
