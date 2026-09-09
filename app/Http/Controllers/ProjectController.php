<?php

namespace App\Http\Controllers;

use App\Enums\ProjectStatus;
use App\Http\Requests\Project\StoreProjectRequest;
use App\Http\Requests\Project\UpdateProjectRequest;
use App\Http\Resources\ProjectResource;
use App\Models\Project;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    /**
     * Display a listing of the user's projects.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Project::class);

        $query = $request->user()->projects()
            ->withCount([
                'tasks as tasks_count',
                'tasks as completed_tasks_count' => fn ($q) => $q->where('status', 'done'),
                'tasks as in_progress_tasks_count' => fn ($q) => $q->where('status', 'in_progress'),
                'tasks as todo_tasks_count' => fn ($q) => $q->where('status', 'todo'),
            ]);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }

        $projects = $query->latest('updated_at')->get();

        $statuses = array_map(fn (ProjectStatus $status) => [
            'value' => $status->value,
            'label' => $status->label(),
        ], ProjectStatus::cases());

        return Inertia::render('Projects/Index', [
            'projects' => ProjectResource::collection($projects)->resolve(),
            'filters' => [
                'search' => $request->input('search', ''),
                'status' => $request->input('status', 'all'),
            ],
            'statuses' => $statuses,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): RedirectResponse
    {
        return redirect()->route('projects.index');
    }

    /**
     * Store a newly created project in storage.
     */
    public function store(StoreProjectRequest $request): RedirectResponse
    {
        $this->authorize('create', Project::class);

        $project = $request->user()->projects()->create($request->validated());

        return redirect()->route('projects.index')->with('success', "Proyek '{$project->name}' berhasil dibuat.");
    }

    /**
     * Display the specified project.
     */
    public function show(Request $request, Project $project): Response
    {
        $this->authorize('view', $project);

        $project->loadCount([
            'tasks as tasks_count',
            'tasks as completed_tasks_count' => fn ($q) => $q->where('status', 'done'),
            'tasks as in_progress_tasks_count' => fn ($q) => $q->where('status', 'in_progress'),
            'tasks as todo_tasks_count' => fn ($q) => $q->where('status', 'todo'),
        ])->load([
            'tasks' => fn ($q) => $q->withCount('attachments')->orderBy('order')->orderByDesc('created_at'),
        ]);

        return Inertia::render('Projects/Show', [
            'project' => (new ProjectResource($project))->resolve(),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Project $project): RedirectResponse
    {
        $this->authorize('update', $project);

        return redirect()->route('projects.show', $project);
    }

    /**
     * Update the specified project in storage.
     */
    public function update(UpdateProjectRequest $request, Project $project): RedirectResponse
    {
        $this->authorize('update', $project);

        $project->update($request->validated());

        return redirect()->back()->with('success', "Proyek '{$project->name}' berhasil diperbarui.");
    }

    /**
     * Remove the specified project from storage.
     */
    public function destroy(Project $project): RedirectResponse
    {
        $this->authorize('delete', $project);

        $name = $project->name;
        $project->delete();

        return redirect()->route('projects.index')->with('success', "Proyek '{$name}' berhasil dihapus.");
    }
}
