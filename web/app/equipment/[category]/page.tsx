import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import EquipmentCard from "@/components/EquipmentCard";
import { getCategories, getEquipment } from "@/lib/queries";

export const revalidate = 3600;

type Params = { params: Promise<{ category: string }> };

/** All 11 category pages are prerendered from the database at build time. */
export async function generateStaticParams() {
  const cats = await getCategories();
  return cats.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { category } = await params;
  const cat = (await getCategories()).find((c) => c.slug === category);
  if (!cat) return {};
  return {
    title: `${cat.title} Hire | EC Rentals Vanderbijlpark`,
    description: cat.benefit_line ?? undefined,
  };
}

export default async function CategoryPage({ params }: Params) {
  const { category } = await params;
  const [cats, equipment] = await Promise.all([getCategories(), getEquipment()]);

  const cat = cats.find((c) => c.slug === category);
  if (!cat) notFound();

  const items = equipment.filter((e) => e.category_id === cat.id);

  return (
    <>
      <section className="pagehead">
        <div className="wrap">
          <div className="rule" />
          <p className="eyebrow" style={{ marginBottom: 14 }}>
            <Link href="/equipment" style={{ color: "inherit" }}>Equipment</Link> · {cat.title}
          </p>
          <h1>{cat.title}</h1>
          <p className="pagehead__lede">{cat.benefit_line}</p>
          <div className="pagehead__stats">
            <span><b className="num">{items.length}</b> item{items.length === 1 ? "" : "s"}</span>
            <span><b className="num">{items.filter((i) => i.operator_available).length}</b> with an operator</span>
            <span>
              <b className="num">{items.reduce((n, i) => n + i.fleet_qty, 0)}</b> units owned
            </span>
          </div>
        </div>
      </section>

      {/* Category rail — sticky on desktop, per plan §6.2 */}
      <nav className="catrail" aria-label="Equipment categories">
        <div className="wrap catrail__in">
          {cats.map((c) => (
            <Link
              key={c.slug}
              href={`/equipment/${c.slug}`}
              className={c.slug === cat.slug ? "is-active" : ""}
            >
              {c.title}
            </Link>
          ))}
        </div>
      </nav>

      <section className="g-black">
        <div className="wrap">
          <div className="egrid">
            {items.map((item) => (
              <EquipmentCard key={item.id} item={item} />
            ))}
          </div>

          <div className="callout">
            <div>
              <h2>Need something not listed here?</h2>
              <p>We source, certify and manage plant we don&apos;t own, under our own contract.</p>
            </div>
            <Link className="btn btn--primary" href="/enquiry">Request managed hire</Link>
          </div>
        </div>
      </section>
    </>
  );
}
