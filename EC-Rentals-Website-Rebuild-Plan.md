# EC Rentals — Website Rebuild
## Analysis, Design Direction & Implementation Plan

**Client:** EC Rentals (Pty) Ltd · Lead EPC Building, Cnr Hertz & Becquerel St, Vanderbijlpark
**Current site:** https://ecrentals.co.za (WordPress + Elementor 4.2.3)
**Target platform:** Wix Studio, built via Claude Code + Wix MCP
**Prepared:** 31 August 2026

---

## 1. Executive Summary

EC Rentals presents itself online as a tool-and-bakkie hire company. The rental register tells a very different story.

The register documents **103 active owned assets** (plus 6 sold / written-off / reconditioning) deployed across **ArcelorMittal Vanderbijlpark, Sasol Sasolburg, Northam Zondereinde, Ivanplats Mokopane, Tutuka Power Station, Doornhoek, Avondale, Damlaagte and Ilikwa** — blue-chip mining, steel, petrochemical and power projects. On top of the owned fleet, EC Rentals **brokers and manages** telehandlers up to 10 t, cherry pickers to 26 m, a 110 t mobile crane, and roughly 90 container units for full site establishment. They place **certified operators** on client sites. They run **solar pile-driving rigs**. They own **HV cable diagnostic equipment** that most hire companies don't.

That is not a tool hire shop. That is a **managed plant and logistics partner to heavy industry** — and it is exactly the space Barloworld Equipment occupies and communicates so well.

**The strategic move for the rebuild is therefore not a facelift. It is a repositioning**, expressed through:

1. A three-tier offer — **Owned Fleet · Managed Hire · Operators & Site Services** — instead of a flat product list.
2. An **Industries** layer (Mining · Power & Energy · Petrochemical · Steel · Renewables · Civils · Agriculture) that lets a procurement manager see themselves immediately.
3. Proof: named blue-chip sites, load-test certification, operator certification, service and maintenance discipline — all of which the register evidences and the current site never mentions.
4. A **multi-item enquiry basket** ("Add to Enquiry" → review → submit) that replaces the current single long form, mirroring Barloworld's *Enquiry Basket* pattern.

---

## 2. Audit — Current Site (ecrentals.co.za)

### 2.1 Structure

| Page | URL | Assessment |
|---|---|---|
| Home | `/` | Headline *"Get The Job Done."* / *"For All Your Vehicle, Machinery & Tool Rental Needs"*. Solid, blunt, but reads SME-generic. |
| Products & Services | `/services/` | Lists only **~11 items** across Site Machinery, Vehicles, HV Diagnostics, Tools. Represents perhaps 10% of actual capability. |
| Gallery | `/gallery/` | 14 uncaptioned images in a flat grid. No context, no proof value. |
| Contact | `/contact/` | Name, E-mail, Contact Number, Message. Google Map embed. Social links include **Google Plus** (defunct since 2019). |
| Get A Quote | `/quote/` | Four repeatable sections (Vehicles & Trailers, Site Machinery, HV Diagnostics, Tools) each with dropdown + qty + days + collection date, then contact block. |

### 2.2 What is genuinely good and must be preserved

- **The quote form's data model is right.** Item + quantity + number of days + collection date, repeatable, then contact details. That is the correct shape for hire enquiry. The new enquiry basket keeps this model and simply gives it a modern interface.
- **The 149-item tool dropdown** is a real asset — a complete, granular tool catalogue that most competitors don't publish. It should become a searchable, filterable tool catalogue rather than a dropdown buried in a form.
- **Positioning line** *"Making the completion of your projects possible by any means necessary"* is strong. Keep it as a supporting line.
- Contact details, address, the Vanderbijlpark anchor.

### 2.3 Gaps

| Gap | Impact |
|---|---|
| ~90% of the fleet is invisible online | Buyers assume EC Rentals can't supply excavators, telehandlers, cranes, tractors, generators, buses |
| No industries / sectors framing | Mining and petrochemical procurement can't self-identify |
| No proof — no client names, projects, certifications, safety credentials | Fails the credibility test for tier-1 vendor onboarding |
| No operator-supply offer visible | A significant, high-margin service line is unsold |
| No site-establishment (container) offer visible | Same |
| Flat gallery, no case studies | Nothing to justify a premium position |
| Single monolithic quote form | High friction, no browsing, no basket |
| Defunct Google Plus link, thin footer | Reads dated |
| No POPIA privacy notice / hire T&Cs | Compliance and procurement risk |
| Elementor page-builder aesthetic | Reads SME, not executive |

### 2.4 Migration note (important)

