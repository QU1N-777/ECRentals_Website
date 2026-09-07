import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SERVICES, getService } from "@/lib/site-data";
import { getCategories } from "@/lib/queries";
import { img } from "@/lib/images";

export const revalidate = 3600;

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const s = getService(slug);
  if (!s) return {};
  return {
    title: `${s.title} | EC Rentals Vanderbijlpark`,
    description: s.lede,
  };
}

export default async function ServicePage({ params }: Params) {
  const { slug } = await params;
  const s = getService(slug);
  if (!s) notFound();

  const cats = await getCategories();
  const related = cats.filter((c) => s.related.includes(c.slug));
  const src = img(s.image);

  return (
    <>
      <section className="pagehead">
        <div className="wrap">
          <div className="rule" />
          <p className="eyebrow" style={{ marginBottom: 14 }}>
            <Link href="/services" style={{ color: "inherit" }}>Services</Link> · {s.eyebrow}
          </p>
          <h1>{s.title}</h1>
          <p className="pagehead__lede">{s.lede}</p>
        </div>
      </section>

      <section className="g-black">
        <div className="wrap split">
          <div>
            {s.body.map((p) => (
              <p key={p.slice(0, 24)} className="prose">{p}</p>
            ))}
            <ul className="ticks">
              {s.points.map((pt) => <li key={pt}>{pt}</li>)}
            </ul>
            <Link className="btn btn--primary" href="/enquiry">Start an enquiry</Link>
          </div>
          <div className="shot">
            {src && (
              <Image src={src} alt={`${s.title} — EC Rentals`} width={900} height={675}
                sizes="(max-width:900px) 100vw, 45vw" />
            )}
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="g-dark">
          <div className="wrap">
            <div className="rule" />
            <div className="sec-head">
              <div>
                <p className="eyebrow" style={{ marginBottom: 14 }}>Related plant</p>
                <h2>What this draws on</h2>
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
