import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import AddToEnquiry from "@/components/AddToEnquiry";
import EquipmentCard from "@/components/EquipmentCard";
import { getEquipment, getEquipmentBySlug, getCategories } from "@/lib/queries";
import { img } from "@/lib/images";
import { splitSpecs } from "@/lib/types";

export const revalidate = 3600;

type Params = { params: Promise<{ slug: string }> };

/** All 62 item pages prerendered — the SEO thesis of the whole rebuild. */
export async function generateStaticParams() {
  const items = await getEquipment();
  return items.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const item = await getEquipmentBySlug(slug);
  if (!item) return {};
  return {
    title: `${item.title} Hire | EC Rentals Vanderbijlpark`,
    description: item.short_description ?? undefined,
  };
}

export default async function ItemPage({ params }: Params) {
  const { slug } = await params;
  const item = await getEquipmentBySlug(slug);
  if (!item) notFound();

  const [all, cats] = await Promise.all([getEquipment(), getCategories()]);
  const cat = cats.find((c) => c.id === item.category_id);
  const related = all.filter((e) => e.category_id === item.category_id && e.slug !== item.slug).slice(0, 3);
  const specs = splitSpecs(item.specs);
  const src = img(item.image_url);

  // Product schema. Deliberately no price or availability — v1 is enquiry only,
  // and availability is confirmed on quotation (plan §9.3 risk table).
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: item.title,
    description: item.short_description ?? undefined,
    category: cat?.title,
    brand: { "@type": "Brand", name: "EC Rentals" },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="item">
        <div className="wrap item__grid">
          <div>
            <div className="item__shot">
              {src ? (
                <Image
                  src={src}
                  alt={`${item.title} available for hire from EC Rentals`}
                  width={900}
                  height={675}
                  priority
                  sizes="(max-width:900px) 100vw, 50vw"
                />
              ) : (
                <span className="ecard__ph">Photography pending</span>
              )}
            </div>
          </div>

          <div className="item__detail">
            <p className="eyebrow" style={{ marginBottom: 14 }}>
              <Link href="/equipment" style={{ color: "inherit" }}>Equipment</Link>
              {cat && (
                <>
                  {" · "}
                  <Link href={`/equipment/${cat.slug}`} style={{ color: "inherit" }}>
                    {cat.title}
                  </Link>
                </>
              )}
            </p>
            <h1>{item.title}</h1>
            <p className="item__lede">{item.short_description}</p>

            <div className="badges">
              <span className={`badge ${item.ownership === "Managed" ? "badge--managed" : "badge--owned"}`}>
                {item.ownership === "Managed" ? "Managed hire" : "Owned fleet"}
              </span>
              {item.operator_available && <span className="badge badge--op">Operator available</span>}
              {item.delivery_class && <span className="badge">{item.delivery_class} delivery</span>}
              {item.ownership === "Owned" && item.fleet_qty > 0 && (
                <span className="badge badge--qty num">{item.fleet_qty} in fleet</span>
              )}
            </div>

            {specs.length > 0 && (
              <table className="specs">
                <caption className="sr-only">Specifications</caption>
                <tbody>
                  {specs.map((s) => {
                    const i = s.indexOf(":");
                    const hasLabel = i > 0 && i < 28;
                    return (
                      <tr key={s}>
                        <th scope="row">{hasLabel ? s.slice(0, i) : "—"}</th>
                        <td>{hasLabel ? s.slice(i + 1).trim() : s}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            <AddToEnquiry equipmentId={item.id} slug={item.slug} title={item.title} />
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="g-black">
          <div className="wrap">
            <div className="rule" />
            <div className="sec-head">
              <div>
                <p className="eyebrow" style={{ marginBottom: 14 }}>Also in {cat?.title}</p>
                <h2>Related plant</h2>
              </div>
              {cat && (
                <Link className="btn btn--ghost" href={`/equipment/${cat.slug}`}>
                  View category
                </Link>
              )}
            </div>
            <div className="egrid">
              {related.map((r) => (
                <EquipmentCard key={r.id} item={r} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
