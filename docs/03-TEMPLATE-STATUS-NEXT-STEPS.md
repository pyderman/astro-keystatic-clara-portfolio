# Template Status & Next Steps

## Current Status

**This project (Clara Holm portfolio) is working end-to-end:**
- ✅ Static portfolio grid (`/`) — reads from `photos` collection
- ✅ About page (`/om`) — reads from `about` singleton
- ✅ Bento page (`/bento`) — 3 random photos + live weather + clock + Spotify
- ✅ Keystatic admin at `/keystatic` — full CRUD for all content
- ✅ Deployed on Vercel, auto-rebuilds on push
- ✅ Keystatic Cloud auth wired — editor logs in at `/keystatic` on the live site
- ✅ All known bugs fixed (see `02-DEBUGGING-INSIGHTS.md`)

**This is a good source to copy from, but it is NOT yet a clean boilerplate.** It contains Clara-specific content (10 real photos, Danish copy, specific schema). The next step is to strip it down.

---

## Step 1 — Create the Boilerplate

**Process:** Copy the `keystatic-astro-test` folder to a new folder (e.g. `astro-keystatic-starter`). Then strip it down:

- [ ] Replace all photos in `public/photos/` with 2–3 placeholder images
- [ ] Replace content in `content/photos/*.yaml` with 2–3 placeholder entries
- [ ] Replace `content/site.yaml` with generic placeholder values
- [ ] Replace `content/about.yaml` with placeholder values
- [ ] Remove `content/photos/` entries down to 2–3 max
- [ ] Rename the project in `package.json` to `astro-keystatic-starter`
- [ ] Update `keystatic.config.ts` — remove the `cloud.project` value (leave as placeholder)
- [ ] Create a new GitHub repo for the starter
- [ ] Update the README with setup instructions

The boilerplate should be deployable in under 30 minutes for a new project.

---

## Step 2 — Improve the Bento Page

### 2a. Let editor select which photos appear (quick win — already possible)

The `photos` collection already has a `featured` boolean field. Right now bento picks 3 photos at **random**. Change it to pick the 3 most-recently-added featured photos instead:

```ts
// bento.astro — replace the shuffle with this
const featured = allPhotos
  .filter(p => p.entry.featured)
  .slice(0, 3);
const [p1, p2, p3] = featured;
```

**Editor flow:** Go to `/keystatic` → Photos → open a photo → toggle "Featured" on. Up to 3 featured photos appear in the bento. Simple, no new schema needed.

### 2b. Make the number of bento photo slots configurable

Currently the layout is hardcoded to 3 photo slots. To make this flexible you'd need to:
- Add a `bento_photo_count` field (1, 2, or 3) to the `site` singleton
- Conditionally render photo slots in bento.astro based on that value
- Adjust the CSS grid template accordingly

This is a medium-effort change — worth doing in the boilerplate but not critical for the Clara project.

### 2c. Add a dedicated bento singleton (optional, more control)

For full editorial control over the bento page, add a `bento` singleton to `keystatic.config.ts`:

```ts
bento: singleton({
  label: 'Bento page',
  path: 'content/bento',
  format: { data: 'yaml' },
  schema: {
    photo_1: fields.relationship({ label: 'Photo 1', collection: 'photos' }),
    photo_2: fields.relationship({ label: 'Photo 2', collection: 'photos' }),
    photo_3: fields.relationship({ label: 'Photo 3', collection: 'photos' }),
    spotify_url: fields.url({ label: 'Spotify embed URL' }),
  },
}),
```

This gives the editor a dedicated page to pick exactly which photos appear and which Spotify playlist plays.

> **Note:** `fields.relationship()` requires Keystatic Cloud or GitHub mode to resolve cross-references. For local dev or simpler setups, using the `featured` flag (2a) is easier.

---

## Step 3 — The Widgets (Weather, Clock, Spotify)

### Weather Widget
**Current state:** Client-side React component, fetches live from Open-Meteo API, hardcoded to Copenhagen coordinates.

**Can it be CMS-editable?** Yes, but probably not worth it for a personal portfolio. If you want it:
- Add `weather_city`, `weather_lat`, `weather_lng` fields to the `site` singleton
- Pass them as props to `WeatherWidget`

For a multi-client boilerplate this makes sense. For a single-person portfolio it's overkill.

**Simpler alternative:** Just hardcode the city to whatever the photographer's base city is and leave it.

### Clock Widget
**Current state:** Client-side React, shows current local time of the visitor's browser.

**CMS-editable?** No reason to make this editable. It's a live clock, always correct.

**Optional improvement:** Could show Copenhagen time specifically (using a timezone prop) rather than visitor's local time. Add `timezone` field to `site` singleton if desired.

### Spotify Widget
**Current state:** Hardcoded embed URL in `bento.astro` pointing to a Deep Focus playlist.

**Can it be CMS-editable?** Yes, and this is actually worth doing. It's a simple field:

1. Add to `site` singleton in `keystatic.config.ts`:
```ts
spotify_embed_url: fields.url({ label: 'Spotify playlist embed URL' }),
```

2. In `bento.astro`, read it:
```astro
const spotifyUrl = site?.spotify_embed_url ?? 'https://open.spotify.com/embed/playlist/37i9dQZF1DWZeKCadgRdKQ?utm_source=generator';
```

3. Use in the iframe:
```astro
<iframe src={spotifyUrl} ...></iframe>
```

**Editor flow:** In Spotify, right-click a playlist → Share → Copy link. Paste into the Keystatic admin field. Done.

> To get the embed URL from a Spotify share link, replace `open.spotify.com/playlist/` with `open.spotify.com/embed/playlist/` and add `?utm_source=generator`.

---

## Recommended Next Actions (Priority Order)

| Priority | Task | Effort |
|---|---|---|
| 1 | Implement featured photo filter for bento (2a) | 15 min |
| 2 | Add Spotify URL field to site singleton | 20 min |
| 3 | Strip Clara content → create clean boilerplate folder | 1 hour |
| 4 | Push boilerplate to its own GitHub repo | 15 min |
| 5 | Add `bento_photo_count` config (2b) | 1–2 hours |
| 6 | Add dedicated bento singleton with photo picker (2c) | 2–3 hours |
| 7 | Evaluate Keystatic Cloud Pro + Cloud Images if photos outgrow the repo | When needed |

---

## Known Remaining Quirks

- **Bento photos are random** on every build — switching to `featured` flag (Step 2a) removes this
- **`@keystatic/astro` doesn't officially support Astro 7** — watch for a new release; remove `.npmrc` `legacy-peer-deps` when it lands
- **Images live in the git repo** — fine up to ~50 photos at 200–400KB each. Beyond that, switch to Keystatic Cloud Images or Cloudinary
- **Bento is static** — rebuilds on content changes, so weather shown at build time would be stale (but we solved this by making weather client-side)
