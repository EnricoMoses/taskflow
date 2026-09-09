export interface TaskAttachment {
    id: number;
    task_id: number;
    original_name: string;
    file_path: string;
    url: string;
    download_url: string;
    mime_type: string;
    size: number;
    size_formatted: string;
    created_at: string;
    created_at_formatted: string;
}
