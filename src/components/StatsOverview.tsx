"use client";

import { Conference } from "@/lib/types";
import { cn, getAreaDotColor } from "@/lib/utils";
import { BarChart3, TrendingDown, Award, Layers } from "lucide-react";

interface StatsOverviewProps {
    conferences: Conference[];
}

export function StatsOverview({ conferences }: StatsOverviewProps) {
    const total = conferences.length;
    const favorites = conferences.filter((c) => c.is_favorite).length;
    const avgAcceptance =
        conferences.filter((c) => c.acceptance_rate != null).reduce((acc, c) => acc + (c.acceptance_rate || 0), 0) /
        (conferences.filter((c) => c.acceptance_rate != null).length || 1);

    const upcomingDeadlines = conferences.filter((c) => {
        if (!c.submission_deadline) return false;
        const d = new Date(c.submission_deadline);
        return d >= new Date();
    }).length;

    const areaDistribution = conferences.reduce(
        (acc, c) => {
            acc[c.area] = (acc[c.area] || 0) + 1;
            return acc;
        },
        {} as Record<string, number>
    );

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard
                icon={<Layers className="w-4 h-4 text-blue-500" />}
                label="Total Conferences"
                value={total}
                detail={
                    <div className="flex gap-1.5 mt-1.5">
                        {Object.entries(areaDistribution).map(([area, count]) => (
                            <div key={area} className="flex items-center gap-1" title={area}>
                                <div className={cn("w-1.5 h-1.5 rounded-full", getAreaDotColor(area))} />
                                <span className="text-[10px] text-gray-400">{count}</span>
                            </div>
                        ))}
                    </div>
                }
            />
            <StatCard
                icon={<Award className="w-4 h-4 text-amber-500" />}
                label="Favorites"
                value={favorites}
                detail={
                    <span className="text-[10px] text-gray-400 mt-1">
                        {total > 0 ? Math.round((favorites / total) * 100) : 0}% of total
                    </span>
                }
            />
            <StatCard
                icon={<TrendingDown className="w-4 h-4 text-red-500" />}
                label="Avg Acceptance"
                value={`${avgAcceptance.toFixed(1)}%`}
                detail={<span className="text-[10px] text-gray-400 mt-1">Across all conferences</span>}
            />
            <StatCard
                icon={<BarChart3 className="w-4 h-4 text-green-500" />}
                label="Open Deadlines"
                value={upcomingDeadlines}
                detail={<span className="text-[10px] text-gray-400 mt-1">Submissions open</span>}
            />
        </div>
    );
}

function StatCard({
    icon,
    label,
    value,
    detail,
}: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    detail?: React.ReactNode;
}) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
                {icon}
                <span className="text-xs text-gray-500 font-medium">{label}</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            {detail}
        </div>
    );
}
