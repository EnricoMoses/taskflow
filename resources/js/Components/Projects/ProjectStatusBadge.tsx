import { ProjectStatusType } from '@/types/project';
import { Badge } from '@/Components/ui/badge';
import { Clock, PlayCircle, CheckCircle2, PauseCircle } from 'lucide-react';

interface ProjectStatusBadgeProps {
    status: ProjectStatusType;
    label?: string;
    className?: string;
}

export default function ProjectStatusBadge({
    status,
    label,
    className = '',
}: ProjectStatusBadgeProps) {
    const config: Record<
        ProjectStatusType,
        { label: string; className: string; icon: React.ComponentType<{ className?: string }> }
    > = {
        planning: {
            label: 'Planning',
            className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 hover:bg-blue-500/20',
            icon: Clock,
        },
        in_progress: {
            label: 'In Progress',
            className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800 hover:bg-amber-500/20',
            icon: PlayCircle,
        },
        completed: {
            label: 'Completed',
            className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-500/20',
            icon: CheckCircle2,
        },
        on_hold: {
            label: 'On Hold',
            className: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-500/20',
            icon: PauseCircle,
        },
    };

    const current = config[status] || config.planning;
    const Icon = current.icon;

    return (
        <Badge
            variant="outline"
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${current.className} ${className}`}
        >
            <Icon className="size-3.5" />
            {label || current.label}
        </Badge>
    );
}
