import { useState, useEffect, useCallback } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Project } from '@/types/project';
import { Task, TaskStatusType, TaskPriorityType } from '@/types/task';
import ProjectStatusBadge from '@/Components/Projects/ProjectStatusBadge';
import ProjectDialog from '@/Components/Projects/ProjectDialog';
import TaskCard from '@/Components/Tasks/TaskCard';
import TaskDialog from '@/Components/Tasks/TaskDialog';
import TaskDetailSheet from '@/Components/Tasks/TaskDetailSheet';
import TaskDateRangePicker from '@/Components/Tasks/TaskDateRangePicker';
import KanbanColumn from '@/Components/Tasks/KanbanColumn';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Progress } from '@/Components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '@/Components/ui/tabs';
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
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { toast } from 'sonner';
import {
    ChevronLeft,
    Calendar,
    CheckCircle2,
    Edit,
    Trash2,
    AlertTriangle,
    Kanban,
    Plus,
    Clock,
    Circle,
    Search,
    X,
    RotateCcw,
} from 'lucide-react';

interface ProjectShowProps {
    project: Project;
    filters?: {
        search?: string;
        priority?: string;
        deadline_preset?: string;
        deadline_from?: string;
        deadline_to?: string;
    };
    priorities?: { value: string; label: string }[];
}

