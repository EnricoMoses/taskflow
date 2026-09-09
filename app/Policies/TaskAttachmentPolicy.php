<?php

namespace App\Policies;

use App\Models\TaskAttachment;
use App\Models\User;

class TaskAttachmentPolicy
{
    /**
     * Determine whether the user can view the attachment.
     */
    public function view(User $user, TaskAttachment $attachment): bool
    {
        return $attachment->task->project->user_id === $user->id;
    }

    /**
     * Determine whether the user can create attachments for a task.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can delete the attachment.
     */
    public function delete(User $user, TaskAttachment $attachment): bool
    {
        return $attachment->task->project->user_id === $user->id;
    }
}
