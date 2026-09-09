import { TaskAttachment } from '@/types/attachment';

export type TaskStatusType = 'todo' | 'in_progress' | 'done';
export type TaskPriorityType = 'low' | 'medium' | 'high';

export interface Task {
    id: number;
    project_id: number;
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