export default function Show({ project, filters, priorities }: ProjectShowProps) {
    // Project modal state
    const [projectDialogOpen, setProjectDialogOpen] = useState(false);
    const [projectDeleteAlertOpen, setProjectDeleteAlertOpen] = useState(false);
    const [isDeletingProject, setIsDeletingProject] = useState(false);

    // Task modal & sheet state
    const [taskDialogOpen, setTaskDialogOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [defaultTaskStatus, setDefaultTaskStatus] = useState<TaskStatusType>('todo');

    const [detailSheetOpen, setDetailSheetOpen] = useState(false);
    const [detailTaskId, setDetailTaskId] = useState<number | null>(null);

    const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
    const [isDeletingTask, setIsDeletingTask] = useState(false);

    // Filter states
    const [search, setSearch] = useState(filters?.search || '');
    const [priority, setPriority] = useState(filters?.priority || 'all');
    const [deadlinePreset, setDeadlinePreset] = useState(filters?.deadline_preset || 'all');
    const [deadlineFrom, setDeadlineFrom] = useState(filters?.deadline_from || '');
    const [deadlineTo, setDeadlineTo] = useState(filters?.deadline_to || '');

    // Mobile tabs state
    const [activeTab, setActiveTab] = useState<string>('all');

    // Tasks state with optimistic local support
    const [tasks, setTasks] = useState<Task[]>(project.tasks || []);
    const [activeTask, setActiveTask] = useState<Task | null>(null);

    useEffect(() => {
        setTasks(project.tasks || []);
    }, [project.tasks]);

    // Group tasks by status
    const todoTasks = tasks.filter((t) => t.status === 'todo');
    const inProgressTasks = tasks.filter((t) => t.status === 'in_progress');
    const doneTasks = tasks.filter((t) => t.status === 'done');

    const detailTask = tasks.find((t) => t.id === detailTaskId) || null;

    // Filter application
    const applyFilters = useCallback(
        (updated: Record<string, any>) => {
            const params: Record<string, any> = {
                search: search || undefined,
                priority: priority !== 'all' ? priority : undefined,
                deadline_preset: deadlinePreset !== 'all' ? deadlinePreset : undefined,
                deadline_from: deadlineFrom || undefined,
                deadline_to: deadlineTo || undefined,
                ...updated,
            };

            Object.keys(params).forEach((key) => {
                if (params[key] === undefined || params[key] === '' || params[key] === 'all') {
                    delete params[key];
                }
            });

            router.get(route('projects.show', project.id), params, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        },
        [project.id, search, priority, deadlinePreset, deadlineFrom, deadlineTo]
    );

    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (filters?.search || '')) {
                applyFilters({ search: search || undefined });
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [search, filters?.search, applyFilters]);

    const handlePriorityChange = (val: string | null) => {
        const nextVal = val || 'all';
        setPriority(nextVal);
        applyFilters({ priority: nextVal !== 'all' ? nextVal : undefined });
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

    const handleResetFilters = () => {
        setSearch('');
        setPriority('all');
        setDeadlinePreset('all');
        setDeadlineFrom('');
        setDeadlineTo('');

        router.get(
            route('projects.show', project.id),
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
        (priority && priority !== 'all') ||
        (deadlinePreset && deadlinePreset !== 'all') ||
        deadlineFrom ||
        deadlineTo
    );

    // Dnd-kit Sensors
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const task = tasks.find((t) => t.id === Number(active.id));
        if (task) {
            setActiveTask(task);
        }
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = Number(active.id);
        const overId = over.id;

        const activeTaskItem = tasks.find((t) => t.id === activeId);
        if (!activeTaskItem) return;

        // Check if dropped over another task
        const overTaskItem = tasks.find((t) => t.id === Number(overId));

        if (overTaskItem) {
            if (activeTaskItem.status !== overTaskItem.status) {
                setTasks((prevTasks) => {
                    const activeIndex = prevTasks.findIndex((t) => t.id === activeId);
                    const overIndex = prevTasks.findIndex((t) => t.id === Number(overId));

                    const updated = [...prevTasks];
                    updated[activeIndex] = {
                        ...updated[activeIndex],
                        status: overTaskItem.status,
                    };

                    return arrayMove(updated, activeIndex, overIndex);
                });
            }
        } else {
            // Check if dropped directly over a column
            const isOverColumn = ['todo', 'in_progress', 'done'].includes(String(overId));
            if (isOverColumn) {
                const newStatus = String(overId) as TaskStatusType;
                if (activeTaskItem.status !== newStatus) {
                    setTasks((prevTasks) => {
                        const activeIndex = prevTasks.findIndex((t) => t.id === activeId);
                        const updated = [...prevTasks];
                        updated[activeIndex] = {
                            ...updated[activeIndex],
                            status: newStatus,
                        };
                        return arrayMove(updated, activeIndex, updated.length - 1);
                    });
                }
            }
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveTask(null);

        if (!over) return;

        const activeId = Number(active.id);
        const overId = over.id;

        const activeTaskItem = tasks.find((t) => t.id === activeId);
        if (!activeTaskItem) return;

        const overTaskItem = tasks.find((t) => t.id === Number(overId));
        const previousSnapshot = [...tasks];

        let finalTasks = [...tasks];

        if (overTaskItem) {
            const activeIndex = finalTasks.findIndex((t) => t.id === activeId);
            const overIndex = finalTasks.findIndex((t) => t.id === Number(overId));

            if (activeIndex !== overIndex || activeTaskItem.status !== overTaskItem.status) {
                finalTasks[activeIndex] = {
                    ...finalTasks[activeIndex],
                    status: overTaskItem.status,
                };
                finalTasks = arrayMove(finalTasks, activeIndex, overIndex);
            }
        } else {
            const isOverColumn = ['todo', 'in_progress', 'done'].includes(String(overId));
            if (isOverColumn) {
                const newStatus = String(overId) as TaskStatusType;
                const activeIndex = finalTasks.findIndex((t) => t.id === activeId);
                finalTasks[activeIndex] = {
                    ...finalTasks[activeIndex],
                    status: newStatus,
                };
            }
        }

        // Apply updated order indices
        const reorderedPayload = finalTasks.map((t, index) => ({
            id: t.id,
            status: t.status,
            order: index,
        }));

        setTasks(finalTasks);

        // Send reorder request to backend
        router.post(
            route('tasks.reorder', project.id),
            { tasks: reorderedPayload },
            {
                preserveScroll: true,
                preserveState: true,
                onError: () => {
                    setTasks(previousSnapshot);
                    toast.error('Gagal memperbarui urutan tugas.');
                },
            }
        );
    };

    const handleDeleteProject = () => {
        setIsDeletingProject(true);
        router.delete(route('projects.destroy', project.id), {
            onFinish: () => {
                setIsDeletingProject(false);
                setProjectDeleteAlertOpen(false);
            },
        });
    };

    const handleCreateTask = (status: TaskStatusType = 'todo') => {
        setSelectedTask(null);
        setDefaultTaskStatus(status);
        setTaskDialogOpen(true);
    };

    const handleEditTask = (task: Task) => {
        setSelectedTask(task);
        setTaskDialogOpen(true);
    };

    const handleViewTaskDetail = (task: Task) => {
        setDetailTaskId(task.id);
        setDetailSheetOpen(true);
    };

    const handleDeleteTaskClick = (task: Task) => {
        setTaskToDelete(task);
    };

    const confirmDeleteTask = () => {
        if (!taskToDelete) return;
        setIsDeletingTask(true);
        router.delete(route('tasks.destroy', taskToDelete.id), {
            preserveScroll: true,
            onFinish: () => {
                setIsDeletingTask(false);
                setTaskToDelete(null);
            },
        });
    };

    const handleTaskStatusChange = (task: Task, newStatus: TaskStatusType) => {
        const previousSnapshot = [...tasks];

        setTasks((prev) =>
            prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t))
        );

        router.patch(
            route('tasks.update-status', task.id),
            { status: newStatus },
            {
                preserveScroll: true,
                preserveState: true,
                onError: () => {
                    setTasks(previousSnapshot);
                    toast.error('Gagal memperbarui status tugas.');
                },
            }
        );
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
                                onClick={() => handleCreateTask('todo')}
                                className="rounded-xl gap-1.5 shadow-sm"
                            >
                                <Plus className="size-4" />
                                Tambah Tugas
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setProjectDialogOpen(true)}
                                className="rounded-xl gap-1.5"
                            >
                                <Edit className="size-3.5" />
                                Edit
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setProjectDeleteAlertOpen(true)}
                                className="rounded-xl gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive border-border"
                            >
                                <Trash2 className="size-3.5" />
                                Hapus
                            </Button>
                        </div>
                    </div>

                    {/* Stats & Progress Bar */}
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

                {/* Kanban Board Section */}
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <Kanban className="size-5 text-primary" />
                            <h2 className="font-heading text-lg font-bold text-foreground">Board Kanban</h2>
                            <span className="text-xs text-muted-foreground font-medium">
                                ({tasks.length} tugas{isFiltered ? ' hasil filter' : ''})
                            </span>
                        </div>

                        {/* Mobile view switcher tab */}
                        <div className="md:hidden">
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <TabsList className="grid grid-cols-4 rounded-xl">
                                    <TabsTrigger value="all" className="rounded-lg text-xs">Semua</TabsTrigger>
                                    <TabsTrigger value="todo" className="rounded-lg text-xs">To-do ({todoTasks.length})</TabsTrigger>
                                    <TabsTrigger value="in_progress" className="rounded-lg text-xs">In Prog ({inProgressTasks.length})</TabsTrigger>
                                    <TabsTrigger value="done" className="rounded-lg text-xs">Done ({doneTasks.length})</TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>
                    </div>

                    {/* Compact Filter Bar */}
                    <div className="bg-card border border-border/70 rounded-2xl p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[260px]">
                            {/* Search */}
                            <div className="relative flex-1 min-w-[180px] max-w-xs">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                                <Input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cari tugas di board..."
                                    className="pl-8 pr-7 h-8 text-xs rounded-xl border-border/80"
                                />
                                {search && (
                                    <button
                                        onClick={() => setSearch('')}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
                                    >
                                        <X className="size-3" />
                                    </button>
                                )}
                            </div>

                            {/* Priority Filter */}
                            <Select value={priority} onValueChange={handlePriorityChange}>
                                <SelectTrigger className="h-8 rounded-xl text-xs border-border/80 w-[130px]">
                                    <SelectValue placeholder="Prioritas" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="all">Semua Prioritas</SelectItem>
                                    {priorities?.map((p) => (
                                        <SelectItem key={p.value} value={p.value}>
                                            {p.label}
                                        </SelectItem>
                                    )) || (
                                        <>
                                            <SelectItem value="low">Rendah</SelectItem>
                                            <SelectItem value="medium">Sedang</SelectItem>
                                            <SelectItem value="high">Tinggi</SelectItem>
                                        </>
                                    )}
                                </SelectContent>
                            </Select>

                            {/* Date Range Picker */}
                            <TaskDateRangePicker
                                preset={deadlinePreset}
                                from={deadlineFrom}
                                to={deadlineTo}
                                onChange={handleDateRangeChange}
                                className="h-8 text-xs"
                            />
                        </div>

                        {isFiltered && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleResetFilters}
                                className="h-8 text-xs text-muted-foreground hover:text-foreground rounded-lg gap-1.5"
                            >
                                <RotateCcw className="size-3" />
                                Reset Filter
                            </Button>
                        )}
                    </div>

                    {/* DndContext Interactive Kanban Columns */}
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCorners}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDragEnd={handleDragEnd}
                    >
                        {/* Desktop 3-Column View */}
                        <div className="hidden md:grid md:grid-cols-3 gap-6">
                            <KanbanColumn
                                title="To-do"
                                status="todo"
                                tasks={todoTasks}
                                icon={<Circle className="size-4 text-slate-500" />}
                                onAddTask={handleCreateTask}
                                onCardClick={handleViewTaskDetail}
                                onCardEdit={handleEditTask}
                                onCardDelete={handleDeleteTaskClick}
                                onCardStatusChange={handleTaskStatusChange}
                            />
                            <KanbanColumn
                                title="In Progress"
                                status="in_progress"
                                tasks={inProgressTasks}
                                icon={<Clock className="size-4 text-amber-500" />}
                                onAddTask={handleCreateTask}
                                onCardClick={handleViewTaskDetail}
                                onCardEdit={handleEditTask}
                                onCardDelete={handleDeleteTaskClick}
                                onCardStatusChange={handleTaskStatusChange}
                            />
                            <KanbanColumn
                                title="Done"
                                status="done"
                                tasks={doneTasks}
                                icon={<CheckCircle2 className="size-4 text-emerald-500" />}
                                onAddTask={handleCreateTask}
                                onCardClick={handleViewTaskDetail}
                                onCardEdit={handleEditTask}
                                onCardDelete={handleDeleteTaskClick}
                                onCardStatusChange={handleTaskStatusChange}
                            />
                        </div>

                        {/* Mobile View with Tabs / Filter */}
                        <div className="md:hidden">
                            {activeTab === 'all' ? (
                                <div className="space-y-6">
                                    <KanbanColumn
                                        title="To-do"
                                        status="todo"
                                        tasks={todoTasks}
                                        icon={<Circle className="size-4 text-slate-500" />}
                                        onAddTask={handleCreateTask}
                                        onCardClick={handleViewTaskDetail}
                                        onCardEdit={handleEditTask}
                                        onCardDelete={handleDeleteTaskClick}
                                        onCardStatusChange={handleTaskStatusChange}
                                    />
                                    <KanbanColumn
                                        title="In Progress"
                                        status="in_progress"
                                        tasks={inProgressTasks}
                                        icon={<Clock className="size-4 text-amber-500" />}
                                        onAddTask={handleCreateTask}
                                        onCardClick={handleViewTaskDetail}
                                        onCardEdit={handleEditTask}
                                        onCardDelete={handleDeleteTaskClick}
                                        onCardStatusChange={handleTaskStatusChange}
                                    />
                                    <KanbanColumn
                                        title="Done"
                                        status="done"
                                        tasks={doneTasks}
                                        icon={<CheckCircle2 className="size-4 text-emerald-500" />}
                                        onAddTask={handleCreateTask}
                                        onCardClick={handleViewTaskDetail}
                                        onCardEdit={handleEditTask}
                                        onCardDelete={handleDeleteTaskClick}
                                        onCardStatusChange={handleTaskStatusChange}
                                    />
                                </div>
                            ) : activeTab === 'todo' ? (
                                <KanbanColumn
                                    title="To-do"
                                    status="todo"
                                    tasks={todoTasks}
                                    icon={<Circle className="size-4 text-slate-500" />}
                                    onAddTask={handleCreateTask}
                                    onCardClick={handleViewTaskDetail}
                                    onCardEdit={handleEditTask}
                                    onCardDelete={handleDeleteTaskClick}
                                    onCardStatusChange={handleTaskStatusChange}
                                />
                            ) : activeTab === 'in_progress' ? (
                                <KanbanColumn
                                    title="In Progress"
                                    status="in_progress"
                                    tasks={inProgressTasks}
                                    icon={<Clock className="size-4 text-amber-500" />}
                                    onAddTask={handleCreateTask}
                                    onCardClick={handleViewTaskDetail}
                                    onCardEdit={handleEditTask}
                                    onCardDelete={handleDeleteTaskClick}
                                    onCardStatusChange={handleTaskStatusChange}
                                />
                            ) : (
                                <KanbanColumn
                                    title="Done"
                                    status="done"
                                    tasks={doneTasks}
                                    icon={<CheckCircle2 className="size-4 text-emerald-500" />}
                                    onAddTask={handleCreateTask}
                                    onCardClick={handleViewTaskDetail}
                                    onCardEdit={handleEditTask}
                                    onCardDelete={handleDeleteTaskClick}
                                    onCardStatusChange={handleTaskStatusChange}
                                />
                            )}
                        </div>

                        {/* DragOverlay for visual elevation when dragging */}
                        <DragOverlay>
                            {activeTask ? (
                                <div className="rotate-2 scale-105 opacity-90 shadow-2xl rounded-2xl cursor-grabbing">
                                    <TaskCard
                                        task={activeTask}
                                        onClick={() => {}}
                                        onEdit={() => {}}
                                        onDelete={() => {}}
                                    />
                                </div>
                            ) : null}
                        </DragOverlay>
                    </DndContext>
                </div>
            </div>

            {/* Edit Project Dialog */}
            <ProjectDialog
                open={projectDialogOpen}
                onOpenChange={setProjectDialogOpen}
                project={project}
            />

            {/* Create / Edit Task Dialog */}
            <TaskDialog
                open={taskDialogOpen}
                onOpenChange={setTaskDialogOpen}
                projectId={project.id}
                task={selectedTask}
                defaultStatus={defaultTaskStatus}
            />

            {/* Task Detail Sheet */}
            <TaskDetailSheet
                open={detailSheetOpen}
                onOpenChange={setDetailSheetOpen}
                task={detailTask}
                projectName={project.name}
                onEdit={handleEditTask}
                onDelete={handleDeleteTaskClick}
            />

            {/* Delete Project Alert Dialog */}
            <AlertDialog
                open={projectDeleteAlertOpen}
                onOpenChange={(open) => !open && setProjectDeleteAlertOpen(false)}
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
                            disabled={isDeletingProject}
                            className="rounded-xl"
                        >
                            Batal
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteProject}
                            disabled={isDeletingProject}
                            className="rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                        >
                            {isDeletingProject ? 'Menghapus...' : 'Ya, Hapus Proyek'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Delete Task Alert Dialog */}
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
                            disabled={isDeletingTask}
                            className="rounded-xl"
                        >
                            Batal
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDeleteTask}
                            disabled={isDeletingTask}
                            className="rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                        >
                            {isDeletingTask ? 'Menghapus...' : 'Ya, Hapus Tugas'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AuthenticatedLayout>
    );
}
