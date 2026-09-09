<?php

namespace App\Http\Resources;

use App\Enums\ProjectStatus;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Project
 */
class ProjectResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $deadlineCarbon = $this->deadline ? Carbon::parse($this->deadline) : null;
        $isCompleted = $this->status === ProjectStatus::COMPLETED;
        $isOverdue = $deadlineCarbon && $deadlineCarbon->isPast() && !$isCompleted && !$deadlineCarbon->isToday();

        $tasksCount = $this->tasks_count ?? 0;
        $completedTasksCount = $this->completed_tasks_count ?? 0;
        $inProgressTasksCount = $this->in_progress_tasks_count ?? 0;
        $todoTasksCount = $this->todo_tasks_count ?? 0;

        $progressPercentage = $tasksCount > 0 ? (int) round(($completedTasksCount / $tasksCount) * 100) : 0;

        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'deadline' => $deadlineCarbon?->format('Y-m-d'),
            'deadline_formatted' => $deadlineCarbon?->format('d M Y'),
            'is_overdue' => $isOverdue,
            'is_today' => $deadlineCarbon?->isToday() ?? false,
            'status' => $this->status instanceof ProjectStatus ? $this->status->value : $this->status,
            'status_label' => $this->status instanceof ProjectStatus ? $this->status->label() : ucfirst(str_replace('_', ' ', (string) $this->status)),
            'tasks_count' => $tasksCount,
            'completed_tasks_count' => $completedTasksCount,
            'in_progress_tasks_count' => $inProgressTasksCount,
            'todo_tasks_count' => $todoTasksCount,
            'progress_percentage' => $progressPercentage,
            'tasks' => TaskResource::collection($this->whenLoaded('tasks')),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
