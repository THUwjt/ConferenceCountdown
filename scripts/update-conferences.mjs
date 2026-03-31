#!/usr/bin/env node

/**
 * update-conferences.mjs
 *
 * Fetches up-to-date conference data from the ccfddl/ccf-deadlines GitHub
 * repository (community-maintained, MIT-licensed YAML files) and merges it
 * with static metadata from our conference-registry.json.
 *
 * For conferences NOT covered by ccfddl (MLSys, ISSCC, VLSI, IEDM,
 * HOT CHIPS), we use fallback data from the registry and automatically
 * advance the year when the conference has passed.
 *
 * Output: src/data/conferences.json — consumed by data.ts at build time.
 *
 * Usage:
 *   node scripts/update-conferences.mjs
 *
 * Run by GitHub Actions before `next build` (weekly cron + every push).
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const REGISTRY_PATH = join(ROOT, "src", "data", "conference-registry.json");
const OUTPUT_PATH = join(ROOT, "src", "data", "conferences.json");

const CCFDDL_RAW_BASE =
    "https://raw.githubusercontent.com/ccfddl/ccf-deadlines/main/conference";

// ---------------------------------------------------------------------------
// Load previous conferences.json as a cache (fallback when fetches fail)
// ---------------------------------------------------------------------------

let previousConferences = {};
try {
    const prev = JSON.parse(readFileSync(OUTPUT_PATH, "utf-8"));
    for (const c of prev.conferences || []) {
        previousConferences[c.short_name] = c;
    }
    console.log(`📦 Loaded ${Object.keys(previousConferences).length} cached conferences from previous build\n`);
} catch {
    console.log("📦 No previous conferences.json found (first run)\n");
}// ---------------------------------------------------------------------------
// Minimal YAML parser – handles the flat key-value + list-of-objects structure
// used by ccfddl YAML files.  We avoid pulling in a YAML library to keep
// the script dependency-free.
// ---------------------------------------------------------------------------

function parseSimpleYaml(text) {
    // This parser handles the specific YAML structure of ccfddl files:
    //   - title: ICLR
    //     description: ...
    //     confs:
    //       - year: 2026
    //         id: iclr26
    //         link: https://...
    //         timeline:
    //           - deadline: '2025-09-24 23:59:59'
    //             abstract_deadline: '2025-09-19 23:59:59'
    //         timezone: AoE
    //         date: May 01-05, 2026
    //         place: Brazil

    const lines = text.split("\n");
    const result = {
        title: "",
        description: "",
        dblp: "",
        confs: [],
    };

    let currentConf = null;
    let currentTimeline = null;
    let inConfs = false;
    let inTimeline = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trimEnd();

        // Top-level fields
        if (!inConfs) {
            const titleMatch = trimmed.match(/^\s*-?\s*title:\s*(.+)/);
            if (titleMatch) {
                result.title = titleMatch[1].trim();
                continue;
            }
            const descMatch = trimmed.match(/^\s*description:\s*(.+)/);
            if (descMatch) {
                result.description = descMatch[1].trim();
                continue;
            }
            const dblpMatch = trimmed.match(/^\s*dblp:\s*(.+)/);
            if (dblpMatch) {
                result.dblp = dblpMatch[1].trim();
                continue;
            }
            if (trimmed.match(/^\s*confs:/)) {
                inConfs = true;
                continue;
            }
            continue;
        }

        // Inside confs:
        // New conference entry: "    - year: 2026"
        const newConfMatch = trimmed.match(/^\s{2,4}-\s+year:\s*(\d+)/);
        if (newConfMatch) {
            if (currentConf) {
                if (currentTimeline) {
                    currentConf.timeline.push(currentTimeline);
                    currentTimeline = null;
                }
                result.confs.push(currentConf);
            }
            currentConf = {
                year: parseInt(newConfMatch[1]),
                id: "",
                link: "",
                timeline: [],
                timezone: "",
                date: "",
                place: "",
            };
            inTimeline = false;
            continue;
        }

        if (!currentConf) continue;

        // Conference-level fields
        const idMatch = trimmed.match(/^\s+id:\s*(.+)/);
        if (idMatch && !inTimeline) {
            currentConf.id = idMatch[1].trim();
            continue;
        }

        const linkMatch = trimmed.match(/^\s+link:\s*(.+)/);
        if (linkMatch && !inTimeline) {
            currentConf.link = linkMatch[1].trim();
            continue;
        }

        const tzMatch = trimmed.match(/^\s+timezone:\s*(.+)/);
        if (tzMatch && !inTimeline) {
            currentConf.timezone = tzMatch[1].trim();
            inTimeline = false;
            continue;
        }

        const dateMatch = trimmed.match(/^\s+date:\s*(.+)/);
        if (dateMatch && !inTimeline) {
            currentConf.date = dateMatch[1].trim();
            continue;
        }

        const placeMatch = trimmed.match(/^\s+place:\s*(.+)/);
        if (placeMatch && !inTimeline) {
            currentConf.place = placeMatch[1].trim();
            continue;
        }

        // Timeline
        if (trimmed.match(/^\s+timeline:/)) {
            inTimeline = true;
            continue;
        }

        // New timeline entry: "        - deadline: ..."  or "        - abstract_deadline: ..."
        const timelineEntryMatch = trimmed.match(
            /^\s+-\s+(deadline|abstract_deadline):\s*'?([^']+)'?\s*$/
        );
        if (timelineEntryMatch && inTimeline) {
            if (currentTimeline) {
                currentConf.timeline.push(currentTimeline);
            }
            currentTimeline = {};
            currentTimeline[timelineEntryMatch[1]] = timelineEntryMatch[2].trim();
            continue;
        }

        // Continuation fields in timeline entry
        if (inTimeline && currentTimeline) {
            const deadlineField = trimmed.match(
                /^\s+(deadline|abstract_deadline):\s*'?([^']+)'?\s*$/
            );
            if (deadlineField) {
                currentTimeline[deadlineField[1]] = deadlineField[2].trim();
                continue;
            }
            const commentField = trimmed.match(/^\s+comment:\s*(.+)/);
            if (commentField) {
                currentTimeline.comment = commentField[1].trim();
                continue;
            }
        }

        // If we hit a non-timeline field while in timeline, end timeline mode
        if (
            inTimeline &&
            trimmed.match(/^\s{4,6}\w/) &&
            !trimmed.match(/^\s+-/) &&
            !trimmed.match(/^\s+(deadline|abstract_deadline|comment)/)
        ) {
            if (currentTimeline) {
                currentConf.timeline.push(currentTimeline);
                currentTimeline = null;
            }
            inTimeline = false;
            // Re-process this line
            i--;
            continue;
        }
    }

    // Push last items
    if (currentConf) {
        if (currentTimeline) {
            currentConf.timeline.push(currentTimeline);
        }
        result.confs.push(currentConf);
    }

    return result;
}

// ---------------------------------------------------------------------------
// Date parsing from ccfddl's free-form "date" field
// Examples: "Apr 23-27, 2026", "May 01-05, 2026", "Oct 31-November 4, 2026",
//           "Feb 25-Mar 1, 2026", "June 27-July 1, 2026"
// ---------------------------------------------------------------------------

const MONTH_MAP = {
    jan: "01", january: "01",
    feb: "02", february: "02",
    mar: "03", march: "03",
    apr: "04", april: "04",
    may: "05",
    jun: "06", june: "06",
    jul: "07", july: "07",
    aug: "08", august: "08",
    sep: "09", september: "09",
    oct: "10", october: "10",
    nov: "11", november: "11",
    dec: "12", december: "12",
};

function monthNum(str) {
    return MONTH_MAP[str.toLowerCase().replace(/\./, "")] || null;
}

function pad(n) {
    return String(n).padStart(2, "0");
}

function parseDateRange(dateStr, year) {
    if (!dateStr || dateStr === "TBD") return { start: null, end: null };

    // Extract year from string if present
    const yearMatch = dateStr.match(/(\d{4})/);
    const y = yearMatch ? parseInt(yearMatch[1]) : year;

    // Try pattern: "Month DD-DD, YYYY" or "Month DD - DD, YYYY"
    let m = dateStr.match(/(\w+)\s+(\d{1,2})\s*[-–]\s*(\d{1,2})/);
    if (m) {
        const mon = monthNum(m[1]);
        if (mon) {
            return {
                start: `${y}-${mon}-${pad(parseInt(m[2]))}`,
                end: `${y}-${mon}-${pad(parseInt(m[3]))}`,
            };
        }
    }

    // Try pattern: "Month DD - Month DD, YYYY" or "Month DD-Month DD, YYYY"
    m = dateStr.match(/(\w+)\s+(\d{1,2})\s*[-–]\s*(\w+)\s+(\d{1,2})/);
    if (m) {
        const mon1 = monthNum(m[1]);
        const mon2 = monthNum(m[3]);
        if (mon1 && mon2) {
            let endYear = y;
            // Handle year boundary (e.g., Dec - Jan)
            if (parseInt(mon2) < parseInt(mon1)) endYear = y + 1;
            return {
                start: `${y}-${mon1}-${pad(parseInt(m[2]))}`,
                end: `${endYear}-${mon2}-${pad(parseInt(m[4]))}`,
            };
        }
    }

    return { start: null, end: null };
}

// ---------------------------------------------------------------------------
// Convert ccfddl timezone string to IANA timezone
// ccfddl uses: "AoE", "UTC-12", "UTC-7", "UTC-8", "UTC+0", "UTC", "UTC-4", "UTC-5", "UTC+1"
// ---------------------------------------------------------------------------

function ccfddlTzToIana(tz) {
    if (!tz) return null;
    const t = tz.trim();
    if (t === "AoE" || t === "UTC-12") return "Etc/GMT+12"; // AoE = UTC-12 (POSIX sign inversion)
    if (t === "UTC" || t === "UTC+0" || t === "UTC-0") return "UTC";
    // Parse UTC±N
    const m = t.match(/^UTC([+-])(\d+)$/);
    if (m) {
        const sign = m[1];
        const hours = parseInt(m[2]);
        // POSIX Etc/GMT uses inverted signs: UTC-7 → Etc/GMT+7
        const posixSign = sign === "+" ? "-" : "+";
        return `Etc/GMT${posixSign}${hours}`;
    }
    return null;
}

// ---------------------------------------------------------------------------
// Parse place string to extract city and country
// Examples: "Brazil", "Seoul, Korea", "Raleigh, USA", "Athens, Greece"
// ---------------------------------------------------------------------------

const US_STATES_RE = /^(AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY|Alabama|Alaska|Arizona|Arkansas|California|Colorado|Connecticut|Delaware|Florida|Georgia|Hawaii|Idaho|Illinois|Indiana|Iowa|Kansas|Kentucky|Louisiana|Maine|Maryland|Massachusetts|Michigan|Minnesota|Mississippi|Missouri|Montana|Nebraska|Nevada|New Hampshire|New Jersey|New Mexico|New York|North Carolina|North Dakota|Ohio|Oklahoma|Oregon|Pennsylvania|Rhode Island|South Carolina|South Dakota|Tennessee|Texas|Utah|Vermont|Virginia|Washington|West Virginia|Wisconsin|Wyoming)$/i;

const AU_STATES_RE = /^(NSW|VIC|QLD|SA|WA|TAS|ACT|NT|New South Wales|Victoria|Queensland|South Australia|Western Australia|Tasmania|Australian Capital Territory|Northern Territory)$/i;

const CA_PROVINCES_RE = /^(AB|BC|MB|NB|NL|NS|NT|NU|ON|PE|QC|SK|YT|Alberta|British Columbia|Manitoba|New Brunswick|Newfoundland and Labrador|Nova Scotia|Northwest Territories|Nunavut|Ontario|Prince Edward Island|Quebec|Québec|Saskatchewan|Yukon)$/i;

function isRegion(str) {
    return US_STATES_RE.test(str) || AU_STATES_RE.test(str) || CA_PROVINCES_RE.test(str);
}

function regionCountry(str) {
    if (US_STATES_RE.test(str)) return "USA";
    if (AU_STATES_RE.test(str)) return "Australia";
    if (CA_PROVINCES_RE.test(str)) return "Canada";
    return null;
}

function parsePlace(place) {
    if (!place || place === "TBD" || place === "Virtual" || place === "Virtual conference") {
        return { city: null, country: null, venue: null };
    }
    const parts = place.split(",").map((s) => s.trim());
    if (parts.length >= 3) {
        const last = parts[parts.length - 1];
        const secondToLast = parts[parts.length - 2];
        if (isRegion(secondToLast)) {
            // "Montréal, Québec, Canada" — secondToLast is a province/state
            // "Irvine, California, USA" — secondToLast is a state
            // city = first part, country = last part (actual country name)
            return { city: parts[0], country: last, venue: null };
        }
        if (isRegion(last)) {
            // "Sydney, NSW" — but with 3 parts? Unlikely, but handle:
            // "Venue, City, CA" → city = secondToLast, country inferred
            return { city: secondToLast, country: regionCountry(last), venue: parts[0] };
        }
        // "Clarion Congress Hotel Prague, Prague, Czechia"
        // Use second-to-last as city
        return { city: secondToLast, country: last, venue: parts[0] };
    }
    if (parts.length === 2) {
        const last = parts[1];
        // "Long Beach, CA" or "Sydney, NSW" — region abbrev → infer country
        if (isRegion(last)) {
            return { city: parts[0], country: regionCountry(last), venue: null };
        }
        return { city: parts[0], country: last, venue: null };
    }
    // Single word — probably a country (e.g. "Brazil") or city
    return { city: null, country: parts[0], venue: null };
}// ---------------------------------------------------------------------------
// Extract deadline and abstract_deadline from ccfddl timeline
// The last timeline entry is usually the paper deadline
// ---------------------------------------------------------------------------

function extractDeadlines(timeline) {
    if (!timeline || timeline.length === 0) {
        return { submission_deadline: null, abstract_deadline: null };
    }

    let submission_deadline = null;
    let abstract_deadline = null;

    // For the latest timeline entries
    const last = timeline[timeline.length - 1];

    if (last.deadline) {
        // Extract just the date part (YYYY-MM-DD) from "2025-09-24 23:59:59"
        const d = last.deadline.split(" ")[0];
        submission_deadline = d === "TBD" ? null : d;
    }

    // Check for abstract_deadline in latest entry or earlier entries
    if (last.abstract_deadline) {
        const d = last.abstract_deadline.split(" ")[0];
        abstract_deadline = d === "TBD" ? null : d;
    } else if (timeline.length > 1) {
        // Sometimes abstract deadline is an earlier entry with comment "abstract deadline"
        const first = timeline[0];
        if (first.abstract_deadline) {
            abstract_deadline = first.abstract_deadline.split(" ")[0];
        } else if (
            first.deadline &&
            first.comment &&
            first.comment.toLowerCase().includes("abstract")
        ) {
            abstract_deadline = first.deadline.split(" ")[0];
        }
    }

    // If we only found abstract but not the main deadline, use second entry
    if (!submission_deadline && timeline.length > 1) {
        const second = timeline[1];
        if (second.deadline) {
            submission_deadline = second.deadline.split(" ")[0];
        }
    }

    return { submission_deadline, abstract_deadline };
}

// ---------------------------------------------------------------------------
// Well-known conference timezone mappings (venue IANA timezone)
// These are used as the conference event timezone (not the deadline timezone).
// We override with more specific IANA timezones when we know the city.
// ---------------------------------------------------------------------------

const CITY_TZ_MAP = {
    "san francisco": "America/Los_Angeles",
    "san jose": "America/Los_Angeles",
    stanford: "America/Los_Angeles",
    "long beach": "America/Los_Angeles",
    "los angeles": "America/Los_Angeles",
    seattle: "America/Los_Angeles",
    bellevue: "America/Los_Angeles",
    irvine: "America/Los_Angeles",
    portland: "America/Los_Angeles",
    "las vegas": "America/Los_Angeles",
    austin: "America/Chicago",
    chicago: "America/Chicago",
    "new york": "America/New_York",
    "new york city": "America/New_York",
    boston: "America/New_York",
    "new jersey": "America/New_York",
    raleigh: "America/New_York",
    montreal: "America/Montreal",
    "montréal": "America/Montreal",
    vancouver: "America/Vancouver",
    toronto: "America/Toronto",
    philadelphia: "America/New_York",
    "rio de janeiro": "America/Sao_Paulo",
    singapore: "Asia/Singapore",
    seoul: "Asia/Seoul",
    tokyo: "Asia/Tokyo",
    sydney: "Australia/Sydney",
    "hong kong": "Asia/Hong_Kong",
    kigali: "Africa/Kigali",
    vienna: "Europe/Vienna",
    prague: "Europe/Prague",
    athens: "Europe/Athens",
    verona: "Europe/Rome",
    lyon: "Europe/Paris",
    antwerp: "Europe/Brussels",
    valencia: "Europe/Madrid",
    edinburgh: "Europe/London",
    koblenz: "Europe/Berlin",
    munich: "Europe/Berlin",
    honolulu: "Pacific/Honolulu",
    "buenos aires": "America/Argentina/Buenos_Aires",
    barcelona: "Europe/Madrid",
};

function inferTimezone(text) {
    if (!text) return null;
    const key = text.toLowerCase().replace(/[.,]/g, "").trim();
    // Direct lookup
    if (CITY_TZ_MAP[key]) return CITY_TZ_MAP[key];
    // Search for any known city within the text
    for (const [city, tz] of Object.entries(CITY_TZ_MAP)) {
        if (key.includes(city)) return tz;
    }
    return null;
}

/** Try to infer timezone from any part of the place string */
function inferTimezoneFromPlace(place) {
    if (!place) return null;
    const lower = place.toLowerCase().replace(/[.,]/g, "");
    for (const [city, tz] of Object.entries(CITY_TZ_MAP)) {
        if (lower.includes(city)) return tz;
    }
    return null;
}// ---------------------------------------------------------------------------
// Main: Fetch & build conferences
// ---------------------------------------------------------------------------

