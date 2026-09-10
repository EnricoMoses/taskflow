<?php

namespace Tests\Feature;

use App\Enums\ProjectStatus;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProjectTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_view_projects_index(): void
    {
        $user = User::factory()->create();
        Project::factory()->count(3)->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->get(route('projects.index'));

        $response->assertOk();
    }

    public function test_unauthenticated_user_cannot_access_projects(): void
    {
        $response = $this->get(route('projects.index'));

        $response->assertRedirect(route('login'));
    }

    public function test_user_can_create_project_with_valid_data(): void
    {
        $user = User::factory()->create();

        $payload = [
            'name' => 'Website Redesign',
            'description' => 'Revamping company landing page',
            'deadline' => now()->addDays(30)->toDateString(),
            'status' => ProjectStatus::IN_PROGRESS->value,
        ];

        $response = $this->actingAs($user)->post(route('projects.store'), $payload);

        $response->assertRedirect(route('projects.index'));
        $this->assertDatabaseHas('projects', [
            'user_id' => $user->id,
            'name' => 'Website Redesign',
            'status' => 'in_progress',
        ]);
    }

    public function test_project_creation_fails_with_invalid_data(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post(route('projects.store'), [
            'name' => '', // required
            'status' => 'invalid_status', // not in enum
            'deadline' => 'not-a-date',
        ]);

        $response->assertSessionHasErrors(['name', 'status', 'deadline']);
    }

    public function test_owner_can_view_project(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->get(route('projects.show', $project));

        $response->assertOk();
    }

    public function test_other_user_cannot_view_another_users_project(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $owner->id]);

        $response = $this->actingAs($otherUser)->get(route('projects.show', $project));

        $response->assertForbidden();
    }

    public function test_owner_can_update_their_project(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $user->id, 'name' => 'Old Name']);

        $response = $this->actingAs($user)->put(route('projects.update', $project), [
            'name' => 'Updated Name',
            'description' => 'Updated description',
            'deadline' => now()->addDays(15)->toDateString(),
            'status' => ProjectStatus::COMPLETED->value,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('projects', [
            'id' => $project->id,
            'name' => 'Updated Name',
            'status' => 'completed',
        ]);
    }

    public function test_other_user_cannot_update_another_users_project(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $owner->id, 'name' => 'Original Name']);

        $response = $this->actingAs($otherUser)->put(route('projects.update', $project), [
            'name' => 'Hacked Name',
            'deadline' => now()->addDays(10)->toDateString(),
            'status' => ProjectStatus::COMPLETED->value,
        ]);

        $response->assertForbidden();
        $this->assertDatabaseHas('projects', [
            'id' => $project->id,
            'name' => 'Original Name',
        ]);
    }

    public function test_owner_can_delete_their_project(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->delete(route('projects.destroy', $project));

        $response->assertRedirect(route('projects.index'));
        $this->assertDatabaseMissing('projects', ['id' => $project->id]);
    }

    public function test_other_user_cannot_delete_another_users_project(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $owner->id]);

        $response = $this->actingAs($otherUser)->delete(route('projects.destroy', $project));

        $response->assertForbidden();
        $this->assertDatabaseHas('projects', ['id' => $project->id]);
    }
}
