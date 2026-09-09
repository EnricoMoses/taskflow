import { Link } from '@inertiajs/react';
import { Project } from '@/types/project';
import ProjectStatusBadge from '@/Components/Projects/ProjectStatusBadge';
import { Card, CardContent, CardFooter, CardHeader } from '@/Components/ui/card';
import { Progress } from '@/Components/ui/progress';
import { Button } from '@/Components/ui/button';
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuSeparator, 
    DropdownMenuTrigger 
} from '@/Components/ui/dropdown-menu';
import { 
    Calendar, 
    CheckCircle2, 
    MoreVertical, 
    ExternalLink, 
    Edit, 
    Trash2, 
    AlertTriangle,
    Kanban
} from 'lucide-react';

interface ProjectCardProps {
    project: Project;
    onEdit: (project: Project) => void;
    onDelete: (project: Project) => void;
}

export default function ProjectCard({
    project,
    onEdit,
    onDelete,
}: ProjectCardProps) {
    return (
        <Card className="group relative flex flex-col justify-between rounded-2xl border border-border/70 bg-card hover:shadow-md hover:border-primary/30 transition-all duration-200">
            <div>
                {/* Card Header: Title & Actions */}
                <CardHeader className="p-5 pb-3">
                    <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <ProjectStatusBadge status={project.status} label={project.status_label} />
                                {project.is_overdue && (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">
                                        <AlertTriangle className="size-3" />
                                        Terlambat
                                    </span>
                                )}
                            </div>
                            <Link
                                href={route('projects.show', project.id)}
                                className="block font-heading text-lg font-bold tracking-tight text-foreground group-hover:text-primary transition-colors line-clamp-1"
                            >
                                {project.name}
                            </Link>
                        </div>

                        {/* Action Menu */}
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                render={
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-8 rounded-lg text-muted-foreground hover:text-foreground shrink-0"
                                    >
                                        <MoreVertical className="size-4" />
                                        <span className="sr-only">Menu Opsi</span>
                                    </Button>
                                }
                            />
                            <DropdownMenuContent align="end" className="w-48 rounded-xl p-1.5 shadow-lg">
                                <DropdownMenuItem
                                    className="cursor-pointer rounded-lg"
                                    render={
                                        <Link href={route('projects.show', project.id)} className="flex items-center gap-2">
                                            <Kanban className="size-4 text-muted-foreground" />
                                            Buka Board Kanban
                                        </Link>
                                    }
                                />
                                <DropdownMenuItem
                                    onClick={() => onEdit(project)}
                                    className="cursor-pointer rounded-lg flex items-center gap-2"
                                >
                                    <Edit className="size-4 text-muted-foreground" />
                                    Edit Proyek
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => onDelete(project)}
                                    variant="destructive"
                                    className="cursor-pointer rounded-lg text-destructive focus:text-destructive flex items-center gap-2"
                                >
                                    <Trash2 className="size-4" />
                                    Hapus Proyek
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardHeader>

                {/* Card Content: Description & Task Stats */}
                <CardContent className="px-5 py-2 space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                        {project.description || 'Tidak ada deskripsi untuk proyek ini.'}
                    </p>

                    {/* Progress Section */}
                    <div className="space-y-2 pt-1">
                        <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-muted-foreground flex items-center gap-1.5">
                                <CheckCircle2 className="size-3.5 text-primary" />
                                Progress Tugas
                            </span>
                            <span className="font-semibold text-foreground">
                                {project.progress_percentage}% ({project.completed_tasks_count}/{project.tasks_count})
                            </span>
                        </div>
                        <Progress value={project.progress_percentage} className="h-2 rounded-full" />
                    </div>
                </CardContent>
            </div>

            {/* Card Footer: Deadline & Quick Link */}
            <CardFooter className="px-5 py-3.5 mt-2 border-t border-border/50 flex items-center justify-between text-xs bg-muted/20 rounded-b-2xl">
                <div className={`flex items-center gap-1.5 font-medium ${project.is_overdue ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}>
                    <Calendar className="size-3.5" />
                    <span>Tenggat: {project.deadline_formatted}</span>
                </div>

                <Link
                    href={route('projects.show', project.id)}
                    className="inline-flex items-center gap-1 text-primary hover:underline font-semibold"
                >
                    Lihat
                    <ExternalLink className="size-3" />
                </Link>
            </CardFooter>
        </Card>
    );
}
