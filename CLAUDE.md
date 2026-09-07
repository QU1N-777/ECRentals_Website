# EC Rentals — Wix Studio Build

**Read this file first, every session.**

Client: EC Rentals (Pty) Ltd — plant, vehicle, tool and operator hire.
Lead EPC Building, Cnr Hertz & Becquerel Street, Vanderbijlpark, South Africa.
+27 66 429 5788 · +27 82 850 4902 · info@ecrentals.co.za · sales@ecrentals.co.za

Positioning: **PLANT, VEHICLES & OPERATORS FOR HEAVY INDUSTRY**
Strapline: *Certified. Serviced. On site.*
Legacy line to retain: *"Making the completion of your projects possible by any means necessary."*

---

## Platform

| | |
|---|---|
| Platform | **Wix Studio** — NOT the classic Wix Editor, NOT Harmony |
| MCP | `wix` (https://mcp.wix.com/mcp) — connected, verified session 1 |
| Site name | **EC Rentals** (business name: EC Rentals (Pty) Ltd) |
| Site ID | `d487feea-7190-45b4-893d-1ab97a358420` |
| Staging URL | https://southlandenergy.wixstudio.com/my-site-6 |
| Studio editor | https://southlandenergy-my-site-6.editor.wix.com/studio/ffc5ba6e-945a-4515-87c2-2170bff3c210?metaSiteId=d487feea-7190-45b4-893d-1ab97a358420 |
| Live domain | `ecrentals.co.za` — currently WordPress + Elementor. **DO NOT TOUCH.** |
| Template origin | Wix Studio "Trucking Company" (T.ROAD), template 3623, metaSiteId `46a2135c-477b-46a5-9a72-822f8d59da63` |
| Plan | Free — **Business plan or higher required** before Velo/custom code (session 3) |
| Velo | Disabled — must be enabled for the enquiry basket |

> ⚠️ **Staging is set to `noindex`.** A `robots: noindex` meta tag was added deliberately so the
> staging site cannot compete with the live WordPress site in search. **Remove it at cutover
> (phase 6) or the new site will never rank.**

## Specification

`EC-Rentals-Website-Rebuild-Plan.md` is the specification and governs every decision.
`EC-Rentals-Master-Prompt.md` is the working brief (tokens, sitemap, section order, copy rules).
Where the two disagree, **the plan wins**.

Source data:
- `ec-rentals-catalogue.csv` — 62 equipment items, 11 categories
- `ec-rentals-tools-catalogue.csv` — 149 tools, 7 sub-categories
- `2026 EC Rentals Management Register.xlsx` — fleet source of truth. **Reference only, never publish.**

---

## NON-NEGOTIABLES

1. **Wix Studio only.** Studio is required for the CMS, Dev Mode/Velo and responsive control this build depends on.
2. **Staging only.** Never touch DNS for `ecrentals.co.za`. Never publish to the live domain.
   The existing site is WordPress and `info@` / `sales@` depend on its current MX records.
   Record all MX/TXT/SPF/DKIM before any DNS change is ever contemplated.
3. **Ask before anything destructive.** Deleting or overwriting a collection, publishing,
   changing account settings — stop and ask first.
4. **Never invent facts.** No pricing, no certifications, no client names, no availability
   claims, no founding year. If the plan doesn't state it, leave it out and add it to the
   open-questions list.
5. **No personal data in the CMS.** Driver names, registration numbers, VINs and client
   project numbers stay in the spreadsheet. `fleetNumbers` is internal metadata only and
   must never render on a public page.
6. **Look it up, don't guess.** Use the Wix MCP documentation tools to confirm the current
   API shape for every call — especially Data Collections and Data Items. Never write Wix
   API payloads from memory.
7. There are ~12 unrelated sites in this Wix account. **Do not touch any of them.**

### Standing build rules

- Backend code lives in `backend/*.web.js` (web modules). Never put secrets in frontend code.
- Enquiry basket uses `wix-storage-frontend` **session** storage — never localStorage.
- All CMS writes go through backend web modules with server-side validation.
- Enquiry notifications go to `info@ecrentals.co.za` (recipient configurable via `Settings`).
- Never hardcode a colour that isn't a token below.
- Honour `prefers-reduced-motion` on every animation.
- v1 is **enquiry only** — no payment, no live availability, no booking engine.

---

## Design tokens

Set as Wix Studio theme colours.

| Token | Hex | Role |
|---|---|---|
| `--ecr-red` | `#BA1B20` | Primary action — **CONFIRMED from client logo + live site theme** |
| `--ecr-red-bright` | `#EA1B23` | Lighter brand red (live site secondary) — gradient start |
| `--ecr-red-dark` | `#911519` | Hover / pressed |
| `--ecr-orange` | `#F97316` | Gradient mid |
| `--ecr-amber` | `#F5A524` | Gradient end · stats · icons |
| `--ecr-black` | `#0A0A0B` | Hero + footer ground |
| `--ecr-charcoal` | `#1C1E21` | Primary dark surface |
| `--ecr-charcoal-2` | `#2A2D31` | Raised surface · borders |
| `--ecr-steel` | `#6B7280` | Secondary text on dark |
| `--ecr-concrete` | `#E8E9EB` | Light dividers |
| `--ecr-offwhite` | `#F5F6F7` | Light ground |
| `--ecr-white` | `#FFFFFF` | Cards on light |

```css
--ecr-gradient: linear-gradient(100deg, #D32027 0%, #F97316 55%, #F5A524 100%);
--ecr-gradient-subtle: linear-gradient(180deg, rgba(211,32,39,0.14) 0%, rgba(249,115,22,0) 100%);
```

> ✅ **RESOLVED 31 Aug 2026.** `#D32027` was a placeholder and is now retired. The real brand
> red is **`#BA1B20`**, established from two independent sources: the logo at
> `ecrentals.co.za/wp-content/uploads/2020/09/EC-Rentals-New-Logo-200px.png` (a gradient from
> `#991B1E` to `#FF1922`, mean non-shadow red `#BD1D22`) and the live site's own theme, which
> declares `#BA1B20` in 70 places. `#EA1B23` is the lighter brand red, used in 21 places.
> Gradient updated to start at `#BA1B20`.

**Rules of use**
- Default ground is charcoal or black. Light sections create rhythm; they are not the default.
- Exactly **one** red action per viewport. If two things are red, neither is the action.
- Gradient carries display type, fills and rules only — never body text.
- Amber/orange = information. Red = action.
- Body text on dark is `#F5F6F7` or `#FFFFFF`, never red. Minimum 4.5:1 contrast.

## Type styles

| Role | Face | Treatment |
|---|---|---|
| Display / H1–H2 | **Archivo** 700–800 | UPPERCASE, tracking `-0.02em`, leading `0.95–1.05` |
| Eyebrow / label | **Archivo** 600 | Uppercase, tracking `+0.14em`, 12–13px, amber or steel |
| Body / H3–H4 | **Inter** 400/500/600 | 17–18px, leading 1.65, max measure 68ch |
| Numerals / specs | **Inter** tabular-nums | Stat band, spec tables, fleet counts |

Fallback pairing if the client wants more weight: **Anton** (display) + **Barlow** (body).

---

## CMS schema (plan §7.2)

Seven collections. Field types are load-bearing for later sessions.

- **Equipment** (62) — `title`, `slug`(unique), `category`(**ref**→EquipmentCategories),
  `shortDescription`, `specs`(pipe-delimited text), `fleetQty`(num), `fleetNumbers`(text, internal),
  `ownership`, `operatorAvailable`(**bool**), `deliveryClass`, `image`(**image**),
  `gallery`(**media gallery**), `sortOrder`(num), `active`(**bool**)
- **EquipmentCategories** (11) — `title`, `slug`(unique), `benefitLine`, `image`, `icon`,
  `sortOrder`(num), `description`
- **Tools** (149) — `title`, `slug`(unique), `toolCategory`, `active`(**bool**)
- **Enquiries** — `reference`, `name`, `company`, `email`, `phone`, `deliverySite`, `reason`,
  `projectStartDate`(**date**), `notes`, `itemsSummary`, `status`, `submittedAt`(**date**), `consent`(**bool**)
- **EnquiryItems** — `enquiry`(**ref**→Enquiries), `equipment`(**ref**→Equipment), `itemTitle`,
  `quantity`(num), `days`(num), `requiredFrom`(**date**)
- **Projects** — `title`, `client`, `sector`, `location`, `summary`, `equipmentUsed`, `image`, `year`
- **Settings** — `key`, `value`

**Permissions.** Equipment, EquipmentCategories, Tools, Projects → public read / admin write.
**Enquiries and EnquiryItems must NOT be publicly readable** — they hold customer contact
details. Site-content write, no public read.

---

## Platform decision — 1 Sept 2026: moving off Wix

Custom stack. Wix staging site stays untouched as a fallback until the new build is signed off.

| Layer | Choice |
|---|---|
| Frontend | Next.js 15 (App Router) on Vercel — ISR, for the 62 + 11 indexable pages |
| Database | **Supabase Postgres** — project `gblryijimeedzyyjnksd`, region `eu-west-1` |
| API URL | `https://gblryijimeedzyyjnksd.supabase.co` |
| Publishable key | `sb_publishable_Z2pid7cumlD2Sio9WIW1oQ_XKIko1Dg` |
| Admin | Custom `/admin` on `site_content` + Supabase Auth (magic link) |
| Media | Supabase Storage |
| Email | Resend, sending from **`mail.ecrentals.co.za`** subdomain only |

> 🚨 **DNS IS FROZEN.** Multiple live mailboxes depend on the current records. Nothing
> touches DNS until the very end, and then only a *sending subdomain* — never the root MX.
> Record every existing MX/TXT/SPF/DKIM before any change is even contemplated.

### Supabase schema notes
- Tables: `equipment_categories` · `equipment` · `tools` · `projects` · `enquiries` ·
  `enquiry_items` · `settings` · `site_content` · `admins` · `enquiry_counters`
- **`equipment.fleet_numbers` is protected by a column-level GRANT**, not convention —
  it is absent from what `anon`/`authenticated` may select, so PostgREST never serves it.
  Admin access to it goes through server routes using the service role.
- **Enquiries/EnquiryItems have no anon policy at all.** Inserts happen server-side with the
  service role after validation, honeypot and rate limiting.
- Helper functions live in a **`private` schema** so Supabase does not expose them over
  `/rest/v1/rpc`. `private.next_enquiry_reference()` generates `ECR-ENQ-YYYYMMDD-NNNN`,
  daily-resetting and race-free, in **Africa/Johannesburg**.
- `enquiry_counters` deliberately has RLS on and zero policies (service role only). The
  Supabase linter reports this as INFO; it is intentional and documented as a table comment.
- Security advisors: **all WARN-level findings cleared.**

## Build log

Append at the end of every session. Every future session starts by reading this file.

### Session 1 — 31 August 2026 — Foundations & data
**Scope:** create site, brand foundations, CMS schema, seed catalogue. No page design.

- Read all four project files in full. Plan is 551 lines; master prompt 391.
- Verified source data by parsing both CSVs: **62 equipment / 11 categories / 149 tools**.
  All slugs unique in both files. Equipment CSV is UTF-8, no BOM; contains 24 × U+2014 EM DASH
  and 5 × U+2013 EN DASH. Tools CSV is pure ASCII. No `×` (U+00D7) present in either file
  despite the brief mentioning it — the dashes are the encoding risk to watch on import.
- Wix MCP handshake confirmed. `ListWixSites` returned 12 unrelated sites; no EC Rentals site
  existed. `WixREADME` protocol read and followed (docs-first discovery before any API call).
- Searched Wix **Studio** templates across four queries; reviewed 10 candidates as rendered
  pages, not by name. Presented a shortlist of six. Client chose **T.ROAD (3623)**.
- Site created from template 3623. Renamed to EC Rentals via `update-business-profile`.
- Installed the **Wix CMS app** (`e593b0bd-b783-45b8-97c2-873d42aacaf4`) — a fresh Studio site
  does not have it, and every `wix-data` call fails `WDE0110` until it is installed.
- Created all **7 collections** with correct field types. Created 3 unique `slug` indexes
  (uniqueness in Wix Data is an **index** property, not a field flag — there is no `unique`
  on the Field schema).
- Seeded **11 categories / 62 equipment / 149 tools**. Verified: 0 unresolved category
  references, 0 missing fields, 62/62 correct numeric and boolean types, 0 mojibake,
  13 items carrying em-dashes and 4 carrying en-dashes intact.
- Set site SEO description + `noindex`. Added the staging guard noted above.

### Session 2 — 31 August 2026 — Brand red, imagery, homepage design

- **Brand red resolved** to `#BA1B20` (see the token table). `#D32027` retired everywhere.
- **ECR028 (10T TCM Forklift) deactivated** — client confirmed sold. `active:false`, `fleetQty:0`,
  fleet number annotated. Forklifts is now a 1-item public category.
- **32 client images ingested.** Filenames carry fleet numbers, so they were joined to Equipment
  by parsing ECR codes (including ranges like `ECR094–ECR099`) and matching `fleetNumbers`.
  **31 of 62 items matched, 0 ambiguous, 0 files unmatched.** They are studio product shots on
  near-black grounds — ideal for the charcoal/black system; use `object-fit:contain` on a
  `#0A0A0B` ground, never a photo frame.
- Web-optimised set written to **`Images/web-optimised/`** — 32 × `.webp`, **named by slug**
  (matching the CSV's `{slug}.webp` convention), all ≤300 KB, 1.4 MB total.
  **Next action: bulk drag-drop that folder into the Wix Media Manager, then patch
  `Equipment.image` by filename.** (The MCP upload tool refuses local paths and needs
  base64/public URL — pushing 32 files through it costs far more than a drag-drop.)
- Homepage designed and published as an artifact: all 13 sections, real copy, real imagery,
  live CMS counts. Local preview copy at `homepage-preview.html`.

### Session 3 — 31 August 2026 — Cinematic banner set

- **No image-generation tool exists in this environment.** Verified, not assumed. Procedural
  photorealism was attempted (fBm skies, perspective ground, haze, god-rays) and rejected —
  it read as CGI, not photography. Pivoted to a **graphic treatment**: real machines on a
  brand-graded field. Reads as intentional poster art rather than failed photo.
- **13 wide banners** in `Images/Generated/` (2.3 MB total), all ≤300 KB, sized 21:9 / 3:2 / 16:9.
  Every machine sits left-of-centre with negative space right — that's the headline zone,
  so do not centre type over these.
- Compositor lives at `scratchpad/cine.py` — adaptive cutout (`cutout2` samples the actual
  border colour, so it handles grey studio backdrops as well as black), brand field, rim
  light, contact shadow, and the §5.4 grade. Re-runnable if more machine shots arrive.
- **`Images/Generated/IMAGE-BRIEF.md`** — paste-ready prompts for the 8 shot groups that need
  a real generator or photographer, with a global style suffix and the hard rules
  (generic machinery only, no invented certification marks, alt text mandatory).

**Imagery gaps — still to shoot:** HV Diagnostics & Testing, Trailers (both categories have zero
photography), operator portraits in PPE, the coverage map, and a higher-resolution Hino 700 +
Palfinger shot (the supplied one is only 642×348 — too small for the hero the plan specifies,
so the Case CX220C excavator is standing in).

**Carried into session 2**
1. **Theme colours and text styles were NOT set** — Wix exposes no REST API for Studio theme
   colours or typography. This is editor-only work. Apply the tokens above manually in Studio
   (Site Design → Colours / Text Styles), and load Archivo + Inter there.
2. **Homepage `<title>` not set** — `title` is an *item-level* tag, rejected at site level by
   the SEO API. Set on the homepage in Studio, or via the Item SEO Tags API:
   `EC Rentals | Plant, Vehicle & Operator Hire | Vanderbijlpark`
3. **Site locale is wrong** — US / America/Chicago / USD. Needs South Africa /
   Africa/Johannesburg / ZAR. No documented REST update method was found; change it in the
   dashboard (Settings → Business Info). Session 3's enquiry timestamps depend on it (SAST).
4. **Images are empty by design.** `image` in the CSV is always exactly `{slug}.webp`, so no
   information was lost. Derive filenames from the slug when the real photography lands.
5. **Enquiries/EnquiryItems are `insert: ADMIN`.** The session-3 web module must use elevated
   permissions to write to them. This was chosen over `insert: ANYONE` so bots cannot write
   directly to a collection holding customer contact details.
6. `EquipmentCategories.description` deliberately left empty — pending sign-off on the
   benefitLine voice before that copy scales to 11 descriptions.

