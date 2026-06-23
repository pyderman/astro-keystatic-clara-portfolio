# Project Overview — Astro + Keystatic Portfolio

## What This Is

A fully working static portfolio site for a fictional freelance photographer (Clara Holm). Built as a proof-of-concept for a **git-based CMS pattern** where non-technical editors manage all content through a web UI — without touching code, FTP, databases, or paid CMS subscriptions.

Every content change made in the admin UI gets committed to GitHub as a file, which triggers an automatic Vercel rebuild. The site is live within ~30 seconds.

## Purpose

This project proves out a reusable pattern for OE clients — particularly municipalities and similar organisations — who need simple content editing without backend infrastructure. The same stack works for things like:
- Portfolio sites
- Event/info pages
- The AffaldsApp website

It also serves as the **source boilerplate** for a cleaner starter template (next step: copy folder, strip content, simplify).

---

## Live URLs

| Resource | URL |
|---|---|
| Live site | https://astro-keystatic-clara-portfolio.vercel.app |
| Portfolio page | https://astro-keystatic-clara-portfolio.vercel.app/ |
| Bento page | https://astro-keystatic-clara-portfolio.vercel.app/bento |
| About page | https://astro-keystatic-clara-portfolio.vercel.app/om |
| CMS Admin | https://astro-keystatic-clara-portfolio.vercel.app/keystatic |
| GitHub repo | https://github.com/pyderman/astro-keystatic-clara-portfolio |
| Keystatic Cloud project | https://keystatic.cloud → Team: puzzled-studio-team → Project: astro-keystatic-cla |
| Vercel project | https://vercel.com/dashboard (project: astro-keystatic-clara-portfolio) |

---

## Tech Stack

| Layer | Tool | Version | Why |
|---|---|---|---|
| Framework | Astro | 7.x | Static-first, zero JS by default, fast builds |
| CMS | Keystatic | 0.5.x | Git-based, admin UI at `/keystatic`, no server/database |
| Styling | Tailwind CSS | 4.x | Utility classes via Vite plugin (NOT @astrojs/tailwind) |
| UI components | React | 19.x | For interactive islands (Clock, WeatherWidget) |
| Hosting | Vercel | — | Auto-deploys on git push, free hobby tier |
| Auth relay | Keystatic Cloud | — | Handles GitHub OAuth for CMS login, free up to 3 users |
| Version control | GitHub | — | Source of truth for both code and content |

---

## How The Three Services Work Together

```
Editor visits /keystatic
        ↓
Keystatic Cloud (keystatic.cloud)
  — authenticates editor via GitHub OAuth
  — no GitHub account needed for editors on Cloud plan
        ↓
Keystatic Admin UI (running on Vercel)
  — editor edits content fields
  — saves changes
        ↓
GitHub repo (pyderman/astro-keystatic-clara-portfolio)
  — Keystatic commits content changes as YAML/image files
  — this is the single source of truth for ALL content
        ↓
Vercel
  — detects new commit on main branch
  — runs `npm run build` (astro build)
  — deploys new static output
  — site live in ~30 seconds
```

### GitHub — Content + Code Storage
GitHub stores everything: the Astro code, the Keystatic config, and all content (as YAML files in `content/`) and images (in `public/photos/`). Every content edit from the CMS becomes a git commit. This means full edit history, rollback capability, and no database.

### Vercel — Hosting + Build Pipeline
Vercel watches the GitHub repo and rebuilds on every push. It runs `astro build`, which reads all content YAML files at build time and generates static HTML. The result is a fast, cheap, secure static site. The Keystatic admin routes are the only dynamic (SSR) part.

### Keystatic Cloud — Auth Relay
Keystatic Cloud sits between the editor and GitHub. It handles the OAuth flow so editors can log into the CMS without needing a personal GitHub account or managing OAuth app credentials. Free for up to 3 editors per team.

---

## Content Model

All content lives in `content/` as YAML files.

### Collections
**`photos`** (`content/photos/*.yaml`) — Each file is one photo card on the portfolio grid:
- `title` — also used as the URL slug
- `location` — city/place name shown on card
- `year` — year integer
- `image` — image file stored in `public/photos/`
- `alt_text` — accessibility description
- `featured` — boolean, used to select photos for the bento page

### Singletons
**`site`** (`content/site.yaml`) — Global fields used across all pages:
- `name`, `tagline`, `email`, `instagram`

**`about`** (`content/about.yaml`) — About page content:
- `portrait`, `portrait_alt`, `bio` (multiline text), `clients` (list), `cv_url`

---

## File Structure

```
keystatic-astro-test/
├── content/               ← All CMS content (YAML) — edited via /keystatic
│   ├── site.yaml
│   ├── about.yaml
│   └── photos/
│       └── *.yaml
├── public/
│   └── photos/            ← Uploaded images (committed to git)
├── src/
│   ├── components/
│   │   ├── Clock.tsx      ← Client-side React clock
│   │   └── WeatherWidget.tsx ← Client-side React weather (Open-Meteo API)
│   ├── layouts/
│   │   └── Layout.astro
│   ├── pages/
│   │   ├── index.astro    ← Portfolio grid
│   │   ├── om.astro       ← About page
│   │   └── bento.astro    ← Bento grid layout
│   └── styles/
│       └── global.css
├── keystatic.config.ts    ← CMS schema definition
├── astro.config.mjs       ← Astro + Vercel + React + Tailwind config
├── .npmrc                 ← legacy-peer-deps=true (needed for Astro 7 + Keystatic 0.5)
└── docs/                  ← This folder
```

---

## Key Documentation Links

| Topic | URL |
|---|---|
| Astro docs | https://docs.astro.build |
| Keystatic docs | https://keystatic.com/docs |
| Keystatic GitHub mode | https://keystatic.com/docs/github-mode |
| Keystatic Cloud | https://keystatic.com/docs/cloud |
| Keystatic fields reference | https://keystatic.com/docs/fields/text |
| Vercel + Astro | https://docs.astro.build/en/guides/deploy/vercel/ |
| Tailwind v4 (Vite) | https://tailwindcss.com/docs/installation/using-vite |
| Open-Meteo API | https://open-meteo.com/en/docs |

---

## Cost

| Service | Cost |
|---|---|
| GitHub repo | Free |
| Vercel hosting (Hobby) | Free |
| Keystatic Cloud (≤3 editors) | Free |
| Image storage (in repo) | Free |
| **Total** | **€0/month** |

Upgrade path if needed: Keystatic Cloud Pro at $10/month unlocks Cloud Images (images stored outside the repo) and more than 3 editors.
