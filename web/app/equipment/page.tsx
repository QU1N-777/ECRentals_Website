import type { Metadata } from "next";
import Link from "next/link";
import EquipmentCard from "@/components/EquipmentCard";
import QuoteButton from "@/components/QuoteButton";
import { getCategories, getEquipment } from "@/lib/queries";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Equipment Catalogue | EC Rentals Vanderbijlpark",
  description:
    "The full EC Rentals catalogue — plant, vehicles, trailers and specialist equipment across eleven classes. Select what the job needs and send one enquiry.",
};

/**
 * The catalogue. Every category is a section on this one page with its items
 * beneath it, so a customer can build an enquiry in a single pass instead of
 * clicking in and out of eleven category pages.
 *
 * The per-category pages still exist at /equipment/[category] — they carry the
 * SEO weight and are what the sitemap and deep links point at.
 */
export default async function EquipmentCatalogue() {
  const [cats, equipment] = await Promise.all([getCategories(), getEquipment()]);

  const byCategory = cats
    .map((c) => ({ cat: c, items: equipment.filter((e) => e.category_id === c.id) }))
    .filter((g) => g.items.length > 0);

  const owned = equipment.filter((e) => e.ownership === "Owned").length;
  const managed = equipment.length - owned;
  const withOperator = equipment.filter((e) => e.operator_available).length;

  return (
    <>
      <section className="pagehead">
        <div className="wrap">
          <div className="rule" />
          <p className="eyebrow" style={{ marginBottom: 14 }}>Catalogue</p>
          <h1>The fleet</h1>
          <p className="pagehead__lede">
            Everything we hire, in one place. Add what the job needs to a single enquiry —
            plant, vehicles, trailers and tools quoted together as one job.
          </p>
          <div className="pagehead__stats">
            <span><b className="num">{equipment.length}</b> items</span>
            <span><b className="num">{owned}</b> owned</span>
            <span><b className="num">{managed}</b> managed hire</span>
            <span><b className="num">{withOperator}</b> with an operator</span>
          </div>
          <div className="hero__cta" style={{ marginTop: 24 }}>
            <QuoteButton>Request a Quote</QuoteButton>
            <Link className="btn btn--ghost" href="/tools">Browse Tools</Link>
          </div>
        </div>
      </section>

      {/* jump rail — every category, one click away */}
      <nav className="catrail" aria-label="Jump to category">
        <div className="wrap catrail__in">
          {byCategory.map(({ cat, items }) => (
            <a key={cat.slug} href={`#${cat.slug}`}>
              {cat.title} <b className="num">{items.length}</b>
            </a>
          ))}
        </div>
      </nav>

      <section className="g-black catalogue">
        <div className="wrap">
          {byCategory.map(({ cat, items }) => (
            <section className="catsec" id={cat.slug} key={cat.id}>
              <div className="catsec__head">
                <div>
                  <div className="rule" />
                  <h2>{cat.title}</h2>
                  <p>{cat.benefit_line}</p>
                </div>
                <div className="catsec__meta">
                  <span className="num">
                    {items.length} item{items.length === 1 ? "" : "s"}
                  </span>
                  <Link className="btn btn--ghost btn--sm" href={`/equipment/${cat.slug}`}>
                    Category page
                  </Link>
                </div>
              </div>
              <div className="egrid">
                {items.map((item) => (
                  <EquipmentCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          ))}

          <div className="callout">
            <div>
              <h2>Can&apos;t find it?</h2>
              <p>
                If we don&apos;t own it, we source, vet and certify it, then manage it on your
                site under our contract. Telehandlers to 10 t, access to 26 m, cranes to 110 t,
                and full container site establishment.
              </p>
            </div>
            <QuoteButton>Request managed hire</QuoteButton>
          </div>
        </div>
      </section>
    </>
  );
}
