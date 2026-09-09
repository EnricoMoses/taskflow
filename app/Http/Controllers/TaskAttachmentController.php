<?php

namespace App\Http\Controllers;

use App\Http\Requests\TaskAttachment\StoreTaskAttachmentRequest;
use App\Models\Task;
use App\Models\TaskAttachment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class TaskAttachmentController extends Controller
{
    /**
     * Store a newly uploaded attachment for a task.
     */
    public function store(StoreTaskAttachmentRequest $request, Task $task): RedirectResponse
    {
        $file = $request->file('file');

        $path = $file->store("tasks/{$task->id}", 'public');

        $attachment = $task->attachments()->create([
            'original_name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'mime_type' => $file->getClientMimeType() ?: $file->getMimeType(),
            'size' => $file->getSize(),
        ]);

        return redirect()->back()->with('success', "File '{$attachment->original_name}' berhasil diunggah.");
    }

    /**
     * Download the attachment file.
     */
    public function download(Request $request, TaskAttachment $attachment): StreamedResponse
    {
        $this->authorize('view', $attachment);

        if (!Storage::disk('public')->exists($attachment->file_path)) {
            abort(404, 'File lampiran tidak ditemukan di penyimpanan.');
        }

        return Storage::disk('public')->download($attachment->file_path, $attachment->original_name);
    }

    /**
     * Remove the specified attachment from storage and database.
     */
    public function destroy(Request $request, TaskAttachment $attachment): RedirectResponse
    {
        $this->authorize('delete', $attachment);

        $name = $attachment->original_name;

        if (Storage::disk('public')->exists($attachment->file_path)) {
            Storage::disk('public')->delete($attachment->file_path);
        }

        $attachment->delete();

        return redirect()->back()->with('success', "File '{$name}' berhasil dihapus.");
    }
}
