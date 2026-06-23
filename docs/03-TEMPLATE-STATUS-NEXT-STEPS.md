# Template Status & Next Steps

## Current Status

**This project (Clara Holm portfolio) is working end-to-end:**
- ✅ Static portfolio grid (`/`) — reads from `photos` collection, shows title + location + year
- ✅ About page (`/om`) — reads from `about` singleton
- ✅ Bento page (`/bento`) — 3 featured photos + live weather + clock + Spotify
- ✅ Keystatic admin at `/keystatic` — full CRUD for singletons
- ✅ Deployed on Vercel, auto-rebuilds on push
- ✅ Keystatic Cloud auth wired — editor logs in at `/keystatic` on the live site
- ✅ Spotify embed URL editable via CMS (Site settings → Spotify embed URL)
- ⚠️ Bento photos use `featured` flag — currently hardcoded in YAML via git, CMS toggle broken (see below)
- ❌ Featured toggle in CMS throws GraphQL error — photo entries can't be saved via the admin UI

**This is a good source to copy from, but it is NOT yet a clean boilerplate.** It contains Clara-specific content (10 real photos, Danish copy, specific schema). The next step is to strip it down.

---

## Known Broken: CMS Featured Toggle (GraphQL Error)

**What was attempted:** Added a `featured` boolean to the photos collection so editors could mark which photos appear on the bento page via the Keystatic admin.

**What actually works:** The filter code in `bento.astro` is correct and reads the `featured` flag properly at build time. The 3 currently-featured photos (amager-strandpark, norreport-station, torvehallerne) show on bento correctly.

**What doesn't work:** Toggling `featured` via the Keystatic admin throws:
```
[GraphQL] A path was requested for deletion which does not exist as of commit oid `...`
```

**Root cause:** The photo YAML files were hand-crafted (not created through Keystatic UI). Filenames with Danish characters (e.g. `assistens-kirkegaard.yaml`) likely don't match the slug Keystatic's generator computes from the title, causing the GitHub write path to fail. Singletons (`site.yaml`, `about.yaml`) save fine.

**Current workaround:** Change `featured: true/false` directly in the YAML files and push via git. This bypasses the Keystatic Cloud write path entirely.

**Proper solution:** See Step 2c below — a dedicated `bento` singleton with explicit image URL fields avoids the slug mismatch problem completely and gives better editorial control.

---

## Step 1 — Create the Boilerplate

**Process:** Copy the `keystatic-astro-test` folder to a new folder (e.g. `astro-keystatic-starter`). Then strip it down:

- [ ] Replace all photos in `public/photos/` with 2–3 placeholder images
- [ ] Replace content in `content/photos/*.yaml` with 2–3 placeholder entries **created through the Keystatic UI** (not hand-crafted) to avoid slug mismatch issues
- [ ] Replace `content/site.yaml` with generic placeholder values
- [ ] Replace `content/about.yaml` with placeholder values
- [ ] Rename the project in `package.json` to `astro-keystatic-starter`
- [ ] Update `keystatic.config.ts` — remove the `cloud.project` value (leave as placeholder)
- [ ] Create a new GitHub repo for the starter
- [ ] Add a README with setup instructions

**Important:** In the boilerplate, create all initial collection entries through `/keystatic` so Keystatic controls the filename generation. Hand-crafting YAML files directly risks slug mismatch errors in Cloud mode.

---

## Step 2 — Fix Bento Photo Selection

### Option A — Fix the existing `featured` approach (medium effort)

The slug mismatch is likely caused by Danish characters in filenames. Two sub-options:

**A1 — Rename files to match Keystatic's slug output:**
Run a test to see what slug Keystatic generates for each photo title (create a test entry through the UI and observe the filename). Rename any mismatched files to match. This fixes the GraphQL error for existing entries.

**A2 — Recreate all photo entries through the Keystatic UI:**
Delete the hand-crafted YAML files, recreate each photo entry through `/keystatic` → Photos → New. Keystatic controls the filename, so slugs always match. More work upfront but permanently correct.

### Option B — Dedicated bento singleton (recommended, cleanest)

Replace the `featured` flag approach with a `bento` singleton that has explicit image URL fields. This completely sidesteps the slug mismatch problem.

**Add to `keystatic.config.ts`:**
```ts
bento: singleton({
  label: 'Bento page',
  path: 'content/bento',
  format: { data: 'yaml' },
  schema: {
    photo_1: fields.image({
      label: 'Photo 1',
      directory: 'public/photos',
      publicPath: '/photos/',
    }),
    photo_2: fields.image({
      label: 'Photo 2',
      directory: 'public/photos',
      publicPath: '/photos/',
    }),
    photo_3: fields.image({
      label: 'Photo 3',
      directory: 'public/photos',
      publicPath: '/photos/',
    }),
  },
}),
```

**Create `content/bento.yaml`:**
```yaml
photo_1: /photos/2025-spring-random-5.webp
photo_2: /photos/2025-spring-random-2.webp
photo_3: /photos/IMG_1888.webp
```

**Update `bento.astro`** to read from the bento singleton instead of filtering the photos collection.

**Why this is better:**
- Editor picks exactly which images appear — no relying on a flag spread across 10 YAML files
- Saves against singletons work fine (no slug mismatch risk)
- Editor can upload a brand new image directly to the bento page without adding it to the portfolio grid
- Could later allow different image counts per box (1–3 photos)

**Effort:** ~1.5 hours

---

## Step 3 — The Widgets (Weather, Clock, Spotify)

### Weather Widget
**Current state:** ✅ Client-side React component, fetches live from Open-Meteo API. Hardcoded to Copenhagen coordinates.

**CMS-editable?** Possible but not worth it for a single-person portfolio. If needed for the boilerplate:
- Add `weather_lat`, `weather_lng` fields to the `site` singleton
- Pass as props to `WeatherWidget`

### Clock Widget
**Current state:** ✅ Client-side React, shows visitor's local time.

**CMS-editable?** No. Leave as-is.

### Spotify Widget
**Current state:** ✅ **Done and working.** Editable via `/keystatic` → Site settings → Spotify embed URL.

**How to update:** Go to Spotify → right-click any playlist → Share → Copy link. Paste the URL into the Keystatic field. The share URL format works — Spotify's embed player accepts the extra parameters.

---

## Recommended Next Actions (Priority Order)

| Priority | Task | Effort | Status |
|---|---|---|---|
| 1 | Implement bento singleton with image pickers (Option B above) | 1.5 hours | ⬜ Todo |
| 2 | Strip Clara content → create clean boilerplate folder | 1 hour | ⬜ Todo |
| 3 | Push boilerplate to its own GitHub repo | 15 min | ⬜ Todo |
| 4 | In boilerplate: create all photo entries through CMS UI, not by hand | — | ⬜ Todo |
| 5 | Investigate slug mismatch for existing entries (Option A) | 1–2 hours | ⬜ Optional |
| 6 | Evaluate Keystatic Cloud Pro + Cloud Images if photos outgrow the repo | — | ⬜ When needed |

---

## Known Remaining Quirks

- **Featured toggle in CMS broken** — GraphQL error when saving photo entries; use git to edit YAML directly until bento singleton (Step 2 Option B) is implemented
- **`@keystatic/astro` doesn't officially support Astro 7** — watch for a new release; remove `.npmrc` `legacy-peer-deps` when it lands
- **Images live in the git repo** — fine up to ~50 photos at 200–400KB each. Beyond that, switch to Keystatic Cloud Images or Cloudinary
- **Bento is statically prerendered** — content changes require a Vercel rebuild (~30s). Weather and clock are client-side so always live
