"use client";

import { Conference } from "@/lib/types";
import { cn, getAreaDotColor, getDeadlineUrgencyColor, formatDate } from "@/lib/utils";
import { useCountdown } from "@/hooks/useCountdown";
import { Clock, AlertTriangle, CheckCircle2 } from "lucide-react";

interface UpcomingDeadlinesProps {
    conferences: Conference[];
}

export function UpcomingDeadlines({ conferences }: UpcomingDeadlinesProps) {
    const now = new Date();
    const upcoming = conferences
        .filter((c) => {
            if (!c.submission_deadline) return false;
            const deadline = new Date(c.submission_deadline);
            return deadline >= now;
        })
        .sort((a, b) => {
            const da = new Date(a.submission_deadline!).getTime();
            const db = new Date(b.submission_deadline!).getTime();
            return da - db;
        })
        .slice(0, 8);

    if (upcoming.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
                <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-500" />
                    Upcoming Deadlines
                </h2>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                    <CheckCircle2 className="w-4 h-4" />
                    No upcoming deadlines
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-500" />
                Upcoming Deadlines
            </h2>
            <div className="space-y-2">
                {upcoming.map((conf) => (
                    <DeadlineItem key={conf.id} conference={conf} />
                ))}
            </div>
        </div>
    );
}

function DeadlineItem({ conference }: { conference: Conference }) {
    const countdown = useCountdown(conference.submission_deadline, "Etc/GMT+12");
    const urgencyColor = getDeadlineUrgencyColor(conference.submission_deadline);

    return (
        <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors group">
            <div className={cn("w-2 h-2 rounded-full flex-shrink-0", getAreaDotColor(conference.area))} />
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">{conference.short_name}</span>
                    <span className="text-xs text-gray-400">{conference.year}</span>
                </div>
                <div className={cn("text-xs", urgencyColor)}>
                    {formatDate(conference.submission_deadline)}
                    <span className="text-gray-400 ml-1">(AoE)</span>
                </div>
            </div>
            <div className="text-right flex-shrink-0">
                {countdown && !countdown.isPast && (
                    <div className="flex items-center gap-1">
                        {countdown.days <= 7 && (
                            <AlertTriangle className="w-3 h-3 text-red-500" />
                        )}
                        <span className={cn("text-sm font-mono font-bold", urgencyColor)}>
                            {countdown.days}d {countdown.hours}h
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
