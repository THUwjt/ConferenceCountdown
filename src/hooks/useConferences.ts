"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Conference, ConferenceFilters } from "@/lib/types";
import { getConferences } from "@/lib/data";

export function useConferences(initialFilters?: Partial<ConferenceFilters>) {
    const [allConferences, setAllConferences] = useState<Conference[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<ConferenceFilters>({
        area: "all",
        rating: "all",
        sortBy: "submission_deadline",
        sortOrder: "asc",
        search: "",
        favoritesOnly: false,
        year: undefined,
        ...initialFilters,
    });

    // Load data on mount (static data, no API needed)
    useEffect(() => {
        try {
            const data = getConferences();
            setAllConferences(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load conferences");
        } finally {
            setLoading(false);
        }
    }, []);

    // Client-side filtering and sorting
    const conferences = useMemo(() => {
        let result = [...allConferences];

        // Filter by area
        if (filters.area && filters.area !== "all") {
            result = result.filter((c) => c.area === filters.area);
        }

        // Filter by rating
        if (filters.rating && filters.rating !== "all") {
            result = result.filter((c) => c.rating === filters.rating);
        }

        // Filter by search
        if (filters.search) {
            const term = filters.search.toLowerCase();
            result = result.filter(
                (c) =>
                    c.name.toLowerCase().includes(term) ||
                    c.short_name.toLowerCase().includes(term) ||
                    (c.city && c.city.toLowerCase().includes(term)) ||
                    (c.country && c.country.toLowerCase().includes(term))
            );
        }

        // Filter by favorites
        if (filters.favoritesOnly) {
            result = result.filter((c) => c.is_favorite);
        }

        // Filter by year
        if (filters.year) {
            result = result.filter((c) => c.year === filters.year);
        }

        // Sort
        const sortColumn = filters.sortBy || "submission_deadline";
        const order = filters.sortOrder === "desc" ? -1 : 1;

        result.sort((a, b) => {
            let aVal: string | number | null = null;
            let bVal: string | number | null = null;

            switch (sortColumn) {
                case "submission_deadline":
                    aVal = a.submission_deadline;
                    bVal = b.submission_deadline;
                    break;
                case "conference_start_date":
                    aVal = a.conference_start_date;
                    bVal = b.conference_start_date;
                    break;
                case "name":
                    aVal = a.short_name;
                    bVal = b.short_name;
                    break;
                case "rating":
                    aVal = a.rating;
                    bVal = b.rating;
                    break;
                case "acceptance_rate":
                    aVal = a.acceptance_rate;
                    bVal = b.acceptance_rate;
                    break;
                case "h5_index":
                    aVal = a.h5_index;
                    bVal = b.h5_index;
                    break;
            }

            // Nulls always go last
            if (aVal === null && bVal === null) return 0;
            if (aVal === null) return 1;
            if (bVal === null) return -1;

            if (typeof aVal === "string" && typeof bVal === "string") {
                return aVal.localeCompare(bVal) * order;
            }
            if (typeof aVal === "number" && typeof bVal === "number") {
                return (aVal - bVal) * order;
            }

            return String(aVal).localeCompare(String(bVal)) * order;
        });

        return result;
    }, [allConferences, filters]);

    const toggleFavorite = useCallback((id: number) => {
        setAllConferences((prev) =>
            prev.map((c) => (c.id === id ? { ...c, is_favorite: !c.is_favorite } : c))
        );
    }, []);

    const deleteConference = useCallback((id: number) => {
        setAllConferences((prev) => prev.filter((c) => c.id !== id));
    }, []);

    const refresh = useCallback(() => {
        try {
            const data = getConferences();
            setAllConferences(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load conferences");
        }
    }, []);

    return {
        conferences,
        loading,
        error,
        filters,
        setFilters,
        toggleFavorite,
        deleteConference,
        refresh,
    };
}
