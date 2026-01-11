# astro-fatsoma

A minimal, **SSR-first Astro integration** for fetching and normalising public event data from the **Fatsoma API**.

Designed to be **clean, stable, and boring by default** — no tracking, no client-side fetches, no UI opinions.

Official plugin page:  
https://velohost.co.uk/plugins/astro-plugins/astro-fatsoma/

---

## Features

- ✅ Server-side (SSR) only
- ✅ Deterministic, stable event shape (v1)
- ✅ In-memory cache with stale-while-revalidate
- ✅ Zero client-side JavaScript
- ✅ No analytics, tracking, or cookies
- ✅ **Location support (venue + city)**
- ✅ Designed for Astro sites and static generation

---

## What this plugin does

- Fetches **public events** from the Fatsoma API
- Includes and resolves **event locations**
- Normalises the response into a **clean v1 interface**
- Caches results in memory (10 minutes by default)
- Fails safely — never breaks SSR

---

## What this plugin does NOT do

- ❌ No UI components
- ❌ No client-side fetching
- ❌ No auth or private endpoints
- ❌ No mutation (read-only)
- ❌ No opinionated formatting

---

## Installation

```bash
npm install astro-fatsoma
```

---

## Astro configuration

Add the plugin to your `astro.config.mjs` and provide a Fatsoma **page ID**.

```js
import { defineConfig } from "astro/config";
import fatsoma from "astro-fatsoma";

export default defineConfig({
  integrations: [
    fatsoma({
      pageId: "YOUR_FATSOMA_PAGE_ID",
    }),
  ],
});
```

---

## Usage

```astro
---
import { getFatsomaEvents } from "astro-fatsoma/fatsoma";

const events = await getFatsomaEvents();
---

<ul>
  {events.map(event => (
    <li>
      <a href={event.url}>{event.name}</a>
      {event.location && (
        <div>{event.location.displayName}</div>
      )}
    </li>
  ))}
</ul>
```

---

## Public Event Shape (v1)

```ts
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
    name: string;
    city: string | null;
    displayName: string;
  } | null;
}
```

---

## Caching behaviour

- In-memory cache (per server instance)
- TTL: **10 minutes**
- Uses **stale-while-revalidate**
- Automatically falls back to stale cache or empty array on failure

```ts
import {
  getFatsomaCacheInfo,
  refreshFatsomaCache,
} from "astro-fatsoma/fatsoma";
```

---

## Encoding & HTML

- Text is returned exactly as provided by Fatsoma
- `descriptionHtml` contains raw HTML
- Rendering & sanitisation are the responsibility of the consumer

---

## Error handling philosophy

- Network failures never throw during SSR
- API errors fail closed
- Worst case result: `[]`

---

## License

MIT © Velohost  
https://velohost.co.uk/