async function fetchYaml(category, file) {
    const url = `${CCFDDL_RAW_BASE}/${category}/${file}`;
    console.log(`  Fetching ${url} ...`);

    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            const resp = await fetch(url, {
                headers: { "User-Agent": "ConferenceCountdown/1.0" },
                signal: AbortSignal.timeout(30000),
            });
            if (!resp.ok) {
                console.warn(`    ⚠ HTTP ${resp.status} for ${url}`);
                return null;
            }
            return await resp.text();
        } catch (err) {
            if (attempt < 3) {
                console.warn(`    ⚠ Attempt ${attempt} failed: ${err.message}, retrying...`);
                await new Promise((r) => setTimeout(r, 2000 * attempt));
            } else {
                console.warn(`    ⚠ All ${attempt} attempts failed: ${err.message}`);
                return null;
            }
        }
    }
    return null;
} function selectBestEdition(confs) {
    // Pick the next upcoming edition, or the latest one if all are past.
    const now = new Date();
    const currentYear = now.getFullYear();

    // Sort by year descending
    const sorted = [...confs].sort((a, b) => b.year - a.year);

    // Find the first edition whose deadline or conference date is in the future
    for (const conf of sorted) {
        const deadlines = extractDeadlines(conf.timeline);
        const deadlineDate = deadlines.submission_deadline
            ? new Date(deadlines.submission_deadline)
            : null;
        const dateRange = parseDateRange(conf.date, conf.year);
        const confEnd = dateRange.end ? new Date(dateRange.end) : null;

        // Conference hasn't ended yet, or deadline hasn't passed — pick this one
        if ((confEnd && confEnd >= now) || (deadlineDate && deadlineDate >= now)) {
            return conf;
        }
    }

    // All past — return the latest year
    return sorted[0] || null;
}

