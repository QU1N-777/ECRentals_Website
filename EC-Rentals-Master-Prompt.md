# EC Rentals — Master Prompt & Wix MCP Setup

Two parts:
**Part A** — the step-by-step guide to connecting Wix to Claude Code.
**Part B** — the master prompt to paste into Claude Code once connected.

---

# PART A — Connecting Wix MCP to Claude Code

### Prerequisites

- **Node.js 19.9.0 or higher** — check with `node -v`
- **Claude Code** installed — `npm install -g @anthropic-ai/claude-code`
- A **Wix account** with owner or co-owner permissions on the target site
- A **Wix Studio** site (Studio, not the classic Editor — required for the CLI, responsive control and the code features this build needs)

---

### Step 1 — Add the Wix MCP server

From your project directory:

```bash
claude mcp add --transport http wix https://mcp.wix.com/mcp
```

If your Claude Code version does not support `--transport http`, use the stdio bridge instead:

```bash
claude mcp add wix -- npx -y @wix/mcp-remote https://mcp.wix.com/sse
```

Or configure it manually in `.mcp.json` at the project root:

```json
{
  "mcpServers": {
    "wix": {
      "type": "http",
      "url": "https://mcp.wix.com/mcp"
    }
  }
}
```

> Wix is also available as a **built-in connector in the Claude apps**, which needs no configuration — but for this build you want Claude Code, because you also need local file editing and the Wix CLI.

---

### Step 2 — Authenticate

```bash
claude
```

Then inside the session:

```
/mcp
```

Select **wix** → **Authenticate**. A browser window opens; log in to Wix and approve access.

Credentials are cached at `~/.mcp-auth` (macOS/Linux) or `C:\Users\<you>\.mcp-auth` (Windows). **If the connection misbehaves later, delete that folder and re-authenticate** — a stale token is the single most common failure.

---

### Step 3 — Verify

In the Claude Code session:

```
/mcp
```

You should see `wix — connected` with tools listed, including `ListWixSites`, `GetSiteContext`, `CallWixSiteAPI`, `ExecuteWixAPI`, `ManageWixSite`, `UploadImageToWixSite`, and the documentation search tools.

Then ask:

```
List my Wix sites and show me the site context for the EC Rentals site.
```

If it returns a site ID and properties, you are connected.

---

### Step 4 — Install the Wix CLI (for Velo code)

The MCP handles data and account operations. Velo backend code is edited locally and deployed with the CLI.

```bash
npm create @wix/app     # or, in an existing Studio site: enable Dev Mode, then
npx @wix/cli dev
```

In **Wix Studio**: open the site → toggle **Dev Mode** on → connect the site to a Git repository (Settings → Version control) → clone that repo locally. Claude Code then edits `backend/`, `public/` and page code files directly, and `git push` deploys.

---

### Step 5 — Set project rules

Create `CLAUDE.md` at the project root so every Claude Code session starts with the right context:

