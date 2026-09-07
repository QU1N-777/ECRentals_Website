# EC Rentals — Handover

**For whoever picks this up next: another Claude Code session, Antigravity, Cursor, or a human.**
Read this file first, then `PROGRESS.md`, then `CLAUDE.md`.

---

## What this is

A replacement website for **EC Rentals (Pty) Ltd** — plant, vehicle, tool and operator hire
for South African heavy industry, based in Vanderbijlpark.

The live site today is WordPress + Elementor at `ecrentals.co.za`. It shows ~11 products.
The register shows **103 owned assets across 11 equipment classes plus 149 tools**. The rebuild
is therefore a **repositioning**, not a facelift: from "tool and bakkie hire" to "managed plant
and logistics partner to heavy industry".

`EC-Rentals-Website-Rebuild-Plan.md` is the specification and **governs every decision**.
`EC-Rentals-Master-Prompt.md` is the working brief. Where they disagree, the plan wins.

---

## Current state in one paragraph

The site is **built and building green** — 104 pages, zero dead links, `tsc` clean. Data lives in
Supabase Postgres and is fully seeded (11 categories / 62 equipment / 149 tools). There is a
working admin UI, a quick-quote modal, an itemised enquiry basket, and an email pipeline.
**Nothing is deployed and no DNS has been touched.** All 50 images render — they ship with the
repo in `web/public/media/` and no credentials are needed to see the site as designed. Storage
is an *override*, not a dependency; see *How images resolve* below.

---

## Stack

| Layer | Choice | Notes |
|---|---|---|
| Frontend | Next.js 15, App Router, TypeScript | `web/` |
| Styling | Plain CSS, one design system file | `web/app/globals.css` — no Tailwind |
| Database | Supabase Postgres | project ref `gblryijimeedzyyjnksd` |
| Auth | Supabase Auth — password + magic link | admin only |
| Storage | Supabase Storage, bucket `site` | public read, admin write |
| Email | Resend (not yet wired to a key) | sends from a `mail.` subdomain only |
| Hosting | Vercel (intended, not yet done) | |

**Why Supabase over Firebase:** the data model is relational — `equipment → categories`,
`enquiry_items → enquiries + equipment`. Firestore would need denormalising by hand and has
**no column-level security**, which this schema relies on (see *Security model*).
The data layer is isolated in `lib/queries.ts` and `lib/supabase/*`, so a swap is contained
if the company ever standardises elsewhere.

---

## Getting started

```bash
cd web
npm install
cp .env.local.example .env.local     # then fill in the keys below
npm run dev                          # http://localhost:3000
```

### Environment variables

| Variable | Needed for | Where to get it |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | everything | already in `.env.local.example` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | everything | already in `.env.local.example` |
| `SUPABASE_SERVICE_ROLE_KEY` | enquiry writes, image upload script | Supabase → Project Settings → API → `service_role` |
| `RESEND_API_KEY` | enquiry emails | Resend dashboard |

Both public values are safe to commit. **The service-role key bypasses RLS — never expose it
to the browser and never commit it.** `.env*.local` is gitignored.

---

## ⚠️ Read this before touching Supabase

There are **two Supabase accounts in play**, and this caused real confusion:

- The project this build uses — **`gblryijimeedzyyjnksd`, named "EC Rentals"** — lives in the
  **original** account. It is healthy, seeded and writable.
- A **second account** was later signed into. It hit the free-tier project limit and shows a
  different project ("EC Rentals Website") with a different bucket ("Main Storage").
  **That project is not used by anything here.**

Supabase's free limit is **per organisation**. Nothing needs creating — the project already
exists. If the dashboard does not show `gblryijimeedzyyjnksd`, you are in the wrong account.

Confirm with: `NEXT_PUBLIC_SUPABASE_URL` in `.env.local` → `https://gblryijimeedzyyjnksd.supabase.co`

---

## Known issues

### 1. Images — resolved, but know how they resolve

They used to render as empty black frames. The cause was a design mistake of mine, worth
recording because it is the sort of thing that quietly comes back.

The approved homepage artifact **base64-embedded** every picture straight into the HTML, so it
was self-contained and always looked right. When that design became a real Next.js site I
swapped those embeds for Supabase Storage URLs — correct for production, but it made every
image depend on a bucket upload that needed a service-role key nobody had. The bucket was
empty, so every request returned **HTTP 400**. The file paths never changed and no file was
ever lost; what changed was *where the bytes were expected to come from*.

**How it works now** — `web/lib/images.ts`, one function, two sources in priority order:

| Stored value | Resolves to | Who writes it |
|---|---|---|
| `https://…/storage/v1/…` | used as-is | the admin UI, after an upload |
| `hero-home.webp` | `/media/hero-home.webp` | the seed data |

