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

The site is **built and building green** — 106 pages, zero dead links, `tsc` clean. Data lives in
**Firebase Firestore** and is fully seeded (11 categories / 62 equipment / 149 tools). There is a
working admin UI (Content Studio, Equipment Fleet Manager with Visual Cards & WYSIWYG frame cropping,
Enquiries Pipeline, Access Control, and the Spacing Studio), a quick-quote modal, an itemised enquiry
basket, and an automated Resend email pipeline with dynamic Firestore configuration and live testing.
**The site is deployed and live on Firebase Hosting at `https://ecrentals.web.app`.**
All images render 100% reliably via direct Google CDN delivery (`images: { unoptimized: true }`),
preventing serverless function cold starts and image 400 parameter errors.

---

## Stack

| Layer | Choice | Notes |
|---|---|---|
| Frontend | Next.js 15, App Router, TypeScript | `web/` |
| Styling | Plain CSS, one design system file | `web/app/globals.css` — no Tailwind |
| Database | Firebase Firestore | `logicore-center` project |
| Auth | Firebase Admin SDK | `/api/session` secure cookies for `/admin` |
| Storage | Firebase Storage | `firebasestorage.googleapis.com` |
| Email | Resend (Automated Pipeline) | Dynamic config in Firestore (`site_settings/email`), managed via `/admin/enquiries` |
| Hosting | Firebase Hosting | `ecrentals.web.app` |

**LogiCore Integration:** Enquiries submitted on the website push directly into LogiCore's `logicore_tasks` Firestore collection seamlessly, while also triggering branded dark-metallic HTML email alerts to `info@ecrentals.co.za` and `sales@ecrentals.co.za` plus automatic receipt confirmations to customers!

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
| `FIREBASE_PROJECT_ID` | Admin SDK Database Init | Firebase Console |
| `FIREBASE_CLIENT_EMAIL` | Admin SDK Service Account | Firebase Console |
| `FIREBASE_PRIVATE_KEY` | Admin SDK Service Account | Firebase Console |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Image Uploads | Firebase Console |
| `RESEND_API_KEY` | enquiry emails | Resend dashboard |

Both public and private variables must be populated to allow the Next.js server to run the Admin SDK safely. The private keys are strictly server-side and never exposed to the client. `.env*.local` is gitignored.

---

## ⚠️ Seeding the database

If you are setting this up from scratch, there is a `web/seed.mjs` script that will:
1. Upload all `/Images/` to Firebase Storage.
2. Read the `ec-rentals-catalogue.csv` files.
3. Automatically generate the equipment, categories, and tools in Firestore.

**How to run:**
Ensure you have `serviceAccountKey.json` inside the `web/` folder from the Firebase Console, and run:
`node seed.mjs`

---

## Known issues

### 1. Images — resolved, but know how they resolve

They used to render as empty black frames. The cause was a design mistake of mine, worth
recording because it is the sort of thing that quietly comes back.

The approved homepage artifact **base64-embedded** every picture straight into the HTML, so it
was self-contained and always looked right. When that design became a real Next.js site I
swapped those embeds for Firebase Storage URLs — correct for production, but it made every
image depend on a bucket upload. The bucket was empty, so every request returned **HTTP 400**.
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

**Optional:** `node seed.mjs` pushes the same 50 files into the bucket as part of its execution. Only worth doing if you want Storage to be the primary source.

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

### 1. Images & Hero — Fully Resolved (P10 & P11)
- Images render 100% reliably via Google CDN edge nodes with `images: { unoptimized: true }` in `next.config.ts`.
- The hero image brightness and gradient scrim are calibrated; all 106 pages compile cleanly with 0 broken links.
- Replaced fleet images are synced to both Firebase Storage and `/public/media/`.
- Equipment and category cards include robust client-side error boundaries with styled dark-metallic fallback cards.
- The Admin Equipment Manager includes a WYSIWYG crop/pan/zoom canvas (`ImageEditorModal.tsx`) that generates clean, correctly framed WebP images.

### 2. Admin Authentication & Session Management
- Authentication uses Firebase Admin SDK session cookies verified via `/api/session`.
- Admin allowlist is maintained in the `admin_emails` Firestore collection, manageable from `/admin/access`.
- Admins can log in using email link or password authentication.

