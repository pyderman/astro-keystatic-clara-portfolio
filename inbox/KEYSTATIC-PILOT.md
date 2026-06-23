# Keystatic Pilot — Static Portfolio with Astro

A minimal proof-of-concept: one-person portfolio site where all content is
edited through a `/keystatic` admin UI, stored as files in git, and deployed
as a fully static site on Vercel. No database. No backend. No CMS subscription.

---

## Concept

**Subject:** Clara Holm — fictitious freelance documentary photographer based in Copenhagen.

Two pages. The editor (Clara) can update every word and every photo caption
without touching code. Deploying a content change = Keystatic commits to git →
Vercel rebuilds → live in ~30 seconds.

---

## Images

For this pilot, images live in `public/photos/` in the repo. Keystatic stores
the filename + metadata. 10–20 optimised JPEGs at 200–400 KB each = well under
10 MB total — no repo bloat at this scale.

If the project grows beyond ~50 hi-res originals, swap to Cloudinary (free tier
covers a real portfolio easily): upload via drag-and-drop, paste the URL into
the Keystatic image field instead of a filename. No other changes needed.

---

## Site structure

### Page 1 — `/` Home / Portfolio

- Full-name headline + one-line tagline (editable)
- Grid of **photo cards** — each card is a Keystatic collection entry:
  - `title` (string)
  - `location` (string)
  - `year` (number)
  - `image` (image field — file stored in `public/photos/`)
  - `alt_text` (string — accessibility)
  - `featured` (boolean — controls order/prominence)
- Footer: email + Instagram handle (editable singletons)

### Page 2 — `/om` About

- Portrait image + alt text (editable)
- Bio text — rich text (MDX via Keystatic)
- List of clients / publications (repeatable field)
- Download CV link (URL field)

---

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Astro 4.x | Static output, zero JS by default |
| Styling | Tailwind CSS | Known quantity |
| CMS | Keystatic 0.5.x | Git-based, `/keystatic` admin, no server |
| Images | `public/photos/` in repo | Simple, free, no third-party service needed |
| Hosting | Vercel | Auto-deploy on git push, free tier |
| Auth (local dev) | None | Keystatic local mode requires no login |
| Auth (production) | GitHub OAuth via Keystatic Cloud | Free for small teams — see note below |

---

## Auth in production — the one thing to know

In local dev, `/keystatic` is open — no login needed.

On the live Vercel URL, Keystatic uses **GitHub OAuth** to gate the admin.
Keystatic Cloud (keystatic.com) acts as the OAuth relay — you connect your
repo there once and it handles the login flow. Free for small teams.

**Constraint:** editors need a GitHub account to log in. For a solo portfolio
(Clara editing her own site) this is fine. For non-technical staff at a
municipality it would be a friction point — worth noting before using this
pattern at scale.

---

## Keystatic content model

```ts
// keystatic.config.ts (sketch)

const config = {
  storage: { kind: 'github', repo: 'your-username/clara-holm-portfolio' },

  collections: {
    photos: collection({
      label: 'Photos',
      slugField: 'title',
      schema: {
        title:    fields.text({ label: 'Title' }),
        location: fields.text({ label: 'Location' }),
        year:     fields.integer({ label: 'Year' }),
        image:    fields.image({ label: 'Photo', directory: 'public/photos', publicPath: '/photos/' }),
        alt_text: fields.text({ label: 'Alt text' }),
        featured: fields.checkbox({ label: 'Featured', defaultValue: false }),
      },
    }),
  },

  singletons: {
    about: singleton({
      label: 'About page',
      schema: {
        portrait: fields.image({ label: 'Portrait', directory: 'public/photos', publicPath: '/photos/' }),
        bio:      fields.mdx({ label: 'Bio' }),
        clients:  fields.array(fields.text({ label: 'Client' }), { label: 'Clients' }),
        cv_url:   fields.url({ label: 'CV download URL' }),
      },
    }),
    site: singleton({
      label: 'Site settings',
      schema: {
        name:      fields.text({ label: 'Full name' }),
        tagline:   fields.text({ label: 'Tagline' }),
        email:     fields.text({ label: 'Email' }),
        instagram: fields.text({ label: 'Instagram handle' }),
      },
    }),
  },
};
```

---

## Deploy setup

1. Create GitHub repo → `git init` → push
2. Vercel → import repo → framework: Astro → deploy
3. keystatic.com → connect repo → production admin at `yourdomain.vercel.app/keystatic`
4. Clara logs in with GitHub → edits content → Keystatic commits to repo → Vercel rebuilds → live in ~30 seconds

---

## Cost breakdown

| Service | Cost |
|---|---|
| Astro + Keystatic (npm) | Free, open source |
| GitHub repo | Free |
| Vercel hosting | Free tier |
| Keystatic Cloud auth | Free for small teams |
| Image storage (`public/photos/`) | Free (in repo) |
| **Total** | **£0/month** |

If images outgrow the repo: Cloudinary free tier (25 credits/month) handles a
full photography portfolio with room to spare.

---

## What this proves

- Non-technical editor manages all content without code, FTP, or a database
- Full git history = every change is logged, reversible
- Static output = fast, cheap, secure — no server to attack or maintain
- Reusable pattern: same stack works for AffaldsApp website content editing

---

## Scaffold commands

```bash
npm create astro@latest clara-holm-portfolio -- --template minimal
cd clara-holm-portfolio
npm install @keystatic/core @keystatic/astro
```

First `/keystatic` admin working locally: ~45 minutes from scratch.
