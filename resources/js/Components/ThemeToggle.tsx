import { useTheme } from '@/Components/ThemeProvider';
import { Button } from '@/Components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import { Sun, Moon, Laptop, Check } from 'lucide-react';

interface ThemeToggleProps {
    className?: string;
}

export default function ThemeToggle({ className = '' }: ThemeToggleProps) {
    const { theme, resolvedTheme, setTheme } = useTheme();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                render={
                    <Button
                        variant="ghost"
                        size="icon"
                        className={`size-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors ${className}`}
                        title="Ubah Tema"
                    >
                        {resolvedTheme === 'dark' ? (
                            <Moon className="size-4.5 text-primary transition-transform" />
                        ) : (
                            <Sun className="size-4.5 text-amber-500 transition-transform" />
                        )}
                        <span className="sr-only">Ubah Tema</span>
                    </Button>
                }
            />
            <DropdownMenuContent align="end" className="w-36 rounded-xl p-1 shadow-lg">
                <DropdownMenuItem
                    onClick={() => setTheme('light')}
                    className="cursor-pointer rounded-lg text-xs flex items-center justify-between py-1.5"
                >
                    <div className="flex items-center gap-2">
                        <Sun className="size-4 text-amber-500" />
                        <span>Terang</span>
                    </div>
                    {theme === 'light' && <Check className="size-3.5 text-primary" />}
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => setTheme('dark')}
                    className="cursor-pointer rounded-lg text-xs flex items-center justify-between py-1.5"
                >
                    <div className="flex items-center gap-2">
                        <Moon className="size-4 text-indigo-400" />
                        <span>Gelap</span>
                    </div>
                    {theme === 'dark' && <Check className="size-3.5 text-primary" />}
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => setTheme('system')}
                    className="cursor-pointer rounded-lg text-xs flex items-center justify-between py-1.5"
                >
                    <div className="flex items-center gap-2">
                        <Laptop className="size-4 text-muted-foreground" />
                        <span>Sistem</span>
                    </div>
                    {theme === 'system' && <Check className="size-3.5 text-primary" />}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
