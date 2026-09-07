import type { Metadata } from "next";
import Link from "next/link";
import { INDUSTRIES } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Industries We Serve | EC Rentals Vanderbijlpark",
  description:
    "Mining, power, petrochemical, steel, renewables, civils and agriculture — plant, vehicles and operators supplied to heavy-industry standards.",
};

export default function IndustriesHub() {
  return (
    <>
      <section className="pagehead">
        <div className="wrap">
          <div className="rule" />
          <p className="eyebrow" style={{ marginBottom: 14 }}>Industries</p>
          <h1>Built for the sites<br />that don&apos;t stop</h1>
          <p className="pagehead__lede">
            Mining, steel, petrochemical and power run to shutdown windows and audit trails.
            We supply to that standard — and the paperwork is ready before the gate asks.
          </p>
        </div>
      </section>

      <section className="g-black">
        <div className="wrap">
          <div className="svcgrid">
            {INDUSTRIES.map((i) => (
              <Link className="svc" key={i.slug} href={`/industries/${i.slug}`}>
                <h2>{i.title}</h2>
                <p className="svc__lede">{i.lede}</p>
                <span className="card__go">Read more &rarr;</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
