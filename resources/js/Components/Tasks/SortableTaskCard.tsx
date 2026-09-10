import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task, TaskStatusType } from '@/types/task';
import TaskCard from '@/Components/Tasks/TaskCard';

interface SortableTaskCardProps {
    task: Task;
    onClick: (task: Task) => void;
    onEdit: (task: Task) => void;
    onDelete: (task: Task) => void;
    onStatusChange?: (task: Task, newStatus: TaskStatusType) => void;
}

export default function SortableTaskCard({
    task,
    onClick,
    onEdit,
    onDelete,
    onStatusChange,
}: SortableTaskCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: task.id,
        data: {
            type: 'Task',
            task,
        },
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`touch-manipulation ${isDragging ? 'opacity-30 z-0' : 'opacity-100'}`}
        >
            <TaskCard
                task={task}
                onClick={onClick}
                onEdit={onEdit}
                onDelete={onDelete}
                onStatusChange={onStatusChange}
            />
        </div>
    );
}
