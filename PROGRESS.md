# EC Rentals — Build Progress

**Updated 7 September 2026 · 73% · 54 of 74 tasks**

Mirrors the live Build Tracker artifact. Percentages are **task counts, not effort** —
P7 carries more work than its count suggests.

```
Overall  ███████████████████████████░░░░░░░░░  73%
```

| | |
|---|---:|
| Pages building | **104** |
| Dead links | **0** |
| Equipment items | **62** (61 published) |
| Tools | **149** |
| Equipment categories | **11** |
| Client-editable content fields | **29** |
| Security warnings outstanding | **0** |
| Images actually rendering | **0** ← the one visible defect |

---

## Phases

| # | Phase | Done | Status |
|---|---|---|---|
| P0 | Discovery & data foundation | 8/8 | ✅ Complete |
| P1 | Supabase backend | 9/9 | ✅ Complete |
| P2 | Brand, design & imagery | 7/9 | 🟡 83% |
| P3 | Next.js site build | 8/10 | 🟡 80% |
| P4 | Enquiry basket & email | 8/9 | 🟡 89% |
| CR1 | Client revisions — round 1 | 5/5 | ✅ Complete |
| P5 | Admin UI | 6/7 | 🟡 86% |
| P6 | Depth pages | 6/8 | 🟡 75% |
| P7 | Polish, SEO & QA | 2/7 | 🔴 29% |
| P8 | Cutover | 0/6 | ⛔ Held by design |

---

## ✅ Complete

**P0 — Discovery & data foundation**
- Plan, master prompt and both catalogues read in full
- Source data validated: 62 / 11 / 149, all slugs unique, encoding audited
- Seven-collection schema designed; reference, boolean, number and date types load-bearing
- 11 category benefit lines written (max 12 words, lead with the job)
- Model proven on Wix Studio — 211 records seeded and verified, later superseded
- Brand red resolved to `#BA1B20` from the logo and the live site theme
- ECR028 (10T TCM Forklift) confirmed sold and deactivated
- Platform decision: leave Wix, go custom on Supabase

**P1 — Supabase backend**
- Project `gblryijimeedzyyjnksd`, eu-west-1, free tier
- 10 tables with real foreign keys, check constraints and `updated_at` triggers
- RLS across every table; public reads only what is active or published
- Column-level `GRANT` hides `fleet_numbers` from the public API
- Seeded 11 / 62 / 149 — 0 orphaned refs, em- and en-dashes intact
- 29 editable content fields + 6 settings rows
- `ECR-ENQ-YYYYMMDD-NNNN` reference generator — daily reset, race-free, SAST
- Helper functions moved to a `private` schema, closing an anon-callable RPC
- All WARN-level security advisors cleared

**CR1 — Client revisions round 1**
- Quote / Enquiry buttons open a real form (name, email, phone, reason, category ticking, from–to dates, location)
- Dedicated catalogue page — 11 category sections with selectable cards
- Hero reworded to "Transport, Plant, Vehicle & Equipment Hire"; eyebrow removed; top gap tightened
- Stat band removed from the homepage
- Schema extended: `hire_from`, `hire_to`, `categories[]`

---

## 🟡 In progress

**P2 — Brand, design & imagery (7/9)**
- ✅ Tokens, type system, homepage design, 32 studio shots joined to the fleet by fleet number, 33 cinematic images curated, 18 site-ready assets, fleet line-up promoted to hero
- ⬜ **Coverage map** — build as inline SVG so provinces carry the brand gradient; not a photo
- 🟡 **Operator photography** — crew shots cover the section; dedicated PPE portraits still the highest-trust gap

**P3 — Next.js site build (8/10)**
- ✅ Scaffold, typed Supabase client, homepage, catalogue, 11 category pages, 61 item pages, tools catalogue, contact
- 🟡 **Load the imagery** — now doable from `/admin` with no key at all
- ⬜ **Deploy to a Vercel preview**

**P4 — Enquiry basket & email (8/9)**
- ✅ Session basket, header badge, Add to Enquiry, quick-quote modal, `/enquiry` review, server action with validation + honeypot + rate limiting, Resend notification, auto-acknowledgement
- 🟡 **Live inbox test** — needs `RESEND_API_KEY`. Enquiries still save without it, so no lead is lost

**P5 — Admin UI (6/7)**
- ✅ Magic-link + password sign-in, email allowlist gate, content editor, drag-and-drop image replace, equipment editor, enquiries inbox
- ⬜ **Hand-over guide for EC Rentals staff** — one page, screenshots, no jargon

**P6 — Depth pages (6/8)**
- ✅ Services hub + 6, industries hub + 7, About, Safety & Compliance, Projects, POPIA notice
- 🟡 **Team directory** — page built with role-based contacts; named staff pending sign-off
- 🟡 **Terms of hire** — structure written; commercial terms must come from EC Rentals and be legally reviewed

---

## 🔴 Barely started

**P7 — Polish, SEO & QA (2/7)**
- ✅ Per-page SEO meta; LocalBusiness + Product JSON-LD; 301 redirect map
- ⬜ Motion pass — weighted and mechanical, `prefers-reduced-motion` honoured
- ⬜ Responsive QA at four breakpoints
- ⬜ WCAG 2.1 AA audit — 4.5:1 body contrast, focus rings, keyboard-navigable basket
- ⬜ Performance targets — LCP under 2.5 s on 4G, CLS under 0.1
- ⬜ Alt text on every image

---

## ⛔ Held deliberately

**P8 — Cutover (0/6)**

Multiple live mailboxes depend on the current DNS. **Nothing here runs until the build is
signed off and the client gives the word.**

- Record every existing MX / TXT / SPF / DKIM — the safety net, do this first
- Verify the `mail.` sending subdomain — root MX never touched
- Point the apex at Vercel — final step
- 301 redirect map ✅ already written into `next.config.ts`
- Search Console + sitemap
- GA4 + Google Business Profile

---

## Blockers

| Severity | Item | Effect |
|---|---|---|
| 🔴 | **Images not uploaded** | All 104 pages render with empty frames. Two-minute fix — see `HANDOVER.md` |
| 🔴 | **Admin auth user not created** | `/admin` cannot be signed into. Dashboard → Authentication → Add user |
| 🟡 | **Asset count 103 vs 108** | A public claim on `/about`. Reconcile register against catalogue |
| 🟡 | **Client names not cleared** | Projects page stays empty until written permission |
| 🟡 | **Founding year unknown** | Blocks the About credibility line |
| 🟡 | **ECR021 load test expired** | The site claims load-test certification |
| 🟡 | **Resend key unset** | Enquiries save but send no email |

---

## Next three moves

1. **Load the images** — biggest visible win, unblocks any design review
2. **Polish pass (P7)** — the last substantial phase before the design reads as finished
3. **Vercel preview** for sign-off, with zero DNS involvement
