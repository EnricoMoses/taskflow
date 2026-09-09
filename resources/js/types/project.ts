import { Task } from '@/types/task';

export type ProjectStatusType = 'planning' | 'in_progress' | 'completed' | 'on_hold';

export interface ProjectStatusOption {
    value: ProjectStatusType;
    label: string;
}

export interface Project {
    id: number;
    name: string;
    description: string | null;
    deadline: string;
    deadline_formatted: string;
    is_overdue: boolean;
    is_today: boolean;
    status: ProjectStatusType;
    status_label: string;
    tasks_count: number;
    completed_tasks_count: number;
    in_progress_tasks_count: number;
    todo_tasks_count: number;
    progress_percentage: number;
    tasks?: Task[];
    created_at: string;
    updated_at: string;
}

export interface ProjectFormData {
    name: string;
    description: string;
    deadline: string;
    status: ProjectStatusType;
}

export interface ProjectFilters {
    search?: string;
    status?: string;
}