The current site is **WordPress + Elementor**, not Wix. This is a **platform migration**, not an edit:

- Domain `ecrentals.co.za` must be re-pointed to Wix (nameservers or A/CNAME).
- **Email is the risk.** `info@` and `sales@ecrentals.co.za` must be preserved — audit current MX records *before* touching DNS, and carry MX/TXT/SPF/DKIM across unchanged.
- Build on a Wix staging URL first; cut DNS over only after sign-off.
- 301 redirect map required: `/services/` → `/equipment`, `/quote/` → `/enquiry`, `/gallery/` → `/projects`, `/contact/` → `/contact`.
- Export the existing 14 gallery images from `/wp-content/uploads/` before decommissioning.

---

## 3. Benchmark Analysis

### 3.1 Barloworld Equipment — the primary reference

**Information architecture.** Eight top-level items (About, Careers, Resources, Contact, Equipment, Power, Parts, Digital Toolbox) with a secondary tier for Maintenance & Repair, Training, Insights, On Offer, Finance, Testimonials. The lesson is not the size — it is that **the menu sells capability, not catalogue**.

**Homepage sequence** (and why it works):

1. Hero — authority claim ("official CAT® dealer in southern Africa")
2. Featured product spotlight
3. **Service commitment** — *"Next-day parts, two-day repair"*. A specific, measurable promise, placed before any product.
4. Three value pillars — reduced downtime · cost efficiency · safety
5. Promotional band
6. Parts promotion
7. Three-column acquisition split — NEW · USED · RENTAL
8. Power solutions
9. Video testimonials
10. Company pillars — History · Partnership · Value
11. Resource download (lead magnet)

**Patterns worth taking:**

| Barloworld pattern | EC Rentals adaptation |
|---|---|
| Equipment organised **by type** (13 categories) *and* **by acquisition mode** (New/Used/Rental) | Organise **by type** (11 categories) *and* **by mode** (Owned Fleet / Managed Hire / With Operator) |
| **Enquiry Basket** — accumulate items, submit in bulk | The core of the new site. Directly solves the client brief. |
| URL-parameter category filtering (`?cat=Dozers`) | Wix Studio dynamic pages + repeater filters (`/equipment/telehandlers-access`) |
| Specific uptime promise above the fold | *"Certified. Serviced. On site."* + a response-time commitment |
| Value pillars: downtime · cost · safety | Uptime · Compliance · One partner, whole site |
| Country selector | Not needed — replace with a **Coverage** module (Gauteng, Mpumalanga, Limpopo, North West, Northern Cape, cross-border) |
| Video testimonials | Project case-study cards from named sites |
| Resource download | "Fleet & Capability Schedule" PDF — a genuine lead magnet built from the register |
| Dark grounds + single high-chroma brand colour (CAT yellow) | Charcoal/black grounds + EC red, with red→orange→amber gradient as the accent system |

**Visual language:** sans-serif throughout; dark backgrounds; machinery photographed in operational context, not on white; full-width heroes with layered imagery and text overlay; three-column grids; card-based offerings.

### 3.2 Riviera Hire — the local-scale reference

Riviera is the "how a mid-size SA plant hire firm should look" reference, and it is closer to EC Rentals in size.

**Homepage sequence:** Hero (`RIVIERA HIRE` / `EARTHMOVING & PLANT HIRE SOLUTIONS` + a credibility paragraph opening with "since 2004") → "Your earthmoving partner" narrative block → **four service cards** (TLB Hire · Excavator Hire · Attachment Hire · Transport Hire), each with a one-line benefit and READ MORE → **stat band** (100% Commitment · 50+ Staff · 30+ Years · 200+ Happy Clients) → integrity/service narrative → **named contact directory** (sales executives, director, accounts — each with direct mobile and email) → address.

**Patterns worth taking:**

| Riviera pattern | EC Rentals adaptation |
|---|---|
| Category cards with a **benefit line**, not a spec line ("Ideal for trenching, digging & general site support") | Every equipment category card leads with the job it does |
| Animated **stat band** | `103` owned assets · `11` equipment classes · `6` blue-chip industrial sites · `24 hr` quote turnaround |
| **Named humans with direct numbers** | Huge trust signal in SA B2B. Publish a real contact directory — sales, operations, accounts. |
| Founding-year credibility in the first paragraph | Insert EC Rentals' founding year (client to confirm) |
| Plain-language honesty ("honest guidance", "responsive technical support") | Keep EC Rentals' blunt voice — it is an asset |

**What to do better than Riviera:** their equipment is described but not individually catalogued, and there is no basket or online enquiry flow. EC Rentals' 62-line catalogue and enquiry basket will be a clear competitive advantage.

