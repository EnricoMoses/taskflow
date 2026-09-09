import { useState } from 'react';
import { router } from '@inertiajs/react';
import { TaskAttachment } from '@/types/attachment';
import { Button } from '@/Components/ui/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/Components/ui/alert-dialog';
import {
    FileText,
    FileImage,
    FileSpreadsheet,
    FileArchive,
    FileCode,
    File,
    Download,
    Trash2,
    AlertTriangle,
    Loader2,
} from 'lucide-react';

interface TaskAttachmentListProps {
    attachments: TaskAttachment[];
}

export default function TaskAttachmentList({
    attachments,
}: TaskAttachmentListProps) {
    const [attachmentToDelete, setAttachmentToDelete] = useState<TaskAttachment | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const getFileIcon = (mimeType: string, filename: string) => {
        const ext = filename.split('.').pop()?.toLowerCase() || '';

        if (mimeType.includes('pdf') || ext === 'pdf') {
            return <FileText className="size-5 text-rose-500" />;
        }
        if (mimeType.includes('image') || ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) {
            return <FileImage className="size-5 text-purple-500" />;
        }
        if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || ['xls', 'xlsx', 'csv'].includes(ext)) {
            return <FileSpreadsheet className="size-5 text-emerald-500" />;
        }
        if (mimeType.includes('word') || ['doc', 'docx'].includes(ext)) {
            return <FileText className="size-5 text-blue-500" />;
        }
        if (mimeType.includes('zip') || mimeType.includes('compressed') || ['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
            return <FileArchive className="size-5 text-amber-500" />;
        }
        return <File className="size-5 text-slate-500" />;
    };

    const confirmDelete = () => {
        if (!attachmentToDelete) return;

        setIsDeleting(true);
        router.delete(route('attachments.destroy', attachmentToDelete.id), {
            preserveScroll: true,
            onFinish: () => {
                setIsDeleting(false);
                setAttachmentToDelete(null);
            },
        });
    };

    if (attachments.length === 0) {
        return (
            <div className="p-6 text-center rounded-2xl border border-dashed border-border bg-muted/10 text-xs text-muted-foreground">
                Belum ada lampiran file pada tugas ini.
            </div>
        );
    }

    return (
        <>
            <div className="space-y-2.5">
                {attachments.map((attachment) => (
                    <div
                        key={attachment.id}
                        className="group flex items-center justify-between gap-3 p-3 rounded-2xl border border-border/70 bg-card hover:bg-muted/30 hover:border-primary/30 transition-all duration-150"
                    >
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="size-9 rounded-xl bg-muted/60 flex items-center justify-center shrink-0">
                                {getFileIcon(attachment.mime_type, attachment.original_name)}
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                                    {attachment.original_name}
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                    {attachment.size_formatted} • {attachment.created_at_formatted}
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                            <a
                                href={attachment.download_url}
                                download={attachment.original_name}
                                title="Unduh file"
                                className="size-7 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            >
                                <Download className="size-3.5" />
                            </a>

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setAttachmentToDelete(attachment)}
                                className="size-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                title="Hapus file"
                            >
                                <Trash2 className="size-3.5" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Delete Confirmation Alert */}
            <AlertDialog
                open={!!attachmentToDelete}
                onOpenChange={(open) => !open && setAttachmentToDelete(null)}
            >
                <AlertDialogContent className="rounded-2xl p-6 sm:max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="font-heading text-lg font-semibold text-destructive flex items-center gap-2">
                            <AlertTriangle className="size-5" />
                            Hapus Lampiran?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-sm text-muted-foreground pt-1">
                            Apakah Anda yakin ingin menghapus file{' '}
                            <span className="font-semibold text-foreground">
                                "{attachmentToDelete?.original_name}"
                            </span>
                            ? File fisik akan dihapus dari server dan tindakan ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="pt-3">
                        <AlertDialogCancel
                            disabled={isDeleting}
                            className="rounded-xl"
                        >
                            Batal
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            disabled={isDeleting}
                            className="rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                        >
                            {isDeleting && <Loader2 className="mr-2 size-4 animate-spin" />}
                            {isDeleting ? 'Menghapus...' : 'Ya, Hapus File'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
