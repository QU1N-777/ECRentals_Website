import type { Metadata } from "next";
import Link from "next/link";
import { SERVICES } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Services | EC Rentals Vanderbijlpark",
  description:
    "Plant hire, operator supply, site establishment, HV cable diagnostics, transport and solar piling — from one supplier, on one order.",
};

export default function ServicesHub() {
  return (
    <>
      <section className="pagehead">
        <div className="wrap">
          <div className="rule" />
          <p className="eyebrow" style={{ marginBottom: 14 }}>Services</p>
          <h1>Six ways we<br />keep a site moving</h1>
          <p className="pagehead__lede">
            Owned fleet, managed hire, people and specialist equipment. One number, one order,
            one invoice — instead of five suppliers blaming each other.
          </p>
        </div>
      </section>

      <section className="g-black">
        <div className="wrap">
          <div className="svcgrid">
            {SERVICES.map((s) => (
              <Link className="svc" key={s.slug} href={`/services/${s.slug}`}>
                <p className="svc__eyebrow">{s.eyebrow}</p>
                <h2>{s.title}</h2>
                <p className="svc__lede">{s.lede}</p>
                <span className="card__go">Read more &rarr;</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