---

## 4. Register Analysis — What EC Rentals Actually Owns

Parsed from `2026 EC Rentals Management Register.xlsx` (7 sheets).

### 4.1 Owned fleet — 103 active assets

| Category | Units | Highlights |
|---|---:|---|
| Vehicle Hire — LDVs & Bakkies | 32 | Hilux 2.4 GD-6 D/C ×9, GD-6 S/C ×8, GD S/C w/ cable rack ×3, VVTi S/C ×4, NP200 ×3, H100 ×2, 4x4, V6, extended cab |
| Tractors & Agricultural | 18 | Case JX75 ×6, tractor trailers ×5, slashers ×4, Massey Ferguson ×2, 2-tine ripper |
| Trailers | 15 | 6 m flatbed ×4, box trailers ×4, V-Tec 4 m / 6 m, cable trailer, water trailer, 10 t UBT drawbar, CVE |
| Power & Site Support | 9 | 23/30/50 kVA gensets ×5, 500 L diesel bowsers ×2, cable trolleys ×2 |
| Personnel Transport | 7 | Sprinter 23s, VW Crafter 23s, Quantum 14s ×2, 16s ×2, 10s |
| Earthmoving & Material Handling | 7 | Case CX220C excavator, Case TLB ×2, skid steer, MultiOne ×2, Wulf mulcher |
| Solar & Piling | 6 | Ramming pile drivers (solar PV) |
| Cranes, Trucks & Logistics | 4 | SAMAG 10 t + 8 t HI-AB, Hino 700 11 t + 8.3 t Palfinger ×2, MAN 33.480 35 t + step-deck, Hino 500 tipper |
| Telehandlers (owned) | 2 | JCB, Haulotte |
| HV Diagnostics & Testing | 2 | HVA60 VLF tester, Sherla sheath fault locator 0–10 kV |
| Forklifts | 1 | Zoomlion 3.5 t (the 10 t TCM is recorded as **sold** — see §4.5) |
| **Total** | **103** | |

**Deployment (a proof asset in itself):** EC Yard 31 · Ilikwa 24 · ArcelorMittal Vanderbijlpark 14 · Northam Zondereinde 14 · Tutuka Standerton 9 · Various 3.

### 4.2 Managed / brokered hire — the hidden second business

- **Telehandlers & access** (`Telehanders` sheet, ~36 PO lines): 2.5 t (2505), 3.5 t (3512), **4 t (4017) — by far the most-hired unit**, 9 t, 10 t (HTH10), 12.5 m trailer-mount cherry picker, 26 m cherry picker, **110 t mobile crane**, forks and attachments. Client-facing sites include Sasol, Barrage Vanderbijlpark, Klerksdorp, Damlaagte, Avondale, Zondereinde, Doornhoek, Rustenburg, and Johnson Crane Hire as a named partner.
- **Site establishment** (`Containers` sheet, ~90 lines): 3 m / 6 m / 12 m offices, stores, ablutions and kitchens, sourced via Container Park, Container Conversion, Big Box Containers and Mobile Office & Parkhome Solutions.
- **Sub-hired vehicles** (`U RENT` sheet, ~26 units): D/C and S/C LDVs and 14-seater Quantums under account ECRE9001 — evidence that EC Rentals scales its fleet on demand rather than turning work away.

**This is a headline capability, not a back-office detail.** "If we don't own it, we source, manage and certify it" is a genuine differentiator against pure fleet owners.

### 4.3 Operators & certification

`Operator Placements` records named operators against machines and projects (MultiOne, ramming machines, telehandler, TLB at Sasol LP3284 and Ivanplats). The register also tracks **load-test expiry dates**, **licence expiry**, **service intervals and next-service-due km** per asset.

**Turn this into marketing copy:** *"Every machine leaves our yard load-test certified, licence-current and serviced to schedule — because we track all three per asset, every month."*

### 4.4 Tool catalogue — 149 items

Extracted verbatim from the existing quote form and reorganised into 7 sub-categories: Hand Tools (57) · Electrical & Cabling (29) · Power Tools (27) · Pipe & Hydraulic (10) · Measurement & Survey (10) · Lifting & Material Handling (10) · Safety & Site Equipment (6). Delivered as `ec-rentals-tools-catalogue.csv`.

### 4.5 Data hygiene flags for the client

