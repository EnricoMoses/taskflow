import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { CheckSquare2, ArrowRight, Kanban, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import ThemeToggle from '@/Components/ThemeToggle';

export default function Welcome({
    auth,
}: PageProps) {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
            <Head title="TaskFlow - Modern Project & Task Management" />

            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between gap-4">
                        <Link href="/" className="flex items-center gap-2.5 group">
                            <div className="size-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-sm group-hover:scale-105 transition-transform duration-200">
                                <CheckSquare2 className="size-5" />
                            </div>
                            <span className="font-heading font-bold text-xl tracking-tight text-foreground">
                                TaskFlow
                            </span>
                        </Link>

                        <div className="flex items-center gap-3">
                            <ThemeToggle />

                            {auth.user ? (
                                <Button
                                    className="rounded-xl gap-1.5"
                                    render={
                                        <Link href={route('dashboard')}>
                                            Dashboard <ArrowRight className="size-4" />
                                        </Link>
                                    }
                                />
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="rounded-xl text-xs sm:text-sm"
                                        render={<Link href={route('login')}>Masuk</Link>}
                                    />
                                    <Button
                                        size="sm"
                                        className="rounded-xl text-xs sm:text-sm shadow-sm"
                                        render={<Link href={route('register')}>Daftar Gratis</Link>}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center space-y-8 max-w-5xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary animate-fade-in">
                    <Sparkles className="size-3.5" />
                    Platform Manajemen Proyek & Tugas Modern
                </div>

                <div className="space-y-4 max-w-3xl">
                    <h1 className="font-heading text-4xl sm:text-6xl font-bold tracking-tight text-foreground leading-[1.15]">
                        Kelola Proyek & Tugas Lebih Cepat dengan{' '}
                        <span className="bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
                            TaskFlow
                        </span>
                    </h1>
                    <p className="text-base sm:text-xl text-muted-foreground leading-relaxed">
                        Visualisasikan alur kerja dengan Board Kanban interaktif, upload lampiran aman, lacak tenggat waktu, dan pantau produktivitas secara real-time.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto pt-2">
                    {auth.user ? (
                        <Button
                            size="lg"
                            className="rounded-2xl px-8 h-12 text-base gap-2 shadow-md w-full sm:w-auto"
                            render={
                                <Link href={route('dashboard')}>
                                    Buka Dashboard <ArrowRight className="size-4" />
                                </Link>
                            }
                        />
                    ) : (
                        <>
                            <Button
                                size="lg"
                                className="rounded-2xl px-8 h-12 text-base gap-2 shadow-md w-full sm:w-auto"
                                render={
                                    <Link href={route('register')}>
                                        Mulai Sekarang Gratis <ArrowRight className="size-4" />
                                    </Link>
                                }
                            />
                            <Button
                                variant="outline"
                                size="lg"
                                className="rounded-2xl px-8 h-12 text-base w-full sm:w-auto"
                                render={<Link href={route('login')}>Sudah Punya Akun</Link>}
                            />
                        </>
                    )}
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 text-left w-full">
                    <div className="bg-card border border-border/70 rounded-3xl p-6 shadow-xs space-y-3">
                        <div className="size-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                            <Kanban className="size-5" />
                        </div>
                        <h3 className="font-heading font-semibold text-base text-foreground">Kanban Interaktif</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                            Drag-and-drop tugas antar status secara intuitif dengan pembaruan UI instan.
                        </p>
                    </div>

                    <div className="bg-card border border-border/70 rounded-3xl p-6 shadow-xs space-y-3">
                        <div className="size-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                            <Zap className="size-5" />
                        </div>
                        <h3 className="font-heading font-semibold text-base text-foreground">Filter & Pencarian Cepat</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                            Temukan tugas berdasarkan prioritas, status, rentang tenggat, dan kata kunci dalam hitungan detik.
                        </p>
                    </div>

                    <div className="bg-card border border-border/70 rounded-3xl p-6 shadow-xs space-y-3">
                        <div className="size-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                            <ShieldCheck className="size-5" />
                        </div>
                        <h3 className="font-heading font-semibold text-base text-foreground">Aman & Terstruktur</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                            Otorisasi berbasis kepemilikan dan validasi ketat memastikan data dan lampiran aman.
                        </p>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
                <div className="max-w-7xl mx-auto px-4">
                    &copy; {new Date().getFullYear()} TaskFlow. All rights reserved.
                </div>
            </footer>
        </div>
    );
}
