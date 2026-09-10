import { useState, useEffect, useCallback } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Task, TaskStatusType, TaskPriorityType, PaginatedData, TaskFilters } from '@/types/task';
import TaskStatusBadge from '@/Components/Tasks/TaskStatusBadge';
import TaskPriorityBadge from '@/Components/Tasks/TaskPriorityBadge';
import TaskDateRangePicker from '@/Components/Tasks/TaskDateRangePicker';
import TaskDialog from '@/Components/Tasks/TaskDialog';
import TaskDetailSheet from '@/Components/Tasks/TaskDetailSheet';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
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
    Search,
    X,
    Filter,
    RotateCcw,
    Plus,
    Calendar,
    Paperclip,
    FolderKanban,
    MoreHorizontal,
    Edit,
    Trash2,
    Eye,
    AlertTriangle,
    ChevronLeft,
    ChevronRight,
    ArrowUpDown,
    CheckSquare2,
    Layers,
} from 'lucide-react';
import { cn } from 'cn';

interface TasksIndexProps {
    tasks: PaginatedData<Task>;
    filters: TaskFilters;
    statuses: { value: string; label: string }[];
    priorities: { value: string; label: string }[];
    projects: { id: number; name: string }[];
}

export default function TasksIndex({
    tasks,
    filters,
    statuses,
    priorities,
    projects,
}: TasksIndexProps) {
    // Local filter state
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status ? String(filters.status) : 'all');
    const [priority, setPriority] = useState(filters.priority ? String(filters.priority) : 'all');
    const [projectId, setProjectId] = useState(filters.project_id ? String(filters.project_id) : 'all');
    const [deadlinePreset, setDeadlinePreset] = useState(filters.deadline_preset || 'all');
    const [deadlineFrom, setDeadlineFrom] = useState(filters.deadline_from || '');
    const [deadlineTo, setDeadlineTo] = useState(filters.deadline_to || '');

    // Dialog & Sheet states
    const [taskDialogOpen, setTaskDialogOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [detailSheetOpen, setDetailSheetOpen] = useState(false);
    const [detailTaskId, setDetailTaskId] = useState<number | null>(null);
    const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Apply filters to URL
    const applyFilters = useCallback(
        (updated: Partial<TaskFilters>) => {
            const params: Record<string, any> = {
                search: search || undefined,
                status: status !== 'all' ? status : undefined,
                priority: priority !== 'all' ? priority : undefined,
                project_id: projectId !== 'all' ? projectId : undefined,
                deadline_preset: deadlinePreset !== 'all' ? deadlinePreset : undefined,
                deadline_from: deadlineFrom || undefined,
                deadline_to: deadlineTo || undefined,
                sort: filters.sort || undefined,
                direction: filters.direction || undefined,
                ...updated,
            };

            // Remove undefined or empty values
            Object.keys(params).forEach((key) => {
                if (params[key] === undefined || params[key] === '' || params[key] === 'all') {
                    delete params[key];
                }
            });

            router.get(route('tasks.index'), params, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        },
        [search, status, priority, projectId, deadlinePreset, deadlineFrom, deadlineTo, filters.sort, filters.direction]
    );

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (filters.search || '')) {
                applyFilters({ search: search || undefined });
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [search, filters.search, applyFilters]);

    // Handle filter changes
    const handleStatusChange = (val: string | null) => {
        const nextVal = val || 'all';
        setStatus(nextVal);
        applyFilters({ status: nextVal !== 'all' ? nextVal : undefined });
    };

    const handlePriorityChange = (val: string | null) => {
        const nextVal = val || 'all';
        setPriority(nextVal);
        applyFilters({ priority: nextVal !== 'all' ? nextVal : undefined });
    };

    const handleProjectChange = (val: string | null) => {
        const nextVal = val || 'all';
        setProjectId(nextVal);
        applyFilters({ project_id: nextVal !== 'all' ? nextVal : undefined });
    };

    const handleDateRangeChange = ({ preset, from, to }: { preset: string; from: string; to: string }) => {
        setDeadlinePreset(preset);
        setDeadlineFrom(from);
        setDeadlineTo(to);
        applyFilters({
            deadline_preset: preset !== 'all' ? preset : undefined,
            deadline_from: from || undefined,
            deadline_to: to || undefined,
        });
    };

    const handleSort = (field: string) => {
        const currentSort = filters.sort || 'deadline';
        const currentDirection = filters.direction || 'asc';

        let newDirection: 'asc' | 'desc' = 'asc';
        if (currentSort === field) {
            newDirection = currentDirection === 'asc' ? 'desc' : 'asc';
        }

        applyFilters({ sort: field, direction: newDirection });
    };

    const handleResetFilters = () => {
        setSearch('');
        setStatus('all');
        setPriority('all');
        setProjectId('all');
        setDeadlinePreset('all');
        setDeadlineFrom('');
        setDeadlineTo('');

        router.get(
            route('tasks.index'),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };

    const isFiltered = Boolean(
        search ||
        (status && status !== 'all') ||
        (priority && priority !== 'all') ||
        (projectId && projectId !== 'all') ||
        (deadlinePreset && deadlinePreset !== 'all') ||
        deadlineFrom ||
        deadlineTo
    );

    // Task actions
    const handleCreateTask = () => {
        setSelectedTask(null);
        setTaskDialogOpen(true);
    };

    const handleEditTask = (task: Task) => {
        setSelectedTask(task);
        setTaskDialogOpen(true);
    };

    const handleViewDetail = (task: Task) => {
        setDetailTaskId(task.id);
        setDetailSheetOpen(true);
    };

    const handleDeleteClick = (task: Task) => {
        setTaskToDelete(task);
    };

    const confirmDelete = () => {
        if (!taskToDelete) return;
        setIsDeleting(true);
        router.delete(route('tasks.destroy', taskToDelete.id), {
            preserveScroll: true,
            onFinish: () => {
                setIsDeleting(false);
                setTaskToDelete(null);
            },
        });
    };

    // Find current task in paginated list for detail sheet
    const detailTask = tasks.data.find((t) => t.id === detailTaskId) || null;

    return (
        <AuthenticatedLayout>
            <Head title="Semua Tugas - TaskFlow" />

            <div className="space-y-6">
                {/* Header Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                                Semua Tugas
                            </h1>
                            <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-bold border border-primary/20">
                                {tasks.total} Total
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                            Kelola, telusuri, dan pantau seluruh tugas lintas proyek Anda.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {projects.length > 0 && (
                            <Button 
                                onClick={handleCreateTask} 
                                className="rounded-2xl gap-2 text-xs sm:text-sm font-medium h-10 px-4 bg-foreground text-background hover:bg-foreground/90 shadow-xs cursor-pointer"
                            >
                                <Plus className="size-4" />
                                Tambah Tugas
                            </Button>
                        )}
                    </div>
                </div>

                {/* Filters Section */}
                <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-xs space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                        {/* Search Input */}
                        <div className="relative lg:col-span-2">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari judul atau deskripsi tugas..."
                                className="pl-10 pr-8 h-10 rounded-2xl text-xs sm:text-sm border-border/80 bg-background"
                            />
                            {search && (
                                <button
                                    onClick={() => setSearch('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
                                >
                                    <X className="size-3.5" />
                                </button>
                            )}
                        </div>

                        {/* Project Filter */}
                        <div>
                            <Select value={projectId} onValueChange={handleProjectChange}>
                                <SelectTrigger className="h-10 rounded-2xl text-xs sm:text-sm border-border/80 bg-background w-full">
                                    <div className="flex items-center gap-2 truncate">
                                        <FolderKanban className="size-3.5 text-muted-foreground shrink-0" />
                                        <SelectValue placeholder="Semua Proyek" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl">
                                    <SelectItem value="all">Semua Proyek</SelectItem>
                                    {projects.map((p) => (
                                        <SelectItem key={p.id} value={String(p.id)}>
                                            {p.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Status Filter */}
                        <div>
                            <Select value={status} onValueChange={handleStatusChange}>
                                <SelectTrigger className="h-10 rounded-2xl text-xs sm:text-sm border-border/80 bg-background w-full">
                                    <div className="flex items-center gap-2 truncate">
                                        <Filter className="size-3.5 text-muted-foreground shrink-0" />
                                        <SelectValue placeholder="Semua Status" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl">
                                    <SelectItem value="all">Semua Status</SelectItem>
                                    {statuses.map((s) => (
                                        <SelectItem key={s.value} value={s.value}>
                                            {s.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Priority Filter */}
                        <div>
                            <Select value={priority} onValueChange={handlePriorityChange}>
                                <SelectTrigger className="h-10 rounded-2xl text-xs sm:text-sm border-border/80 bg-background w-full">
                                    <SelectValue placeholder="Semua Prioritas" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl">
                                    <SelectItem value="all">Semua Prioritas</SelectItem>
                                    {priorities.map((p) => (
                                        <SelectItem key={p.value} value={p.value}>
                                            {p.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Secondary Filter Row: Date Range + Reset Button */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/50">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-semibold text-muted-foreground">Tenggat:</span>
                            <TaskDateRangePicker
                                preset={deadlinePreset}
                                from={deadlineFrom}
                                to={deadlineTo}
                                onChange={handleDateRangeChange}
                            />
                        </div>

                        {isFiltered && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleResetFilters}
                                className="h-8 text-xs text-muted-foreground hover:text-foreground rounded-lg gap-1.5"
                            >
                                <RotateCcw className="size-3.5" />
                                Reset Filter
                            </Button>
                        )}
                    </div>
                </div>

                {/* Main Content: Tasks Table / Cards */}
                <div className="bg-card border border-border/70 rounded-3xl shadow-xs overflow-hidden">
                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-muted/40 border-b border-border/60">
                                <TableRow>
                                    <TableHead
                                        onClick={() => handleSort('title')}
                                        className="w-[35%] py-3.5 pl-6 cursor-pointer hover:text-primary transition-colors select-none font-heading font-semibold"
                                    >
                                        <div className="flex items-center gap-1.5">
                                            Judul Tugas
                                            <ArrowUpDown className="size-3.5 text-muted-foreground" />
                                        </div>
                                    </TableHead>
                                    <TableHead className="w-[18%] font-heading font-semibold">Proyek</TableHead>
                                    <TableHead
                                        onClick={() => handleSort('status')}
                                        className="w-[12%] cursor-pointer hover:text-primary transition-colors select-none font-heading font-semibold"
                                    >
                                        <div className="flex items-center gap-1.5">
                                            Status
                                            <ArrowUpDown className="size-3.5 text-muted-foreground" />
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        onClick={() => handleSort('priority')}
                                        className="w-[12%] cursor-pointer hover:text-primary transition-colors select-none font-heading font-semibold"
                                    >
                                        <div className="flex items-center gap-1.5">
                                            Prioritas
                                            <ArrowUpDown className="size-3.5 text-muted-foreground" />
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        onClick={() => handleSort('deadline')}
                                        className="w-[15%] cursor-pointer hover:text-primary transition-colors select-none font-heading font-semibold"
                                    >
                                        <div className="flex items-center gap-1.5">
                                            Tenggat Waktu
                                            <ArrowUpDown className="size-3.5 text-muted-foreground" />
                                        </div>
                                    </TableHead>
                                    <TableHead className="w-[8%] pr-6 text-right font-heading font-semibold">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {tasks.data.length > 0 ? (
                                    tasks.data.map((task) => (
                                        <TableRow
                                            key={task.id}
                                            onClick={() => handleViewDetail(task)}
                                            className="cursor-pointer hover:bg-muted/40 transition-colors group"
                                        >
                                            {/* Title & Description */}
                                            <TableCell className="pl-6 py-4">
                                                <div className="space-y-1 max-w-md">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                                                            {task.title}
                                                        </span>
                                                        {task.attachments_count > 0 && (
                                                            <span className="inline-flex items-center gap-0.5 text-[11px] text-muted-foreground px-1.5 py-0.5 rounded-md bg-muted">
                                                                <Paperclip className="size-3" />
                                                                {task.attachments_count}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {task.description && (
                                                        <p className="text-xs text-muted-foreground line-clamp-1">
                                                            {task.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </TableCell>

                                            {/* Project */}
                                            <TableCell>
                                                {task.project ? (
                                                    <Link
                                                        href={route('projects.show', task.project.id)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground hover:text-primary hover:underline"
                                                    >
                                                        <FolderKanban className="size-3.5 text-muted-foreground" />
                                                        <span className="truncate max-w-[140px]">{task.project.name}</span>
                                                    </Link>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">-</span>
                                                )}
                                            </TableCell>

                                            {/* Status */}
                                            <TableCell>
                                                <TaskStatusBadge status={task.status} label={task.status_label} />
                                            </TableCell>

                                            {/* Priority */}
                                            <TableCell>
                                                <TaskPriorityBadge priority={task.priority} label={task.priority_label} />
                                            </TableCell>

                                            {/* Deadline */}
                                            <TableCell>
                                                <div className="space-y-0.5">
                                                    <div
                                                        className={cn(
                                                            'inline-flex items-center gap-1.5 text-xs font-medium',
                                                            task.is_overdue
                                                                ? 'text-destructive font-semibold'
                                                                : 'text-foreground'
                                                        )}
                                                    >
                                                        <Calendar className="size-3.5 text-muted-foreground shrink-0" />
                                                        <span>{task.deadline_formatted || 'Tanpa tenggat'}</span>
                                                    </div>
                                                    {task.is_overdue && (
                                                        <span className="block text-[11px] font-semibold text-destructive">
                                                            Terlambat
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>

                                            {/* Actions */}
                                            <TableCell className="pr-6 text-right" onClick={(e) => e.stopPropagation()}>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        render={
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="size-8 rounded-lg text-muted-foreground hover:text-foreground"
                                                            >
                                                                <MoreHorizontal className="size-4" />
                                                                <span className="sr-only">Menu Aksi</span>
                                                            </Button>
                                                        }
                                                    />
                                                    <DropdownMenuContent align="end" className="w-44 rounded-xl p-1.5 shadow-lg">
                                                        <DropdownMenuItem
                                                            onClick={() => handleViewDetail(task)}
                                                            className="cursor-pointer rounded-lg flex items-center gap-2 text-xs"
                                                        >
                                                            <Eye className="size-3.5 text-muted-foreground" />
                                                            Lihat Detail
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleEditTask(task)}
                                                            className="cursor-pointer rounded-lg flex items-center gap-2 text-xs"
                                                        >
                                                            <Edit className="size-3.5 text-muted-foreground" />
                                                            Edit Tugas
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => handleDeleteClick(task)}
                                                            variant="destructive"
                                                            className="cursor-pointer rounded-lg text-destructive focus:text-destructive flex items-center gap-2 text-xs"
                                                        >
                                                            <Trash2 className="size-3.5" />
                                                            Hapus Tugas
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="py-16 text-center">
                                            <div className="flex flex-col items-center justify-center space-y-3">
                                                <div className="size-12 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground">
                                                    <CheckSquare2 className="size-6" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="font-heading font-semibold text-base text-foreground">
                                                        Tidak ada tugas ditemukan
                                                    </p>
                                                    <p className="text-xs text-muted-foreground max-w-sm">
                                                        {isFiltered
                                                            ? 'Coba sesuaikan kata kunci pencarian atau reset filter untuk melihat semua tugas.'
                                                            : 'Belum ada tugas yang dibuat di dalam proyek Anda.'}
                                                    </p>
                                                </div>
                                                {isFiltered && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={handleResetFilters}
                                                        className="rounded-xl text-xs gap-1.5 mt-2"
                                                    >
                                                        <RotateCcw className="size-3" />
                                                        Reset Filter
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Mobile Card List View */}
                    <div className="md:hidden divide-y divide-border/60">
                        {tasks.data.length > 0 ? (
                            tasks.data.map((task) => (
                                <div
                                    key={task.id}
                                    onClick={() => handleViewDetail(task)}
                                    className="p-4 space-y-3 active:bg-muted/30 transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <TaskPriorityBadge priority={task.priority} label={task.priority_label} />
                                                <TaskStatusBadge status={task.status} label={task.status_label} />
                                            </div>
                                            <h4 className="font-heading font-semibold text-sm text-foreground pt-1">
                                                {task.title}
                                            </h4>
                                        </div>

                                        <div onClick={(e) => e.stopPropagation()}>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger
                                                    render={
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="size-7 rounded-lg text-muted-foreground hover:text-foreground"
                                                        >
                                                            <MoreHorizontal className="size-3.5" />
                                                        </Button>
                                                    }
                                                />
                                                <DropdownMenuContent align="end" className="w-40 rounded-xl p-1.5 shadow-lg">
                                                    <DropdownMenuItem
                                                        onClick={() => handleViewDetail(task)}
                                                        className="cursor-pointer rounded-lg text-xs flex items-center gap-2"
                                                    >
                                                        <Eye className="size-3.5 text-muted-foreground" />
                                                        Detail
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleEditTask(task)}
                                                        className="cursor-pointer rounded-lg text-xs flex items-center gap-2"
                                                    >
                                                        <Edit className="size-3.5 text-muted-foreground" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => handleDeleteClick(task)}
                                                        variant="destructive"
                                                        className="cursor-pointer rounded-lg text-destructive text-xs flex items-center gap-2"
                                                    >
                                                        <Trash2 className="size-3.5" />
                                                        Hapus
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>

                                    {task.description && (
                                        <p className="text-xs text-muted-foreground line-clamp-2">
                                            {task.description}
                                        </p>
                                    )}

                                    <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs text-muted-foreground">
                                        {task.project ? (
                                            <Link
                                                href={route('projects.show', task.project.id)}
                                                onClick={(e) => e.stopPropagation()}
                                                className="inline-flex items-center gap-1 text-xs hover:text-primary font-medium truncate max-w-[140px]"
                                            >
                                                <FolderKanban className="size-3" />
                                                <span>{task.project.name}</span>
                                            </Link>
                                        ) : (
                                            <span />
                                        )}

                                        <div className="flex items-center gap-2">
                                            {task.attachments_count > 0 && (
                                                <span className="inline-flex items-center gap-0.5">
                                                    <Paperclip className="size-3" />
                                                    {task.attachments_count}
                                                </span>
                                            )}
                                            <span className={cn('text-xs', task.is_overdue && 'text-destructive font-semibold')}>
                                                {task.deadline_formatted || 'Tanpa tenggat'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-12 px-4 text-center space-y-3">
                                <p className="font-heading font-semibold text-sm text-foreground">
                                    Tidak ada tugas ditemukan
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Coba ubah filter atau kata kunci pencarian Anda.
                                </p>
                                {isFiltered && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleResetFilters}
                                        className="rounded-xl text-xs gap-1.5"
                                    >
                                        <RotateCcw className="size-3" />
                                        Reset Filter
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Pagination Footer */}
                    {tasks.links && tasks.links.length > 3 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-border/60 bg-muted/20">
                            <p className="text-xs text-muted-foreground">
                                Menampilkan <span className="font-semibold text-foreground">{tasks.from || 0}</span> -{' '}
                                <span className="font-semibold text-foreground">{tasks.to || 0}</span> dari{' '}
                                <span className="font-semibold text-foreground">{tasks.total}</span> tugas
                            </p>

                            <div className="flex items-center gap-1.5">
                                {tasks.links.map((link, idx) => {
                                    // Strip html entities if any
                                    const label = link.label
                                        .replace('&laquo; Previous', '')
                                        .replace('Next &raquo;', '')
                                        .trim();

                                    const isPrev = link.label.includes('Previous');
                                    const isNext = link.label.includes('Next');

                                    if (!link.url) {
                                        return (
                                            <span
                                                key={idx}
                                                className="px-2.5 py-1 text-xs text-muted-foreground/40 rounded-lg cursor-not-allowed select-none"
                                            >
                                                {isPrev ? <ChevronLeft className="size-4" /> : isNext ? <ChevronRight className="size-4" /> : label}
                                            </span>
                                        );
                                    }

                                    return (
                                        <Link
                                            key={idx}
                                            href={link.url}
                                            preserveScroll
                                            preserveState
                                            className={cn(
                                                'inline-flex items-center justify-center text-xs rounded-lg transition-colors min-w-8 h-8 px-2',
                                                link.active
                                                    ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                            )}
                                        >
                                            {isPrev ? <ChevronLeft className="size-4" /> : isNext ? <ChevronRight className="size-4" /> : label}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Task Create / Edit Dialog */}
            <TaskDialog
                open={taskDialogOpen}
                onOpenChange={setTaskDialogOpen}
                task={selectedTask}
                projects={projects}
            />

            {/* Task Detail Sheet */}
            <TaskDetailSheet
                open={detailSheetOpen}
                onOpenChange={setDetailSheetOpen}
                task={detailTask}
                projectName={detailTask?.project?.name}
                onEdit={handleEditTask}
                onDelete={handleDeleteClick}
            />

            {/* Delete Confirmation Alert Dialog */}
            <AlertDialog
                open={!!taskToDelete}
                onOpenChange={(open) => !open && setTaskToDelete(null)}
            >
                <AlertDialogContent className="rounded-2xl p-6 sm:max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="font-heading text-lg font-semibold text-destructive flex items-center gap-2">
                            <AlertTriangle className="size-5" />
                            Hapus Tugas?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-sm text-muted-foreground pt-1">
                            Apakah Anda yakin ingin menghapus tugas{' '}
                            <span className="font-semibold text-foreground">
                                "{taskToDelete?.title}"
                            </span>
                            ? Tindakan ini tidak dapat dibatalkan.
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
                            {isDeleting ? 'Menghapus...' : 'Ya, Hapus Tugas'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AuthenticatedLayout>
    );
}