- `ECR028` (10 t TCM Forklift) is listed under **Sold** yet still appears in the live quote form's machinery dropdown — confirm before publishing.
- `ECR046` (Hilux S/C) is listed under **Write off** — excluded from the catalogue.
- `ECR116–ECR119` (slashers) have no registration or location recorded.
- `ECR021` Zoomlion forklift load test shows **2024-09-05** — expired. Load-test currency is a claim the new site will make publicly; the register should be clean before that claim goes live.
- Spelling in the register to correct for public use: "Zoonlion" → Zoomlion, "Hauloutte" → Haulotte, "Wulf Multcher" → Wulf Mulcher, "Cabel" → Cable.

---

## 5. Design Direction

### 5.1 Positioning statement

> **EC Rentals — Plant, vehicles and operators for South Africa's heavy industry.**
> Certified. Serviced. On site.

Supporting line (retained from current site): *"Making the completion of your projects possible by any means necessary."*

### 5.2 Colour system

The owner asked for the existing red and black to be joined by charcoal grey and red→yellow/orange gradients. The system below does that while keeping red rare enough to stay powerful.

| Token | Hex | Role |
|---|---|---|
| `--ecr-red` | `#D32027` | Primary brand. CTAs, active states, rules. **Sample the exact value off the client's logo file before locking.** |
| `--ecr-red-dark` | `#A5161C` | Hover / pressed |
| `--ecr-orange` | `#F97316` | Gradient mid-stop, secondary accent |
| `--ecr-amber` | `#F5A524` | Gradient end-stop, stat figures, icon strokes |
| `--ecr-black` | `#0A0A0B` | Hero and footer grounds |
| `--ecr-charcoal` | `#1C1E21` | Primary dark surface — cards, nav, section bands |
| `--ecr-charcoal-2` | `#2A2D31` | Raised surface, card hover, borders on dark |
| `--ecr-steel` | `#6B7280` | Secondary text on dark, metadata |
| `--ecr-concrete` | `#E8E9EB` | Light section divider, table rules |
| `--ecr-offwhite` | `#F5F6F7` | Light section ground |
| `--ecr-white` | `#FFFFFF` | Card ground on light sections |

**Signature gradient** — use deliberately and sparingly: hero headline accent word, primary CTA fill, active category underline, stat figures, section top-rules.

```css
--ecr-gradient: linear-gradient(100deg, #D32027 0%, #F97316 55%, #F5A524 100%);
--ecr-gradient-subtle: linear-gradient(180deg, rgba(211,32,39,0.14) 0%, rgba(249,115,22,0) 100%);
```

**Rules of use**
- Default ground is **charcoal or black**. Light sections are the exception, used to create rhythm — roughly: dark hero → dark categories → light proof/stats → dark industries → light projects → dark CTA → black footer.
- Red is for **one action per viewport**. If two things are red, neither is the action.
- Never place body text on the gradient. Gradient carries display type, fills and rules only.
- Amber/orange handle *information* (stats, icons, badges); red handles *action*.
- Accessibility: minimum 4.5:1 for body text. `#D32027` on `#0A0A0B` is not sufficient for small text — use white or `#F5F6F7` for body on dark, and reserve red for large display type, fills and iconography.

### 5.3 Typography

| Role | Face | Treatment |
|---|---|---|
| Display / H1–H2 | **Archivo** 700–800 (fallback: Oswald) | Uppercase, tracking `-0.02em`, tight leading `0.95–1.05` |
| Eyebrow / label | **Archivo** 600 | Uppercase, tracking `+0.14em`, 12–13 px, in amber or steel |
| Body / H3–H4 | **Inter** 400/500/600 | 17–18 px body, leading 1.65, max measure 68ch |
| Numerals / specs | **Inter** tabular-nums | Stat band, spec tables, fleet counts |

Both are on Google Fonts and available in Wix Studio. Alternate pairing if the client wants more weight: **Anton** (display) + **Barlow** (body).

### 5.4 Imagery direction

**Priority: real photography of the actual fleet.** Barloworld's credibility comes from equipment photographed on real sites. Ask EC Rentals for a shoot at the EC Yard plus one live site — this is the single highest-leverage investment in the whole project.

**Shot list to request:**
1. Hero — Hino 700 with Palfinger crane extended, low three-quarter angle, dusk or overcast, site in background
2. One clean three-quarter product shot per equipment category (11 shots) — consistent angle and height
3. Operator portraits in PPE, mid-task, shallow depth of field (4–6)
4. Yard wide shot showing fleet scale
5. Detail texture — tyre tread, hydraulic ram, load-test tag, service sticker, EC decal (6–8, for section backgrounds and dividers)
6. Solar pile driver working on a PV site (differentiator — no competitor has this)

**Interim / gap-fill:** AI-generated or licensed stock, treated to a single consistent grade — desaturated mid-tones, lifted blacks to charcoal not pure black, warm highlight bias to sit with the amber accents. Every generated image must be **generic machinery in generic settings** — never a real client's branding, plant or site.

