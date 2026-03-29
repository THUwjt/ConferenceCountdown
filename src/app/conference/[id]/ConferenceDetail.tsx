"use client";

import { useEffect, useState, use } from "react";
import { Conference } from "@/lib/types";
import { getConferenceById } from "@/lib/data";
import { CountdownTimer } from "@/components/CountdownTimer";
import {
    cn,
    getAreaColor,
    getRatingColor,
    formatDate,
    formatDateRange,
    getDeadlineUrgencyColor,
} from "@/lib/utils";
import {
    ArrowLeft,
    Star,
    MapPin,
    Calendar,
    Clock,
    FileText,
    ExternalLink,
    Globe,
    Users,
    TrendingDown,
    BarChart3,
    BookOpen,
    Award,
    Loader2,
    AlertCircle,
    Download,
    Tag,
    Eye,
    Layers,
} from "lucide-react";
import Link from "next/link";

export default function ConferenceDetail({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const [conference, setConference] = useState<Conference | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        try {
            const data = getConferenceById(parseInt(id));
            if (data) {
                setConference(data);
            } else {
                setError("Conference not found");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    }, [id]);

    const toggleFavorite = () => {
        if (!conference) return;
        setConference({ ...conference, is_favorite: !conference.is_favorite });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    <span className="text-sm text-gray-500">Loading conference details...</span>
                </div>
            </div>
        );
    }

    if (error || !conference) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white rounded-xl border border-red-200 p-8 max-w-md text-center">
                    <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                    <h2 className="text-lg font-bold text-gray-900 mb-2">Conference Not Found</h2>
                    <p className="text-sm text-gray-500 mb-4">{error || "Could not load conference details."}</p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    const c = conference;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero header */}
            <div
                className={cn(
                    "relative",
                    c.area === "AI/ML"
                        ? "bg-gradient-to-r from-purple-600 to-purple-800"
                        : c.area === "Systems"
                            ? "bg-gradient-to-r from-blue-600 to-blue-800"
                            : c.area === "Hardware"
                                ? "bg-gradient-to-r from-amber-600 to-amber-800"
                                : c.area === "EDA/VLSI"
                                    ? "bg-gradient-to-r from-emerald-600 to-emerald-800"
                                    : "bg-gradient-to-r from-gray-600 to-gray-800"
                )}
            >
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Link
                            href="/"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 text-white/90 text-sm hover:bg-white/20 transition-all"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back
                        </Link>
                    </div>

                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                                <h1 className="text-3xl font-bold text-white">
                                    {c.short_name} {c.year}
                                </h1>
                                <span className={cn("px-2.5 py-1 text-xs font-semibold rounded-full border", getAreaColor(c.area))}>
                                    {c.area}
                                </span>
                                {c.rating && (
                                    <span className={cn("px-2.5 py-1 text-xs font-bold rounded-full border", getRatingColor(c.rating))}>
                                        {c.rating} ({c.rating_source})
                                    </span>
                                )}
                            </div>
                            <p className="text-white/80 text-lg mb-3">{c.name}</p>

                            <div className="flex flex-wrap gap-4 text-sm text-white/70">
                                {c.city && (
                                    <span className="flex items-center gap-1.5">
                                        <MapPin className="w-4 h-4" />
                                        {c.city}, {c.country}
                                    </span>
                                )}
                                <span className="flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4" />
                                    {formatDateRange(c.conference_start_date, c.conference_end_date)}
                                </span>
                                {c.venue && (
                                    <span className="flex items-center gap-1.5">
                                        <Globe className="w-4 h-4" />
                                        {c.venue}
                                    </span>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={toggleFavorite}
                            className={cn(
                                "flex-shrink-0 p-2 rounded-xl transition-all",
                                c.is_favorite
                                    ? "bg-amber-400 text-white"
                                    : "bg-white/10 text-white/60 hover:bg-white/20"
                            )}
                        >
                            <Star className={cn("w-6 h-6", c.is_favorite && "fill-current")} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Countdown Timers - Prominent */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 -mt-10 mb-8 relative z-10">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-red-500" />
                            Submission Deadline
                        </div>
                        <CountdownTimer targetDate={c.submission_deadline} label="Submission" />
                        <div className={cn("text-sm mt-3 font-medium", getDeadlineUrgencyColor(c.submission_deadline))}>
                            {formatDate(c.submission_deadline)}
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-500" />
                            Conference Starts
                        </div>
                        <CountdownTimer targetDate={c.conference_start_date} label="Conference" />
                        <div className="text-sm mt-3 font-medium text-gray-600">
                            {formatDate(c.conference_start_date)}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left column: Main info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Important Dates */}
                        <Section title="Important Dates" icon={<Calendar className="w-4 h-4 text-blue-500" />}>
                            <div className="grid grid-cols-2 gap-3">
                                <DateRow label="Submission Opens" date={c.submission_start_date} />
                                <DateRow label="Submission Deadline" date={c.submission_deadline} urgent />
                                <DateRow label="Notification" date={c.notification_date} />
                                <DateRow label="Camera Ready" date={c.camera_ready_date} />
                                <DateRow label="Conference Start" date={c.conference_start_date} />
                                <DateRow label="Conference End" date={c.conference_end_date} />
                                <DateRow label="Workshop" date={c.workshop_date} />
                                <DateRow label="Tutorial" date={c.tutorial_date} />
                                <DateRow label="Registration Opens" date={c.registration_start_date} />
                                <DateRow label="Registration Closes" date={c.registration_end_date} />
                                {c.early_registration_deadline && (
                                    <DateRow label="Early Registration" date={c.early_registration_deadline} />
                                )}
                                {c.abstract_deadline && (
                                    <DateRow label="Abstract Deadline" date={c.abstract_deadline} />
                                )}
                            </div>
                        </Section>

                        {/* Submission Requirements */}
                        <Section title="Submission Requirements" icon={<FileText className="w-4 h-4 text-green-500" />}>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <InfoCard label="Review Type" value={c.review_type || "N/A"} icon={<Eye className="w-4 h-4" />} />
                                <InfoCard label="Paper Format" value={c.paper_format || "N/A"} icon={<FileText className="w-4 h-4" />} />
                                <InfoCard label="Max Pages" value={c.max_pages ? `${c.max_pages} pages` : "N/A"} icon={<BookOpen className="w-4 h-4" />} />
                                <InfoCard label="Publisher" value={c.publisher || "N/A"} icon={<Layers className="w-4 h-4" />} />
                            </div>
                            {c.submission_types && c.submission_types.length > 0 && (
                                <div className="mt-4">
                                    <span className="text-xs font-medium text-gray-500 block mb-2">Submission Types</span>
                                    <div className="flex flex-wrap gap-2">
                                        {c.submission_types.map((t) => (
                                            <span key={t} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium capitalize">
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </Section>

                        {/* Themes & Tracks */}
                        {(c.themes || c.tracks) && (
                            <Section title="Themes & Tracks" icon={<Tag className="w-4 h-4 text-purple-500" />}>
                                {c.themes && c.themes.length > 0 && (
                                    <div className="mb-4">
                                        <span className="text-xs font-medium text-gray-500 block mb-2">Research Themes</span>
                                        <div className="flex flex-wrap gap-2">
                                            {c.themes.map((t) => (
                                                <span key={t} className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">
                                                    {t}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {c.tracks && c.tracks.length > 0 && (
                                    <div>
                                        <span className="text-xs font-medium text-gray-500 block mb-2">Tracks</span>
                                        <div className="flex flex-wrap gap-2">
                                            {c.tracks.map((t) => (
                                                <span key={t} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                                                    {t}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </Section>
                        )}

                        {/* Historical Acceptance Rates */}
                        {c.historical_acceptance_rates && (
                            <Section title="Historical Acceptance Rates" icon={<BarChart3 className="w-4 h-4 text-orange-500" />}>
                                <div className="flex items-end gap-2 h-40">
                                    {Object.entries(c.historical_acceptance_rates)
                                        .sort(([a], [b]) => a.localeCompare(b))
                                        .map(([year, rate]) => (
                                            <div key={year} className="flex-1 flex flex-col items-center gap-1">
                                                <span className="text-xs font-bold text-gray-700">{rate}%</span>
                                                <div
                                                    className="w-full bg-gradient-to-t from-orange-500 to-orange-300 rounded-t-md transition-all duration-500"
                                                    style={{ height: `${(rate / 50) * 100}%` }}
                                                />
                                                <span className="text-[10px] text-gray-500">{year}</span>
                                            </div>
                                        ))}
                                </div>
                            </Section>
                        )}
                    </div>

                    {/* Right column: Sidebar */}
                    <div className="space-y-6">
                        {/* Impact Metrics */}
                        <Section title="Impact Metrics" icon={<Award className="w-4 h-4 text-amber-500" />}>
                            <div className="space-y-3">
                                {c.h5_index != null && (
                                    <MetricRow label="h5-index" value={c.h5_index} />
                                )}
                                {c.h5_median != null && (
                                    <MetricRow label="h5-median" value={c.h5_median} />
                                )}
                                {c.acceptance_rate != null && (
                                    <MetricRow label="Acceptance Rate" value={`${c.acceptance_rate}%`} />
                                )}
                                {c.total_submissions != null && (
                                    <MetricRow label="Total Submissions" value={c.total_submissions} />
                                )}
                                {c.total_accepted != null && (
                                    <MetricRow label="Total Accepted" value={c.total_accepted} />
                                )}
                            </div>
                        </Section>

                        {/* Quick Links */}
                        <Section title="Links & Resources" icon={<ExternalLink className="w-4 h-4 text-blue-500" />}>
                            <div className="space-y-2">
                                {c.website && (
                                    <LinkRow href={c.website} label="Official Website" icon={<Globe className="w-4 h-4" />} />
                                )}
                                {c.cfp_url && (
                                    <LinkRow href={c.cfp_url} label="Call for Papers" icon={<FileText className="w-4 h-4" />} />
                                )}
                                {c.paper_template_url && (
                                    <LinkRow href={c.paper_template_url} label="Paper Template" icon={<Download className="w-4 h-4" />} />
                                )}
                                {c.latex_template_url && (
                                    <LinkRow href={c.latex_template_url} label="LaTeX Template" icon={<FileText className="w-4 h-4" />} />
                                )}
                                {c.proceedings_url && (
                                    <LinkRow href={c.proceedings_url} label="Proceedings" icon={<BookOpen className="w-4 h-4" />} />
                                )}
                                {c.paper_download_url && (
                                    <LinkRow href={c.paper_download_url} label="Download Papers" icon={<Download className="w-4 h-4" />} />
                                )}
                            </div>
                        </Section>

                        {/* Additional Info */}
                        <Section title="Additional Info" icon={<Users className="w-4 h-4 text-gray-500" />}>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Open Access</span>
                                    <span className={cn("font-medium", c.open_access ? "text-green-600" : "text-gray-400")}>
                                        {c.open_access ? "Yes" : "No"}
                                    </span>
                                </div>
                                {c.proceedings_doi && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">DOI</span>
                                        <span className="font-mono text-xs text-gray-700">{c.proceedings_doi}</span>
                                    </div>
                                )}
                                {c.timezone && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Timezone</span>
                                        <span className="text-gray-700">{c.timezone}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Format</span>
                                    <span className="text-gray-700">
                                        {c.is_hybrid ? "Hybrid" : c.is_virtual ? "Virtual" : "In-person"}
                                    </span>
                                </div>
                            </div>
                        </Section>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Section({
    title,
    icon,
    children,
}: {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                {icon}
                {title}
            </h3>
            {children}
        </div>
    );
}

function DateRow({
    label,
    date,
    urgent,
}: {
    label: string;
    date: string | null;
    urgent?: boolean;
}) {
    return (
        <div className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-gray-50">
            <span className="text-xs text-gray-500">{label}</span>
            <span
                className={cn(
                    "text-xs font-medium",
                    urgent ? getDeadlineUrgencyColor(date) : "text-gray-700"
                )}
            >
                {formatDate(date)}
            </span>
        </div>
    );
}

function InfoCard({
    label,
    value,
    icon,
}: {
    label: string;
    value: string;
    icon: React.ReactNode;
}) {
    return (
        <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                {icon}
                <span className="text-[10px] font-medium uppercase">{label}</span>
            </div>
            <div className="text-sm font-semibold text-gray-900 capitalize">{value}</div>
        </div>
    );
}

function MetricRow({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="flex items-center justify-between py-1.5">
            <span className="text-sm text-gray-500">{label}</span>
            <span className="text-sm font-bold text-gray-900">{value}</span>
        </div>
    );
}

function LinkRow({
    href,
    label,
    icon,
}: {
    href: string;
    label: string;
    icon: React.ReactNode;
}) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 p-2.5 rounded-lg text-sm text-blue-600 hover:bg-blue-50 transition-all group"
        >
            <span className="text-blue-400 group-hover:text-blue-600 transition-colors">{icon}</span>
            <span className="font-medium">{label}</span>
            <ExternalLink className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
        </a>
    );
}
