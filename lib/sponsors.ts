import { put, list, del } from "@vercel/blob";
import { allMasechtot } from "@/constants/shasData";

/**
 * A live masechta sponsorship. Unlike the old hardcoded approach, sponsorships
 * are stored in Vercel Blob so they can be added/removed at runtime and
 * automatically expire. `masechta` is the English name and must match a name
 * in shasData. `expiresAt` is an epoch-ms timestamp, or null for a sponsorship
 * that never expires (an admin can pin one permanently).
 */
export interface Sponsorship {
  id: string;
  masechta: string;
  sponsor: string;
  createdAt: number;
  expiresAt: number | null;
}

const DATA_PREFIX = "sponsors/data";

// Default sponsorship lifetime. A sponsored masechta shows for this many
// months and then "rests" (drops back to available).
export const SPONSORSHIP_MONTHS = 2;

/** epoch-ms `months` calendar-months after `from`. */
export function computeExpiry(from: number, months = SPONSORSHIP_MONTHS): number {
  const d = new Date(from);
  d.setMonth(d.getMonth() + months);
  return d.getTime();
}

/** A sponsorship counts as active until its expiry passes (null = forever). */
export function isActive(s: Sponsorship, now = Date.now()): boolean {
  return s.expiresAt === null || s.expiresAt > now;
}

// In-memory cache of the last-saved data to avoid CDN staleness (mirrors the
// avreichim/haskamos storage pattern).
let memoryCache: Sponsorship[] | null = null;

/** Raw stored list, including any expired records. Internal use only. */
async function getRaw(): Promise<Sponsorship[]> {
  if (memoryCache !== null) return memoryCache;

  try {
    const result = await list({ prefix: DATA_PREFIX });
    const dataBlobs = result.blobs
      .filter((b) => b.pathname.startsWith(DATA_PREFIX))
      .sort(
        (a, b) =>
          new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      );

    if (dataBlobs.length === 0) {
      memoryCache = [];
      return memoryCache;
    }

    const res = await fetch(dataBlobs[0].downloadUrl, { cache: "no-store" });
    const data = await res.json();
    memoryCache = Array.isArray(data) ? data : [];
    return memoryCache;
  } catch (err) {
    console.error("sponsors getRaw error:", err);
    return [];
  }
}

async function saveRaw(data: Sponsorship[]): Promise<Sponsorship[]> {
  const result = await put(
    `${DATA_PREFIX}-${Date.now()}.json`,
    JSON.stringify(data),
    { access: "public", contentType: "application/json" }
  );

  // Update in-memory cache immediately so reads are fresh after a write.
  memoryCache = data;

  // Clean up old data blobs (keep only the latest).
  try {
    const all = await list({ prefix: DATA_PREFIX });
    const old = all.blobs.filter(
      (b) => b.pathname.startsWith(DATA_PREFIX) && b.url !== result.url
    );
    if (old.length > 0) await del(old.map((b) => b.url));
  } catch {}

  return data;
}

/**
 * The active sponsorships. Expired records are filtered out and, if any were
 * found, pruned from storage — this is what makes a sponsorship "rest" after
 * two months without any manual cleanup or cron job.
 */
export async function getActiveSponsorships(): Promise<Sponsorship[]> {
  const raw = await getRaw();
  const now = Date.now();
  const active = raw.filter((s) => isActive(s, now));

  // Housekeeping: persist the pruned list only when something actually expired,
  // so steady-state reads don't write.
  if (active.length !== raw.length) {
    try {
      await saveRaw(active);
    } catch (err) {
      console.error("sponsors prune error:", err);
    }
  }

  return active;
}

/**
 * Record one or more sponsorships. Unknown masechta names are ignored. Any
 * existing record for the same masechta is replaced (a re-sponsor refreshes the
 * dedication and the two-month clock). Pass `months = null` to pin permanently.
 * Not admin-guarded — callable from the Stripe webhook and the admin API alike.
 */
export async function addSponsorships(
  names: string[],
  sponsor: string,
  months: number | null = SPONSORSHIP_MONTHS
): Promise<Sponsorship[]> {
  const raw = await getRaw();
  const now = Date.now();

  const valid = new Set(allMasechtot.map((mm) => mm.name));
  const toAdd = [...new Set(names)].filter((n) => valid.has(n));

  // Start from the currently-active records, minus any we're replacing.
  const replacing = new Set(toAdd);
  const next = raw.filter(
    (s) => isActive(s, now) && !replacing.has(s.masechta)
  );

  const text = sponsor.trim() || "Anonymous";
  toAdd.forEach((name, i) => {
    next.push({
      id: `${now}-${i}`,
      masechta: name,
      sponsor: text,
      createdAt: now,
      expiresAt: months === null ? null : computeExpiry(now, months),
    });
  });

  return saveRaw(next);
}

/**
 * Remove a sponsorship by id or by masechta name. Also prunes any expired
 * records that were still sitting in storage. Returns the remaining active list.
 */
export async function removeSponsorship(match: {
  id?: string;
  masechta?: string;
}): Promise<Sponsorship[]> {
  const raw = await getRaw();
  const now = Date.now();

  const next = raw.filter((s) => {
    if (!isActive(s, now)) return false; // drop expired while we're here
    if (match.id) return s.id !== match.id;
    if (match.masechta) return s.masechta !== match.masechta;
    return true;
  });

  return saveRaw(next);
}
