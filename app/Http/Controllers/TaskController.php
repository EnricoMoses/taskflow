<?php

namespace App\Http\Controllers;

use App\Enums\TaskStatus;
use App\Http\Requests\Task\StoreTaskRequest;
use App\Http\Requests\Task\UpdateTaskRequest;
use App\Models\Project;
use App\Models\Task;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Enum;

class TaskController extends Controller
{
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
