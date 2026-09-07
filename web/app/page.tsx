import Image from "next/image";
import Link from "next/link";
import { getContent, t, list } from "@/lib/content";
import { getCategories, getCategoryCounts, getTools } from "@/lib/queries";
import { img } from "@/lib/images";
import CategoryCard from "@/components/CategoryCard";
import QuoteButton from "@/components/QuoteButton";

// Rebuild hourly; the admin UI can trigger an on-demand revalidate later.
export const revalidate = 3600;

const INDUSTRIES = [
  ["Mining", "Platinum, chrome and base metals — surface plant, crew transport and operators."],
  ["Power & Energy", "Station shutdowns, HV cable diagnostics and site power."],
  ["Petrochemical", "Access, lifting and certified operators inside process areas."],
  ["Steel & Heavy Industry", "Mill support, material handling and heavy haulage."],
  ["Renewables", "Solar PV pile driving, plus the plant and crews behind it."],
  ["Construction & Civils", "Earthworks, trenching and site establishment from day one."],
  ["Agriculture", "Tractors, slashers, trailers and servitude maintenance."],
] as const;

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export default async function Home() {
  const [c, cats, counts, tools] = await Promise.all([
    getContent(),
    getCategories(),
    getCategoryCounts(),
    getTools(),
  ]);

  const heroSrc = img(t(c, "home.hero.image", "hero-home.webp"));
  const managedSrc = img(t(c, "home.managed.image", "managed-hire.webp"));
  const operatorsSrc = img(t(c, "home.operators.image", "operators.webp"));
  const ctaSrc = img(t(c, "home.cta.image", "cta-fleet.webp"));

  // Headline is stored in two parts so the gradient word stays editable.
  const headLead = t(c, "home.hero.headline", "Transport, Plant, Vehicle &");
  const headAccent = t(c, "home.hero.headline_accent", "Equipment Hire");
  const eyebrow = t(c, "home.hero.eyebrow");

  const toolCats = tools.reduce<Map<string, number>>((m, tool) => {
    m.set(tool.tool_category, (m.get(tool.tool_category) ?? 0) + 1);
    return m;
  }, new Map());

  return (
    <>
      {/* 1 — HERO */}
      <div className="hero">
        {heroSrc && (
          <Image
            className="hero__img"
            src={heroSrc}
            alt="The EC Rentals fleet lined up at sunset — crane truck, bakkie, telehandler, tractor and excavator"
            fill
            priority
            sizes="100vw"
          />
        )}
        <div className="hero__edge" aria-hidden="true" />
        <div className="wrap hero__in">
          {eyebrow && (
            <p className="eyebrow" style={{ marginBottom: 20 }}>{eyebrow}</p>
          )}
          <h1>
            {headLead}{headAccent && " "}
            {headAccent && <span className="grad-text">{headAccent}</span>}
          </h1>
          <p className="hero__sub">{t(c, "home.hero.subline", "Certified. Serviced. On site.")}</p>
          <p className="hero__legacy">{t(c, "home.hero.legacy")}</p>
          <div className="hero__cta">
            <Link className="btn btn--primary" href="/equipment">
              {t(c, "home.hero.cta_primary", "Browse Equipment")}
            </Link>
            <QuoteButton variant="ghost">
              {t(c, "home.hero.cta_secondary", "Request a Quote")}
            </QuoteButton>
          </div>
        </div>
      </div>

      {/* 2 — TRUST BAND */}
      <section className="trust" aria-label="Capability summary">
        <div className="wrap">
          <ul>
            {list(c, "home.trust.items", [
              "Vanderbijlpark-based",
              "Nationwide delivery",
              "Cross-border capable",
              "Operators supplied",
              "24-hour quote turnaround",
            ]).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* 3 — EQUIPMENT CATEGORIES */}
      <section className="g-black" id="equipment">
        <div className="wrap">
          <div className="rule" />
          <div className="sec-head">
            <div>
              <p className="eyebrow" style={{ marginBottom: 14 }}>The fleet</p>
              <h2>
                {cats.length} equipment classes,
                <br />
                one supplier
              </h2>
              <p>
                Owned fleet and managed hire in the same catalogue. Add anything to a single
                enquiry and we quote it as one job.
              </p>
            </div>
            <Link className="btn btn--ghost" href="/equipment">All Equipment</Link>
          </div>
          <div className="cards">
            {cats.map((cat, i) => (
              <CategoryCard
                key={cat.id}
                category={cat}
                count={counts.get(cat.id) ?? 0}
                priority={i < 3}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 4 — CAPABILITY PILLARS */}
      <section className="g-light" id="services">
        <div className="wrap">
          <div className="rule" />
          <div className="sec-head">
            <div>
              <p className="eyebrow" style={{ color: "#8A6410", marginBottom: 14 }}>Why EC Rentals</p>
              <h2>Three things that keep<br />your programme on schedule</h2>
            </div>
          </div>
          <div className="pillars">
            <div className="pillar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3.5 2" />
              </svg>
              <h3>Uptime</h3>
              <p>
                We track service intervals and next-service-due per asset, every month. Machines
                leave the yard serviced to schedule — not serviced when something breaks.
              </p>
            </div>
            <div className="pillar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M12 3l8 3.5v5c0 4.6-3.2 8.4-8 9.5-4.8-1.1-8-4.9-8-9.5v-5z" />
                <path d="M9 12l2.2 2.2L15.5 10" />
              </svg>
              <h3>Compliance</h3>
              <p>
                Load-test certification, licence currency and operator certification tracked per
                asset and per operator — because tier-1 sites audit all three before your plant
                comes through the gate.
              </p>
            </div>
            <div className="pillar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M3 20V9l6-4 6 4v11" />
                <path d="M15 20V12l6 3v5" />
                <path d="M2 20h20" />
              </svg>
              <h3>One partner</h3>
              <p>
                Owned fleet, managed hire, certified operators and full container site
                establishment. One number, one order, one invoice — instead of five suppliers
                blaming each other.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6 — MANAGED HIRE */}
      <section className="g-dark">
        <div className="wrap split">
          <div>
            <div className="rule" />
            <p className="eyebrow" style={{ marginBottom: 14 }}>Managed hire</p>
            <h2>{t(c, "home.managed.heading", "Don’t see it? We’ll source it.")}</h2>
            <p>{t(c, "home.managed.body")}</p>
            <ul className="ticks">
              <li>Telehandlers from 2.5 t to 10 t</li>
              <li>Cherry pickers and access platforms to 26 m</li>
              <li>Mobile cranes to 110 t, with operator and rigging team</li>
              <li>Full container site establishment — offices, stores, ablutions, kitchens</li>
            </ul>
            <QuoteButton>Enquire About Managed Hire</QuoteButton>
          </div>
          <div className="shot">
            {managedSrc && (
              <Image
                src={managedSrc}
                alt="Haulotte telehandler on an industrial steelwork site"
                width={900}
                height={600}
                sizes="(max-width:900px) 100vw, 45vw"
              />
            )}
          </div>
        </div>
      </section>

      {/* 7 — INDUSTRIES */}
      <section className="g-black" id="industries">
        <div className="wrap">
          <div className="rule" />
          <div className="sec-head">
            <div>
              <p className="eyebrow" style={{ marginBottom: 14 }}>Sectors</p>
              <h2>Built for the sites<br />that don’t stop</h2>
              <p>
                Mining, steel, petrochemical and power run to shutdown windows and audit trails.
                We supply to that standard.
              </p>
            </div>
          </div>
          <div className="tiles">
            {INDUSTRIES.map(([name, blurb]) => (
              <Link className="tile" key={name} href={`/industries/${slugify(name)}`}>
                <span className="tile__t">{name}</span>
                <p className="tile__s">{blurb}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 9 — OPERATORS */}
      <section className="g-dark" id="about">
        <div className="wrap split">
          <div className="shot">
            {operatorsSrc && (
              <Image
                src={operatorsSrc}
                alt="Case TLB and crew working a civil roadworks site"
                width={900}
                height={600}
                sizes="(max-width:900px) 100vw, 45vw"
              />
            )}
          </div>
          <div>
            <div className="rule" />
            <p className="eyebrow" style={{ marginBottom: 14 }}>Operators &amp; site services</p>
            <h2>{t(c, "home.operators.heading", "The machine is half the job")}</h2>
            <p>{t(c, "home.operators.body")}</p>
            <ul className="ticks">
              <li>Operator placement against telehandlers, TLBs, excavators and ramming rigs</li>
              <li>Certification and licence currency tracked per operator</li>
              <li>Site establishment — offices, stores, ablutions and kitchens</li>
              <li>HV cable testing and fault location by qualified technicians</li>
            </ul>
            <Link className="btn btn--ghost" href="/services/operator-supply">Operator Supply</Link>
          </div>
        </div>
      </section>

      {/* 10 — TOOL TEASER */}
      <section className="g-black" id="tools">
        <div className="wrap">
          <div className="rule" />
          <p className="eyebrow" style={{ marginBottom: 14 }}>Tool hire</p>
          <h2 style={{ fontSize: "clamp(28px,4.4vw,50px)" }}>
            <span className="num">{tools.length}</span> tools in stock
          </h2>
          <p style={{ color: "var(--steel-lift)", maxWidth: "68ch", marginTop: 14 }}>
            Hand tools, power tools, cable and electrical kit, pipe and hydraulic, measurement,
            lifting and safety equipment. Search the catalogue and add straight to your enquiry.
          </p>
          <div className="chips">
            {[...toolCats.entries()]
              .sort((a, b) => b[1] - a[1])
              .map(([name, n]) => (
                <span className="chip" key={name}>
                  {name}
                  <b className="num">{n}</b>
                </span>
              ))}
          </div>
          <div style={{ marginTop: 26 }}>
            <Link className="btn btn--primary" href="/tools">Search All Tools</Link>
          </div>
        </div>
      </section>

      {/* 12 — CTA BAND */}
      <section className="cta">
        {ctaSrc && (
          <Image src={ctaSrc} alt="EC Rentals plant working at sunrise" fill sizes="100vw" />
        )}
        <div className="wrap">
          <h2>{t(c, "home.cta.heading", "Tell us what the job needs. We’ll tell you what it takes.")}</h2>
          <p>{t(c, "home.cta.body")}</p>
          <QuoteButton variant="plain" className="btn">Request a Quote</QuoteButton>
        </div>
      </section>
    </>
  );
}
