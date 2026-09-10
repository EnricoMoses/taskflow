import { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Project } from '@/types/project';
import { Task } from '@/types/task';
import ProjectStatusBadge from '@/Components/Projects/ProjectStatusBadge';
import TaskPriorityBadge from '@/Components/Tasks/TaskPriorityBadge';
import TaskStatusBadge from '@/Components/Tasks/TaskStatusBadge';
import ProjectDialog from '@/Components/Projects/ProjectDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Progress } from '@/Components/ui/progress';
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip as RechartsTooltip,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
} from 'recharts';
import {
    FolderKanban,
    CheckCircle2,
    Clock,
    AlertTriangle,
    Plus,
    ListTodo,
    ArrowRight,
    Calendar,
    RotateCw,
    TrendingUp,
    LayoutGrid,
    PieChart as PieChartIcon,
    Inbox,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface DistributionItem {
    status: string;
    label: string;
    count: number;
    color: string;
}

interface DashboardProps {
    summary: {
        total_projects: number;
        total_tasks: number;
        completed_tasks: number;
        overdue_tasks: number;
        completion_rate: number;
    };
    task_distribution: DistributionItem[];
    project_distribution: DistributionItem[];
    upcoming_tasks: Task[];
    overdue_tasks_list: Task[];
    recent_projects: Project[];
}

export default function Dashboard({
    summary,
    task_distribution,
    project_distribution,
    upcoming_tasks,
    overdue_tasks_list,
    recent_projects,
}: DashboardProps) {
    const { auth } = usePage<PageProps>().props;
    const [projectDialogOpen, setProjectDialogOpen] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = () => {
        setIsRefreshing(true);
        router.reload({
            onFinish: () => {
                setIsRefreshing(false);
                toast.success('Data dashboard berhasil diperbarui');
            },
        });
    };

    // Colors matching reference style (Green / Yellow-Amber / Coral-Red)
    const taskStatusColors: Record<string, string> = {
        done: '#10b981',       // Emerald Green
        in_progress: '#f59e0b',// Golden Amber
        todo: '#ef4444',       // Coral Red
    };

    const formattedTaskDistribution = task_distribution.map((item) => ({
        ...item,
        color: taskStatusColors[item.status] || item.color,
    }));

    // Custom Pie Chart Tooltip
    const CustomPieTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-popover border border-border/80 rounded-xl p-2.5 shadow-lg text-xs space-y-1">
                    <p className="font-semibold text-foreground flex items-center gap-1.5">
                        <span className="size-2 rounded-full" style={{ backgroundColor: data.color }} />
                        {data.label}
                    </p>
                    <p className="text-muted-foreground">
                        {data.count} Tugas ({summary.total_tasks > 0 ? Math.round((data.count / summary.total_tasks) * 100) : 0}%)
                    </p>
                </div>
            );
        }
        return null;
    };

    // Custom Bar Chart Tooltip
    const CustomBarTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-popover border border-border/80 rounded-xl p-2.5 shadow-lg text-xs space-y-1">
                    <p className="font-semibold text-foreground flex items-center gap-1.5">
                        <span className="size-2 rounded-full bg-cyan-600" />
                        {data.label}
                    </p>
                    <p className="text-muted-foreground">{data.count} Proyek</p>
                </div>
            );
        }
        return null;
    };

    const hasTasks = summary.total_tasks > 0;
    const hasProjects = summary.total_projects > 0;

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard - TaskFlow" />

            <div className="space-y-6 sm:space-y-8">
                {/* Greeting & Quick Action Row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                            Halo, {auth.user.name}
                        </h1>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>Ringkasan TaskFlow</span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-muted text-muted-foreground border border-border/60">
                                Workspace
                            </span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2.5">
                        <Button
                            onClick={() => setProjectDialogOpen(true)}
                            className="rounded-2xl gap-2 text-xs sm:text-sm font-medium h-10 px-4 bg-foreground text-background hover:bg-foreground/90 shadow-xs"
                        >
                            <Plus className="size-4" />
                            Tambah Proyek
                        </Button>

                        <Button
                            variant="outline"
                            className="rounded-2xl gap-2 text-xs sm:text-sm font-medium h-10 px-4 border-border/80 bg-card hover:bg-muted/80 shadow-xs"
                            render={
                                <Link href={route('tasks.index')}>
                                    <ListTodo className="size-4" />
                                    Semua Tugas
                                </Link>
                            }
                        />

                        <Button
                            variant="outline"
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className="rounded-2xl gap-2 text-xs sm:text-sm font-medium h-10 px-4 border-border/80 bg-card hover:bg-muted/80 shadow-xs"
                        >
                            <RotateCw className={cn("size-3.5 text-muted-foreground", isRefreshing && "animate-spin")} />
                            Refresh Data
                        </Button>
                    </div>
                </div>

                {/* 4 Summary Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                    {/* Card 1: Total Proyek */}
                    <div className="bg-card rounded-2xl border border-border/80 p-5 shadow-xs flex items-center gap-4 hover:border-blue-500/40 transition-colors">
                        <div className="size-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                            <FolderKanban className="size-6" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-semibold text-muted-foreground">
                                Total Proyek
                            </p>
                            <p className="text-2xl sm:text-3xl font-heading font-extrabold text-foreground tracking-tight mt-0.5">
                                {summary.total_projects}
                            </p>
                        </div>
                    </div>

                    {/* Card 2: Total Tugas */}
                    <div className="bg-card rounded-2xl border border-border/80 p-5 shadow-xs flex items-center gap-4 hover:border-purple-500/40 transition-colors">
                        <div className="size-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                            <ListTodo className="size-6" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-semibold text-muted-foreground">
                                Total Tugas
                            </p>
                            <p className="text-2xl sm:text-3xl font-heading font-extrabold text-foreground tracking-tight mt-0.5">
                                {summary.total_tasks}
                            </p>
                        </div>
                    </div>

                    {/* Card 3: Tugas Selesai */}
                    <div className="bg-card rounded-2xl border border-border/80 p-5 shadow-xs flex items-center gap-4 hover:border-emerald-500/40 transition-colors">
                        <div className="size-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="size-6" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-semibold text-muted-foreground">
                                Tugas Selesai
                            </p>
                            <p className="text-2xl sm:text-3xl font-heading font-extrabold text-foreground tracking-tight mt-0.5">
                                {summary.completed_tasks}
                            </p>
                        </div>
                    </div>

                    {/* Card 4: Tugas Terlambat */}
                    <div className="bg-card rounded-2xl border border-border/80 p-5 shadow-xs flex items-center gap-4 hover:border-amber-500/40 transition-colors">
                        <div className={cn(
                            "size-12 rounded-2xl flex items-center justify-center shrink-0",
                            summary.overdue_tasks > 0 
                                ? "bg-destructive/10 text-destructive" 
                                : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        )}>
                            <Clock className="size-6" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-semibold text-muted-foreground">
                                Tugas Terlambat
                            </p>
                            <p className={cn(
                                "text-2xl sm:text-3xl font-heading font-extrabold tracking-tight mt-0.5",
                                summary.overdue_tasks > 0 ? "text-destructive" : "text-foreground"
                            )}>
                                {summary.overdue_tasks}
                            </p>
                        </div>
                    </div>
                </div>

                {/* 2-Column Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Chart 1: Distribusi Status Tugas */}
                    <Card className="rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden">
                        <CardHeader className="p-5 sm:p-6 pb-2">
                            <div className="flex items-center gap-2.5">
                                <div className="size-8 rounded-xl bg-muted/70 flex items-center justify-center text-muted-foreground">
                                    <Clock className="size-4" />
                                </div>
                                <CardTitle className="text-base font-heading font-bold text-foreground">
                                    Distribusi Status Tugas
                                </CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-5 sm:p-6 pt-2">
                            {hasTasks ? (
                                <div className="flex flex-col items-center justify-center py-2">
                                    <div className="relative size-56 flex items-center justify-center">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <RechartsTooltip content={<CustomPieTooltip />} />
                                                <Pie
                                                    data={formattedTaskDistribution}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={62}
                                                    outerRadius={88}
                                                    paddingAngle={3}
                                                    dataKey="count"
                                                >
                                                    {formattedTaskDistribution.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                                    ))}
                                                </Pie>
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
                                            <span className="text-3xl font-heading font-extrabold text-foreground leading-none">
                                                {summary.total_tasks}
                                            </span>
                                            <span className="text-xs text-muted-foreground font-medium mt-1">Total</span>
                                        </div>
                                    </div>

                                    {/* Horizontal Color Legend */}
                                    <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-4 pt-3 border-t border-border/50 w-full">
                                        <div className="flex items-center gap-2 text-xs">
                                            <span className="size-3 rounded-xs bg-[#10b981]" />
                                            <span className="text-muted-foreground font-medium">Selesai</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs">
                                            <span className="size-3 rounded-xs bg-[#f59e0b]" />
                                            <span className="text-muted-foreground font-medium">Sedang Dikerjakan</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs">
                                            <span className="size-3 rounded-xs bg-[#ef4444]" />
                                            <span className="text-muted-foreground font-medium">Belum Mulai</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-56 flex flex-col items-center justify-center text-center p-6 space-y-3 text-muted-foreground">
                                    <div className="size-12 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground/70">
                                        <ListTodo className="size-6" />
                                    </div>
                                    <p className="text-sm font-medium text-foreground/80">Belum ada data tugas untuk ditampilkan.</p>
                                    <p className="text-xs text-muted-foreground max-w-xs">
                                        Buat tugas baru di dalam proyek Anda untuk melihat pembagian status pengerjaan.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Chart 2: Distribusi Status Proyek */}
                    <Card className="rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden">
                        <CardHeader className="p-5 sm:p-6 pb-2">
                            <div className="flex items-center gap-2.5">
                                <div className="size-8 rounded-xl bg-muted/70 flex items-center justify-center text-muted-foreground">
                                    <TrendingUp className="size-4" />
                                </div>
                                <CardTitle className="text-base font-heading font-bold text-foreground">
                                    Distribusi Status Proyek
                                </CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-5 sm:p-6 pt-2">
                            {hasProjects ? (
                                <div className="h-56 w-full pt-2">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            layout="vertical"
                                            data={project_distribution}
                                            margin={{ top: 10, right: 20, left: 40, bottom: 0 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.2} />
                                            <XAxis
                                                type="number"
                                                allowDecimals={false}
                                                tickLine={false}
                                                axisLine={false}
                                                tick={{ fontSize: 11, fill: 'currentColor' }}
                                                className="text-muted-foreground"
                                            />
                                            <YAxis
                                                type="category"
                                                dataKey="label"
                                                tickLine={false}
                                                axisLine={false}
                                                tick={{ fontSize: 11, fill: 'currentColor' }}
                                                className="text-muted-foreground"
                                                width={90}
                                            />
                                            <RechartsTooltip content={<CustomBarTooltip />} />
                                            <Bar 
                                                dataKey="count" 
                                                fill="#0891b2" 
                                                radius={[0, 6, 6, 0]}
                                                barSize={18}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="h-56 flex flex-col items-center justify-center text-center p-6 space-y-3 text-muted-foreground">
                                    <div className="size-12 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground/70">
                                        <FolderKanban className="size-6" />
                                    </div>
                                    <p className="text-sm font-medium text-foreground/80">Belum ada proyek untuk ditampilkan.</p>
                                    <Button
                                        size="sm"
                                        onClick={() => setProjectDialogOpen(true)}
                                        className="rounded-xl text-xs gap-1.5 h-8 px-3"
                                    >
                                        <Plus className="size-3.5" />
                                        Buat Proyek Baru
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Bottom 2-Column Lists: Tenggat Waktu & Proyek Terbaru */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column: Tenggat Waktu Terdekat */}
                    <Card className="rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden">
                        <CardHeader className="p-5 sm:p-6 pb-3 flex flex-row items-center justify-between border-b border-border/40">
                            <div className="flex items-center gap-2.5">
                                <div className="size-8 rounded-xl bg-muted/70 flex items-center justify-center text-muted-foreground">
                                    <Clock className="size-4" />
                                </div>
                                <CardTitle className="text-base font-heading font-bold text-foreground">
                                    Tenggat Waktu Terdekat
                                </CardTitle>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs text-primary hover:text-primary/80 gap-1 rounded-xl h-8 px-2.5"
                                render={
                                    <Link href={route('tasks.index')}>
                                        Lihat Semua <ArrowRight className="size-3" />
                                    </Link>
                                }
                            />
                        </CardHeader>
                        <CardContent className="p-5 sm:p-6 pt-4">
                            {upcoming_tasks.length > 0 ? (
                                <div className="divide-y divide-border/60">
                                    {upcoming_tasks.map((task) => (
                                        <div
                                            key={task.id}
                                            className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3 group"
                                        >
                                            <div className="space-y-1 min-w-0 flex-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <TaskPriorityBadge priority={task.priority} label={task.priority_label} />
                                                    {task.project && (
                                                        <Link
                                                            href={route('projects.show', task.project.id)}
                                                            className="text-[11px] font-medium text-muted-foreground hover:text-foreground flex items-center gap-1 truncate max-w-[150px]"
                                                        >
                                                            <FolderKanban className="size-3" />
                                                            {task.project.name}
                                                        </Link>
                                                    )}
                                                </div>
                                                <h4 className="font-heading font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate">
                                                    {task.title}
                                                </h4>
                                            </div>

                                            <div className="text-right shrink-0">
                                                <div className="inline-flex items-center gap-1 text-xs font-medium text-foreground bg-muted/50 px-2.5 py-1 rounded-xl">
                                                    <Calendar className="size-3 text-muted-foreground" />
                                                    <span>{task.deadline_formatted}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-10 flex flex-col items-center justify-center text-center space-y-2 text-muted-foreground">
                                    <div className="size-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                        <CheckCircle2 className="size-5" />
                                    </div>
                                    <p className="text-sm font-medium text-foreground/80">Tidak ada tugas mendekati tenggat saat ini.</p>
                                    <p className="text-xs text-muted-foreground">Semua jadwal dan tenggat waktu tugas Anda terkontrol dengan baik.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Right Column: Proyek Terbaru */}
                    <Card className="rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden">
                        <CardHeader className="p-5 sm:p-6 pb-3 flex flex-row items-center justify-between border-b border-border/40">
                            <div className="flex items-center gap-2.5">
                                <div className="size-8 rounded-xl bg-muted/70 flex items-center justify-center text-muted-foreground">
                                    <FolderKanban className="size-4" />
                                </div>
                                <CardTitle className="text-base font-heading font-bold text-foreground">
                                    Proyek Terbaru
                                </CardTitle>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs text-primary hover:text-primary/80 gap-1 rounded-xl h-8 px-2.5"
                                render={
                                    <Link href={route('projects.index')}>
                                        Lihat Semua <ArrowRight className="size-3" />
                                    </Link>
                                }
                            />
                        </CardHeader>
                        <CardContent className="p-5 sm:p-6 pt-4">
                            {recent_projects.length > 0 ? (
                                <div className="divide-y divide-border/60">
                                    {recent_projects.map((project) => (
                                        <div
                                            key={project.id}
                                            className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3 group"
                                        >
                                            <div className="space-y-1.5 min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <ProjectStatusBadge status={project.status} label={project.status_label} />
                                                    <span className="text-[11px] text-muted-foreground">
                                                        {project.completed_tasks_count}/{project.tasks_count} Tugas
                                                    </span>
                                                </div>
                                                <Link
                                                    href={route('projects.show', project.id)}
                                                    className="font-heading font-semibold text-sm text-foreground group-hover:text-primary transition-colors block truncate"
                                                >
                                                    {project.name}
                                                </Link>
                                                <div className="w-full max-w-xs flex items-center gap-2">
                                                    <Progress value={project.progress_percentage} className="h-1.5" />
                                                    <span className="text-[10px] font-bold text-muted-foreground">
                                                        {project.progress_percentage}%
                                                    </span>
                                                </div>
                                            </div>

                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="rounded-xl size-8 p-0 shrink-0 text-muted-foreground hover:text-foreground"
                                                render={
                                                    <Link href={route('projects.show', project.id)}>
                                                        <ArrowRight className="size-4" />
                                                    </Link>
                                                }
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-10 flex flex-col items-center justify-center text-center space-y-3 text-muted-foreground">
                                    <div className="size-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                        <FolderKanban className="size-5" />
                                    </div>
                                    <p className="text-sm font-medium text-foreground/80">Belum ada proyek yang dibuat.</p>
                                    <Button
                                        size="sm"
                                        onClick={() => setProjectDialogOpen(true)}
                                        className="rounded-xl text-xs gap-1.5 h-8 px-3"
                                    >
                                        <Plus className="size-3.5" />
                                        Mulai Buat Proyek
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Create Project Dialog */}
            <ProjectDialog
                open={projectDialogOpen}
                onOpenChange={setProjectDialogOpen}
            />
        </AuthenticatedLayout>
    );
}
