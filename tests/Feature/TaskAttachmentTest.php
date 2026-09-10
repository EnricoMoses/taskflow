<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\Task;
use App\Models\TaskAttachment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class TaskAttachmentTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_can_upload_valid_attachment(): void
    {
        Storage::fake('public');

        $user = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $user->id]);
        $task = Task::factory()->create(['project_id' => $project->id]);

        $file = UploadedFile::fake()->create('document.pdf', 1024, 'application/pdf'); // 1MB

        $response = $this->actingAs($user)->post(route('tasks.attachments.store', $task), [
            'file' => $file,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('task_attachments', [
            'task_id' => $task->id,
            'original_name' => 'document.pdf',
            'mime_type' => 'application/pdf',
        ]);

        $attachment = TaskAttachment::first();
        Storage::disk('public')->assertExists($attachment->file_path);
    }

    public function test_upload_fails_when_file_exceeds_10mb(): void
    {
        Storage::fake('public');

        $user = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $user->id]);
        $task = Task::factory()->create(['project_id' => $project->id]);

        $oversizedFile = UploadedFile::fake()->create('huge_file.pdf', 12000, 'application/pdf'); // ~12MB > 10240KB

        $response = $this->actingAs($user)->post(route('tasks.attachments.store', $task), [
            'file' => $oversizedFile,
        ]);

        $response->assertSessionHasErrors(['file']);
        $this->assertDatabaseCount('task_attachments', 0);
    }

    public function test_upload_fails_with_disallowed_mime_type(): void
    {
        Storage::fake('public');

        $user = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $user->id]);
        $task = Task::factory()->create(['project_id' => $project->id]);

        $disallowedFile = UploadedFile::fake()->create('malicious.exe', 500, 'application/x-msdownload');

        $response = $this->actingAs($user)->post(route('tasks.attachments.store', $task), [
            'file' => $disallowedFile,
        ]);

        $response->assertSessionHasErrors(['file']);
        $this->assertDatabaseCount('task_attachments', 0);
    }

    public function test_other_user_cannot_upload_attachment_to_another_users_task(): void
    {
        Storage::fake('public');

        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $owner->id]);
        $task = Task::factory()->create(['project_id' => $project->id]);

        $file = UploadedFile::fake()->create('notes.docx', 500);

        $response = $this->actingAs($otherUser)->post(route('tasks.attachments.store', $task), [
            'file' => $file,
        ]);

        $response->assertForbidden();
        $this->assertDatabaseCount('task_attachments', 0);
    }

    public function test_owner_can_download_attachment(): void
    {
        Storage::fake('public');

        $user = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $user->id]);
        $task = Task::factory()->create(['project_id' => $project->id]);

        $file = UploadedFile::fake()->create('spec.pdf', 500, 'application/pdf');
        $storedPath = $file->store('tasks/' . $task->id, 'public');

        $attachment = TaskAttachment::factory()->create([
            'task_id' => $task->id,
            'original_name' => 'spec.pdf',
            'file_path' => $storedPath,
            'mime_type' => 'application/pdf',
            'size' => 500 * 1024,
        ]);

        $response = $this->actingAs($user)->get(route('attachments.download', $attachment));

        $response->assertOk();
    }

    public function test_other_user_cannot_download_attachment(): void
    {
        Storage::fake('public');

        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $owner->id]);
        $task = Task::factory()->create(['project_id' => $project->id]);

        $attachment = TaskAttachment::factory()->create([
            'task_id' => $task->id,
            'original_name' => 'secret.pdf',
            'file_path' => 'tasks/' . $task->id . '/secret.pdf',
        ]);

        $response = $this->actingAs($otherUser)->get(route('attachments.download', $attachment));

        $response->assertForbidden();
    }

    public function test_owner_can_delete_attachment_and_physical_file(): void
    {
        Storage::fake('public');

        $user = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $user->id]);
        $task = Task::factory()->create(['project_id' => $project->id]);

        $file = UploadedFile::fake()->create('delete_me.png', 200, 'image/png');
        $storedPath = $file->store('tasks/' . $task->id, 'public');

        $attachment = TaskAttachment::factory()->create([
            'task_id' => $task->id,
            'original_name' => 'delete_me.png',
            'file_path' => $storedPath,
        ]);

        Storage::disk('public')->assertExists($storedPath);

        $response = $this->actingAs($user)->delete(route('attachments.destroy', $attachment));

        $response->assertRedirect();
        $this->assertDatabaseMissing('task_attachments', ['id' => $attachment->id]);
        Storage::disk('public')->assertMissing($storedPath);
    }

    public function test_other_user_cannot_delete_attachment(): void
    {
        Storage::fake('public');

        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $owner->id]);
        $task = Task::factory()->create(['project_id' => $project->id]);

        $attachment = TaskAttachment::factory()->create([
            'task_id' => $task->id,
            'file_path' => 'tasks/' . $task->id . '/file.png',
        ]);

        $response = $this->actingAs($otherUser)->delete(route('attachments.destroy', $attachment));

        $response->assertForbidden();
        $this->assertDatabaseHas('task_attachments', ['id' => $attachment->id]);
    }
}
