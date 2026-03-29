"use client";

import { useConferences } from "@/hooks/useConferences";
import { ConferenceCard } from "@/components/ConferenceCard";
import { FilterBar } from "@/components/FilterBar";
import { StatsOverview } from "@/components/StatsOverview";
import { TimelineView } from "@/components/TimelineView";
import { UpcomingDeadlines } from "@/components/UpcomingDeadlines";
import { AddConferenceModal } from "@/components/AddConferenceModal";
import { useState } from "react";
import {
  GraduationCap,
  Plus,
  RefreshCw,
  LayoutGrid,
  List,
  Calendar as CalendarIcon,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ViewMode = "grid" | "list" | "timeline";

export default function Home() {
  const {
    conferences,
    loading,
    error,
    filters,
    setFilters,
    toggleFavorite,
    refresh,
  } = useConferences();

  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setTimeout(() => setRefreshing(false), 500);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 leading-tight">
                  ConferenceTracker
                </h1>
                <p className="text-xs text-gray-500 -mt-0.5">
                  AI/ML · Systems · Hardware
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* View mode toggles */}
              <div className="hidden sm:flex items-center bg-gray-100 rounded-lg p-0.5">
                {([
                  { mode: "grid" as ViewMode, icon: LayoutGrid, label: "Grid" },
                  { mode: "list" as ViewMode, icon: List, label: "List" },
                  { mode: "timeline" as ViewMode, icon: CalendarIcon, label: "Timeline" },
                ]).map(({ mode, icon: Icon, label }) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                      viewMode === mode
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </button>
                ))}
              </div>

              <button
                onClick={handleRefresh}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all"
                title="Refresh"
              >
                <RefreshCw
                  className={cn(
                    "w-4 h-4",
                    refreshing && "animate-spin"
                  )}
                />
              </button>

              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Conference</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats */}
        <StatsOverview conferences={conferences} />

        {/* Filters */}
        <FilterBar
          filters={filters}
          onChange={setFilters}
          conferenceCount={conferences.length}
        />

        {/* Loading / Error */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <span className="text-sm text-gray-500">Loading conferences...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 p-4 mb-6 bg-red-50 border border-red-200 rounded-xl text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <div>
              <div className="font-medium text-sm">Failed to load conferences</div>
              <div className="text-xs mt-0.5">{error}</div>
            </div>
            <button
              onClick={refresh}
              className="ml-auto px-3 py-1 bg-red-100 rounded-lg text-xs font-medium hover:bg-red-200 transition-all"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {viewMode === "timeline" ? (
              <TimelineView conferences={conferences} />
            ) : (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                {/* Sidebar: Upcoming Deadlines */}
                <div className="lg:col-span-4 xl:col-span-3 order-2 lg:order-1">
                  <div className="lg:sticky lg:top-[80px]">
                    <UpcomingDeadlines conferences={conferences} />
                  </div>
                </div>

                {/* Conference Cards */}
                <div className="lg:col-span-8 xl:col-span-9 order-1 lg:order-2">
                  {conferences.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                      <div className="text-gray-400 text-4xl mb-3">📭</div>
                      <div className="text-lg font-semibold text-gray-700 mb-1">
                        No conferences found
                      </div>
                      <div className="text-sm text-gray-400">
                        Try adjusting your filters or add a new conference.
                      </div>
                    </div>
                  ) : viewMode === "list" ? (
                    <div className="space-y-3">
                      {conferences.map((conf) => (
                        <ConferenceCard
                          key={conf.id}
                          conference={conf}
                          onToggleFavorite={toggleFavorite}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {conferences.map((conf) => (
                        <ConferenceCard
                          key={conf.id}
                          conference={conf}
                          onToggleFavorite={toggleFavorite}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>
              ConferenceTracker — Tracking {conferences.length} conferences
            </span>
            <span>
              ICLR · NeurIPS · ICML · AAAI · MLSys · HPCA · ISCA · MICRO · OSDI · DAC & more
            </span>
          </div>
        </div>
      </footer>

      {/* Add Conference Modal */}
      {showAddModal && (
        <AddConferenceModal
          onClose={() => setShowAddModal(false)}
          onCreated={() => {
            setShowAddModal(false);
            refresh();
          }}
        />
      )}
    </div>
  );
}
