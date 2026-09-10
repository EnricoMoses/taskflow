<?php

namespace App\Http\Resources;

use App\Enums\TaskPriority;
use App\Enums\TaskStatus;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Task
 */
class TaskResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $deadlineCarbon = $this->deadline ? Carbon::parse($this->deadline) : null;
        $isDone = $this->status === TaskStatus::DONE;
        $isOverdue = $deadlineCarbon && $deadlineCarbon->isPast() && !$isDone && !$deadlineCarbon->isToday();

        return [
            'id' => $this->id,
            'project_id' => $this->project_id,
            'title' => $this->title,
            'description' => $this->description,
            'deadline' => $deadlineCarbon?->format('Y-m-d'),
            'deadline_formatted' => $deadlineCarbon?->format('d M Y'),
            'is_overdue' => $isOverdue,
            'is_today' => $deadlineCarbon?->isToday() ?? false,
            'status' => $this->status instanceof TaskStatus ? $this->status->value : $this->status,
            'status_label' => $this->status instanceof TaskStatus ? $this->status->label() : ucfirst((string) $this->status),
            'priority' => $this->priority instanceof TaskPriority ? $this->priority->value : $this->priority,
            'priority_label' => $this->priority instanceof TaskPriority ? $this->priority->label() : ucfirst((string) $this->priority),
            'order' => $this->order ?? 0,
            'project_id' => $this->project_id,
            'project' => $this->relationLoaded('project') && $this->project ? [
                'id' => $this->project->id,
                'name' => $this->project->name,
            ] : null,
            'attachments_count' => $this->attachments_count ?? ($this->relationLoaded('attachments') ? $this->attachments->count() : 0),
            'attachments' => TaskAttachmentResource::collection($this->whenLoaded('attachments')),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
