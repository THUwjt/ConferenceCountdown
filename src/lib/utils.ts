import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
    return clsx(inputs);
}

export function getCountdown(targetDate: string | null): {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    total: number;
    isPast: boolean;
    label: string;
} | null {
    if (!targetDate) return null;

    const now = new Date();
    const target = new Date(targetDate + "T23:59:59");
    const diff = target.getTime() - now.getTime();
    const isPast = diff < 0;
    const absDiff = Math.abs(diff);

    const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((absDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((absDiff % (1000 * 60)) / 1000);

    let label: string;
    if (isPast) {
        if (days === 0) label = "Ended today";
        else if (days === 1) label = "Ended yesterday";
        else label = `Ended ${days} days ago`;
    } else {
        if (days === 0) label = "Ends today";
        else if (days === 1) label = "Tomorrow";
        else if (days <= 7) label = `${days} days left`;
        else if (days <= 30) label = `${Math.ceil(days / 7)} weeks left`;
        else label = `${Math.ceil(days / 30)} months left`;
    }

    return { days, hours, minutes, seconds, total: diff, isPast, label };
}

export function getAreaColor(area: string): string {
    const colors: Record<string, string> = {
        "AI/ML": "bg-purple-100 text-purple-800 border-purple-200",
        Systems: "bg-blue-100 text-blue-800 border-blue-200",
        Hardware: "bg-amber-100 text-amber-800 border-amber-200",
        "EDA/VLSI": "bg-emerald-100 text-emerald-800 border-emerald-200",
        Mixed: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return colors[area] || colors.Mixed;
}

export function getAreaDotColor(area: string): string {
    const colors: Record<string, string> = {
        "AI/ML": "bg-purple-500",
        Systems: "bg-blue-500",
        Hardware: "bg-amber-500",
        "EDA/VLSI": "bg-emerald-500",
        Mixed: "bg-gray-500",
    };
    return colors[area] || colors.Mixed;
}

export function getRatingColor(rating: string | null): string {
    const colors: Record<string, string> = {
        "A*": "bg-red-100 text-red-800 border-red-200",
        A: "bg-orange-100 text-orange-800 border-orange-200",
        B: "bg-yellow-100 text-yellow-800 border-yellow-200",
        C: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return rating ? colors[rating] || colors.C : "bg-gray-50 text-gray-500 border-gray-200";
}

export function getDeadlineUrgencyColor(targetDate: string | null): string {
    if (!targetDate) return "text-gray-400";
    const now = new Date();
    const target = new Date(targetDate);
    const diff = target.getTime() - now.getTime();
    const days = diff / (1000 * 60 * 60 * 24);

    if (days < 0) return "text-gray-400";
    if (days <= 7) return "text-red-600";
    if (days <= 30) return "text-orange-500";
    if (days <= 90) return "text-yellow-600";
    return "text-green-600";
}

export function formatDate(dateStr: string | null): string {
    if (!dateStr) return "TBD";
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

export function formatDateRange(start: string | null, end: string | null): string {
    if (!start) return "TBD";
    const startDate = new Date(start + "T00:00:00");
    const endDate = end ? new Date(end + "T00:00:00") : null;

    const startFormatted = startDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    });

    if (!endDate) return `${startFormatted}, ${startDate.getFullYear()}`;

    if (startDate.getMonth() === endDate.getMonth()) {
        return `${startFormatted}–${endDate.getDate()}, ${endDate.getFullYear()}`;
    }

    const endFormatted = endDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    });

    return `${startFormatted} – ${endFormatted}, ${endDate.getFullYear()}`;
}
