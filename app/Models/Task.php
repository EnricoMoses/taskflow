<?php

namespace App\Models;

use App\Enums\TaskPriority;
use App\Enums\TaskStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Task extends Model
{
    /** @use HasFactory<\Database\Factories\TaskFactory> */
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'project_id',
        'title',
        'description',
        'deadline',
        'status',
        'priority',
        'order',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'deadline' => 'date',
            'status' => TaskStatus::class,
            'priority' => TaskPriority::class,
            'order' => 'integer',
        ];
    }

    /**
     * Get the project that owns the task.
     *
     * @return BelongsTo<Project, $this>
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Get the attachments for the task.
     *
     * @return HasMany<TaskAttachment, $this>
     */
    public function attachments(): HasMany
    {
        return $this->hasMany(TaskAttachment::class);
    }

    /**
     * Scope a query to search tasks by title or description.
     */
    public function scopeSearch($query, ?string $term)
    {
        if (empty($term)) {
            return $query;
        }

        return $query->where(function ($q) use ($term) {
            $q->where('title', 'like', "%{$term}%")
              ->orWhere('description', 'like', "%{$term}%");
        });
    }

    /**
     * Scope a query to filter tasks by status (string or array).
     */
    public function scopeStatus($query, $status)
    {
        if (empty($status) || $status === 'all') {
            return $query;
        }

        if (is_array($status)) {
            $statuses = array_filter($status, fn ($s) => !empty($s) && $s !== 'all');
            return !empty($statuses) ? $query->whereIn('status', $statuses) : $query;
        }

        return $query->where('status', $status);
    }

    /**
     * Scope a query to filter tasks by priority (string or array).
     */
    public function scopePriority($query, $priority)
    {
        if (empty($priority) || $priority === 'all') {
            return $query;
        }

        if (is_array($priority)) {
            $priorities = array_filter($priority, fn ($p) => !empty($p) && $p !== 'all');
            return !empty($priorities) ? $query->whereIn('priority', $priorities) : $query;
        }

        return $query->where('priority', $priority);
    }

    /**
     * Scope a query to filter tasks by deadline range.
     */
    public function scopeDeadlineBetween($query, ?string $from, ?string $to)
    {
        if (!empty($from) && !empty($to)) {
            return $query->whereBetween('deadline', [$from, $to]);
        }

        if (!empty($from)) {
            return $query->whereDate('deadline', '>=', $from);
        }

        if (!empty($to)) {
            return $query->whereDate('deadline', '<=', $to);
        }

        return $query;
    }

    /**
     * Scope a query to filter overdue tasks (deadline < today & status != done).
     */
    public function scopeOverdue($query)
    {
        return $query->whereNotNull('deadline')
            ->whereDate('deadline', '<', now()->toDateString())
            ->where('status', '!=', TaskStatus::DONE);
    }
}
