/**
 * Editorial content for the depth pages.
 *
 * Deliberately *not* in the database: this is structural page copy, written
 * once, not something EC Rentals staff will edit weekly. The `site_content`
 * table stays for the things they genuinely change — headlines, stats, photos.
 *
 * Every claim here traces to EC-Rentals-Website-Rebuild-Plan.md. Nothing is
 * invented: no founding year, no client names, no pricing, no certifications
 * beyond load-testing / licence currency / operator certification, which the
 * register evidences (§4.3).
 */

export type Service = {
  slug: string;
  title: string;
  eyebrow: string;
  lede: string;
  body: string[];
  points: string[];
  /** Category slugs this service draws its plant from. */
  related: string[];
  image: string;
};

export const SERVICES: Service[] = [
  {
    slug: "plant-hire",
    title: "Plant Hire",
    eyebrow: "Owned fleet",
    lede: "Excavators, TLBs, loaders and material handling — hired bare or with a certified operator.",
    body: [
      "Most of what leaves our yard is ours. That matters more than it sounds: we know each machine's service history, its load-test status and its licence currency, because we track all three per asset, every month.",
      "Hire is by the day, the month or the project. Long-term placements are normal for us — a machine can sit on one site for a year, serviced on schedule without leaving.",
    ],
    points: [
      "Owned fleet across eleven equipment classes",
      "Serviced to schedule, with next-service-due tracked per asset",
      "Operator supplied where the machine calls for one",
      "Delivery classed Light, Standard or Heavy so haulage is quoted correctly",
    ],
    related: ["earthmoving-material-handling", "telehandlers-access", "forklifts"],
    image: "cat-earthmoving.webp",
  },
  {
    slug: "operator-supply",
    title: "Operator Supply",
    eyebrow: "People, not just plant",
    lede: "Certified operators placed against the machines they run, with certification tracked the same way we track load tests.",
    body: [
      "A machine on site without a competent operator is a delay with a rental rate attached. We place operators against specific plant — telehandlers, TLBs, excavators, ramming rigs — rather than sending general labour and hoping.",
      "Operator certification and licence currency are tracked per person, because tier-1 sites audit that before anyone goes through the gate.",
    ],
    points: [
      "Operators matched to the specific machine class",
      "Certification and licence currency tracked per operator",
      "Placement for short shutdowns or long project terms",
      "Site induction requirements accommodated on request",
    ],
    related: ["earthmoving-material-handling", "telehandlers-access", "solar-piling"],
    image: "operators.webp",
  },
  {
    slug: "site-establishment",
    title: "Site Establishment",
    eyebrow: "From bare ground",
    lede: "Offices, stores, ablutions and kitchens delivered, positioned and managed — plus the power and fuel to run them.",
    body: [
      "Container establishment is sourced and managed rather than owned, which means we handle the vetting, the delivery, the placement and the off-hire under our own contract. You keep one supplier.",
      "Pair it with generators and diesel bowsers from our own fleet and a site goes from bare ground to working in a single mobilisation.",
    ],
    points: [
      "3 m, 6 m and 12 m units — offices, stores, ablutions, kitchens",
      "Delivery, placement and off-hire managed end to end",
      "Generators from 23 to 50 kVA and 500 L diesel bowsers from our own fleet",
      "One order, one point of accountability",
    ],
    related: ["power-site-support"],
    image: "cat-power-site.webp",
  },
  {
    slug: "hv-diagnostics",
    title: "HV Diagnostics & Testing",
    eyebrow: "Cable integrity",
    lede: "VLF cable testing and precision sheath fault location — equipment most hire companies simply do not carry.",
    body: [
      "We own an HVA60 Very Low Frequency test set and a Sherla sheath fault locator rated 0–10 kV. They prove cable integrity before commissioning and pinpoint faults without trenching the whole run.",
      "Both are operated by qualified technicians. This is diagnostic work, not equipment drop-off.",
    ],
    points: [
      "0.1 Hz VLF testing for commissioning and fault investigation",
      "Sheath fault pinpointing on MV cable, 0–10 kV",
      "Minimises excavation and downtime",
      "Qualified technician supplied with the equipment",
    ],
    related: ["hv-diagnostics-testing"],
    image: "cat-hv-diagnostics.webp",
  },
  {
    slug: "transport-logistics",
    title: "Transport & Logistics",
    eyebrow: "Getting it there",
    lede: "Crane trucks, step-deck haulage and tippers — including abnormal loads and cross-border movement.",
    body: [
      "Self-loading crane trucks place plant and material where a forklift cannot reach. For machine moves, a 35-tonne MAN and step-deck trailer handles excavators, TLBs, telehandlers and containers.",
      "Tipper haulage covers spoil, aggregate and demolition rubble off the same fleet.",
    ],
    points: [
      "Crane trucks to 8.3 t with knuckle-boom reach",
      "35 t step-deck combination, abnormal load capable",
      "Tipper haulage for spoil and aggregate",
      "Nationwide delivery, cross-border capable",
    ],
    related: ["cranes-trucks-logistics", "trailers"],
    image: "cat-cranes-logistics.webp",
  },
  {
    slug: "solar-piling",
    title: "Solar Piling",
    eyebrow: "Renewables",
    lede: "Ramming rigs driving foundation piles for utility-scale photovoltaic installations, operators included.",
    body: [
      "Six purpose-built ramming machines, deployed on utility-scale solar projects. This is a specialist capability — it needs the right rig and trained operators, and very few general hire companies carry either.",
      "The rigs come with people who know how to run them.",
    ],
    points: [
      "Six ramming rigs available",
      "Purpose-built for solar PV pile installation",
      "Trained operators supplied",
      "Deployed on utility-scale photovoltaic projects",
    ],
    related: ["solar-piling"],
    image: "cat-solar-piling.webp",
  },
];

