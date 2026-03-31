import { Conference } from "./types";
import conferenceData from "../data/conferences.json";

// Conference data is loaded from the auto-generated conferences.json file.
// This file is produced by `scripts/update-conferences.mjs` which fetches
// the latest edition data from the ccfddl/ccf-deadlines repository.
// The GitHub Actions workflow runs the update script before each build,
// so deployed data is always fresh.

const conferences = (conferenceData as unknown as { conferences: Conference[] }).conferences;

// Get all conferences
export function getConferences(): Conference[] {
    return conferences;
}

// Get a conference by its ID
export function getConferenceById(id: number): Conference | undefined {
    return conferences.find((c) => c.id === id);
}

// Get all unique conference IDs (for static path generation)
export function getAllConferenceIds(): number[] {
    return conferences.map((c) => c.id);
}
