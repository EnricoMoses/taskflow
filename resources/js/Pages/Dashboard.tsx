import { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Project } from '@/types/project';
import { Task } from '@/types/task';
import ProjectStatusBadge from '@/Components/Projects/ProjectStatusBadge';
import TaskPriorityBadge from '@/Components/Tasks/TaskPriorityBadge';
import TaskStatusBadge from '@/Components/Tasks/TaskStatusBadge';
import ProjectDialog from '@/Components/Projects/ProjectDialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
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
    Paperclip,
    TrendingUp,
    CheckSquare2,
    Layers,
} from 'lucide-react';
import { cn } from 'cn';

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
                        <span className="size-2 rounded-full" style={{ backgroundColor: data.color }} />
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

            <div className="space-y-8">
                {/* Greeting & Action Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-card via-card to-primary/5 border border-border/70 rounded-3xl p-6 sm:p-8 shadow-xs">
                    <div className="space-y-1.5">
                        <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                            Selamat Datang, {auth.user.name} 👋
                        </h1>
                        <p className="text-sm text-muted-foreground max-w-2xl">
                            Pantau seluruh proyek, tenggat waktu penting, dan produktivitas tim Anda di satu dashboard.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        <Button
                            variant="outline"
                            className="rounded-xl gap-2 text-xs sm:text-sm"
                            render={
                                <Link href={route('tasks.index')}>
                                    <ListTodo className="size-4" />
                                    Semua Tugas
                                </Link>
                            }
                        />
                        <Button
                            onClick={() => setProjectDialogOpen(true)}
                            className="rounded-xl gap-2 text-xs sm:text-sm shadow-sm"
                        >
                            <Plus className="size-4" />
                            Buat Proyek
                        </Button>
                    </div>
                </div>

                {/* 4 Summary Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {/* Card 1: Total Proyek */}
                    <Card className="rounded-3xl border border-border/70 bg-card p-6 shadow-xs space-y-4 hover:border-primary/40 transition-colors">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Total Proyek
                            </span>
                            <div className="size-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                <FolderKanban className="size-5" />
                            </div>
                        </div>
                        <div>
                            <div className="text-3xl font-heading font-bold text-foreground">
                                {summary.total_projects}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {summary.total_projects > 0 ? 'Proyek aktif & terdaftar' : 'Belum ada proyek'}
                            </p>
                        </div>
                    </Card>

                    {/* Card 2: Total Task */}
                    <Card className="rounded-3xl border border-border/70 bg-card p-6 shadow-xs space-y-4 hover:border-primary/40 transition-colors">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Total Tugas
                            </span>
                            <div className="size-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                                <ListTodo className="size-5" />
                            </div>
                        </div>
                        <div>
                            <div className="text-3xl font-heading font-bold text-foreground">
                                {summary.total_tasks}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Lintas seluruh proyek Anda
                            </p>
                        </div>
                    </Card>

                    {/* Card 3: Task Selesai */}
                    <Card className="rounded-3xl border border-border/70 bg-card p-6 shadow-xs space-y-4 hover:border-primary/40 transition-colors">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Tugas Selesai
                            </span>
                            <div className="size-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                <CheckCircle2 className="size-5" />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-heading font-bold text-foreground">
                                    {summary.completed_tasks}
                                </span>
                                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                    {summary.completion_rate}% Selesai
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Dari {summary.total_tasks} total tugas
                            </p>
                        </div>
                    </Card>

                    {/* Card 4: Task Overdue */}
                    <Card className={cn(
                        "rounded-3xl border p-6 shadow-xs space-y-4 transition-colors",
                        summary.overdue_tasks > 0
                            ? "border-destructive/30 bg-destructive/5 hover:border-destructive/50"
                            : "border-border/70 bg-card hover:border-primary/40"
                    )}>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Tugas Terlambat
                            </span>
                            <div className={cn(
                                "size-10 rounded-2xl flex items-center justify-center",
                                summary.overdue_tasks > 0
                                    ? "bg-destructive/10 text-destructive"
                                    : "bg-amber-500/10 text-amber-500"
                            )}>
                                <AlertTriangle className="size-5" />
                            </div>
                        </div>
                        <div>
                            <div className={cn(
                                "text-3xl font-heading font-bold",
                                summary.overdue_tasks > 0 ? "text-destructive" : "text-foreground"
                            )}>
                                {summary.overdue_tasks}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {summary.overdue_tasks > 0 ? 'Perlu tindakan segera' : 'Semua tugas tepat waktu'}
                            </p>
                        </div>
                    </Card>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Chart 1: Distribusi Status Task (Donut) */}
                    <Card className="rounded-3xl border border-border/70 bg-card shadow-xs">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-heading font-semibold text-foreground flex items-center gap-2">
                                <CheckSquare2 className="size-4 text-primary" />
                                Distribusi Status Tugas
                            </CardTitle>
                            <CardDescription className="text-xs text-muted-foreground">
                                Perbandingan status pengerjaan seluruh tugas
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-2">
                            {hasTasks ? (
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                                    <div className="relative size-52 sm:size-60 shrink-0 flex items-center justify-center">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <RechartsTooltip content={<CustomPieTooltip />} />
                                                <Pie
                                                    data={task_distribution}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={65}
                                                    outerRadius={90}
                                                    paddingAngle={4}
                                                    dataKey="count"
                                                >
                                                    {task_distribution.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                                    ))}
                                                </Pie>
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
                                            <span className="text-2xl font-heading font-bold text-foreground">
                                                {summary.total_tasks}
                                            </span>
                                            <span className="text-[11px] text-muted-foreground">Total Tugas</span>
                                        </div>
                                    </div>

                                    {/* Legend breakdown list */}
                                    <div className="w-full space-y-2.5">
                                        {task_distribution.map((item) => (
                                            <div
                                                key={item.status}
                                                className="flex items-center justify-between p-2.5 rounded-xl bg-muted/30 border border-border/50 text-xs"
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <span
                                                        className="size-3 rounded-full shrink-0"
                                                        style={{ backgroundColor: item.color }}
                                                    />
                                                    <span className="font-medium text-foreground">{item.label}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-foreground">{item.count}</span>
                                                    <span className="text-[11px] text-muted-foreground w-10 text-right">
                                                        {summary.total_tasks > 0
                                                            ? Math.round((item.count / summary.total_tasks) * 100)
                                                            : 0}%
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="h-60 flex flex-col items-center justify-center text-center space-y-2 text-muted-foreground">
                                    <CheckSquare2 className="size-8 opacity-40" />
                                    <p className="text-xs">Belum ada data tugas untuk ditampilkan.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Chart 2: Distribusi Proyek per Status (Bar) */}
                    <Card className="rounded-3xl border border-border/70 bg-card shadow-xs">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-heading font-semibold text-foreground flex items-center gap-2">
                                <Layers className="size-4 text-primary" />
                                Distribusi Status Proyek
                            </CardTitle>
                            <CardDescription className="text-xs text-muted-foreground">
                                Jumlah proyek berdasarkan tahapan status
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-2">
                            {hasProjects ? (
                                <div className="h-60 w-full pt-2">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={project_distribution}
                                            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                                            <XAxis
                                                dataKey="label"
                                                tickLine={false}
                                                axisLine={false}
                                                tick={{ fontSize: 11, fill: 'currentColor' }}
                                                className="text-muted-foreground"
                                            />
                                            <YAxis
                                                allowDecimals={false}
                                                tickLine={false}
                                                axisLine={false}
                                                tick={{ fontSize: 11, fill: 'currentColor' }}
                                                className="text-muted-foreground"
                                            />
                                            <RechartsTooltip content={<CustomBarTooltip />} />
                                            <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                                                {project_distribution.map((entry, index) => (
                                                    <Cell key={`bar-${index}`} fill={entry.color} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="h-60 flex flex-col items-center justify-center text-center space-y-2 text-muted-foreground">
                                    <FolderKanban className="size-8 opacity-40" />
                                    <p className="text-xs">Belum ada proyek untuk ditampilkan.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Two-Column Lists: Tasks & Recent Projects */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column: Upcoming & Overdue Tasks */}
                    <div className="space-y-6">
                        {/* Upcoming Deadlines */}
                        <Card className="rounded-3xl border border-border/70 bg-card shadow-xs">
                            <CardHeader className="flex flex-row items-center justify-between pb-3">
                                <div>
                                    <CardTitle className="text-base font-heading font-semibold text-foreground flex items-center gap-2">
                                        <Clock className="size-4 text-primary" />
                                        Tenggat Waktu Terdekat
                                    </CardTitle>
                                    <CardDescription className="text-xs text-muted-foreground">
                                        5 tugas yang harus segera diselesaikan
                                    </CardDescription>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs text-primary hover:text-primary/80 gap-1 rounded-xl h-8"
                                    render={
                                        <Link href={route('tasks.index')}>
                                            Lihat Semua <ArrowRight className="size-3" />
                                        </Link>
                                    }
                                />
                            </CardHeader>
                            <CardContent className="pt-0">
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
                                                    <div className="inline-flex items-center gap-1 text-xs font-medium text-foreground bg-muted/50 px-2 py-1 rounded-lg">
                                                        <Calendar className="size-3 text-muted-foreground" />
                                                        <span>{task.deadline_formatted}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-8 text-center text-xs text-muted-foreground space-y-1">
                                        <CheckCircle2 className="size-6 mx-auto opacity-40 text-emerald-500" />
                                        <p>Tidak ada tugas mendekati tenggat saat ini.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Overdue Tasks List (if any) */}
                        {overdue_tasks_list.length > 0 && (
                            <Card className="rounded-3xl border border-destructive/30 bg-destructive/5 shadow-xs">
                                <CardHeader className="flex flex-row items-center justify-between pb-3">
                                    <div>
                                        <CardTitle className="text-base font-heading font-semibold text-destructive flex items-center gap-2">
                                            <AlertTriangle className="size-4" />
                                            Tugas Terlambat (Overdue)
                                        </CardTitle>
                                        <CardDescription className="text-xs text-muted-foreground">
                                            Tugas yang telah melewati tanggal tenggat waktu
                                        </CardDescription>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-xs text-destructive hover:bg-destructive/10 rounded-xl h-8"
                                        render={
                                            <Link href={route('tasks.index', { deadline_preset: 'overdue' })}>
                                                Filter <ArrowRight className="size-3" />
                                            </Link>
                                        }
                                    />
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <div className="divide-y divide-destructive/20">
                                        {overdue_tasks_list.map((task) => (
                                            <div
                                                key={task.id}
                                                className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3 group"
                                            >
                                                <div className="space-y-1 min-w-0 flex-1">
                                                    <div className="flex items-center gap-2">
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
                                                    <h4 className="font-heading font-semibold text-sm text-foreground truncate">
                                                        {task.title}
                                                    </h4>
                                                </div>

                                                <div className="text-right shrink-0">
                                                    <span className="text-xs font-bold text-destructive bg-destructive/15 px-2 py-0.5 rounded-md">
                                                        {task.deadline_formatted}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Column: Recent Projects with Progress */}
                    <div>
                        <Card className="rounded-3xl border border-border/70 bg-card shadow-xs h-full flex flex-col justify-between">
                            <div>
                                <CardHeader className="flex flex-row items-center justify-between pb-3">
                                    <div>
                                        <CardTitle className="text-base font-heading font-semibold text-foreground flex items-center gap-2">
                                            <FolderKanban className="size-4 text-primary" />
                                            Proyek Terbaru
                                        </CardTitle>
                                        <CardDescription className="text-xs text-muted-foreground">
                                            Aktivitas proyek yang baru diperbarui
                                        </CardDescription>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-xs text-primary hover:text-primary/80 gap-1 rounded-xl h-8"
                                        render={
                                            <Link href={route('projects.index')}>
                                                Semua Proyek <ArrowRight className="size-3" />
                                            </Link>
                                        }
                                    />
                                </CardHeader>
                                <CardContent className="pt-0">
                                    {recent_projects.length > 0 ? (
                                        <div className="divide-y divide-border/60">
                                            {recent_projects.map((project) => (
                                                <Link
                                                    key={project.id}
                                                    href={route('projects.show', project.id)}
                                                    className="py-3.5 first:pt-0 last:pb-0 block group hover:bg-muted/30 -mx-3 px-3 rounded-2xl transition-colors"
                                                >
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="space-y-1 min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <ProjectStatusBadge
                                                                    status={project.status}
                                                                    label={project.status_label}
                                                                />
                                                            </div>
                                                            <h4 className="font-heading font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate">
                                                                {project.name}
                                                            </h4>
                                                        </div>

                                                        <span className="text-xs font-bold text-foreground shrink-0">
                                                            {project.progress_percentage}%
                                                        </span>
                                                    </div>

                                                    {/* Progress bar & metadata */}
                                                    <div className="mt-2.5 space-y-1.5">
                                                        <Progress
                                                            value={project.progress_percentage}
                                                            className="h-1.5 rounded-full"
                                                        />
                                                        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                                                            <span>
                                                                {project.completed_tasks_count} / {project.tasks_count} Tugas Selesai
                                                            </span>
                                                            <span>Tenggat: {project.deadline_formatted}</span>
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-12 text-center text-xs text-muted-foreground space-y-3">
                                            <FolderKanban className="size-8 mx-auto opacity-40 text-muted-foreground" />
                                            <p>Belum ada proyek yang dibuat.</p>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setProjectDialogOpen(true)}
                                                className="rounded-xl text-xs"
                                            >
                                                <Plus className="size-3 mr-1" />
                                                Buat Proyek Pertama
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </div>
                        </Card>
                    </div>
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
