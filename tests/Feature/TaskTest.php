<?php

namespace Tests\Feature;

use App\Enums\TaskPriority;
use App\Enums\TaskStatus;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaskTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_can_create_task_in_project(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $user->id]);

        $payload = [
            'title' => 'Setup CI/CD Pipeline',
            'description' => 'Automate deployment using GitHub Actions',
            'deadline' => now()->addDays(7)->toDateString(),
            'status' => TaskStatus::TODO->value,
            'priority' => TaskPriority::HIGH->value,
        ];

        $response = $this->actingAs($user)->post(route('tasks.store', $project), $payload);

        $response->assertRedirect();
        $this->assertDatabaseHas('tasks', [
            'project_id' => $project->id,
            'title' => 'Setup CI/CD Pipeline',
            'status' => 'todo',
            'priority' => 'high',
        ]);
    }

    public function test_other_user_cannot_create_task_in_another_users_project(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $owner->id]);

        $payload = [
            'title' => 'Unauthorized Task',
            'status' => TaskStatus::TODO->value,
            'priority' => TaskPriority::LOW->value,
        ];

        $response = $this->actingAs($otherUser)->post(route('tasks.store', $project), $payload);

        $response->assertForbidden();
        $this->assertDatabaseMissing('tasks', ['title' => 'Unauthorized Task']);
    }

    public function test_task_creation_fails_with_invalid_input(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->post(route('tasks.store', $project), [
            'title' => '',
            'status' => 'invalid',
            'priority' => 'invalid',
        ]);

        $response->assertSessionHasErrors(['title', 'status', 'priority']);
    }

    public function test_owner_can_update_task(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $user->id]);
        $task = Task::factory()->create(['project_id' => $project->id, 'title' => 'Initial Title']);

        $response = $this->actingAs($user)->put(route('tasks.update', $task), [
            'title' => 'Updated Task Title',
            'description' => 'Updated description',
            'deadline' => now()->addDays(3)->toDateString(),
            'status' => TaskStatus::IN_PROGRESS->value,
            'priority' => TaskPriority::HIGH->value,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('tasks', [
            'id' => $task->id,
            'title' => 'Updated Task Title',
            'status' => 'in_progress',
            'priority' => 'high',
        ]);
    }

    public function test_other_user_cannot_update_task(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $owner->id]);
        $task = Task::factory()->create(['project_id' => $project->id, 'title' => 'Secret Task']);

        $response = $this->actingAs($otherUser)->put(route('tasks.update', $task), [
            'title' => 'Hacked Task Title',
            'status' => TaskStatus::DONE->value,
            'priority' => TaskPriority::LOW->value,
        ]);

        $response->assertForbidden();
        $this->assertDatabaseHas('tasks', [
            'id' => $task->id,
            'title' => 'Secret Task',
        ]);
    }

    public function test_owner_can_update_task_status(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $user->id]);
        $task = Task::factory()->create(['project_id' => $project->id, 'status' => TaskStatus::TODO->value]);

        $response = $this->actingAs($user)->patch(route('tasks.update-status', $task), [
            'status' => TaskStatus::DONE->value,
            'order' => 2,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('tasks', [
            'id' => $task->id,
            'status' => 'done',
            'order' => 2,
        ]);
    }

    public function test_owner_can_batch_reorder_tasks(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $user->id]);
        $task1 = Task::factory()->create(['project_id' => $project->id, 'status' => TaskStatus::TODO->value, 'order' => 0]);
        $task2 = Task::factory()->create(['project_id' => $project->id, 'status' => TaskStatus::TODO->value, 'order' => 1]);

        $response = $this->actingAs($user)->post(route('tasks.reorder', $project), [
            'tasks' => [
                ['id' => $task1->id, 'status' => TaskStatus::IN_PROGRESS->value, 'order' => 1],
                ['id' => $task2->id, 'status' => TaskStatus::TODO->value, 'order' => 0],
            ],
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('tasks', ['id' => $task1->id, 'status' => 'in_progress', 'order' => 1]);
        $this->assertDatabaseHas('tasks', ['id' => $task2->id, 'status' => 'todo', 'order' => 0]);
    }

    public function test_other_user_cannot_batch_reorder_tasks(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $owner->id]);
        $task = Task::factory()->create(['project_id' => $project->id, 'status' => TaskStatus::TODO->value, 'order' => 0]);

        $response = $this->actingAs($otherUser)->post(route('tasks.reorder', $project), [
            'tasks' => [
                ['id' => $task->id, 'status' => TaskStatus::DONE->value, 'order' => 0],
            ],
        ]);

        $response->assertForbidden();
    }

    public function test_owner_can_delete_task(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $user->id]);
        $task = Task::factory()->create(['project_id' => $project->id]);

        $response = $this->actingAs($user)->delete(route('tasks.destroy', $task));

        $response->assertRedirect();
        $this->assertDatabaseMissing('tasks', ['id' => $task->id]);
    }

    public function test_other_user_cannot_delete_task(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $owner->id]);
        $task = Task::factory()->create(['project_id' => $project->id]);

        $response = $this->actingAs($otherUser)->delete(route('tasks.destroy', $task));

        $response->assertForbidden();
        $this->assertDatabaseHas('tasks', ['id' => $task->id]);
    }

    public function test_authenticated_user_can_view_all_tasks_index(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $user->id]);
        Task::factory()->count(3)->create(['project_id' => $project->id]);

        $response = $this->actingAs($user)->get(route('tasks.index'));

        $response->assertOk();
    }
}
