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
    ListTodo,
    ChevronDown,
    ChevronsUpDown,
    PanelLeft,
    Layers,
    LayoutGrid,
    CheckCircle2
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
import ThemeToggle from '@/Components/ThemeToggle';
import { cn } from '@/lib/utils';

export default function AuthenticatedLayout({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const { auth, flash } = usePage<PageProps>().props;
    const user = auth.user;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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

    const navItems = [
        {
            name: 'Dashboard',
            href: route('dashboard'),
            icon: LayoutDashboard,
            active: isCurrent('dashboard'),
        },
        {
            name: 'Proyek',
            href: route('projects.index'),
            icon: FolderKanban,
            active: isCurrent('projects.*'),
        },
        {
            name: 'Semua Tugas',
            href: route('tasks.index'),
            icon: ListTodo,
            active: isCurrent('tasks.*'),
        },
        {
            name: 'Profil Saya',
            href: route('profile.edit'),
            icon: User,
            active: isCurrent('profile.*'),
        },
    ];

    // Determine current page name for header breadcrumb
    const getCurrentPageName = () => {
        if (isCurrent('dashboard')) return 'Dashboard';
        if (isCurrent('projects.show')) return 'Detail Proyek';
        if (isCurrent('projects.*')) return 'Proyek';
        if (isCurrent('tasks.*')) return 'Semua Tugas';
        if (isCurrent('profile.*')) return 'Profil Pengguna';
        return 'Workspace';
    };

    return (
        <div className="min-h-screen bg-slate-50/60 dark:bg-background text-foreground flex font-sans selection:bg-primary/20 selection:text-primary">
            <Toaster richColors position="top-right" />

            {/* Desktop Left Sidebar */}
            <aside 
                className={cn(
                    "hidden md:flex flex-col fixed inset-y-0 left-0 z-30 border-r border-border/70 bg-card/95 backdrop-blur transition-all duration-300 ease-in-out",
                    sidebarCollapsed ? "w-20" : "w-64"
                )}
            >
                {/* Brand Header */}
                <div className="h-20 flex items-center justify-between px-5 border-b border-border/40">
                    <Link href="/dashboard" className="flex items-center gap-3 group overflow-hidden">
                        <div className="size-10 rounded-2xl bg-teal-600 dark:bg-teal-500 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-200">
                            <LayoutGrid className="size-5" />
                        </div>
                        {!sidebarCollapsed && (
                            <div className="flex flex-col min-w-0 transition-opacity duration-200">
                                <span className="font-heading font-extrabold text-lg tracking-tight text-foreground leading-none">
                                    TaskFlow
                                </span>
                                <span className="text-[11px] text-muted-foreground font-medium mt-1">
                                    Workspace
                                </span>
                            </div>
                        )}
                    </Link>
                </div>

                {/* Navigation Links */}
                <div className="flex-1 overflow-y-auto px-3 py-6 space-y-6">
                    <div>
                        {!sidebarCollapsed && (
                            <h3 className="px-3 text-[11px] font-bold text-muted-foreground/70 uppercase tracking-wider mb-2">
                                Menu
                            </h3>
                        )}
                        <nav className="space-y-1.5">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        title={sidebarCollapsed ? item.name : undefined}
                                        className={cn(
                                            "flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-sm font-medium transition-all duration-150 group",
                                            item.active
                                                ? "bg-slate-200/70 dark:bg-slate-800 text-foreground font-semibold shadow-xs"
                                                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                                            sidebarCollapsed && "justify-center px-0 py-3"
                                        )}
                                    >
                                        <Icon 
                                            className={cn(
                                                "size-5 shrink-0 transition-colors",
                                                item.active 
                                                    ? "text-teal-600 dark:text-teal-400" 
                                                    : "text-muted-foreground group-hover:text-foreground"
                                            )} 
                                        />
                                        {!sidebarCollapsed && (
                                            <span className="truncate">{item.name}</span>
                                        )}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                </div>

                {/* Bottom User Card */}
                <div className="p-3 border-t border-border/40">
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            className={cn(
                                "w-full flex items-center gap-3 p-2.5 rounded-2xl hover:bg-muted/70 transition-colors text-left outline-none cursor-pointer group",
                                sidebarCollapsed && "justify-center p-2"
                            )}
                        >
                            <Avatar className="size-9 rounded-full border border-border/70 shrink-0">
                                <AvatarFallback className="bg-teal-600/10 text-teal-700 dark:text-teal-300 font-bold text-xs">
                                    {getInitials(user.name)}
                                </AvatarFallback>
                            </Avatar>
                            {!sidebarCollapsed && (
                                <>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-foreground truncate leading-tight">
                                            {user.name}
                                        </p>
                                        <p className="text-[11px] text-muted-foreground truncate leading-tight mt-0.5">
                                            {user.email}
                                        </p>
                                    </div>
                                    <ChevronsUpDown className="size-4 text-muted-foreground shrink-0 group-hover:text-foreground" />
                                </>
                            )}
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" side="top" className="w-56 rounded-2xl p-1.5 shadow-xl mb-2">
                            <DropdownMenuLabel className="font-normal px-2.5 py-2">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-semibold leading-none">{user.name}</p>
                                    <p className="text-xs leading-none text-muted-foreground truncate">{user.email}</p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="cursor-pointer rounded-xl px-2.5 py-2"
                                render={
                                    <Link href={route('profile.edit')} className="w-full flex items-center gap-2">
                                        <User className="size-4 text-muted-foreground" />
                                        <span>Profil Saya</span>
                                    </Link>
                                }
                            />
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="cursor-pointer rounded-xl px-2.5 py-2 text-destructive focus:text-destructive"
                                variant="destructive"
                                render={
                                    <Link href={route('logout')} method="post" as="button" className="w-full flex items-center gap-2">
                                        <LogOut className="size-4" />
                                        <span>Keluar</span>
                                    </Link>
                                }
                            />
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </aside>

            {/* Mobile Drawer Backdrop & Sidebar */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div 
                        className="fixed inset-0 bg-background/80 backdrop-blur-xs transition-opacity"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                    <div className="fixed inset-y-0 left-0 w-72 bg-card border-r border-border p-5 flex flex-col shadow-2xl z-50 animate-in slide-in-from-left duration-200">
                        {/* Mobile Header */}
                        <div className="flex items-center justify-between pb-5 border-b border-border/60">
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-2xl bg-teal-600 dark:bg-teal-500 text-white flex items-center justify-center shadow-sm">
                                    <LayoutGrid className="size-5" />
                                </div>
                                <div>
                                    <span className="font-heading font-extrabold text-lg text-foreground leading-none block">
                                        TaskFlow
                                    </span>
                                    <span className="text-[11px] text-muted-foreground font-medium">
                                        Workspace
                                    </span>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-xl size-8"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <X className="size-5" />
                            </Button>
                        </div>

                        {/* Mobile Nav Links */}
                        <div className="flex-1 overflow-y-auto py-6 space-y-6">
                            <div>
                                <h3 className="px-3 text-[11px] font-bold text-muted-foreground/70 uppercase tracking-wider mb-2">
                                    Menu
                                </h3>
                                <nav className="space-y-1.5">
                                    {navItems.map((item) => {
                                        const Icon = item.icon;
                                        return (
                                            <Link
                                                key={item.name}
                                                href={item.href}
                                                onClick={() => setMobileMenuOpen(false)}
                                                className={cn(
                                                    "flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-medium transition-all",
                                                    item.active
                                                        ? "bg-slate-200/70 dark:bg-slate-800 text-foreground font-semibold"
                                                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                                                )}
                                            >
                                                <Icon className={cn("size-5", item.active ? "text-teal-600 dark:text-teal-400" : "text-muted-foreground")} />
                                                <span>{item.name}</span>
                                            </Link>
                                        );
                                    })}
                                </nav>
                            </div>
                        </div>

                        {/* Mobile Profile & Logout */}
                        <div className="pt-4 border-t border-border/60 space-y-3">
                            <div className="flex items-center gap-3 px-2">
                                <Avatar className="size-10 rounded-full border border-border">
                                    <AvatarFallback className="bg-teal-600/10 text-teal-700 dark:text-teal-300 font-bold text-xs">
                                        {getInitials(user.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-foreground truncate">{user.name}</p>
                                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 pt-2">
                                <Button
                                    variant="outline"
                                    className="w-full justify-start rounded-xl text-xs gap-2"
                                    render={
                                        <Link href={route('profile.edit')} onClick={() => setMobileMenuOpen(false)}>
                                            <User className="size-3.5" />
                                            Profil
                                        </Link>
                                    }
                                />
                                <Button
                                    variant="destructive"
                                    className="rounded-xl text-xs px-3"
                                    render={
                                        <Link href={route('logout')} method="post" as="button" onClick={() => setMobileMenuOpen(false)}>
                                            <LogOut className="size-3.5" />
                                        </Link>
                                    }
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <div 
                className={cn(
                    "flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out",
                    sidebarCollapsed ? "md:ml-20" : "md:ml-64"
                )}
            >
                {/* Top Header Bar */}
                <header className="sticky top-0 z-20 h-16 border-b border-border/60 bg-background/80 backdrop-blur-md px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
                    {/* Left: Sidebar Toggle & Page Title / Breadcrumb */}
                    <div className="flex items-center gap-3">
                        {/* Mobile Toggle */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden size-9 rounded-xl text-muted-foreground hover:text-foreground"
                            onClick={() => setMobileMenuOpen(true)}
                        >
                            <Menu className="size-5" />
                        </Button>

                        {/* Desktop Toggle */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="hidden md:flex size-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80"
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            title={sidebarCollapsed ? "Perluas Sidebar" : "Perkecil Sidebar"}
                        >
                            <PanelLeft className="size-4.5" />
                        </Button>

                        {/* Breadcrumb / Page Title */}
                        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                            <span>{getCurrentPageName()}</span>
                        </div>
                    </div>

                    {/* Right: Theme Toggle & Actions */}
                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                    </div>
                </header>

                {/* Optional Header Banner from Pages */}
                {header && (
                    <div className="border-b border-border/40 bg-card/40 px-4 sm:px-6 lg:px-8 py-5">
                        <div className="max-w-7xl mx-auto">
                            {header}
                        </div>
                    </div>
                )}

                {/* Page Content */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
