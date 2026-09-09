<?php

namespace App\Http\Requests\TaskAttachment;

use Illuminate\Foundation\Http\FormRequest;

class StoreTaskAttachmentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $task = $this->route('task');

        return $task && $this->user()?->can('update', $task);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'file' => [
                'required',
                'file',
                'max:10240', // 10MB in KB
                'mimes:pdf,doc,docx,xls,xlsx,png,jpg,jpeg,zip',
            ],
        ];
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'file' => 'file lampiran',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'file.required' => 'File lampiran wajib dipilih.',
            'file.file' => 'Lampiran harus berupa file yang valid.',
            'file.max' => 'Ukuran file tidak boleh melebihi 10 MB.',
            'file.mimes' => 'Format file harus berupa: pdf, doc, docx, xls, xlsx, png, jpg, jpeg, atau zip.',
        ];
    }
}
