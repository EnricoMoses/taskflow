import { TaskAttachment } from '@/types/attachment';

export type TaskStatusType = 'todo' | 'in_progress' | 'done';
export type TaskPriorityType = 'low' | 'medium' | 'high';

export interface TaskProjectSummary {
    id: number;
    name: string;
}

export interface Task {
    id: number;
    project_id: number;
    project?: TaskProjectSummary | null;
    title: string;
    description: string | null;
    deadline: string | null;
    deadline_formatted: string | null;
    is_overdue: boolean;
    is_today: boolean;
    status: TaskStatusType;
    status_label: string;
    priority: TaskPriorityType;
    priority_label: string;
    order: number;
    attachments_count: number;
    attachments?: TaskAttachment[];
    created_at: string;
    updated_at: string;
}

export interface TaskFormData {
    title: string;
    description?: string;
    deadline?: string;
    status: TaskStatusType;
    priority: TaskPriorityType;
}

export interface TaskFilters {
    search?: string;
    status?: string | string[];
    priority?: string | string[];
    project_id?: string | number;
    deadline_preset?: string;
    deadline_from?: string;
    deadline_to?: string;
    sort?: string;
    direction?: 'asc' | 'desc';
}

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    first_page_url: string;
    from: number | null;
    last_page: number;
    last_page_url: string;
    links: PaginationLink[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
}