```markdown
# EC Rentals — Wix Studio Build

Platform: Wix Studio (NOT classic Wix Editor)
Site: ecrentals.co.za (currently WordPress — migrating)
MCP: wix (https://mcp.wix.com/mcp)

## Rules
- Always search Wix documentation via the MCP before writing Velo code — the APIs change.
- Backend code lives in `backend/*.web.js` (web modules). Never put secrets in frontend code.
- Use `wix-storage-frontend` session storage for the enquiry basket, never localStorage.
- All CMS writes go through backend web modules with server-side validation.
- Enquiry notifications go to info@ecrentals.co.za.
- Design tokens are defined in the plan document — never hardcode a colour that isn't a token.
- Honour `prefers-reduced-motion` on every animation.
```

---

### Step 6 — Guardrails before you let it run

1. **Work on a staging site first.** Do not point Claude Code at the live domain until sign-off.
2. **Record the current DNS.** Before any cutover, save the existing MX, TXT, SPF and DKIM records for `ecrentals.co.za` — `info@` and `sales@` depend on them.
3. **Approve destructive calls manually.** `ManageWixSite` and `CallWixSiteAPI` can delete collections. Keep permissions in ask-mode for those.
4. **Commit often.** Git history is your only undo for Velo code.

---

### Known limits — set expectations

The Wix MCP **can** create sites, create and modify CMS collections, bulk-insert data, upload media, publish, and read every Wix API doc. It **cannot** visually lay out pages in the Studio editor — there is no "design this page" tool. Page composition remains a human task in Wix Studio, guided by the section specs in the plan. Plan for Claude Code to do the data, the code and the copy; a designer does the canvas.

---

# PART B — The Master Prompt

Paste everything below into Claude Code once the Wix MCP is connected. Attach `EC-Rentals-Website-Rebuild-Plan.md`, `ec-rentals-catalogue.csv` and `ec-rentals-tools-catalogue.csv` to the project directory first.

---

````
# ROLE

You are the lead developer building a new website for EC Rentals (Pty) Ltd on Wix Studio,
using the Wix MCP connector and the Wix CLI. You have access to the Wix MCP.

Read `EC-Rentals-Website-Rebuild-Plan.md` in this directory before doing anything.
It is the specification. This prompt is the working brief.

# CLIENT

EC Rentals — plant, vehicle, tool and operator hire.
Lead EPC Building, Cnr Hertz & Becquerel Street, Vanderbijlpark, South Africa.
+27 66 429 5788 · +27 82 850 4902 · info@ecrentals.co.za · sales@ecrentals.co.za
Current site: https://ecrentals.co.za (WordPress + Elementor — being replaced)

# POSITIONING

EC Rentals is NOT a tool hire shop. It is a managed plant and logistics partner to
South African heavy industry: 103 owned assets deployed at ArcelorMittal Vanderbijlpark,
Sasol Sasolburg, Northam Zondereinde, Ivanplats Mokopane and Tutuka Power Station,
plus managed hire of telehandlers to 10 t, cherry pickers to 26 m, cranes to 110 t
and full container site establishment, plus certified operators placed on client sites,
plus solar pile driving and HV cable diagnostics.

Headline positioning:  PLANT, VEHICLES & OPERATORS FOR HEAVY INDUSTRY
Supporting line:       Certified. Serviced. On site.
Legacy line to retain: "Making the completion of your projects possible by any means necessary."

Reference sites the client admires:
- https://barloworld-equipment.com  (primary — capability-led IA, enquiry basket, dark + single accent colour)
- https://rivierahire.co.za         (secondary — benefit-led category cards, stat band, named contact directory)

# DESIGN SYSTEM — use these exact tokens, never invent colours

--ecr-red        #D32027   primary action  (sample the real value off the client logo when supplied)
--ecr-red-dark   #A5161C   hover/pressed
--ecr-orange     #F97316   gradient mid
--ecr-amber      #F5A524   gradient end, stats, icons
--ecr-black      #0A0A0B   hero + footer ground
--ecr-charcoal   #1C1E21   primary dark surface
--ecr-charcoal-2 #2A2D31   raised surface, borders
--ecr-steel      #6B7280   secondary text on dark
--ecr-concrete   #E8E9EB   light dividers
--ecr-offwhite   #F5F6F7   light ground
--ecr-white      #FFFFFF   cards on light

--ecr-gradient: linear-gradient(100deg, #D32027 0%, #F97316 55%, #F5A524 100%);

Rules:
- Default ground is charcoal or black. Light sections create rhythm, they are not the default.
- Exactly ONE red action per viewport.
- Gradient carries display type, fills and rules only — never body text.
- Amber/orange = information. Red = action.
- Body text on dark is #F5F6F7 or #FFFFFF, never red. Minimum 4.5:1 contrast.

Typography:
- Display / H1–H2: Archivo 700–800, UPPERCASE, tracking -0.02em, leading 0.95–1.05
- Eyebrow: Archivo 600, uppercase, tracking +0.14em, 12–13px, amber or steel
- Body / H3–H4: Inter 400/500/600, 17–18px, leading 1.65, max 68ch
- Numerals: Inter with tabular-nums

Motion (all easing cubic-bezier(0.22, 1, 0.36, 1), 320–480ms):
- Section entrance: fade + 24px rise, 60ms stagger, trigger at 15% viewport, fire once
- Hero: 8s slow scale 1.0→1.06 on background; headline words rise in sequence
- Stat band: count-up on first view, 1.2s ease-out
- Card hover: lift 4px, image scale 1.04 inside a fixed frame, gradient rule wipes the bottom edge
- Sticky header: transparent over hero, collapses to charcoal past 80px scroll
- Parallax: background layers only, max 12% offset, never on text
- ALWAYS honour prefers-reduced-motion: reduce

# SITEMAP

/                            Home
/equipment                   Hub — 11 categories
/equipment/{category}        Dynamic category page  (11)
/equipment/item/{slug}       Dynamic item page      (62)
/tools                       Searchable tool catalogue (149)
/services                    Hub
  /services/plant-hire · /operator-supply · /site-establishment
  /hv-diagnostics · /transport-logistics · /solar-piling
/industries                  Hub
  /industries/{sector}       Mining · Power & Energy · Petrochemical · Steel &
                             Heavy Industry · Renewables · Construction & Civils · Agriculture
/about  ·  /about/safety-compliance  ·  /about/team
/projects                    Case studies, filterable by sector
/enquiry                     Enquiry basket → checkout
/enquiry/thank-you
/contact
/privacy-policy  ·  /terms-of-hire

Primary nav: Equipment · Tools · Services · Industries · About · Contact
             + persistent red "Enquiry (n)" basket button, right-aligned.

# HOMEPAGE SECTIONS, IN ORDER

1  Hero — full-bleed machinery imagery. H1 "PLANT, VEHICLES & OPERATORS FOR
   HEAVY INDUSTRY" with "HEAVY INDUSTRY" in the gradient. Sub: "Certified. Serviced.
   On site." CTAs: [Browse Equipment] gradient · [Request a Quote] ghost. Scroll cue.
2  Trust band — Vanderbijlpark-based · Nationwide delivery · Cross-border capable ·
   Operators supplied · 24-hour quote turnaround
3  Equipment categories — 11 cards, 3-up / 2-up / 1-up. Photo, name, benefit line,
   unit count, "View →"
4  Capability pillars — Uptime · Compliance · One Partner
5  Stat band (count-up, gradient numerals) — 103 assets owned · 11 equipment classes ·
   6 major industrial sites served · 24hr quote turnaround
6  Managed Hire feature — "Don't see it? We'll source it."
7  Industries — 7 tiles
8  Projects / proof — 3 case-study cards
9  Operators & site services — split layout
10 Tool hire teaser — "149 tools in stock" + live search deep-linking to /tools
11 Coverage — SA map, provinces, cross-border note
12 CTA band — full-width gradient. "Tell us what the job needs. We'll tell you what it takes."
13 Footer — charcoal/black, 4 columns, both phone numbers, both emails, address, hours,
   POPIA + terms + company registration. NO Google Plus link.

# CMS COLLECTIONS — create these via the Wix MCP, then seed from the CSVs

Equipment            title, slug(unique), category(ref→EquipmentCategories), shortDescription,
                     specs(pipe-delimited text), fleetQty(number), fleetNumbers(text, internal),
                     ownership(Owned|Managed), operatorAvailable(bool), deliveryClass(Light|Standard|Heavy),
                     image, gallery, sortOrder(number), active(bool)
                     → seed from ec-rentals-catalogue.csv (62 items)

EquipmentCategories  title, slug, benefitLine, image, icon, sortOrder, description  (11 items)

Tools                title, slug, toolCategory, active
                     → seed from ec-rentals-tools-catalogue.csv (149 items)

Enquiries            reference, name, company, email, phone, deliverySite, reason,
                     projectStartDate, notes, itemsSummary, status(New|Quoted|Won|Lost),
                     submittedAt, consent(bool)

EnquiryItems         enquiry(ref→Enquiries), equipment(ref→Equipment), itemTitle,
                     quantity(number), days(number), requiredFrom(date)

Projects             title, client, sector, location, summary, equipmentUsed, image, year

Settings             key, value   — holds the notification recipient so EC Rentals can
                                    change it without a developer

# THE ENQUIRY BASKET — the core feature

Flow:
  Card/item page "Add to Enquiry" (item, qty, days, required-from)
  → session basket + header badge increments + slide-over confirmation
  → /enquiry review page: edit qty/days/date, remove lines
  → contact block: Name · Company · Email · Phone · Delivery site or town ·
    Reason (dropdown) · Project start date · Notes
  → POPIA consent checkbox + honeypot + CAPTCHA
  → submit → backend web module
  → insert Enquiries + batch-insert EnquiryItems
  → generate reference ECR-ENQ-YYYYMMDD-NNNN
  → email info@ecrentals.co.za with an itemised table
  → auto-acknowledgement to the enquirer with the reference
  → create/update Wix CRM contact
  → /enquiry/thank-you

Implementation:
- Basket state: wix-storage-frontend SESSION storage. JSON array of
  {equipmentId, title, qty, days, requiredFrom}. NOT localStorage.
- Header badge: masterPage.js reads session storage on $w.onReady and updates on change.
- Submission: backend/enquiry.web.js exporting submitEnquiry(). Validate server-side
  as well as client-side. Never trust the client.
- Email: wix-crm-backend triggered email, OR a Wix Automation on the Enquiries
  collection "Item added" trigger. (Wix has deprecated the older "CMS form submitted"
  trigger for new automations — do not use it.)
- Search the Wix MCP documentation tools for current API signatures BEFORE writing
  any Velo. Do not write from memory.

"Reason" dropdown options (used on both /contact and /enquiry):
  Quotation · Heavy Machine Rental · Vehicle Hire · Truck Hire · Tractor Hire ·
  Forklift Hire · Telehandler & Access Hire · Crane Hire (Managed) · Plant Operator
  Supply · Site Establishment (Containers) · HV Cable Testing & Fault Location ·
  Solar Piling · Tool Hire · Long-Term / Project Hire · Cross-Border Hire ·
  Careers · General Enquiry

# COPY RULES

- Voice: direct, technical, confident. South African English. No marketing froth.
- Every category card leads with the JOB it does, not the spec.
  Good: "Trenching, loading and backfilling — with an operator if you need one."
  Bad:  "High quality TLB equipment for all your needs."
- Specs are facts: tonnage, reach, seats, kVA, litres.
- Never invent capabilities, pricing, certifications or client names.
- Never state availability of a specific unit — availability is confirmed on quotation.
- Alt text on every image, descriptive and specific.

# SEO

- Title pattern: "{Item} Hire | EC Rentals Vanderbijlpark"
- Meta description from shortDescription
- LocalBusiness + Product JSON-LD schema
- 301 redirects: /services/ → /equipment · /quote/ → /enquiry ·
  /gallery/ → /projects · /contact/ → /contact
- Submit the sitemap to Google Search Console after launch

# CONSTRAINTS

- Wix Studio only. Not the classic Editor.
- Build on a STAGING URL. Do not touch DNS for ecrentals.co.za without explicit approval.
- Record the existing MX/TXT/SPF/DKIM records before any DNS change — info@ and sales@
  depend on them.
- v1 is ENQUIRY ONLY. No online payment, no live availability calendar, no booking engine.
- WCAG 2.1 AA. LCP < 2.5s on 4G, CLS < 0.1.
- All images .webp. Hero ≤ 300 KB, cards ≤ 120 KB.
- Placeholder imagery must be generic machinery — never a real client's branding or plant.

# EXECUTION ORDER

Phase 0  Confirm MCP connection. List sites. Create/identify the Wix Studio staging site.
         Set theme colours and text styles from the design tokens.
Phase 1  Create all seven CMS collections via the MCP. Seed Equipment, EquipmentCategories
         and Tools from the CSVs. Upload placeholder images.
Phase 2  Home, /equipment hub, dynamic category and item pages, /tools, /contact.
Phase 3  The enquiry basket end to end, including the email automation. Test delivery to
         a real inbox before calling it done.
Phase 4  Services (6), Industries (7), About, Safety & Compliance, Team, Projects.
Phase 5  Motion, hover states, responsive QA at 4 breakpoints, SEO meta, schema, alt text,
         POPIA notice, terms of hire.
Phase 6  Cutover checklist only — do not execute without approval.

# START HERE

1. Confirm the Wix MCP is connected and list my Wix sites.
2. Read EC-Rentals-Website-Rebuild-Plan.md and both CSVs.
3. Give me a short plan for Phase 0 and Phase 1 — what you will create, in what order,
   and anything you need from me first.
4. Stop and wait for my go-ahead before creating anything in Wix.
````

---

## Reusable follow-up prompts

**Seeding the catalogue**
> Using the Wix MCP, create the `Equipment` and `EquipmentCategories` collections with the schema in the plan, then bulk-import `ec-rentals-catalogue.csv`. Report how many items were created and list any rows that failed validation.

**Building the basket**
> Search the Wix documentation for the current `wix-storage-frontend` and `wix-crm-backend` APIs, then implement the enquiry basket exactly as specified in §7 of the plan. Write the backend as a web module with server-side validation. Show me the code before deploying.

**Writing category copy**
> For each of the 11 equipment categories, write a benefit line (max 12 words, leads with the job) and a 60–80 word category description in the voice defined in the master prompt. Output as a CSV I can import into `EquipmentCategories`.

**Pre-launch audit**
> Run a pre-launch check against the plan: every page has a title and meta description, every image has alt text, contrast is at least 4.5:1 for body text, `prefers-reduced-motion` is honoured, the enquiry form delivers to a real inbox, the 301 redirect map is in place, and the POPIA notice is linked from every form. Report failures only.
