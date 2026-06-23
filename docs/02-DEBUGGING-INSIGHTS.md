# Debugging Insights — What Went Wrong & What To Watch Out For

A running log of bugs hit during this build, why they happened, and the fix. Essential reading before starting a new Keystatic + Astro project.

---

## 1. Keystatic admin crashes on a singleton/collection page but the dashboard works fine

**Symptom:** `/keystatic/` loads normally. Navigating to `/keystatic/singleton/about` causes the React app to go blank / crash silently. No error in the dev server terminal.

**Root cause:** `itemLabel` in `fields.array()` receives a **preview props object** (with `.key`, `.value`, etc.), not the raw value. Returning the whole object instead of a string causes React to crash with "Objects are not valid as a React child" — but only when that particular page renders the list.

**Broken code:**
```ts
fields.array(fields.text({ label: 'Client' }), {
  label: 'Clients',
  itemLabel: (props) => props,  // ← returns an object, React crashes
})
```

**Fixed code:**
```ts
fields.array(fields.text({ label: 'Client' }), {
  label: 'Clients',
  itemLabel: (props) => props.value,  // ← returns the string
})
```

**For `fields.object()` items**, use `props.fields.fieldName.value` instead.

**Why it's hard to find:** The crash only affects the specific page containing that field. The dashboard lists all singletons/collections fine. It looks like a routing or hydration issue, not a config bug.

---

## 2. Nullable fields missing from YAML cause form initialisation issues

**Symptom:** Keystatic admin may fail to render a singleton edit page when optional fields (image, url) are completely absent from the YAML file.

**Root cause:** When Keystatic initialises the form state for a singleton, fields like `fields.image()` and `fields.url()` expect to find their key in the YAML even if the value is null. A completely missing key can cause unexpected form state.

**Fix:** Always include nullable fields explicitly in the YAML, even when empty:
```yaml
portrait: null
cv_url: null
```

**Rule:** If the schema defines a field, the YAML should have the key — even as `null`.

---

## 3. Vercel build fails: `@astrojs/tailwind` peer dependency conflict

**Symptom:**
```
npm error ERESOLVE could not resolve
npm error peer astro@"^3.0.0 || ^4.0.0 || ^5.0.0" from @astrojs/tailwind@6.0.2
```

**Root cause:** `@astrojs/tailwind` only supports Astro 3/4/5. This project uses Astro 7. The package was a leftover in `package.json` and wasn't even being used — Tailwind was already correctly configured via `@tailwindcss/vite` in `astro.config.mjs`.

**Fix:** Remove `@astrojs/tailwind` from `package.json`. Tailwind 4 with Astro 7 uses the Vite plugin approach:
```js
// astro.config.mjs
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  vite: { plugins: [tailwindcss()] },
});
```
No `@astrojs/tailwind` needed. Don't install it.

---

## 4. Vercel build fails: `@keystatic/astro` peer dependency conflict

**Symptom:**
```
npm error peer astro@"2 || 3 || 4 || 5 || 6" from @keystatic/astro@5.1.0
```

**Root cause:** `@keystatic/astro@5.1.0` (latest as of June 2026) declares peer support for Astro 2–6 only. This project uses Astro 7. Locally npm installed fine because the lock file was already resolved, but Vercel's fresh `npm install` re-resolves and trips on the mismatch.

**Fix:** Add `.npmrc` to the project root:
```
legacy-peer-deps=true
```

This tells npm to use the legacy peer resolution algorithm (permissive), matching how the lock file was originally generated. The packages work fine at runtime despite the declared peer mismatch.

**Note:** This is a temporary workaround. When `@keystatic/astro` releases support for Astro 7, remove the `.npmrc` entry and bump the version.

---

## 5. Bento page shows blank content on Vercel (images, site name all empty)

**Symptom:** The bento page loads but everything is blank — no site name, no photos, no tagline. Works fine locally. The portfolio index page works correctly on Vercel.

**Root cause:** `bento.astro` had `export const prerender = false`, making it a server-side rendered (SSR) page. On Vercel, SSR pages run as serverless functions. The `createReader(process.cwd(), keystaticConfig)` call reads YAML content files from the filesystem — but in the Vercel serverless function environment, the content YAML files are not accessible at `process.cwd()` at runtime.

**Why other pages work:** `index.astro` and `om.astro` are statically prerendered at build time, when the content files ARE accessible on the build server's filesystem.

**Fix:** Remove `export const prerender = false` so bento is also statically prerendered. Move any dynamic/live data to client-side React components:

