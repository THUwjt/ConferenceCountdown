import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
    return clsx(inputs);
}

/**
 * Get countdown to a target date.
 * @param targetDate - Date string in YYYY-MM-DD format
 * @param timezone - IANA timezone string (e.g., "America/Los_Angeles").
 *                   For submission deadlines, pass "Etc/GMT+12" (AoE - Anywhere on Earth)
 *                   since most academic deadlines use AoE.
 *                   If null/undefined, defaults to AoE for safety.
 */
export function getCountdown(targetDate: string | null, timezone?: string | null): {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    total: number;
    isPast: boolean;
    label: string;
} | null {
    if (!targetDate) return null;

    // Construct the end-of-day in the specified timezone
    // For AoE (Anywhere on Earth) = UTC-12, IANA name is "Etc/GMT+12"
    // Note: In IANA, Etc/GMT+12 means UTC-12 (signs are inverted)
    const tz = timezone || "Etc/GMT+12";

    // Create a target date at 23:59:59 in the specified timezone
    // Use Intl.DateTimeFormat to get the UTC offset for the target timezone
    let target: Date;
    try {
        // Format the target date at 23:59:59 in the given timezone
        // and convert to an absolute UTC timestamp
        const dateStr = `${targetDate}T23:59:59`;
        const formatter = new Intl.DateTimeFormat("en-US", {
            timeZone: tz,
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
        });

        // Get the offset between UTC and the target timezone at the target date
        // We do this by finding what UTC time corresponds to 23:59:59 in the target tz
        // Approach: binary-search-free method using Date and timezone formatting
        const utcDate = new Date(dateStr + "Z"); // interpret as UTC first
        const utcStr = formatter.format(utcDate); // format that UTC time in target tz
        // Parse the formatted string to see what time it shows in the target tz
        const parts = formatter.formatToParts(utcDate);
        const getPart = (type: string) => parts.find((p) => p.type === type)?.value || "0";
        const tzHour = parseInt(getPart("hour"));
        const tzMinute = parseInt(getPart("minute"));
        const tzSecond = parseInt(getPart("second"));
        const tzDay = parseInt(getPart("day"));
        const tzMonth = parseInt(getPart("month"));
        const tzYear = parseInt(getPart("year"));

        // The UTC time showed as tzHour:tzMinute:tzSecond in the target tz
        // We want 23:59:59 in target tz, so the offset is:
        const targetInTz = new Date(Date.UTC(tzYear, tzMonth - 1, tzDay, tzHour, tzMinute, tzSecond));
        const offsetMs = targetInTz.getTime() - utcDate.getTime();

        // Now construct the actual target: 23:59:59 in target tz = that UTC time minus the offset
        const wantedInTz = new Date(dateStr + "Z"); // This is the "wall clock" we want
        target = new Date(wantedInTz.getTime() - offsetMs);
    } catch {
        // Fallback: if timezone handling fails, treat as local time
        target = new Date(targetDate + "T23:59:59");
    }

    const now = new Date();
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
