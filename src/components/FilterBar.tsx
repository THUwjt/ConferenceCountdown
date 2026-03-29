"use client";

import { ConferenceFilters } from "@/lib/types";
import {
    Search,
    SlidersHorizontal,
    Star,
    ArrowUpDown,
    X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterBarProps {
    filters: ConferenceFilters;
    onChange: (filters: ConferenceFilters) => void;
    conferenceCount: number;
}

const areas = [
    { value: "all", label: "All Areas" },
    { value: "AI/ML", label: "AI / ML" },
    { value: "Systems", label: "Systems" },
    { value: "Hardware", label: "Hardware" },
    { value: "EDA/VLSI", label: "EDA / VLSI" },
];

const ratings = [
    { value: "all", label: "All Ratings" },
    { value: "A*", label: "A*" },
    { value: "A", label: "A" },
    { value: "B", label: "B" },
    { value: "C", label: "C" },
];

const sortOptions = [
    { value: "submission_deadline", label: "Submission Deadline" },
    { value: "conference_start_date", label: "Conference Date" },
    { value: "name", label: "Name" },
    { value: "acceptance_rate", label: "Acceptance Rate" },
    { value: "h5_index", label: "h5-Index" },
];

export function FilterBar({ filters, onChange, conferenceCount }: FilterBarProps) {
    const hasActiveFilters =
        (filters.area && filters.area !== "all") ||
        (filters.rating && filters.rating !== "all") ||
        filters.favoritesOnly ||
        filters.search;

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6">
            {/* Search bar */}
            <div className="flex items-center gap-3 mb-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search conferences, cities, countries..."
                        value={filters.search || ""}
                        onChange={(e) => onChange({ ...filters, search: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    {filters.search && (
                        <button
                            onClick={() => onChange({ ...filters, search: "" })}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
                <button
                    onClick={() => onChange({ ...filters, favoritesOnly: !filters.favoritesOnly })}
                    className={cn(
                        "flex items-center gap-1.5 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all",
                        filters.favoritesOnly
                            ? "bg-amber-50 border-amber-300 text-amber-700"
                            : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                    )}
                >
                    <Star className={cn("w-4 h-4", filters.favoritesOnly && "fill-current")} />
                    Favorites
                </button>
            </div>

            {/* Filter row */}
            <div className="flex flex-wrap items-center gap-3">
                <SlidersHorizontal className="w-4 h-4 text-gray-400" />

                {/* Area filter */}
                <div className="flex gap-1">
                    {areas.map((a) => (
                        <button
                            key={a.value}
                            onClick={() => onChange({ ...filters, area: a.value })}
                            className={cn(
                                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                                filters.area === a.value
                                    ? "bg-gray-900 text-white"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            )}
                        >
                            {a.label}
                        </button>
                    ))}
                </div>

                <div className="w-px h-6 bg-gray-200" />

                {/* Rating filter */}
                <div className="flex gap-1">
                    {ratings.map((r) => (
                        <button
                            key={r.value}
                            onClick={() => onChange({ ...filters, rating: r.value })}
                            className={cn(
                                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                                filters.rating === r.value
                                    ? "bg-gray-900 text-white"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            )}
                        >
                            {r.label}
                        </button>
                    ))}
                </div>

                <div className="w-px h-6 bg-gray-200" />

                {/* Sort */}
                <div className="flex items-center gap-1.5">
                    <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                    <select
                        value={filters.sortBy}
                        onChange={(e) =>
                            onChange({
                                ...filters,
                                sortBy: e.target.value as ConferenceFilters["sortBy"],
                            })
                        }
                        className="text-xs bg-gray-100 border-0 rounded-lg px-3 py-1.5 text-gray-600 focus:ring-2 focus:ring-blue-500"
                    >
                        {sortOptions.map((s) => (
                            <option key={s.value} value={s.value}>
                                {s.label}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={() =>
                            onChange({
                                ...filters,
                                sortOrder: filters.sortOrder === "asc" ? "desc" : "asc",
                            })
                        }
                        className="px-2 py-1.5 rounded-lg bg-gray-100 text-xs text-gray-600 hover:bg-gray-200 transition-all"
                    >
                        {filters.sortOrder === "asc" ? "↑ Asc" : "↓ Desc"}
                    </button>
                </div>

                <div className="ml-auto flex items-center gap-2">
                    {hasActiveFilters && (
                        <button
                            onClick={() =>
                                onChange({
                                    area: "all",
                                    rating: "all",
                                    sortBy: "submission_deadline",
                                    sortOrder: "asc",
                                    search: "",
                                    favoritesOnly: false,
                                })
                            }
                            className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700"
                        >
                            <X className="w-3 h-3" />
                            Clear filters
                        </button>
                    )}
                    <span className="text-xs text-gray-400">{conferenceCount} conferences</span>
                </div>
            </div>
        </div>
    );
}