**Treatment rules:** charcoal-to-transparent gradient scrims under all overlay text; 16:9 hero, 4:3 category cards, 3:2 project cards; `.webp` throughout; hero ≤ 300 KB, cards ≤ 120 KB; every image gets descriptive alt text (an SEO win the current site forfeits entirely).

### 5.5 Motion & interaction

Restrained and mechanical. Machinery is heavy — the interface should feel weighted, never bouncy.

| Element | Behaviour |
|---|---|
| Global easing | `cubic-bezier(0.22, 1, 0.36, 1)`, 320–480 ms |
| Section entrance | Fade + 24 px rise, staggered 60 ms per child, triggered at 15% viewport, **fires once** |
| Hero | Slow 8 s scale 1.0→1.06 on the background image; headline words rise in sequence; gradient rule wipes left→right on load |
| Stat band | Count-up on first view, 1.2 s ease-out, tabular numerals so digits don't jitter |
| Equipment card hover | Lift 4 px, shadow deepens, image scales 1.04 inside a fixed frame, gradient rule wipes across the bottom edge, "Add to Enquiry" fades up from the base |
| Category nav | Active pill fills with the gradient; inactive shows a 2 px charcoal-2 underline |
| Sticky header | Transparent over hero; on scroll past 80 px, collapses to charcoal with a hairline bottom border and a compact logo |
| Enquiry basket | Badge count pulses once on add; slide-over panel from the right, 380 ms |
| Parallax | Background layers only, max 12% offset. Never on text. |
| Buttons | Gradient fill on primary; on hover the gradient shifts position, no size change |
| Accessibility | Honour `prefers-reduced-motion: reduce` — disable parallax, count-ups and entrance transforms; keep opacity fades |

---

## 6. Information Architecture

```
/                             Home
/equipment                    Equipment hub — all 11 categories
  /equipment/{category}       Dynamic category page (11)
  /equipment/item/{slug}      Dynamic item page (62)
/tools                        Tool hire — searchable catalogue (149 items)
/services                     Services hub
  /services/plant-hire
  /services/operator-supply
  /services/site-establishment
  /services/hv-diagnostics
  /services/transport-logistics
  /services/solar-piling
/industries                   Industries hub
  /industries/{sector}        Mining · Power & Energy · Petrochemical ·
                              Steel & Heavy Industry · Renewables ·
                              Construction & Civils · Agriculture
/about                        Company, story, coverage map
  /about/safety-compliance    Load testing, licensing, service discipline, PPE
  /about/team                 Named contact directory (Riviera pattern)
/projects                     Case studies / gallery, filterable by sector
/enquiry                      Enquiry basket → checkout form
/contact                      Contact + "Reason" dropdown form
/privacy-policy               POPIA notice
/terms-of-hire                Hire terms & conditions
```

**Primary navigation:** Equipment · Tools · Services · Industries · About · Contact — with a persistent **Enquiry (n)** basket button in red on the right.

### 6.1 Homepage section order

