/**
 * Public event shape (CLEAN + STABLE — v1)
 */
export interface FatsomaEvent {
  id: string;

  name: string;
  vanity: string;
  seoName: string | null;
  url: string;

  startsAt: string;
  endsAt: string;
  lastEntryTime: string | null;

  currency: string;
  price: {
    min: number | null;
    max: number | null;
  };

  image: string | null;
  descriptionHtml: string | null;

  ageRestriction: string | null;
  attendeesCount: number | null;

  /** Public, frontend-safe location */
  location: {
    name: string;
    city: string | null;
    displayName: string;
  } | null;
}

/* ======================================================
   Config access
====================================================== */

function getConfig() {
  const config = (globalThis as any).__ASTRO_FATSOMA_CONFIG__;
  if (!config) {
    throw new Error(
      "[astro-fatsoma] Plugin not initialised. Did you forget to add it to astro.config.mjs?"
    );
  }
  return config;
}

/* ======================================================
   In-memory SSR cache (stale-while-revalidate)
====================================================== */

let cachedEvents: FatsomaEvent[] | null = null;
let cacheTimestamp = 0;

// 10 minutes
const CACHE_TTL = 10 * 60 * 1000;

// Fetch timeout (5s)
const FETCH_TIMEOUT_MS = 5_000;

function isCacheValid(): boolean {
  return (
    cachedEvents !== null &&
    Date.now() - cacheTimestamp < CACHE_TTL
  );
}

/**
 * Cache status helper (public, read-only)
 */
export function getFatsomaCacheInfo() {
  return {
    hasCache: cachedEvents !== null,
    ageMs: cachedEvents ? Date.now() - cacheTimestamp : null,
    ttlMs: CACHE_TTL,
    expiresInMs: cachedEvents
      ? Math.max(0, CACHE_TTL - (Date.now() - cacheTimestamp))
      : null,
  };
}

/**
 * Manually clear the cache (public API)
 */
export function refreshFatsomaCache(): void {
  cachedEvents = null;
  cacheTimestamp = 0;
}

/* ======================================================
   Fetch live events from Fatsoma (cached + resilient)
====================================================== */

export async function getFatsomaEvents(): Promise<FatsomaEvent[]> {
  if (isCacheValid()) {
    return cachedEvents!;
  }

  const { pageId } = getConfig();
  const fromDate = new Date().toISOString();

  const url =
    "https://api.fatsoma.com/v1/events" +
    `?filter[status]=active` +
    `&filter[page.id]=${encodeURIComponent(pageId)}` +
    `&filter[ends-at][gte]=${encodeURIComponent(fromDate)}` +
    `&include=location` +
    `&page[number]=1` +
    `&page[size]=50` +
    `&sort=starts-at-time,relevance`;

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    FETCH_TIMEOUT_MS
  );

  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(`Fatsoma API error ${res.status}`);
    }

    const json = await res.json();

    /* ----------------------------------------------
       Internal lookup: locationId → public fields
    ---------------------------------------------- */

    const locationsById = new Map<
      string,
      {
        name: string;
        city: string | null;
        displayName: string;
      }
    >();

    for (const item of json.included ?? []) {
      if (item?.type === "locations" && item.id) {
        const attrs = item.attributes ?? {};
        const name = attrs.name ?? "";
        const city = attrs.city ?? null;

        locationsById.set(item.id, {
          name,
          city,
          displayName: city ? `${name}, ${city}` : name,
        });
      }
    }

    const events: FatsomaEvent[] = (json.data ?? []).map((event: any) => {
      const attrs = event.attributes ?? {};
      const vanity = attrs["vanity-name"] ?? "";

      const locationId =
        event.relationships?.location?.data?.id ?? null;

      return {
        id: event.id,

        name: attrs.name ?? "",
        vanity,
        seoName: attrs["seo-name"] ?? null,
        url: vanity ? `https://www.fatsoma.com/e/${vanity}` : "",

        startsAt: attrs["starts-at"] ?? "",
        endsAt: attrs["ends-at"] ?? "",
        lastEntryTime: attrs["last-entry-time"] ?? null,

        currency: attrs.currency ?? "",
        price: {
          min:
            typeof attrs["price-min"] === "number"
              ? attrs["price-min"]
              : null,
          max:
            typeof attrs["price-max"] === "number"
              ? attrs["price-max"]
              : null,
        },

        image: attrs["asset-url"] ?? null,
        descriptionHtml: attrs.description ?? null,

        ageRestriction: attrs["age-restrictions"] ?? null,
        attendeesCount:
          typeof attrs["attendees-count"] === "number"
            ? attrs["attendees-count"]
            : null,

        location:
          locationId && locationsById.has(locationId)
            ? locationsById.get(locationId)!
            : null,
      };
    });

    cachedEvents = events;
    cacheTimestamp = Date.now();

    return events;
  } catch {
    if (cachedEvents) {
      return cachedEvents;
    }
    return [];
  } finally {
    clearTimeout(timeout);
  }
}