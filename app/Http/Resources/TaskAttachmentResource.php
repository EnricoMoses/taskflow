<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

/**
 * @mixin \App\Models\TaskAttachment
 */
class TaskAttachmentResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $bytes = (int) $this->size;
        if ($bytes >= 1048576) {
            $formattedSize = number_format($bytes / 1048576, 1) . ' MB';
        } elseif ($bytes >= 1024) {
            $formattedSize = number_format($bytes / 1024, 0) . ' KB';
        } else {
            $formattedSize = $bytes . ' B';
        }

        return [
            'id' => $this->id,
            'task_id' => $this->task_id,
            'original_name' => $this->original_name,
            'file_path' => $this->file_path,
            'url' => Storage::disk('public')->url($this->file_path),
            'download_url' => route('attachments.download', $this->id),
            'mime_type' => $this->mime_type,
            'size' => $this->size,
            'size_formatted' => $formattedSize,
            'created_at' => $this->created_at?->toIso8601String(),
            'created_at_formatted' => $this->created_at?->format('d M Y, H:i'),
        ];
    }
}
