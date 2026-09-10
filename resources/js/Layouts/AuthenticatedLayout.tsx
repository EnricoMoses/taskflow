import { useState, useEffect, PropsWithChildren, ReactNode } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Toaster } from '@/Components/ui/sonner';
import { toast } from 'sonner';
import { 
    LayoutDashboard, 
    FolderKanban, 
    Menu, 
    X, 
    User, 
    LogOut,
    CheckSquare2,
    ChevronDown,
    ListTodo,
} from 'lucide-react';
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuLabel, 
    DropdownMenuSeparator, 
    DropdownMenuTrigger 
} from '@/Components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/Components/ui/avatar';
import { Button } from '@/Components/ui/button';

export default function AuthenticatedLayout({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const { auth, flash } = usePage<PageProps>().props;
    const user = auth.user;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    const isCurrent = (routeName: string) => {
        try {
            return route().current(routeName);
        } catch {
            return false;
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/20 selection:text-primary">
            <Toaster richColors position="top-right" />

            {/* Top Navigation */}
            <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between gap-4">
                        {/* Left: Brand & Nav Links */}
                        <div className="flex items-center gap-6 md:gap-8">
                            <Link href="/dashboard" className="flex items-center gap-2.5 group">
                                <div className="size-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-sm group-hover:scale-105 transition-transform duration-200">
                                    <CheckSquare2 className="size-5" />
                                </div>
                                <span className="font-heading font-bold text-xl tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                                    TaskFlow
                                </span>
                            </Link>

                            <nav className="hidden md:flex items-center gap-1">
                                <Link
                                    href={route('dashboard')}
                                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                        isCurrent('dashboard')
                                            ? 'bg-primary/10 text-primary font-semibold'
                                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                    }`}
                                >
                                    <LayoutDashboard className="size-4" />
                                    Dashboard
                                </Link>
                                <Link
                                    href={route('projects.index')}
                                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                        isCurrent('projects.*')
                                            ? 'bg-primary/10 text-primary font-semibold'
                                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                    }`}
                                >
                                    <FolderKanban className="size-4" />
                                    Projects
                                </Link>
                                <Link
                                    href={route('tasks.index')}
                                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                        isCurrent('tasks.*')
                                            ? 'bg-primary/10 text-primary font-semibold'
                                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                    }`}
                                >
                                    <ListTodo className="size-4" />
                                    All Tasks
                                </Link>
                            </nav>
                        </div>

                        {/* Right: User Profile & Actions */}
                        <div className="flex items-center gap-3">
                            <div className="hidden md:flex items-center">
                                <DropdownMenu>
                                    <DropdownMenuTrigger className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-muted/80 transition-colors outline-none cursor-pointer">
                                        <Avatar className="size-8 rounded-lg border border-border">
                                            <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-semibold text-xs">
                                                {getInitials(user.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col text-left">
                                            <span className="text-xs font-semibold leading-none">{user.name}</span>
                                            <span className="text-[11px] text-muted-foreground leading-tight mt-0.5 max-w-[120px] truncate">{user.email}</span>
                                        </div>
                                        <ChevronDown className="size-3.5 text-muted-foreground ml-1" />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56 rounded-xl p-1.5 shadow-lg">
                                        <DropdownMenuLabel className="font-normal px-2 py-1.5">
                                            <div className="flex flex-col space-y-1">
                                                <p className="text-sm font-medium leading-none">{user.name}</p>
                                                <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                                            </div>
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            className="cursor-pointer rounded-lg"
                                            render={
                                                <Link href={route('profile.edit')} className="w-full flex items-center gap-2">
                                                    <User className="size-4 text-muted-foreground" />
                                                    Profile
                                                </Link>
                                            }
                                        />
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            className="cursor-pointer rounded-lg text-destructive focus:text-destructive"
                                            variant="destructive"
                                            render={
                                                <Link href={route('logout')} method="post" as="button" className="w-full flex items-center gap-2">
                                                    <LogOut className="size-4" />
                                                    Log Out
                                                </Link>
                                            }
                                        />
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            {/* Mobile menu toggle */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="md:hidden"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                aria-label="Toggle Menu"
                            >
                                {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation Drawer */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-b border-border bg-background/98 px-4 pt-2 pb-4 space-y-3">
                        <nav className="flex flex-col gap-1">
                            <Link
                                href={route('dashboard')}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
                                    isCurrent('dashboard')
                                        ? 'bg-primary/10 text-primary font-semibold'
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                }`}
                            >
                                <LayoutDashboard className="size-4" />
                                Dashboard
                            </Link>
                            <Link
                                href={route('projects.index')}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
                                    isCurrent('projects.*')
                                        ? 'bg-primary/10 text-primary font-semibold'
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                }`}
                            >
                                <FolderKanban className="size-4" />
                                Projects
                            </Link>
                            <Link
                                href={route('tasks.index')}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
                                    isCurrent('tasks.*')
                                        ? 'bg-primary/10 text-primary font-semibold'
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                }`}
                            >
                                <ListTodo className="size-4" />
                                All Tasks
                            </Link>
                        </nav>
                        <div className="border-t border-border pt-3">
                            <div className="flex items-center gap-3 px-3 py-2 mb-2">
                                <Avatar className="size-8 rounded-lg border border-border">
                                    <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-semibold text-xs">
                                        {getInitials(user.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold">{user.name}</span>
                                    <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Link
                                    href={route('profile.edit')}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                                >
                                    <User className="size-4" />
                                    Profile
                                </Link>
                                <Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10"
                                >
                                    <LogOut className="size-4" />
                                    Log Out
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </header>

            {/* Optional Header Banner */}
            {header && (
                <div className="border-b border-border/40 bg-muted/20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        {header}
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    );
}
