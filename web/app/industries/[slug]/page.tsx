import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { INDUSTRIES, getIndustry } from "@/lib/site-data";
import { getCategories } from "@/lib/queries";

export const revalidate = 3600;

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return INDUSTRIES.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const i = getIndustry(slug);
  if (!i) return {};
  return { title: `${i.title} | EC Rentals Vanderbijlpark`, description: i.lede };
}

export default async function IndustryPage({ params }: Params) {
  const { slug } = await params;
  const ind = getIndustry(slug);
  if (!ind) notFound();

  const cats = await getCategories();
  const related = cats.filter((c) => ind.related.includes(c.slug));

  return (
    <>
      <section className="pagehead">
        <div className="wrap">
          <div className="rule" />
          <p className="eyebrow" style={{ marginBottom: 14 }}>
            <Link href="/industries" style={{ color: "inherit" }}>Industries</Link>
          </p>
          <h1>{ind.title}</h1>
          <p className="pagehead__lede">{ind.lede}</p>
        </div>
      </section>

      <section className="g-black">
        <div className="wrap split">
          <div>
            {ind.body.map((p) => <p key={p.slice(0, 24)} className="prose">{p}</p>)}
            <Link className="btn btn--primary" href="/enquiry">Start an enquiry</Link>
          </div>
          <div>
            <h2 className="needs__h">What this sector asks for</h2>
            <ul className="ticks">
              {ind.needs.map((n) => <li key={n}>{n}</li>)}
            </ul>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="g-dark">
          <div className="wrap">
            <div className="rule" />
            <div className="sec-head">
              <div>
                <p className="eyebrow" style={{ marginBottom: 14 }}>Equipment</p>
                <h2>What we supply here</h2>
              </div>
            </div>
            <div className="tiles">
              {related.map((c) => (
                <Link className="tile" key={c.slug} href={`/equipment/${c.slug}`}>
                  <span className="tile__t">{c.title}</span>
                  <p className="tile__s">{c.benefit_line}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