So the 50 bundled files in `web/public/media/` (3.7 MB, committed) are the floor. The moment
someone swaps a picture in `/admin`, that row stores an absolute Storage URL and wins over the
bundled default — **with no redeploy**. The site can therefore never render a blank frame
because a bucket is empty or a key is missing.

`web/public/media/` mirrors the database paths exactly:

| Folder | Files |
|---|---|
| `media/*.webp` | 7 — hero, section and page banners |
| `media/categories/cat-*.webp` | 11 — one per equipment category |
| `media/equipment/<slug>.webp` | 32 — client studio shots, joined by fleet number |

**Optional:** `node web/scripts/upload-images.mjs` (needs `SUPABASE_SERVICE_ROLE_KEY`) pushes
the same 50 files into the bucket. Only worth doing if you want Storage to be the primary
source. The site does not need it.

**Still open — the hero reads black in the automated screenshot. Start here.**

Every measurement says it should not. Verified against a freshly started production server:

| Check | Result |
|---|---|
| `/media/hero-home.webp` | HTTP 200, 265,984 bytes |
| Decoded pixels (canvas sample) | 1915×820, **avg brightness 106**, max 255 |
| Through `/_next/image?w=3840&q=75` | identical, avg 106 |
| `.hero__img` computed style | `complete:true`, opacity 1, visible, `object-fit:cover`, rect 1468×801 |
| Scrim in the served CSS | correct — alpha reaches **0** past 62% horizontal |
| `elementsFromPoint(1150,300)` | nothing opaque above the image except the transparent scrim |

So the bytes are bright, they reach the element, and nothing covers them — yet the capture is
black. **Do not "fix" this by lightening the scrim again.** That was chased three times and it
was the wrong thread; two of those rounds were also judged against a stale `next start` still
holding port 3010 from an earlier build, so they proved nothing either way.

Next session: **open it in a real browser first.** There is a live possibility the page is
already correct and only the headless capture is wrong. If it really is black on a monitor,
look at compositing rather than colour — the `.hero` stacking context, `overflow`, and whether
`.hero__in` (z-index 2) forms a layer that flattens the sibling image.

Kill stray servers before judging anything: `Get-NetTCPConnection -LocalPort 3010`.

### 2. Admin password user does not exist yet

The login UI supports password **and** magic link, and two addresses are already on the
allowlist. But the actual auth user was never created — writing a password hash directly into
`auth.users` was correctly blocked as a privileged operation.

**Create it in the dashboard:** Authentication → Users → **Add user** → enter the EC Rentals
admin email → set a password → tick **Auto Confirm**. Credentials were supplied privately and
are deliberately **not** recorded in this repo.

Allowlisted addresses live in `public.admin_emails`. Add a row to grant access, delete to revoke.
Also manageable from `/admin/access`.

### 3. Email is unverified

The enquiry pipeline is written and wired but has never sent a real message — `RESEND_API_KEY`
is unset. **Enquiries still save to the database without it**, so no lead is ever lost; only the
notification is skipped. Before launch, verify the sending domain and send a live test to Gmail,
Outlook and the client's real mailbox.

### 4. Two build-tooling traps that cost time

- **Never run `next build` while `npm run dev` is running.** Both write to `.next` and on
  Windows this corrupts it, producing `Cannot find module './vendor-chunks/@supabase.js'` and a
  blank 500 page. Fix: stop both, `rm -rf .next`, rebuild.
- **Git Bash heredocs on Windows fail** on files containing apostrophes. Write `.tsx`/`.css`
  files with an editor/Write tool, not `cat > file <<'EOF'`.

---

## Architecture map

```
web/
  app/
    page.tsx                     Homepage — all content from the database
    equipment/page.tsx           Catalogue: 11 category sections, selectable cards
    equipment/[category]/        11 prerendered category pages
    equipment/item/[slug]/       61 prerendered item pages (62 minus one deactivated)
    tools/                       149 tools, live search + filter
    services/, industries/       6 + 7 pages from lib/site-data.ts
    about/, projects/, contact/  depth pages
    privacy-policy/, terms-of-hire/   legal (both DRAFTS — see below)
    enquiry/
      page.tsx + EnquiryForm     itemised basket checkout
      actions.ts                 basket submission (server action)
      quick-actions.ts           quick-quote modal submission
    admin/
      layout.tsx                 auth gate
      page.tsx  + ContentEditor  28 editable fields
      equipment/                 62 items + bulk image upload
      enquiries/                 inbox with status workflow
      access/                    admin allowlist
  components/
    EnquiryModal.tsx             the quick-quote modal (global, event-driven)
    QuoteButton.tsx              opens the modal from anywhere
    admin/ImagePicker.tsx        single drag-drop image replace
    admin/BulkUpload.tsx         many files, matched by filename
  lib/
    queries.ts                   all public data reads (cached per request)
    content.ts                   site_content helpers
    site-data.ts                 editorial copy for services + industries
    basket.ts                    session-storage basket
    supabase/                    server, browser, session clients
  scripts/upload-images.mjs      one-shot asset loader
```