- Weather was server-fetched → moved to `WeatherWidget.tsx` (React, `client:load`)
- Clock was already client-side
- Photos and site content are now read at build time (correct)

**Rule:** Never use `createReader` in SSR pages on Vercel. Use it only in prerendered pages (build time) or use Keystatic's API routes for runtime reads.

---

## 6. Keystatic config: github mode vs cloud mode

**Initial config used `kind: 'github'`** which requires setting up a custom GitHub App and four env vars. This is the manual/advanced setup described in the GitHub mode docs.

**Keystatic Cloud (`kind: 'cloud'`) is simpler** and is the recommended path for most projects:
- No env vars to manage
- No custom GitHub App
- Editors don't need a GitHub account
- Free for up to 3 users

**Config pattern to use:**
```ts
storage:
  import.meta.env.MODE === 'production'
    ? { kind: 'cloud' }
    : { kind: 'local' },

cloud: {
  project: 'your-team/your-project',  // from keystatic.cloud dashboard
},
```

---

## 7. `fields.slugField` MUST use `fields.slug()` — not `fields.text()`

**Symptom:** Photo title renders as empty string on the portfolio grid after switching `slugField` from `fields.slug()` to `fields.text()`.

**Root cause:** Keystatic requires the `slugField` to use `fields.slug()`. It's not interchangeable with `fields.text()`. When you use `fields.text()` as the slugField, Keystatic's reader does not return the stored YAML value for that field — `entry.title` becomes an empty string.

**Broken code:**
```ts
// keystatic.config.ts
photos: collection({
  slugField: 'title',
  schema: {
    title: fields.text({ label: 'Title' }),  // ← WRONG as slugField
  }
})
```

**Correct code:**
```ts
photos: collection({
  slugField: 'title',
  schema: {
    title: fields.slug({ name: { label: 'Title' } }),  // ← required
  }
})
```

**Reading the value:** With `fields.slug()`, the reader returns the title as a plain string — access it as `entry.title`, not `entry.title.name`. See CLAUDE.md for the `parseWithSlug` quirk.

---

## 8. Keystatic Cloud GraphQL error when saving collection entries (UNRESOLVED)

**Symptom:** When trying to save changes to a photo entry via the Keystatic admin on the live site, the following error appears:
```
[GraphQL] A path was requested for deletion which does not exist as of commit oid `...`
```
The save fails. The error affects the `photos` collection but not singletons (site, about both save fine).

**Root cause (suspected):** The photo YAML files were hand-crafted and committed directly to git — not created through the Keystatic UI. The filenames contain transliterations of Danish characters (e.g. `assistens-kirkegaard.yaml` with double-`aa` for `å`). When Keystatic Cloud tries to save a change, it recomputes the slug from the title and may generate a different path than the actual filename (e.g. `kirkegard` instead of `kirkegaard`). The GitHub GraphQL API then fails when trying to delete the "old" path that doesn't exist.

**Evidence:** Singletons (`site.yaml`, `about.yaml`) save correctly. Only collection entries with potentially mismatched filenames fail.

**Workaround:** Edit featured/unfeatured state directly in the YAML files via git (not through the CMS). This bypasses the GitHub GraphQL write path entirely.

**Proper fix (not yet implemented):** Two options:
1. Rename all photo YAML files to match exactly what Keystatic's slug generator produces from the title (requires knowing the exact slug algorithm for Danish characters)
2. Create a fresh `bento` singleton with explicit photo URL fields instead of relying on the `featured` flag in the photos collection — then the editor selects bento photos independently of the photos collection, avoiding the slug mismatch issue entirely (see doc 03, Step 2c)

---

## General Rules For Future Projects

1. **`itemLabel` always returns `props.value`** for text items in `fields.array()`
2. **Always include nullable image/url fields** as `null` in YAML, never omit them
3. **Never use `@astrojs/tailwind` with Astro 7+** — use `@tailwindcss/vite` instead
4. **Add `.npmrc` with `legacy-peer-deps=true`** when using Keystatic + Astro 7
5. **Never use `createReader` in SSR pages on Vercel** — prerender content pages, keep SSR only for Keystatic API routes
6. **Use Keystatic Cloud** (`kind: 'cloud'`) not GitHub mode for new projects — simpler auth, no env vars
7. **The Keystatic dashboard crashing on a sub-page** but working on `/keystatic/` = config bug in the schema for that page, not a routing/React issue
8. **`slugField` must use `fields.slug()`** — `fields.text()` silently breaks slug field reading
9. **Create collection entries through the Keystatic UI** when using Cloud mode — hand-crafted YAML files with non-ASCII characters in filenames risk slug mismatch errors on save