1. **Hero** — full-bleed video or stills of the crane truck / excavator working. H1: `PLANT, VEHICLES & OPERATORS FOR HEAVY INDUSTRY` with `HEAVY INDUSTRY` in gradient. Sub: *Certified. Serviced. On site.* Two CTAs: **Browse Equipment** (gradient) · **Request a Quote** (ghost). Scroll cue.
2. **Trust band** — thin charcoal strip: `Vanderbijlpark-based · Nationwide delivery · Cross-border capable · Operators supplied · 24-hour quote turnaround`.
3. **Equipment categories** — 11 cards, 3-up desktop / 2-up tablet / 1-up mobile. Photo, category name, benefit line, unit count, `View →`.
4. **Capability pillars** (Barloworld's value-pillar slot) — three columns: **Uptime** (serviced to schedule, tracked per asset) · **Compliance** (load-test certified, licence-current, certified operators) · **One Partner** (owned fleet, managed hire, operators, containers — one number, one invoice).
5. **Stat band** — dark, gradient numerals, count-up: `103` assets owned · `11` equipment classes · `6` major industrial sites served · `24 hr` quote turnaround.
6. **Managed Hire feature** — the differentiator section. "Don't see it? We'll source it." Telehandlers to 10 t, cherry pickers to 26 m, cranes to 110 t, full container site establishment.
7. **Industries** — 7 tiles with sector imagery, linking to sector pages.
8. **Projects / proof** — three case-study cards from named sites (with client permission).
9. **Operators & site services** — split layout, operator portrait left, capability copy right.
10. **Tool hire teaser** — "149 tools in stock" with a live search field that deep-links into `/tools`.
11. **Coverage** — SA map, provinces highlighted, cross-border note.
12. **CTA band** — full-width gradient. *"Tell us what the job needs. We'll tell you what it takes."* → Request a Quote.
13. **Footer** — charcoal/black. Four columns: equipment categories · services · company · contact block with both numbers, both emails, address, hours. Legal row: POPIA, terms, company registration. **Remove the Google Plus link.**

### 6.2 Equipment category page

Sticky category filter rail (11 categories) · secondary filters: Ownership (Owned / Managed), Operator available (Yes/No), Delivery class · card grid · each card has **Add to Enquiry** inline · "Can't find it? Request a managed hire" CTA at the foot.

### 6.3 Equipment item page

Image gallery · title + category eyebrow · short description · spec table (from the `specs` field) · availability/fleet-size badge · **quantity + hire duration + required-from date + Add to Enquiry** · "Operator available" badge where applicable · related items in category · downloadable spec sheet (phase 2).

---

## 7. Enquiry Basket — Functional Specification

This is the heart of the brief: *"something similar to an online store — but for hiring equipment."*

### 7.1 Flow

```
Browse category → card "Add to Enquiry"
      ↓ (item, qty, days, required-from date held in session)
Header badge increments, slide-over confirms
      ↓
/enquiry — review basket: edit qty / days / date, remove lines
      ↓
Contact block: Name · Company · Email · Phone · Delivery site or town ·
               Reason (dropdown) · Project start date · Notes
      ↓
POPIA consent checkbox + honeypot/CAPTCHA
      ↓
Submit → backend web module
      ↓
1. Write to `Enquiries` + `EnquiryItems` CMS collections
2. Generate reference: ECR-ENQ-YYYYMMDD-0001
3. Email info@ecrentals.co.za — itemised table + contact details
4. Auto-acknowledgement to enquirer with reference number
5. Create/update Wix CRM contact
      ↓
/enquiry/thank-you — reference number, expected response time, phone numbers
```

### 7.2 CMS collections (Wix Data)

**`Equipment`** — 62 items, seeded from `ec-rentals-catalogue.csv`

| Field | Type | Notes |
|---|---|---|
| `title` | Text | Display name |
| `slug` | Text | URL key, unique |
| `category` | Reference → `EquipmentCategories` | |
| `shortDescription` | Text | Card + meta description |
| `specs` | Text | Pipe-delimited; split to a list on render |
| `fleetQty` | Number | Units owned |
| `fleetNumbers` | Text | Internal reference, not displayed |
| `ownership` | Text | `Owned` / `Managed` |
| `operatorAvailable` | Boolean | |
| `deliveryClass` | Text | `Light` / `Standard` / `Heavy` |
| `image` | Image | Primary |
| `gallery` | Media gallery | Secondary |
| `sortOrder` | Number | |
| `active` | Boolean | Publish flag |

**`EquipmentCategories`** — 11 items: `title`, `slug`, `benefitLine`, `image`, `icon`, `sortOrder`, `description`

**`Tools`** — 149 items from `ec-rentals-tools-catalogue.csv`: `title`, `slug`, `toolCategory`, `active`

**`Enquiries`** — `reference`, `name`, `company`, `email`, `phone`, `deliverySite`, `reason`, `projectStartDate`, `notes`, `itemsSummary` (denormalised text for the email body), `status` (New / Quoted / Won / Lost), `submittedAt`, `consent`

**`EnquiryItems`** — `enquiry` (Reference → `Enquiries`), `equipment` (Reference → `Equipment`), `itemTitle`, `quantity`, `days`, `requiredFrom`

**`Projects`** — `title`, `client`, `sector`, `location`, `summary`, `equipmentUsed`, `image`, `year`

### 7.3 "Reason" dropdown — contact form and enquiry checkout

Per the brief, extended to cover the register's real capability:

```
Quotation
Heavy Machine Rental
Vehicle Hire
Truck Hire
Tractor Hire
Forklift Hire
Telehandler & Access Hire
Crane Hire (Managed)
Plant Operator Supply
Site Establishment (Containers)
HV Cable Testing & Fault Location
Solar Piling
Tool Hire
Long-Term / Project Hire
Cross-Border Hire
Careers
General Enquiry
```

### 7.4 Technical approach in Wix

| Layer | Implementation |
|---|---|
| Basket state | `wix-storage-frontend` **session** storage, JSON array of `{equipmentId, title, qty, days, requiredFrom}`. Survives page navigation, clears on browser close. |
| Header badge | Global site code (`masterPage.js`) reads session storage on `$w.onReady`, updates badge, subscribes to a lightweight pub/sub via `wix-window-frontend` |
| Add to Enquiry | Repeater `onItemReady` → button handler → push to session array → animate badge |
| Basket page | Repeater bound to the session array, inline qty/days/date editing, remove handler |
| Submit | Web module `backend/enquiry.web.js` exporting `submitEnquiry()` — validates, inserts `Enquiries`, batch-inserts `EnquiryItems`, builds the HTML email body, sends |
| Email out | `wix-crm-backend` triggered email, **or** Wix Automation on the `Enquiries` collection's **"Item added"** trigger (Wix has deprecated the older "CMS form submitted" trigger for new automations) |
| Recipient | `info@ecrentals.co.za`, plus a CC field configurable in a `Settings` collection so EC Rentals can change it without a developer |
| CRM | `wix-crm-backend` `contacts.createContact()` / `appendOrCreateContact()` |
| Spam | Honeypot field + Wix CAPTCHA element + rate limit by IP in the web module |
| Validation | Client-side and again server-side — never trust the client |

**Fallback if Velo is out of scope:** Wix's native multi-step Form Builder plus a repeater-driven "selected items" hidden field. Weaker UX, no persistent basket. Recommended only as a phase-1 stopgap.

### 7.5 Notification email — required content

```
Subject:  New Hire Enquiry — {reference} — {company}

REFERENCE:      ECR-ENQ-20260901-0042
SUBMITTED:      1 Sept 2026, 14:32 SAST
REASON:         Telehandler & Access Hire

EQUIPMENT REQUESTED
┌────────────────────────────────┬─────┬──────┬──────────────┐
│ Item                           │ Qty │ Days │ Required from│
├────────────────────────────────┼─────┼──────┼──────────────┤
│ 4T Telehandler (4017)          │  2  │  60  │ 15 Sept 2026 │
│ 30kVA Diesel Generator         │  1  │  60  │ 15 Sept 2026 │
│ Toyota Hilux 2.4 GD-6 D/C      │  3  │  90  │ 10 Sept 2026 │
└────────────────────────────────┴─────┴──────┴──────────────┘

CONTACT
Name:           Johan Meyer
Company:        Northam Platinum — Zondereinde
Email:          j.meyer@example.co.za
Phone:          +27 82 000 0000
Delivery site:  Zondereinde Mine, Thabazimbi
Project start:  15 September 2026

NOTES
Operators required for both telehandlers. Site induction on 12 Sept.

[ Open enquiry in dashboard ]
```

---

## 8. SEO, Performance & Compliance

**SEO.** Every one of the 62 equipment items and 11 categories becomes an indexable page — a step change from 5 pages today. Title pattern: `{Item} Hire | EC Rentals Vanderbijlpark`. Target long-tail: *"telehandler hire Vanderbijlpark"*, *"crane truck hire Gauteng"*, *"solar pile driving South Africa"*, *"HV cable fault location South Africa"*, *"plant operator supply Mpumalanga"*. Add `LocalBusiness` and `Product` JSON-LD schema. Submit the Wix sitemap to Google Search Console. Preserve link equity with the 301 map in §2.4.

**Google Business Profile.** Claim/verify for the Vanderbijlpark address, add the fleet photo set, and link it from the site — the single cheapest local-search win.

**Performance targets.** LCP < 2.5 s on 4G, CLS < 0.1. All images `.webp` and responsive; lazy-load below the fold; hero image preloaded; limit custom fonts to 2 families × 3 weights.

**Compliance.** POPIA privacy notice with an explicit consent checkbox on every form and a stated retention period. Cookie banner. Hire terms & conditions page. Company registration and VAT number in the footer.

**Accessibility.** WCAG 2.1 AA: 4.5:1 text contrast, visible focus rings, keyboard-navigable basket, alt text on every image, `prefers-reduced-motion` honoured.

---

## 9. Build Approach & Phasing

### 9.1 What Claude Code + Wix MCP can and cannot do — read this first

Setting expectations honestly saves a week of frustration.

**The Wix MCP is strong at:**
- Searching Wix REST / SDK / Velo / Design System documentation
- Listing sites, fetching site context, creating and publishing sites at account level
- Executing Wix REST API calls — **including creating CMS collections and bulk-inserting data items**
- Uploading images into the Media Manager

**The Wix MCP does not:**
- Lay out pages visually in the Wix editor. There is no "design this page" tool. Page composition is done by a human in **Wix Studio**, guided by the section-by-section spec in this document.

**Therefore the realistic division of labour is:**

| Work | Who / how |
|---|---|
| Site creation, CMS collections, data seeding, media upload | **Claude Code + Wix MCP** (REST API) |
| Velo backend, basket logic, email automation, custom elements | **Claude Code + Wix CLI**, local files, git deploy |
| Page layout, responsive breakpoints, animation panel settings | **Human in Wix Studio**, following §6 |
| Copy, spec text, alt text, SEO meta | **Claude Code**, pasted or pushed via CMS |
| Photography / image generation | **Client shoot + generated gap-fill** |

Use **Wix Studio**, not the classic Wix Editor — Studio is required for proper responsive control, the Wix CLI, and the eCommerce validation SPI patterns.

### 9.2 Phasing

| Phase | Scope | Output |
|---|---|---|
| **0 — Foundations** (2–3 days) | Wix Studio site created, MCP connected, design tokens set as Studio theme colours/text styles, fonts loaded, staging URL live | Empty but branded shell |
| **1 — Data** (2 days) | `EquipmentCategories`, `Equipment`, `Tools`, `Projects`, `Enquiries`, `EnquiryItems` collections created via MCP; CSVs imported; placeholder imagery uploaded | Populated CMS |
| **2 — Core pages** (5–7 days) | Home, Equipment hub, dynamic category + item pages, Tools, Contact | Browsable site |
| **3 — Enquiry basket** (4–5 days) | Session basket, badge, slide-over, `/enquiry` page, backend web module, email automation, thank-you page, spam protection | Working enquiry flow |
| **4 — Depth** (4–5 days) | Services (6), Industries (7), About, Safety & Compliance, Team, Projects | Full site |
| **5 — Polish** (3–4 days) | Motion, hover states, responsive QA at 4 breakpoints, SEO meta, schema, alt text, POPIA + T&Cs | Launch-ready |
| **6 — Cutover** (1 day + monitoring) | MX audit, DNS switch, 301 redirects, Search Console, GA4, form-delivery test to a real inbox | Live |

**Indicative total: 4–5 weeks**, assuming photography runs in parallel from week 1.

### 9.3 Risks

| Risk | Mitigation |
|---|---|
| Email breaks at DNS cutover | Record all MX/TXT/SPF/DKIM before changing anything; change nameservers only after confirming Wix will host DNS with those records intact; test `info@` immediately after |
| Enquiry emails land in spam | Verify the sending domain in Wix; SPF/DKIM alignment; send a live test to Gmail, Outlook and the client's actual mailbox before launch |
| No real photography → generic stock undermines the premium claim | Book the yard shoot in week 1. This is the highest-risk item for perceived quality. |
| Register data is out of date on the public site (expired load tests, sold assets) | Publish *capabilities and classes*, not live availability. Add an "availability confirmed on quotation" line. Fix the flags in §4.5 first. |
| Scope creep into a full booking/payment system | Explicitly out of scope for v1. Enquiry only — pricing stays a human conversation, which suits project hire. |
| Client names published without permission | Get written sign-off per case study; otherwise describe as "a tier-1 platinum producer in Limpopo" |
| Velo complexity exceeds available skills | Phase 3 has the native-forms fallback in §7.4 |

---

## 10. Deliverables in this pack

| File | Contents |
|---|---|
| `EC-Rentals-Website-Rebuild-Plan.md` | This document |
| `EC-Rentals-Master-Prompt.md` | Copy-paste master prompt for Claude Code + Wix MCP, plus the MCP setup guide |
| `ec-rentals-catalogue.csv` | 62 equipment items across 11 categories, ready for Wix CMS import |
| `ec-rentals-tools-catalogue.csv` | 149 tools across 7 sub-categories, ready for Wix CMS import |

---

## 11. Open questions for the client

1. **Founding year** — needed for the credibility line ("Since 20xx").
2. **Exact brand red** — supply the logo as SVG/AI so the hex can be sampled rather than guessed.
3. **Client-name permissions** — may we name ArcelorMittal, Sasol, Northam, Ivanplats, Eskom Tutuka in case studies? If not, sector descriptions will be used.
4. **Photography** — will EC Rentals commission a yard-and-site shoot? Budget and date?
5. **`ECR028` (10 t TCM Forklift)** — sold, or still available for hire?
6. **Team directory** — which staff should appear with direct contact details (the Riviera pattern is a strong trust signal)?
7. **Container / managed hire** — should this be marketed openly as an EC Rentals service line? (Recommendation: yes, strongly.)
8. **Careers** — is EC Rentals hiring operators/drivers? If so, a Careers page adds real value.
9. **Wix plan** — Wix Studio with a Business plan or higher is required for custom code and forms.
