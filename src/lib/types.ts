export interface Conference {
    id: number;
    name: string;
    short_name: string;
    year: number;
    area: "AI/ML" | "Systems" | "Hardware" | "EDA/VLSI" | "Mixed";
    rating: string | null;
    rating_source: string | null;

    // Dates
    conference_start_date: string | null;
    conference_end_date: string | null;
    submission_start_date: string | null;
    submission_deadline: string | null;
    notification_date: string | null;
    camera_ready_date: string | null;
    workshop_date: string | null;
    tutorial_date: string | null;
    registration_start_date: string | null;
    registration_end_date: string | null;
    early_registration_deadline: string | null;

    // Location
    city: string | null;
    country: string | null;
    venue: string | null;
    timezone: string | null;
    is_virtual: boolean;
    is_hybrid: boolean;

    // Submission requirements
    review_type: "single-blind" | "double-blind" | "open" | null;
    paper_format: string | null;
    max_pages: number | null;
    abstract_deadline: string | null;
    submission_types: string[] | null; // parsed from JSON

    // Impact & metrics
    h5_index: number | null;
    h5_median: number | null;
    acceptance_rate: number | null;
    historical_acceptance_rates: Record<string, number> | null; // parsed from JSON
    total_submissions: number | null;
    total_accepted: number | null;

    // Links
    website: string | null;
    cfp_url: string | null;
    proceedings_url: string | null;
    paper_template_url: string | null;
    latex_template_url: string | null;

    // Conference content
    themes: string[] | null; // parsed from JSON
    tracks: string[] | null; // parsed from JSON
    keynote_speakers: string[] | null; // parsed from JSON

    // Paper / Publication info
    proceedings_doi: string | null;
    publisher: string | null;
    open_access: boolean;
    paper_download_url: string | null;

    // User preferences
    is_favorite: boolean;
    notes: string | null;
    color_tag: string | null;

    // Meta
    created_at: string;
    updated_at: string;
    last_fetched_at: string | null;
}

// Raw database row (before JSON parsing)
export interface ConferenceRow {
    id: number;
    name: string;
    short_name: string;
    year: number;
    area: string;
    rating: string | null;
    rating_source: string | null;
    conference_start_date: string | null;
    conference_end_date: string | null;
    submission_start_date: string | null;
    submission_deadline: string | null;
    notification_date: string | null;
    camera_ready_date: string | null;
    workshop_date: string | null;
    tutorial_date: string | null;
    registration_start_date: string | null;
    registration_end_date: string | null;
    early_registration_deadline: string | null;
    city: string | null;
    country: string | null;
    venue: string | null;
    timezone: string | null;
    is_virtual: number;
    is_hybrid: number;
    review_type: string | null;
    paper_format: string | null;
    max_pages: number | null;
    abstract_deadline: string | null;
    submission_types: string | null;
    h5_index: number | null;
    h5_median: number | null;
    acceptance_rate: number | null;
    historical_acceptance_rates: string | null;
    total_submissions: number | null;
    total_accepted: number | null;
    website: string | null;
    cfp_url: string | null;
    proceedings_url: string | null;
    paper_template_url: string | null;
    latex_template_url: string | null;
    themes: string | null;
    tracks: string | null;
    keynote_speakers: string | null;
    proceedings_doi: string | null;
    publisher: string | null;
    open_access: number;
    paper_download_url: string | null;
    is_favorite: number;
    notes: string | null;
    color_tag: string | null;
    created_at: string;
    updated_at: string;
    last_fetched_at: string | null;
}

export function parseConferenceRow(row: ConferenceRow): Conference {
    return {
        ...row,
        area: row.area as Conference["area"],
        review_type: row.review_type as Conference["review_type"],
        is_virtual: !!row.is_virtual,
        is_hybrid: !!row.is_hybrid,
        open_access: !!row.open_access,
        is_favorite: !!row.is_favorite,
        submission_types: row.submission_types ? JSON.parse(row.submission_types) : null,
        historical_acceptance_rates: row.historical_acceptance_rates
            ? JSON.parse(row.historical_acceptance_rates)
            : null,
        themes: row.themes ? JSON.parse(row.themes) : null,
        tracks: row.tracks ? JSON.parse(row.tracks) : null,
        keynote_speakers: row.keynote_speakers ? JSON.parse(row.keynote_speakers) : null,
    };
}

export interface ConferenceFilters {
    area?: string;
    rating?: string;
    sortBy?: "submission_deadline" | "conference_start_date" | "name" | "rating" | "acceptance_rate" | "h5_index";
    sortOrder?: "asc" | "desc";
    search?: string;
    favoritesOnly?: boolean;
    year?: number;
}

export type ConferenceFormData = Omit<Conference, "id" | "created_at" | "updated_at" | "last_fetched_at">;
