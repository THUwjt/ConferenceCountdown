"use client";

import { useState } from "react";
import { X, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddConferenceModalProps {
    onClose: () => void;
    onCreated: () => void;
}

const areaOptions = ["AI/ML", "Systems", "Hardware", "EDA/VLSI", "Mixed"] as const;
const ratingOptions = ["A*", "A", "B", "C"] as const;
const reviewTypes = ["double-blind", "single-blind", "open"] as const;

export function AddConferenceModal({ onClose, onCreated }: AddConferenceModalProps) {
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"basic" | "dates" | "details" | "links">("basic");

    const [form, setForm] = useState({
        name: "",
        short_name: "",
        year: new Date().getFullYear(),
        area: "AI/ML" as string,
        rating: "A" as string,
        rating_source: "CCF",
        conference_start_date: "",
        conference_end_date: "",
        submission_start_date: "",
        submission_deadline: "",
        notification_date: "",
        camera_ready_date: "",
        workshop_date: "",
        tutorial_date: "",
        registration_start_date: "",
        registration_end_date: "",
        city: "",
        country: "",
        venue: "",
        timezone: "",
        review_type: "double-blind" as string,
        paper_format: "LaTeX",
        max_pages: 10,
        h5_index: null as number | null,
        acceptance_rate: null as number | null,
        website: "",
        cfp_url: "",
        paper_template_url: "",
        publisher: "",
        open_access: false,
        is_favorite: false,
    });

    const updateField = (field: string, value: unknown) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        if (!form.name || !form.short_name) {
            setError("Name and short name are required.");
            return;
        }

        setSubmitting(true);
        setError(null);
        try {
            // In static mode, we just notify the parent (data lives in client state)
            onCreated();
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setSubmitting(false);
        }
    };

    const tabs = [
        { key: "basic" as const, label: "Basic Info" },
        { key: "dates" as const, label: "Dates" },
        { key: "details" as const, label: "Details" },
        { key: "links" as const, label: "Links" },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                        <Plus className="w-5 h-5 text-blue-600" />
                        <h2 className="text-lg font-bold text-gray-900">Add Conference</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 px-6 pt-3 bg-gray-50 border-b border-gray-200">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={cn(
                                "px-4 py-2 text-sm font-medium rounded-t-lg transition-all -mb-px",
                                activeTab === tab.key
                                    ? "bg-white text-gray-900 border border-gray-200 border-b-white"
                                    : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    {activeTab === "basic" && (
                        <div className="space-y-4">
                            <FormField label="Conference Full Name *">
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => updateField("name", e.target.value)}
                                    placeholder="e.g., International Conference on Learning Representations"
                                    className="form-input"
                                />
                            </FormField>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField label="Short Name *">
                                    <input
                                        type="text"
                                        value={form.short_name}
                                        onChange={(e) => updateField("short_name", e.target.value)}
                                        placeholder="e.g., ICLR"
                                        className="form-input"
                                    />
                                </FormField>
                                <FormField label="Year">
                                    <input
                                        type="number"
                                        value={form.year}
                                        onChange={(e) => updateField("year", parseInt(e.target.value))}
                                        className="form-input"
                                    />
                                </FormField>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField label="Area">
                                    <select
                                        value={form.area}
                                        onChange={(e) => updateField("area", e.target.value)}
                                        className="form-input"
                                    >
                                        {areaOptions.map((a) => (
                                            <option key={a} value={a}>{a}</option>
                                        ))}
                                    </select>
                                </FormField>
                                <FormField label="Rating">
                                    <select
                                        value={form.rating}
                                        onChange={(e) => updateField("rating", e.target.value)}
                                        className="form-input"
                                    >
                                        {ratingOptions.map((r) => (
                                            <option key={r} value={r}>{r}</option>
                                        ))}
                                    </select>
                                </FormField>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <FormField label="City">
                                    <input
                                        type="text"
                                        value={form.city}
                                        onChange={(e) => updateField("city", e.target.value)}
                                        placeholder="e.g., Vienna"
                                        className="form-input"
                                    />
                                </FormField>
                                <FormField label="Country">
                                    <input
                                        type="text"
                                        value={form.country}
                                        onChange={(e) => updateField("country", e.target.value)}
                                        placeholder="e.g., Austria"
                                        className="form-input"
                                    />
                                </FormField>
                                <FormField label="Venue">
                                    <input
                                        type="text"
                                        value={form.venue}
                                        onChange={(e) => updateField("venue", e.target.value)}
                                        placeholder="Convention center..."
                                        className="form-input"
                                    />
                                </FormField>
                            </div>
                        </div>
                    )}

                    {activeTab === "dates" && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField label="Conference Start">
                                    <input
                                        type="date"
                                        value={form.conference_start_date}
                                        onChange={(e) => updateField("conference_start_date", e.target.value)}
                                        className="form-input"
                                    />
                                </FormField>
                                <FormField label="Conference End">
                                    <input
                                        type="date"
                                        value={form.conference_end_date}
                                        onChange={(e) => updateField("conference_end_date", e.target.value)}
                                        className="form-input"
                                    />
                                </FormField>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField label="Submission Start">
                                    <input
                                        type="date"
                                        value={form.submission_start_date}
                                        onChange={(e) => updateField("submission_start_date", e.target.value)}
                                        className="form-input"
                                    />
                                </FormField>
                                <FormField label="Submission Deadline">
                                    <input
                                        type="date"
                                        value={form.submission_deadline}
                                        onChange={(e) => updateField("submission_deadline", e.target.value)}
                                        className="form-input"
                                    />
                                </FormField>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField label="Notification Date">
                                    <input
                                        type="date"
                                        value={form.notification_date}
                                        onChange={(e) => updateField("notification_date", e.target.value)}
                                        className="form-input"
                                    />
                                </FormField>
                                <FormField label="Camera Ready">
                                    <input
                                        type="date"
                                        value={form.camera_ready_date}
                                        onChange={(e) => updateField("camera_ready_date", e.target.value)}
                                        className="form-input"
                                    />
                                </FormField>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField label="Workshop Date">
                                    <input
                                        type="date"
                                        value={form.workshop_date}
                                        onChange={(e) => updateField("workshop_date", e.target.value)}
                                        className="form-input"
                                    />
                                </FormField>
                                <FormField label="Tutorial Date">
                                    <input
                                        type="date"
                                        value={form.tutorial_date}
                                        onChange={(e) => updateField("tutorial_date", e.target.value)}
                                        className="form-input"
                                    />
                                </FormField>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField label="Registration Start">
                                    <input
                                        type="date"
                                        value={form.registration_start_date}
                                        onChange={(e) => updateField("registration_start_date", e.target.value)}
                                        className="form-input"
                                    />
                                </FormField>
                                <FormField label="Registration End">
                                    <input
                                        type="date"
                                        value={form.registration_end_date}
                                        onChange={(e) => updateField("registration_end_date", e.target.value)}
                                        className="form-input"
                                    />
                                </FormField>
                            </div>
                        </div>
                    )}

                    {activeTab === "details" && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <FormField label="Review Type">
                                    <select
                                        value={form.review_type}
                                        onChange={(e) => updateField("review_type", e.target.value)}
                                        className="form-input"
                                    >
                                        {reviewTypes.map((r) => (
                                            <option key={r} value={r}>{r}</option>
                                        ))}
                                    </select>
                                </FormField>
                                <FormField label="Paper Format">
                                    <input
                                        type="text"
                                        value={form.paper_format}
                                        onChange={(e) => updateField("paper_format", e.target.value)}
                                        placeholder="LaTeX"
                                        className="form-input"
                                    />
                                </FormField>
                                <FormField label="Max Pages">
                                    <input
                                        type="number"
                                        value={form.max_pages || ""}
                                        onChange={(e) => updateField("max_pages", e.target.value ? parseInt(e.target.value) : null)}
                                        className="form-input"
                                    />
                                </FormField>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <FormField label="h5-index">
                                    <input
                                        type="number"
                                        value={form.h5_index ?? ""}
                                        onChange={(e) => updateField("h5_index", e.target.value ? parseInt(e.target.value) : null)}
                                        className="form-input"
                                    />
                                </FormField>
                                <FormField label="Acceptance Rate (%)">
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={form.acceptance_rate ?? ""}
                                        onChange={(e) => updateField("acceptance_rate", e.target.value ? parseFloat(e.target.value) : null)}
                                        className="form-input"
                                    />
                                </FormField>
                                <FormField label="Publisher">
                                    <input
                                        type="text"
                                        value={form.publisher}
                                        onChange={(e) => updateField("publisher", e.target.value)}
                                        placeholder="ACM, IEEE..."
                                        className="form-input"
                                    />
                                </FormField>
                            </div>
                            <div className="flex items-center gap-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.open_access}
                                        onChange={(e) => updateField("open_access", e.target.checked)}
                                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">Open Access</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.is_favorite}
                                        onChange={(e) => updateField("is_favorite", e.target.checked)}
                                        className="w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                                    />
                                    <span className="text-sm text-gray-700">Mark as Favorite</span>
                                </label>
                            </div>
                        </div>
                    )}

                    {activeTab === "links" && (
                        <div className="space-y-4">
                            <FormField label="Official Website">
                                <input
                                    type="url"
                                    value={form.website}
                                    onChange={(e) => updateField("website", e.target.value)}
                                    placeholder="https://..."
                                    className="form-input"
                                />
                            </FormField>
                            <FormField label="Call for Papers URL">
                                <input
                                    type="url"
                                    value={form.cfp_url}
                                    onChange={(e) => updateField("cfp_url", e.target.value)}
                                    placeholder="https://..."
                                    className="form-input"
                                />
                            </FormField>
                            <FormField label="Paper Template URL">
                                <input
                                    type="url"
                                    value={form.paper_template_url}
                                    onChange={(e) => updateField("paper_template_url", e.target.value)}
                                    placeholder="https://..."
                                    className="form-input"
                                />
                            </FormField>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-all"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <Plus className="w-4 h-4" />
                                Create Conference
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

function FormField({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
            {children}
        </div>
    );
}