### 3. Email Automation System — Ready & Tested (P12)
- The email notification system is fully wired via `web/lib/email-service.ts` using Resend.
- Dynamic credentials and settings live in Firestore doc `site_settings/email` — no redeploy required to change API keys or recipient addresses!
- **How to manage:** Go to `/admin/enquiries`, click **`⚙️ Email Automation`**, enter your Resend API Key, verify recipient addresses (`info@ecrentals.co.za` + `sales@ecrentals.co.za`), and click **Send Test Notification**.
- Customer enquiries automatically receive an immediate professional receipt email quoting their reference code (`ECR-ENQ-...`).
- Past enquiries can be re-dispatched at any time with the **"✉️ Resend Alert"** button on each enquiry card.

### 4. Build-Tooling Best Practices
- Never run `next build` concurrently with `npm run dev` (writes to `.next` can cause Windows lock conflicts).
- When modifying database or spacing configs, updates are hot-reloaded and reflected instantly on the client.

---

## Architecture map

```
web/
  app/
    page.tsx                     Homepage — all content from Firestore
    equipment/page.tsx           Catalogue: 11 category sections, selectable cards
    equipment/[category]/        11 prerendered category pages
    equipment/item/[slug]/       61 prerendered item pages (62 minus one deactivated)
    tools/                       149 tools, categorized & sub-grouped with color gradients
    services/, industries/       6 + 7 pages from lib/site-data.ts
    about/, projects/, contact/  depth pages
    privacy-policy/, terms-of-hire/   legal (drafts)
    enquiry/
      page.tsx + EnquiryForm     itemised basket checkout
      actions.ts                 basket submission (server action + email alert)
      quick-actions.ts           quick-quote modal submission (+ email alert)
    admin/
      layout.tsx                 auth gate via Firebase session cookie
      page.tsx  + ContentEditor  28+ editable fields (site_content)
      equipment/                 Visual Cards fleet manager + WYSIWYG frame cropper
      enquiries/                 inbox with status workflow & Email Automation Studio
      spacing/                   Spacing Studio with live interactive preview & sliders
      access/                    admin allowlist management
    api/
      admin/email-settings/      GET/POST Resend credentials & recipients
      admin/email-settings/test/ POST test email dispatcher
      admin/enquiries/[id]/resend/ POST manual re-dispatch of enquiry alert
      admin/spacing/             GET/POST layout and gap parameters
      session/                   Firebase Admin auth session management
      upload/                    Firebase Storage image uploader
  components/
    EnquiryModal.tsx             quick-quote modal (global, event-driven)
    ToolSearch.tsx               categorized & sub-type grouped tool catalogue
    admin/
      EmailSettingsModal.tsx     Resend configuration modal with live test runner
      ImageEditorModal.tsx       interactive WYSIWYG pan/zoom/crop tool
  lib/
    firebase/                    server & client Firebase SDK initializations
    email-service.ts             Resend email automation, HTML templates & Firestore sync
    spacing-config.ts            site-wide gap tokens & default spacing parameters
    queries.ts                   public Firestore cached reads
    content.ts                   site_content helpers
    basket.ts                    session-storage basket
```

### Content & Database Model (Firestore)

| Collection | Purpose |
|---|---|
| `equipment` | 62 fleet items with specifications, categories, and image URLs |
| `categories` | 11 equipment categories with benefit statements and badges |
| `tools` | 149 tools with categories, sub-types, and hire options |
| `enquiries` | Incoming hire requests with status, line items, and email delivery audits |
| `site_content` | 30+ client-editable text fields, copy blocks, and hero configurations |
| `site_settings` | System configs (`site_settings/email`, `site_settings/spacing`) |
| `logicore_tasks` | Direct bidirectional integration with LogiCore operations |
| `admin_emails` | Allowlist of authorized administrator emails |

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

1. **Client Sign-off** — Review the live site at https://ecrentals.web.app
2. **Resend Live Email Activation** — Navigate to `/admin/enquiries` -> `⚙️ Email Automation`, enter Resend API key, and send a test dispatch to confirm deliverability to `info@ecrentals.co.za` and `sales@ecrentals.co.za`.
3. **Resolve Content Blockers** — Get final answers from EC Rentals on the yellow blockers above (founding year, client permission, asset count).
4. **Final Cutover** — Once approved, point the production root domain (`ecrentals.co.za`) to Firebase Hosting and configure Search Console.

