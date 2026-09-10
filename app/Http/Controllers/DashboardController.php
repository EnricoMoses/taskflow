<?php

namespace App\Http\Controllers;

use App\Enums\ProjectStatus;
use App\Enums\TaskStatus;
use App\Http\Resources\ProjectResource;
use App\Http\Resources\TaskResource;
use App\Models\Task;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the authenticated user's main dashboard.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        // 1. Summary Counts
        $totalProjects = $user->projects()->count();

        $userTasksQuery = Task::whereHas('project', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        });

        $totalTasks = (clone $userTasksQuery)->count();
        $completedTasks = (clone $userTasksQuery)->where('status', TaskStatus::DONE)->count();
        $overdueTasksCount = (clone $userTasksQuery)->overdue()->count();

        // 2. Task Status Distribution
        $taskStatusCounts = (clone $userTasksQuery)
            ->selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        $taskDistribution = [
            [
                'status' => 'todo',
                'label' => 'To-do',
                'count' => (int) ($taskStatusCounts['todo'] ?? 0),
                'color' => '#94a3b8',
            ],
            [
                'status' => 'in_progress',
                'label' => 'In Progress',
                'count' => (int) ($taskStatusCounts['in_progress'] ?? 0),
                'color' => '#f59e0b',
            ],
            [
                'status' => 'done',
                'label' => 'Done',
                'count' => (int) ($taskStatusCounts['done'] ?? 0),
                'color' => '#10b981',
            ],
        ];

        // 3. Project Status Distribution
        $projectStatusCounts = $user->projects()
            ->selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        $projectColors = [
            'planning' => '#6366f1',
            'in_progress' => '#3b82f6',
            'completed' => '#10b981',
            'on_hold' => '#f97316',
        ];

        $projectDistribution = array_map(function (ProjectStatus $status) use ($projectStatusCounts, $projectColors) {
            return [
                'status' => $status->value,
                'label' => $status->label(),
                'count' => (int) ($projectStatusCounts[$status->value] ?? 0),
                'color' => $projectColors[$status->value] ?? '#64748b',
            ];
        }, ProjectStatus::cases());

        // 4. Upcoming Deadlines (Nearest 5 incomplete tasks with future/today deadline)
        $upcomingTasks = (clone $userTasksQuery)
            ->where('status', '!=', TaskStatus::DONE)
            ->whereNotNull('deadline')
            ->whereDate('deadline', '>=', now()->toDateString())
            ->with(['project:id,name', 'attachments'])
            ->withCount('attachments')
            ->orderBy('deadline', 'asc')
            ->limit(5)
            ->get();

        // 5. Overdue Tasks (5 overdue tasks)
        $overdueTasksList = (clone $userTasksQuery)
            ->overdue()
            ->with(['project:id,name', 'attachments'])
            ->withCount('attachments')
            ->orderBy('deadline', 'asc')
            ->limit(5)
            ->get();

        // 6. Recent Projects
        $recentProjects = $user->projects()
            ->withCount([
                'tasks as tasks_count',
                'tasks as completed_tasks_count' => fn ($q) => $q->where('status', 'done'),
                'tasks as in_progress_tasks_count' => fn ($q) => $q->where('status', 'in_progress'),
                'tasks as todo_tasks_count' => fn ($q) => $q->where('status', 'todo'),
            ])
            ->latest('updated_at')
            ->limit(5)
            ->get();

        return Inertia::render('Dashboard', [
            'summary' => [
                'total_projects' => $totalProjects,
                'total_tasks' => $totalTasks,
                'completed_tasks' => $completedTasks,
                'overdue_tasks' => $overdueTasksCount,
                'completion_rate' => $totalTasks > 0 ? (int) round(($completedTasks / $totalTasks) * 100) : 0,
            ],
            'task_distribution' => $taskDistribution,
            'project_distribution' => $projectDistribution,
            'upcoming_tasks' => TaskResource::collection($upcomingTasks)->resolve(),
            'overdue_tasks_list' => TaskResource::collection($overdueTasksList)->resolve(),
            'recent_projects' => ProjectResource::collection($recentProjects)->resolve(),
        ]);
    }
}
