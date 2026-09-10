import { useState } from 'react';
import { format, parseISO, isValid } from 'date-fns';
import { id } from 'date-fns/locale';
import { Calendar as CalendarIcon, X, Check } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { Button } from '@/Components/ui/button';
import { Calendar } from '@/Components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/Components/ui/popover';
import { cn } from 'cn';

interface TaskDateRangePickerProps {
    preset?: string;
    from?: string;
    to?: string;
    onChange: (values: { preset: string; from: string; to: string }) => void;
    className?: string;
}

const PRESETS = [
    { label: 'Semua Tenggat', value: 'all' },
    { label: 'Terlambat (Overdue)', value: 'overdue' },
    { label: 'Hari Ini', value: 'today' },
    { label: 'Minggu Ini', value: 'this_week' },
    { label: 'Bulan Ini', value: 'this_month' },
];

export default function TaskDateRangePicker({
    preset = 'all',
    from = '',
    to = '',
    onChange,
    className,
}: TaskDateRangePickerProps) {
    const [open, setOpen] = useState(false);

    // Parse initial date range
    const fromDate = from && isValid(parseISO(from)) ? parseISO(from) : undefined;
    const toDate = to && isValid(parseISO(to)) ? parseISO(to) : undefined;
    const [dateRange, setDateRange] = useState<DateRange | undefined>(
        fromDate || toDate ? { from: fromDate, to: toDate } : undefined
    );

    const handleSelectPreset = (newPreset: string) => {
        setDateRange(undefined);
        onChange({
            preset: newPreset,
            from: '',
            to: '',
        });
        setOpen(false);
    };

    const handleSelectRange = (range: DateRange | undefined) => {
        setDateRange(range);
        if (range?.from) {
            const formattedFrom = format(range.from, 'yyyy-MM-dd');
            const formattedTo = range.to ? format(range.to, 'yyyy-MM-dd') : formattedFrom;
            onChange({
                preset: 'custom',
                from: formattedFrom,
                to: formattedTo,
            });
            if (range.to) {
                setOpen(false);
            }
        } else {
            onChange({
                preset: 'all',
                from: '',
                to: '',
            });
        }
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        setDateRange(undefined);
        onChange({
            preset: 'all',
            from: '',
            to: '',
        });
        setOpen(false);
    };

    // Label formatting
    const getTriggerLabel = () => {
        if (preset && preset !== 'all' && preset !== 'custom') {
            const matched = PRESETS.find((p) => p.value === preset);
            if (matched) return matched.label;
        }

        if (from && to) {
            try {
                const parsedFrom = parseISO(from);
                const parsedTo = parseISO(to);
                if (from === to) {
                    return format(parsedFrom, 'd MMM yyyy', { locale: id });
                }
                return `${format(parsedFrom, 'd MMM', { locale: id })} - ${format(parsedTo, 'd MMM yyyy', { locale: id })}`;
            } catch {
                return 'Rentang Tanggal';
            }
        }

        if (from) {
            try {
                return `Sejak ${format(parseISO(from), 'd MMM yyyy', { locale: id })}`;
            } catch {
                return 'Rentang Tanggal';
            }
        }

        return 'Tenggat Waktu';
    };

    const hasActiveFilter = (preset && preset !== 'all') || Boolean(from) || Boolean(to);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
                render={
                    <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                            'h-9 justify-start text-left font-normal rounded-xl px-3 gap-2 border-border/80 text-xs sm:text-sm',
                            hasActiveFilter && 'border-primary/50 bg-primary/5 text-primary font-medium',
                            className
                        )}
                    >
                        <CalendarIcon className="size-3.5 shrink-0 text-muted-foreground" />
                        <span className="truncate max-w-[180px]">{getTriggerLabel()}</span>
                        {hasActiveFilter && (
                            <span
                                role="button"
                                onClick={handleClear}
                                className="ml-auto rounded-full p-0.5 hover:bg-muted text-muted-foreground hover:text-foreground"
                            >
                                <X className="size-3" />
                            </span>
                        )}
                    </Button>
                }
            />

            <PopoverContent className="w-auto p-0 rounded-2xl shadow-xl border-border/80" align="start">
                <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-border">
                    {/* Presets Sidebar */}
                    <div className="p-3 space-y-1 sm:w-48 shrink-0 bg-muted/20">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-2 py-1">
                            Pilihan Cepat
                        </p>
                        {PRESETS.map((p) => {
                            const isSelected = preset === p.value;
                            return (
                                <button
                                    key={p.value}
                                    type="button"
                                    onClick={() => handleSelectPreset(p.value)}
                                    className={cn(
                                        'w-full flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg text-left transition-colors',
                                        isSelected
                                            ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                                            : 'text-foreground hover:bg-muted'
                                    )}
                                >
                                    <span>{p.label}</span>
                                    {isSelected && <Check className="size-3.5" />}
                                </button>
                            );
                        })}
                    </div>

                    {/* Calendar Range Picker */}
                    <div className="p-3">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-2 pb-2">
                            Pilih Kalender Kustom
                        </p>
                        <Calendar
                            mode="range"
                            defaultMonth={fromDate || new Date()}
                            selected={dateRange}
                            onSelect={handleSelectRange}
                            numberOfMonths={1}
                            locale={id}
                            className="rounded-xl border border-border/50"
                        />
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
