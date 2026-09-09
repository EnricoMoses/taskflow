import { TaskStatusType } from '@/types/task';
import { Badge } from '@/Components/ui/badge';
import { Circle, Clock, CheckCircle2 } from 'lucide-react';

interface TaskStatusBadgeProps {
    status: TaskStatusType;
    label?: string;
    className?: string;
}

export default function TaskStatusBadge({
    status,
    label,
    className = '',
}: TaskStatusBadgeProps) {
    const config: Record<
        TaskStatusType,
        { label: string; className: string; icon: React.ComponentType<{ className?: string }> }
    > = {
        todo: {
            label: 'To-do',
            className: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800',
            icon: Circle,
        },
        in_progress: {
            label: 'In Progress',
            className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
            icon: Clock,
        },
        done: {
            label: 'Done',
            className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
            icon: CheckCircle2,
        },
    };

    const current = config[status] || config.todo;
    const Icon = current.icon;

    return (
        <Badge
            variant="outline"
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${current.className} ${className}`}
        >
            <Icon className="size-3" />
            {label || current.label}
        </Badge>
    );
}
