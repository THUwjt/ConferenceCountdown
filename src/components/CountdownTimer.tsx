"use client";

import { useCountdown } from "@/hooks/useCountdown";
import { cn } from "@/lib/utils";

interface CountdownTimerProps {
    targetDate: string | null;
    label: string;
    compact?: boolean;
}

export function CountdownTimer({ targetDate, label, compact = false }: CountdownTimerProps) {
    const countdown = useCountdown(targetDate);

    if (!countdown || !targetDate) {
        return (
            <div className={cn("text-gray-400", compact ? "text-xs" : "text-sm")}>
                {label}: TBD
            </div>
        );
    }

    const { days, hours, minutes, seconds, isPast } = countdown;

    if (isPast) {
        return (
            <div className={cn("text-gray-400 line-through", compact ? "text-xs" : "text-sm")}>
                {label}: Passed
            </div>
        );
    }

    const urgentClass =
        days <= 3
            ? "text-red-600 animate-pulse"
            : days <= 7
                ? "text-red-500"
                : days <= 30
                    ? "text-orange-500"
                    : days <= 90
                        ? "text-yellow-600"
                        : "text-green-600";

    if (compact) {
        return (
            <div className="text-xs">
                <span className="text-gray-500">{label}: </span>
                <span className={cn("font-mono font-semibold", urgentClass)}>
                    {days}d {hours}h {minutes}m {seconds}s
                </span>
            </div>
        );
    }

    return (
        <div>
            <div className="text-xs text-gray-500 mb-1 uppercase tracking-wider">{label}</div>
            <div className={cn("flex gap-1.5 items-center", urgentClass)}>
                <TimeBlock value={days} unit="D" />
                <span className="text-lg font-bold">:</span>
                <TimeBlock value={hours} unit="H" />
                <span className="text-lg font-bold">:</span>
                <TimeBlock value={minutes} unit="M" />
                <span className="text-lg font-bold">:</span>
                <TimeBlock value={seconds} unit="S" />
            </div>
        </div>
    );
}

function TimeBlock({ value, unit }: { value: number; unit: string }) {
    return (
        <div className="flex flex-col items-center">
            <span className="font-mono text-xl font-bold leading-none tabular-nums">
                {String(value).padStart(2, "0")}
            </span>
            <span className="text-[10px] text-gray-400 uppercase">{unit}</span>
        </div>
    );
}
