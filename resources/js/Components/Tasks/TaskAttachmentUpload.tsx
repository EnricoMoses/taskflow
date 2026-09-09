import React, { useState, useRef } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Progress } from '@/Components/ui/progress';
import { UploadCloud, FileUp, X, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface TaskAttachmentUploadProps {
    taskId: number;
}

const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'png', 'jpg', 'jpeg', 'zip'];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export default function TaskAttachmentUpload({ taskId }: TaskAttachmentUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [clientError, setClientError] = useState<string | null>(null);

    const { data, setData, post, progress, processing, reset, errors, clearErrors } = useForm<{
        file: File | null;
    }>({
        file: null,
    });

    const validateAndSetFile = (file: File) => {
        setClientError(null);
        clearErrors();

        // 1. Check size
        if (file.size > MAX_FILE_SIZE_BYTES) {
            setClientError('Ukuran file melebihi batas maksimum 10 MB.');
            return false;
        }

        // 2. Check extension
        const ext = file.name.split('.').pop()?.toLowerCase() || '';
        if (!ALLOWED_EXTENSIONS.includes(ext)) {
            setClientError(`Tipe file .${ext} tidak didukung. Format yang diizinkan: pdf, doc, docx, xls, xlsx, png, jpg, jpeg, zip.`);
            return false;
        }

        setData('file', file);
        return true;
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            validateAndSetFile(file);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files?.[0];
        if (file) {
            validateAndSetFile(file);
        }
    };

    const handleUploadSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.file) return;

        post(route('tasks.attachments.store', taskId), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                if (fileInputRef.current) fileInputRef.current.value = '';
                setClientError(null);
            },
            onError: (err) => {
                if (err.file) {
                    toast.error(err.file);
                }
            },
        });
    };

    const handleClearSelected = () => {
        reset();
        if (fileInputRef.current) fileInputRef.current.value = '';
        setClientError(null);
        clearErrors();
    };

    return (
        <form onSubmit={handleUploadSubmit} className="space-y-3">
            <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.zip"
                className="hidden"
                id="task-file-input"
            />

            {/* Drag and Drop Zone */}
            {!data.file && (
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`cursor-pointer flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-dashed transition-all text-center group ${
                        isDragging
                            ? 'border-primary bg-primary/5 scale-[0.99]'
                            : 'border-border/80 hover:border-primary/50 bg-muted/10 hover:bg-muted/20'
                    }`}
                >
                    <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-2 group-hover:scale-105 transition-transform">
                        <UploadCloud className="size-5" />
                    </div>
                    <p className="text-xs font-semibold text-foreground">
                        Tarik & lepas file ke sini, atau <span className="text-primary underline">pilih file</span>
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                        Maksimal 10 MB (PDF, DOC, DOCX, XLS, XLSX, PNG, JPG, JPEG, ZIP)
                    </p>
                </div>
            )}

            {/* Selected File Preview & Upload Bar */}
            {data.file && (
                <div className="p-3.5 rounded-2xl border border-primary/30 bg-primary/5 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                <FileUp className="size-4" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-semibold text-foreground truncate">{data.file.name}</p>
                                <p className="text-[10px] text-muted-foreground">
                                    {(data.file.size / (1024 * 1024)).toFixed(2)} MB
                                </p>
                            </div>
                        </div>

                        {!processing && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={handleClearSelected}
                                className="size-6 rounded-md text-muted-foreground hover:text-foreground"
                            >
                                <X className="size-3.5" />
                            </Button>
                        )}
                    </div>

                    {/* Upload Progress Bar */}
                    {progress && (
                        <div className="space-y-1">
                            <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
                                <span>Mengunggah...</span>
                                <span>{progress.percentage}%</span>
                            </div>
                            <Progress value={progress.percentage ?? null} className="h-1.5" />
                        </div>
                    )}

                    <div className="flex items-center justify-end gap-2 pt-1">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleClearSelected}
                            disabled={processing}
                            className="rounded-xl text-xs h-8 px-3"
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            size="sm"
                            disabled={processing}
                            className="rounded-xl text-xs h-8 px-3 gap-1.5"
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="size-3.5 animate-spin" />
                                    Mengunggah...
                                </>
                            ) : (
                                <>
                                    <UploadCloud className="size-3.5" />
                                    Unggah File
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            )}

            {/* Error Messages */}
            {(clientError || errors.file) && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-destructive/10 text-destructive text-xs">
                    <AlertCircle className="size-4 shrink-0" />
                    <span>{clientError || errors.file}</span>
                </div>
            )}
        </form>
    );
}