### Content model

Editable copy and photography live in the **`site_content`** table (29 rows), grouped and
labelled for the admin UI. **Adding a new editable field is one SQL insert — no admin code
changes.** Structural page copy (services, industries) lives in `lib/site-data.ts` because it
is written once, not edited weekly.

---

## Security model — do not weaken these

1. **`equipment.fleet_numbers` is protected by a column-level `GRANT`.** It is absent from what
   `anon`/`authenticated` may select, so PostgREST will not serve it even if a query asks.
   Internal metadata (fleet numbers, registrations) must never reach a public page.
   *Verified: 0 of 61 built item pages contain an `ECR0…` code.*
2. **`enquiries` / `enquiry_items` have no anonymous policy at all.** Writes happen server-side
   with the service role after validation, honeypot and IP rate limiting. Bots cannot write
   into a table holding customer contact details.
3. **`anon` holds read and nothing else.** Write grants were revoked across all tables.
4. **Helper functions live in a `private` schema** so Supabase does not expose them at
   `/rest/v1/rpc`. `private.next_enquiry_reference()` generates `ECR-ENQ-YYYYMMDD-NNNN`,
   daily-resetting, race-free, in **Africa/Johannesburg**.
5. **`enquiry_counters` has RLS on and zero policies by design** — service role only. The
   Supabase linter reports this as INFO; it is intentional and documented as a table comment.
6. Security advisors: **all WARN-level findings cleared.**

---

## Rules inherited from the brief — do not break these

- **DNS is frozen.** Multiple live mailboxes depend on the current records. Nothing touches DNS
  until the build is signed off, and then only a **sending subdomain** (`mail.ecrentals.co.za`)
  — never the root MX. Record every existing MX/TXT/SPF/DKIM first.
- **Never invent facts.** No pricing, no founding year, no certifications, no client names, no
  availability claims. If the plan does not state it, leave it out.
- **No client names without written permission.** ArcelorMittal, Sasol, Northam, Ivanplats and
  Tutuka must not be published. `projects.published` defaults to `false` for this reason.
- **No personal data in the CMS.** Driver names, registrations and VINs stay in the spreadsheet.
- **Availability is confirmed on quotation** — never state a specific unit is available.
- **Brand red is `#BA1B20`**, confirmed from the client logo and the live site theme.
  `#D32027` was a placeholder and is retired.
- **`prefers-reduced-motion` honoured on every animation.**

---

## Open decisions the client still owes

| # | Item | Blocks |
|---|---|---|
| 1 | **Asset count**: plan says 103 owned; catalogue sums to 108 (107 after the sold forklift) | A public claim on `/about` |
| 2 | **Client-name permission** for case studies | The Projects page stays empty |
| 3 | **Founding year** | The "since 20xx" credibility line on About |
| 4 | **Commercial hire terms** | `/terms-of-hire` is a placeholder |
| 5 | **Named team directory** | `/about/team` shows roles, not people |
| 6 | **ECR021 load test expired** (2024-09-05) | The site claims load-test certification |

---

## Assets

`Images/site-ready/` (18) and `Images/web-optimised/` (32) **are committed** — they are what
the uploader needs.

Large source folders are **excluded** from the repo (~115 MB) and live on the build machine:
`Images/*.png` (32 client studio shots), `Images/Generated Cinematic Website Images/` (OpenAI),
`Images/Antigravity/` (Gemini), `Images/Cinematic Images/`, `Images/Generated/`.

31 of 62 equipment items have a photo, matched to the fleet by parsing ECR numbers from
filenames. **HV Diagnostics and Trailers have no photography at all**, and there are no
dedicated operator portraits — the highest-trust image on the site is still missing.

---

## Suggested next steps, in order

1. **Create the admin auth user** so `/admin` is usable — nothing else is blocked by it.
2. **Eye the hero scrim** on a real monitor; the balance is judgement, not measurement.
3. **Polish pass (P7)** — motion, four-breakpoint responsive QA, WCAG 2.1 AA, alt text.
4. **Deploy to a Vercel preview** for sign-off. No DNS involved.
5. **Wire Resend** and send a live test to a real inbox.
6. **Cutover (P8)** — only after sign-off, and only the sending subdomain first.
