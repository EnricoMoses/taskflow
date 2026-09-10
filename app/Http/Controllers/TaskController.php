<?php

namespace App\Http\Controllers;

use App\Enums\TaskPriority;
use App\Enums\TaskStatus;
use App\Http\Requests\Task\StoreTaskRequest;
use App\Http\Requests\Task\UpdateTaskRequest;
use App\Http\Resources\TaskResource;
use App\Models\Project;
use App\Models\Task;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rules\Enum;
use Inertia\Inertia;
use Inertia\Response;

class TaskController extends Controller
{
    /**
     * Display a global listing of tasks across all user's projects.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        $query = Task::whereHas('project', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        })->with(['project:id,name', 'attachments'])
          ->withCount('attachments');

        // Search scope
        if ($request->filled('search')) {
            $query->search($request->input('search'));
        }

        // Status filter
        if ($request->filled('status')) {
            $query->status($request->input('status'));
        }

        // Priority filter
        if ($request->filled('priority')) {
            $query->priority($request->input('priority'));
        }

        // Project filter
        if ($request->filled('project_id') && $request->input('project_id') !== 'all') {
            $query->where('project_id', $request->input('project_id'));
        }

        // Deadline preset filter
        if ($request->filled('deadline_preset') && $request->input('deadline_preset') !== 'all') {
            $preset = $request->input('deadline_preset');
            if ($preset === 'overdue') {
                $query->overdue();
            } elseif ($preset === 'today') {
                $query->whereDate('deadline', Carbon::today());
            } elseif ($preset === 'this_week') {
                $query->whereBetween('deadline', [Carbon::now()->startOfWeek()->toDateString(), Carbon::now()->endOfWeek()->toDateString()]);
            } elseif ($preset === 'this_month') {
                $query->whereBetween('deadline', [Carbon::now()->startOfMonth()->toDateString(), Carbon::now()->endOfMonth()->toDateString()]);
            }
        } elseif ($request->filled('deadline_from') || $request->filled('deadline_to')) {
            $query->deadlineBetween($request->input('deadline_from'), $request->input('deadline_to'));
        }

        // Sorting
        $sort = $request->input('sort', 'deadline');
        $direction = $request->input('direction', 'asc');

        if ($sort === 'deadline') {
            $query->orderByRaw('deadline IS NULL, deadline ' . ($direction === 'desc' ? 'DESC' : 'ASC'))
                  ->latest('created_at');
        } elseif ($sort === 'priority') {
            $query->orderByRaw("CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 ELSE 4 END " . ($direction === 'desc' ? 'DESC' : 'ASC'))
                  ->latest('created_at');
        } elseif ($sort === 'status') {
            $query->orderBy('status', $direction === 'desc' ? 'desc' : 'asc')
                  ->latest('created_at');
        } elseif ($sort === 'title') {
            $query->orderBy('title', $direction === 'desc' ? 'desc' : 'asc');
        } else {
            $query->latest('created_at');
        }

        $paginatedTasks = $query->paginate(15)->withQueryString();

        $statuses = array_map(fn (TaskStatus $status) => [
            'value' => $status->value,
            'label' => $status->label(),
        ], TaskStatus::cases());

        $priorities = array_map(fn (TaskPriority $priority) => [
            'value' => $priority->value,
            'label' => $priority->label(),
        ], TaskPriority::cases());

        $userProjects = $user->projects()
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        return Inertia::render('Tasks/Index', [
            'tasks' => TaskResource::collection($paginatedTasks),
            'filters' => [
                'search' => $request->input('search', ''),
                'status' => $request->input('status', 'all'),
                'priority' => $request->input('priority', 'all'),
                'project_id' => $request->input('project_id', 'all'),
                'deadline_preset' => $request->input('deadline_preset', 'all'),
                'deadline_from' => $request->input('deadline_from', ''),
                'deadline_to' => $request->input('deadline_to', ''),
                'sort' => $sort,
                'direction' => $direction,
            ],
            'statuses' => $statuses,
            'priorities' => $priorities,
            'projects' => $userProjects,
        ]);
    }
    /**
     * Store a newly created task in the specified project.
     */
    public function store(StoreTaskRequest $request, Project $project): RedirectResponse
    {
        $validated = $request->validated();

        if (!isset($validated['order'])) {
            $maxOrder = $project->tasks()->where('status', $validated['status'])->max('order');
            $validated['order'] = $maxOrder !== null ? $maxOrder + 1 : 0;
        }

        $task = $project->tasks()->create($validated);

        return redirect()->back()->with('success', "Tugas '{$task->title}' berhasil ditambahkan.");
    }

    /**
     * Update the specified task.
     */
    public function update(UpdateTaskRequest $request, Task $task): RedirectResponse
    {
        $task->update($request->validated());

        return redirect()->back()->with('success', "Tugas '{$task->title}' berhasil diperbarui.");
    }

    /**
     * Update task status & order (for kanban moves and status transitions).
     */
    public function updateStatus(Request $request, Task $task): RedirectResponse
    {
        $this->authorize('update', $task);

        $validated = $request->validate([
            'status' => ['required', new Enum(TaskStatus::class)],
            'order' => ['nullable', 'integer', 'min:0'],
        ]);

        $task->update($validated);

        return redirect()->back()->with('success', "Status tugas berhasil diperbarui.");
    }

    /**
     * Batch reorder tasks within a project (for drag-and-drop moves across or within columns).
     */
    public function reorder(Request $request, Project $project): RedirectResponse
    {
        $this->authorize('update', $project);

        $validated = $request->validate([
            'tasks' => ['required', 'array'],
            'tasks.*.id' => ['required', 'integer', 'exists:tasks,id'],
            'tasks.*.status' => ['required', new Enum(TaskStatus::class)],
            'tasks.*.order' => ['required', 'integer', 'min:0'],
        ]);

        DB::transaction(function () use ($validated, $project) {
            foreach ($validated['tasks'] as $item) {
                $project->tasks()->where('id', $item['id'])->update([
                    'status' => $item['status'],
                    'order' => $item['order'],
                ]);
            }
        });

        return redirect()->back()->with('success', "Urutan tugas berhasil diperbarui.");
    }

    /**
     * Remove the specified task from storage.
     */
    public function destroy(Request $request, Task $task): RedirectResponse
    {
        $this->authorize('delete', $task);

        $title = $task->title;
        $task->delete();

        return redirect()->back()->with('success', "Tugas '{$title}' berhasil dihapus.");
    }
}
