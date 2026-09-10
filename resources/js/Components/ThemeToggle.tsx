import { useTheme } from '@/Components/ThemeProvider';
import { Button } from '@/Components/ui/button';
import { Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
    className?: string;
}

export default function ThemeToggle({ className = '' }: ThemeToggleProps) {
    const { resolvedTheme, toggleTheme } = useTheme();

    return (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className={cn(
                "size-9 rounded-xl text-foreground/80 hover:text-foreground hover:bg-muted/80 transition-all duration-200 cursor-pointer focus-visible:ring-1 focus-visible:ring-ring",
                className
            )}
            title={resolvedTheme === 'dark' ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'}
            aria-label={resolvedTheme === 'dark' ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'}
        >
            {resolvedTheme === 'dark' ? (
                <Moon className="size-5 text-foreground transition-all duration-200" strokeWidth={1.8} />
            ) : (
                <Sun className="size-5 text-foreground transition-all duration-200" strokeWidth={1.8} />
            )}
            <span className="sr-only">Toggle theme</span>
        </Button>
    );
}