async function buildConference(entry, index) {
    const { short_name, name, area, ccfddl, static: staticData } = entry;
    const now = new Date().toISOString();

    // Base conference object from static data
    const base = {
        id: index + 1,
        name,
        short_name,
        area,
        rating: staticData.rating,
        rating_source: staticData.rating_source,
        review_type: staticData.review_type,
        paper_format: staticData.paper_format,
        max_pages: staticData.max_pages,
        submission_types: staticData.submission_types,
        h5_index: staticData.h5_index,
        h5_median: staticData.h5_median,
        acceptance_rate: staticData.acceptance_rate,
        historical_acceptance_rates: staticData.historical_acceptance_rates,
        total_submissions: null,
        total_accepted: null,
        proceedings_url: staticData.proceedings_url,
        paper_template_url: staticData.paper_template_url,
        latex_template_url: null,
        themes: staticData.themes,
        tracks: staticData.tracks,
        keynote_speakers: null,
        proceedings_doi: null,
        publisher: staticData.publisher,
        open_access: staticData.open_access || false,
        paper_download_url: null,
        is_favorite: staticData.is_favorite || false,
        notes: null,
        color_tag: null,
        created_at: now,
        updated_at: now,
        last_fetched_at: null,
        // Will be filled in below
        year: null,
        conference_start_date: null,
        conference_end_date: null,
        submission_start_date: null,
        submission_deadline: null,
        notification_date: null,
        camera_ready_date: null,
        workshop_date: null,
        tutorial_date: null,
        registration_start_date: null,
        registration_end_date: null,
        early_registration_deadline: null,
        abstract_deadline: null,
        city: null,
        country: null,
        venue: null,
        timezone: null,
        is_virtual: false,
        is_hybrid: false,
        website: null,
        cfp_url: null,
    };

    // Try fetching from ccfddl
    if (ccfddl) {
        const yamlText = await fetchYaml(ccfddl.category, ccfddl.file);
        if (yamlText) {
            try {
                const parsed = parseSimpleYaml(yamlText);
                const edition = selectBestEdition(parsed.confs);

                if (edition) {
                    const deadlines = extractDeadlines(edition.timeline);
                    const dateRange = parseDateRange(edition.date, edition.year);
                    const place = parsePlace(edition.place);

                    base.year = edition.year;
                    base.conference_start_date = dateRange.start;
                    base.conference_end_date = dateRange.end;
                    base.submission_deadline = deadlines.submission_deadline;
                    base.abstract_deadline = deadlines.abstract_deadline;
                    base.city = place.city;
                    base.country = place.country;
                    base.venue = place.venue;
                    base.website = edition.link || null;
                    base.timezone = inferTimezoneFromPlace(edition.place) || ccfddlTzToIana(edition.timezone);
                    base.is_virtual = edition.place
                        ? edition.place.toLowerCase().includes("virtual")
                        : false;
                    base.last_fetched_at = now;

                    console.log(
                        `  ✓ ${short_name} ${edition.year} — ${edition.place || "TBD"}`
                    );
                    return base;
                }
            } catch (err) {
                console.warn(`  ⚠ Parse error for ${short_name}: ${err.message}`);
            }
        }
    }

    // Fallback to static data
    if (staticData.fallback) {
        const fb = staticData.fallback;
        base.year = fb.year;
        base.conference_start_date = fb.conference_start_date;
        base.conference_end_date = fb.conference_end_date;
        base.submission_deadline = fb.submission_deadline;
        base.abstract_deadline = fb.abstract_deadline || null;
        base.notification_date = fb.notification_date || null;
        base.camera_ready_date = fb.camera_ready_date || null;
        base.city = fb.city;
        base.country = fb.country;
        base.venue = fb.venue;
        base.timezone = fb.timezone;
        base.website = fb.website;
        base.cfp_url = fb.cfp_url;
        base.notes = "Data from static fallback — not auto-updated.";
        console.log(`  → ${short_name} ${fb.year} — using fallback data`);
    } else if (previousConferences[short_name]) {
        // Use cached data from previous build
        const cached = previousConferences[short_name];
        base.year = cached.year;
        base.conference_start_date = cached.conference_start_date;
        base.conference_end_date = cached.conference_end_date;
        base.submission_start_date = cached.submission_start_date;
        base.submission_deadline = cached.submission_deadline;
        base.notification_date = cached.notification_date;
        base.camera_ready_date = cached.camera_ready_date;
        base.workshop_date = cached.workshop_date;
        base.tutorial_date = cached.tutorial_date;
        base.abstract_deadline = cached.abstract_deadline;
        base.city = cached.city;
        base.country = cached.country;
        base.venue = cached.venue;
        base.timezone = cached.timezone;
        base.website = cached.website;
        base.cfp_url = cached.cfp_url;
        base.is_virtual = cached.is_virtual;
        base.is_hybrid = cached.is_hybrid;
        base.last_fetched_at = cached.last_fetched_at;
        base.notes = "Using cached data — fetch failed.";
        console.log(`  ⟳ ${short_name} — using cached data from previous build`);
    } else {
        console.warn(`  ✗ ${short_name} — no ccfddl source, no fallback, no cache!`);
    } return base;
}

async function main() {
    console.log("🔄 Updating conference data...\n");

    const registry = JSON.parse(readFileSync(REGISTRY_PATH, "utf-8"));
    console.log(`📋 ${registry.length} conferences in registry\n`);

    const conferences = [];
    for (let i = 0; i < registry.length; i++) {
        const conf = await buildConference(registry[i], i);
        conferences.push(conf);
    }

    // Write output
    const output = {
        generated_at: new Date().toISOString(),
        source: "https://github.com/ccfddl/ccf-deadlines",
        conferences,
    };

    writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2) + "\n", "utf-8");
    console.log(`\n✅ Wrote ${conferences.length} conferences to ${OUTPUT_PATH}`);
}

main().catch((err) => {
    console.error("❌ Fatal error:", err);
    process.exit(1);
});