export type Industry = {
  slug: string;
  title: string;
  lede: string;
  body: string[];
  needs: string[];
  related: string[];
};

export const INDUSTRIES: Industry[] = [
  {
    slug: "mining",
    title: "Mining",
    lede: "Platinum, chrome and base metals — surface plant, crew transport and certified operators.",
    body: [
      "Mining sites audit before they admit. Load-test certification, licence currency and operator certification are checked at the gate, and plant that cannot produce them does not go through. We track all three per asset and per operator, every month.",
      "Crew transport matters as much as the plant. Shift movement runs on 10-, 14-, 16- and 23-seater vehicles, which we own rather than sub-hire.",
    ],
    needs: ["Load-test certified lifting", "Certified operators", "Shift crew transport", "Site power and fuel"],
    related: ["telehandlers-access", "personnel-transport", "power-site-support"],
  },
  {
    slug: "power-energy",
    title: "Power & Energy",
    lede: "Station shutdowns, HV cable diagnostics and site power where the grid cannot reach.",
    body: [
      "Shutdown windows do not move. Plant arrives when it is scheduled to arrive, or the window is lost — which is why we track service intervals rather than waiting for something to break.",
      "We also own HV cable diagnostic equipment that most hire companies do not carry, so cable integrity can be proven before energising rather than discovered afterwards.",
    ],
    needs: ["Shutdown-window reliability", "HV cable testing and fault location", "Generators from 23 to 50 kVA", "Access equipment to 26 m"],
    related: ["hv-diagnostics-testing", "power-site-support", "telehandlers-access"],
  },
  {
    slug: "petrochemical",
    title: "Petrochemical",
    lede: "Access, lifting and certified operators working inside live process areas.",
    body: [
      "Process areas are unforgiving about competence and paperwork. Operators are placed against the specific machine they run, with certification current and documented.",
      "Access work runs from trailer-mounted platforms up to 26 m self-propelled boom lifts, sourced and certified under our contract where we do not own the unit.",
    ],
    needs: ["Certified operators inside process areas", "Access platforms to 26 m", "Telehandlers to 10 t", "Site establishment"],
    related: ["telehandlers-access", "cranes-trucks-logistics", "power-site-support"],
  },
  {
    slug: "steel-heavy-industry",
    title: "Steel & Heavy Industry",
    lede: "Mill support, material handling and heavy haulage — from a yard minutes away.",
    body: [
      "Our yard is in Vanderbijlpark, inside the Vaal industrial triangle. For the steel and petrochemical belt that means response measured in minutes rather than a day's haul.",
      "Forklifts, crane trucks and step-deck haulage handle plate, section and package movement around and between mills.",
    ],
    needs: ["Forklift capacity for plate and package", "Self-loading crane trucks", "35 t step-deck haulage", "Rapid local response"],
    related: ["forklifts", "cranes-trucks-logistics", "trailers"],
  },
  {
    slug: "renewables",
    title: "Renewables",
    lede: "Solar PV pile driving, plus the plant and crews behind the array.",
    body: [
      "Six ramming rigs drive foundation piles on utility-scale photovoltaic installations, with trained operators. It is a genuine specialism and the reason renewables sits as its own sector rather than under civils.",
      "Behind the rigs sit the ordinary requirements of any remote site: crew transport, site power, fuel and establishment.",
    ],
    needs: ["Solar PV pile driving", "Remote-site power and fuel", "Crew transport", "Container establishment"],
    related: ["solar-piling", "power-site-support", "personnel-transport"],
  },
  {
    slug: "construction-civils",
    title: "Construction & Civils",
    lede: "Earthworks, trenching and site establishment from day one to handover.",
    body: [
      "Excavators, TLBs and skid steers cover bulk earthworks through to confined-space work. The 22-tonne class excavator handles bulk; the MultiOne articulated loader goes indoors and into restricted access where nothing larger fits.",
      "Site establishment, power and crew transport come off the same order.",
    ],
    needs: ["Bulk earthworks and trenching", "Confined-access plant", "Trailers and haulage", "Full site establishment"],
    related: ["earthmoving-material-handling", "trailers", "power-site-support"],
  },
  {
    slug: "agriculture",
    title: "Agriculture",
    lede: "Tractors, slashers, trailers and servitude maintenance across farms and estates.",
    body: [
      "Eighteen tractor-class assets, including a six-strong Case JX75 pool, plus slashers, rippers and tractor-drawn trailers rated to 10 tonnes.",
      "The same fleet handles servitude and firebreak maintenance for utilities and estates, which is where agricultural plant and industrial work overlap.",
    ],
    needs: ["Utility tractors with implements", "Slashing and firebreak maintenance", "Tractor-drawn trailers to 10 t", "Ripping and ground preparation"],
    related: ["tractors-agricultural", "trailers"],
  },
];

export const PROVINCES = [
  { name: "Gauteng", note: "Base — Vanderbijlpark", base: true },
  { name: "Mpumalanga", note: "Power and coal belt" },
  { name: "Limpopo", note: "Platinum and mining" },
  { name: "North West", note: "Platinum and chrome" },
  { name: "Northern Cape", note: "Solar and bulk civils" },
  { name: "Free State", note: "Agriculture and civils" },
  { name: "Cross-border", note: "On request" },
];

export const getService = (slug: string) => SERVICES.find((s) => s.slug === slug);
export const getIndustry = (slug: string) => INDUSTRIES.find((i) => i.slug === slug);
