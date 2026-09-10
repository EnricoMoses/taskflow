import { PropsWithChildren } from 'react';
import { Link } from '@inertiajs/react';
import { CheckSquare2 } from 'lucide-react';
import ThemeToggle from '@/Components/ThemeToggle';

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center bg-background text-foreground px-4 py-8">
            {/* Top Right Theme Toggle */}
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
                <ThemeToggle />
            </div>

            {/* Brand Logo */}
            <div className="mb-6 text-center">
                <Link href="/" className="inline-flex items-center gap-2.5 group">
                    <div className="size-10 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-md group-hover:scale-105 transition-transform duration-200">
                        <CheckSquare2 className="size-6" />
                    </div>
                    <span className="font-heading font-bold text-2xl tracking-tight text-foreground">
                        TaskFlow
                    </span>
                </Link>
            </div>

            {/* Form Card */}
            <div className="w-full sm:max-w-md bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-sm">
                {children}
            </div>
        </div>
    );
}
