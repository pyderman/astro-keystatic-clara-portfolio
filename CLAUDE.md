# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Static portfolio site for a fictitious freelance photographer (Clara Holm). All content is edited through a `/keystatic` admin UI, stored as files in git, and deployed as a fully static site on Vercel. No database, no backend, no CMS subscription.

The inbox spec lives at `inbox/KEYSTATIC-PILOT.md`.

## Tech stack

- **Astro 7.x** — static output, zero JS by default
- **Keystatic 0.5.x** — git-based CMS, admin at `/keystatic`
- **Tailwind CSS** — styling
- **Vercel** — hosting (auto-deploy on git push)

## Commands

```bash
npm run dev        # start dev server (Keystatic admin available at /keystatic)
npm run build      # static build output to dist/
npm run preview    # preview the static build locally
```

## Architecture

### Keystatic reader quirk

When reading a collection where the slug field uses `fields.slug()`, the reader returns the title as a **plain string** (not `{ name, slug }`). Access it as `entry.title`, not `entry.title.name`. Internally, `parseWithSlug` returns only `.name` from the slug compound object.

### Content model

Defined in `keystatic.config.ts`. Two collections/singletons drive the entire site:

- **`photos` collection** — each entry is a photo card on the home page: `title`, `location`, `year`, `image` (stored in `public/photos/`), `alt_text`, `featured`
- **`about` singleton** — portrait image, MDX bio, repeatable clients list, CV URL
- **`site` singleton** — global fields: name, tagline, email, Instagram handle

### Pages

- `/` — home/portfolio: headline + tagline (from `site` singleton) + grid of photo cards (from `photos` collection), footer with email + Instagram
- `/om` — about page: portrait, bio (MDX), clients list, CV download link

### Images

Images live in `public/photos/` and are referenced by filename in Keystatic entries. The image field is configured with `directory: 'public/photos'` and `publicPath: '/photos/'`. If the photo count grows beyond ~50 hi-res originals, swap the image field to a URL field and use Cloudinary instead — no structural changes needed.

### Auth

- **Local dev** — no login required; Keystatic runs in local mode
- **Production** — GitHub OAuth via Keystatic Cloud (keystatic.com) gates the `/keystatic` admin. Editors need a GitHub account.

### Storage

Keystatic is configured with `storage: { kind: 'github', repo: '...' }` in production, which means content edits from the admin UI are committed directly to the GitHub repo, triggering a Vercel rebuild (~30 seconds to live).
