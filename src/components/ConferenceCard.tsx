"use client";

import { Conference } from "@/lib/types";
import {
    cn,
    getAreaColor,
    getRatingColor,
    formatDateRange,
    formatDate,
    getDeadlineUrgencyColor,
} from "@/lib/utils";
import { CountdownTimer } from "./CountdownTimer";
import {
    Star,
    MapPin,
    Calendar,
    Clock,
    ExternalLink,
    FileText,
    Users,
    TrendingDown,
    ChevronRight,
} from "lucide-react";
import Link from "next/link";

interface ConferenceCardProps {
    conference: Conference;
    onToggleFavorite: (id: number) => void;
}

export function ConferenceCard({ conference, onToggleFavorite }: ConferenceCardProps) {
    const c = conference;

    return (
        <div
            className={cn(
                "relative bg-white rounded-xl border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group",
                c.is_favorite ? "border-amber-300 ring-1 ring-amber-100" : "border-gray-200"
            )}
        >
            {/* Top color bar */}
            <div
                className={cn(
                    "h-1",
                    c.area === "AI/ML"
                        ? "bg-purple-500"
                        : c.area === "Systems"
                            ? "bg-blue-500"
                            : c.area === "Hardware"
                                ? "bg-amber-500"
                                : c.area === "EDA/VLSI"
                                    ? "bg-emerald-500"
                                    : "bg-gray-400"
                )}
            />

            <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <Link
                                href={`/conference/${c.id}`}
                                className="text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors truncate"
                            >
                                {c.short_name} {c.year}
                            </Link>
                            <span className={cn("px-2 py-0.5 text-xs font-medium rounded-full border", getAreaColor(c.area))}>
                                {c.area}
                            </span>
                            {c.rating && (
                                <span className={cn("px-2 py-0.5 text-xs font-bold rounded-full border", getRatingColor(c.rating))}>
                                    {c.rating}
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-gray-500 truncate">{c.name}</p>
                    </div>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            onToggleFavorite(c.id);
                        }}
                        className={cn(
                            "flex-shrink-0 p-1.5 rounded-lg transition-all",
                            c.is_favorite
                                ? "text-amber-500 hover:bg-amber-50"
                                : "text-gray-300 hover:text-amber-400 hover:bg-gray-50"
                        )}
                    >
                        <Star className={cn("w-5 h-5", c.is_favorite && "fill-current")} />
                    </button>
                </div>

                {/* Location & Dates */}
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 mb-4">
                    {c.city && (
                        <div className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-gray-400" />
                            <span>
                                {c.city}, {c.country}
                            </span>
                        </div>
                    )}
                    <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span>{formatDateRange(c.conference_start_date, c.conference_end_date)}</span>
                    </div>
                </div>

                {/* Countdown Timers */}
                <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                    <CountdownTimer targetDate={c.submission_deadline} label="Submission" compact />
                    <CountdownTimer targetDate={c.conference_start_date} label="Conference" compact />
                </div>

                {/* Key Dates */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs mb-4">
                    <DateItem
                        icon={<Clock className="w-3 h-3" />}
                        label="Submission"
                        date={c.submission_deadline}
                        urgency={getDeadlineUrgencyColor(c.submission_deadline)}
                    />
                    <DateItem
                        icon={<FileText className="w-3 h-3" />}
                        label="Notification"
                        date={c.notification_date}
                    />
                    <DateItem
                        icon={<Calendar className="w-3 h-3" />}
                        label="Camera Ready"
                        date={c.camera_ready_date}
                    />
                    <DateItem
                        icon={<Users className="w-3 h-3" />}
                        label="Workshop"
                        date={c.workshop_date}
                    />
                </div>

                {/* Metrics */}
                <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-3 pt-3 border-t border-gray-100">
                    {c.acceptance_rate != null && (
                        <div className="flex items-center gap-1">
                            <TrendingDown className="w-3 h-3" />
                            <span>Acceptance: {c.acceptance_rate}%</span>
                        </div>
                    )}
                    {c.h5_index != null && <span>h5-index: {c.h5_index}</span>}
                    {c.max_pages != null && <span>{c.max_pages} pages max</span>}
                    {c.review_type && <span className="capitalize">{c.review_type}</span>}
                </div>

                {/* Footer Links */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex gap-2">
                        {c.website && (
                            <a
                                href={c.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
                            >
                                <ExternalLink className="w-3 h-3" />
                                Website
                            </a>
                        )}
                        {c.cfp_url && (
                            <a
                                href={c.cfp_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
                            >
                                <FileText className="w-3 h-3" />
                                CFP
                            </a>
                        )}
                    </div>
                    <Link
                        href={`/conference/${c.id}`}
                        className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 transition-colors group/link"
                    >
                        Details
                        <ChevronRight className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform" />
                    </Link>
                </div>
            </div>
        </div>
    );
}

function DateItem({
    icon,
    label,
    date,
    urgency,
}: {
    icon: React.ReactNode;
    label: string;
    date: string | null;
    urgency?: string;
}) {
    return (
        <div className="flex items-center gap-1.5">
            <span className="text-gray-400">{icon}</span>
            <span className="text-gray-500">{label}:</span>
            <span className={cn("font-medium", urgency || "text-gray-700")}>
                {formatDate(date)}
            </span>
        </div>
    );
}
