import { TaskPriorityType } from '@/types/task';
import { Badge } from '@/Components/ui/badge';
import { ArrowDown, ArrowRight, ArrowUp } from 'lucide-react';

interface TaskPriorityBadgeProps {
    priority: TaskPriorityType;
    label?: string;
    className?: string;
}

export default function TaskPriorityBadge({
    priority,
    label,
    className = '',
}: TaskPriorityBadgeProps) {
    const config: Record<
        TaskPriorityType,
        { label: string; className: string; icon: React.ComponentType<{ className?: string }> }
    > = {
        low: {
            label: 'Rendah',
            className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
            icon: ArrowDown,
        },
        medium: {
            label: 'Sedang',
            className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
            icon: ArrowRight,
        },
        high: {
            label: 'Tinggi',
            className: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800',
            icon: ArrowUp,
        },
    };

    const current = config[priority] || config.medium;
    const Icon = current.icon;

    return (
        <Badge
            variant="outline"
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border ${current.className} ${className}`}
        >
            <Icon className="size-3" />
            {label || current.label}
        </Badge>
    );
}
