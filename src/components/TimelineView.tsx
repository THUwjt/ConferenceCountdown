"use client";

import { Conference } from "@/lib/types";
import { cn, getAreaDotColor, formatDate } from "@/lib/utils";
import { Calendar } from "lucide-react";

interface TimelineViewProps {
    conferences: Conference[];
}

export function TimelineView({ conferences }: TimelineViewProps) {
    // Group by month
    const months: Record<string, Conference[]> = {};

    const sorted = [...conferences]
        .filter((c) => c.conference_start_date)
        .sort((a, b) => new Date(a.conference_start_date!).getTime() - new Date(b.conference_start_date!).getTime());

    for (const conf of sorted) {
        const date = new Date(conf.conference_start_date!);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        if (!months[key]) months[key] = [];
        months[key].push(conf);
    }

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
    ];

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-500" />
                Conference Timeline
            </h2>
            <div className="relative">
                {Object.entries(months).map(([monthKey, confs]) => {
                    const [year, month] = monthKey.split("-").map(Number);
                    const now = new Date();
                    const isCurrentMonth =
                        now.getFullYear() === year && now.getMonth() + 1 === month;
                    const isPast = new Date(year, month - 1) < new Date(now.getFullYear(), now.getMonth());

                    return (
                        <div key={monthKey} className="relative flex gap-4 mb-1 last:mb-0">
                            {/* Timeline bar */}
                            <div className="flex flex-col items-center">
                                <div
                                    className={cn(
                                        "w-3 h-3 rounded-full border-2 z-10",
                                        isCurrentMonth
                                            ? "bg-blue-500 border-blue-500"
                                            : isPast
                                                ? "bg-gray-300 border-gray-300"
                                                : "bg-white border-gray-300"
                                    )}
                                />
                                <div className="w-0.5 flex-1 bg-gray-200 -mt-px" />
                            </div>

                            {/* Content */}
                            <div className={cn("flex-1 pb-4", isPast && "opacity-60")}>
                                <div className="text-xs font-semibold text-gray-900 mb-1.5">
                                    {monthNames[month - 1]} {year}
                                    {isCurrentMonth && (
                                        <span className="ml-2 px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px]">
                                            Now
                                        </span>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {confs.map((conf) => (
                                        <div
                                            key={conf.id}
                                            className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-md text-xs hover:bg-gray-100 transition-colors"
                                            title={`${conf.name}\n${formatDate(conf.conference_start_date)}`}
                                        >
                                            <div className={cn("w-1.5 h-1.5 rounded-full", getAreaDotColor(conf.area))} />
                                            <span className="font-medium">{conf.short_name}</span>
                                            <span className="text-gray-400">{formatDate(conf.conference_start_date)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
