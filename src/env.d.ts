declare global {
  /**
   * Internal config injected by the Astro integration.
   * Do not rely on this directly.
   */
  var __ASTRO_FATSOMA_CONFIG__:
    | {
        pageId: string;
      }
    | undefined;
}

declare module "astro-fatsoma/fatsoma" {
  /**
   * Public event shape (v1)
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

    location: {
      id: string;
      name: string;
      city: string | null;
      displayName: string;
    } | null;
  }

  /**
   * Fetch events (cached, SSR-safe)
   */
  export function getFatsomaEvents(): Promise<FatsomaEvent[]>;

  /**
   * Manually clear the in-memory cache
   */
  export function refreshFatsomaCache(): void;

  /**
   * Inspect cache state (debug / observability)
   */
  export function getFatsomaCacheInfo(): {
    hasCache: boolean;
    ageMs: number | null;
    ttlMs: number;
    expiresInMs: number | null;
  };
}

export {};