# astro-build-id

**Deterministic build identification for Astro sites**

`astro-build-id` is a tiny, static-first Astro integration that writes a single
build identifier file at build time.

It exists to answer one simple operational question:

> *Which build is currently deployed?*

No databases.  
No runtime code.  
No guessing.

---

## Why this exists

With static sites and CDNs, it is often hard to tell:

- whether a deploy actually updated
- if a cache purge worked
- which environment is live
- whether two environments are running the same build

People end up:
- redeploying “just in case”
- adding random comments to HTML
- guessing from timestamps

`astro-build-id` solves this cleanly with **one file**.

---

## What it does (v1)

On `astro build`, the plugin writes a file (by default):

```
/build-id.txt
```

Containing a **single immutable value**, for example:

```
2026-01-08T19:42:11.341Z
```

This file is:

- Static
- Cache-safe
- Public-safe
- Deterministic per build
- Easy to inspect with `curl`

---

## What it does NOT do

This plugin deliberately does **not**:

- Run at runtime
- Use databases
- Read git state
- Guess CI providers
- Inject HTML
- Depend on adapters
- Expose secrets

It reflects **build identity only**, nothing else.

---

## Installation

```bash
npm install astro-build-id
```

---

## Basic usage

Add the integration to your `astro.config.mjs`:

```js
import { defineConfig } from "astro/config";
import astroBuildId from "astro-build-id";

export default defineConfig({
  integrations: [
    astroBuildId()
  ]
});
```

After build:

```
dist/build-id.txt
```

---

## Build ID formats

By default, the build ID is an ISO timestamp.

You can change the format:

```js
astroBuildId({
  format: "unix"
})
```

Supported formats:

| Format | Example |
|------|--------|
| `iso` (default) | `2026-01-08T19:42:11.341Z` |
| `unix` | `1736365331` |
| `short` | `k0x9f2ab` |

---

## Custom filename

```js
astroBuildId({
  filename: "health.txt"
})
```

Result:

```
/health.txt
```

---

## CI / CD integration (recommended)

The most common and powerful usage is to pass a value from CI.

### Example (GitHub Actions)

```yaml
- name: Build
  run: |
    echo "BUILD_ID=${GITHUB_RUN_ID}" >> $GITHUB_ENV
    npm run build
```

```js
astroBuildId({
  value: process.env.BUILD_ID
})
```

If `value` is provided:
- it is written verbatim
- it overrides any format
- whitespace is trimmed safely

This keeps the plugin **stateless and explicit**.

---

## CDN & caching behaviour

Because the output is static:

- The file can be cached aggressively
- It works behind any CDN
- It works on Cloudflare, Netlify, Vercel, S3, etc.

Example check:

```bash
curl https://example.com/build-id.txt
```

---

## Failure behaviour

If the file cannot be written:

- A warning is logged
- The build continues
- The site is not broken

This plugin must never break a deployment.

---

## Roadmap

Planned for v2 (not in v1):

- Optional JSON output
- Multiple IDs (build + deploy)
- Integration with `astro-build-info`

v1 intentionally stays minimal.

---

## License

MIT

---

## Author

Built and maintained by **Velohost**  
https://velohost.co.uk/

Project homepage:  
https://velohost.co.uk/plugins/astro-build-id/
