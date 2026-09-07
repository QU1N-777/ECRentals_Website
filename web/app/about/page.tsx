import type { Metadata } from "next";
import Link from "next/link";
import { getEquipment, getCategories, getTools } from "@/lib/queries";
import { PROVINCES } from "@/lib/site-data";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "About EC Rentals | Plant &amp; Operator Hire, Vanderbijlpark",
  description:
    "A managed plant and logistics partner to South African heavy industry — owned fleet, managed hire, certified operators, based in Vanderbijlpark.",
};

export default async function About() {
  const [equipment, cats, tools] = await Promise.all([getEquipment(), getCategories(), getTools()]);
  const owned = equipment.filter((e) => e.ownership === "Owned").reduce((n, e) => n + e.fleet_qty, 0);

  return (
    <>
      <section className="pagehead">
        <div className="wrap">
          <div className="rule" />
          <p className="eyebrow" style={{ marginBottom: 14 }}>About</p>
          <h1>Not a tool<br />hire shop</h1>
          <p className="pagehead__lede">
            EC Rentals is a managed plant and logistics partner to South African heavy industry.
            We own the fleet, we place the operators, and where we don&apos;t own something we
            source it, certify it and manage it under our own contract.
          </p>
        </div>
      </section>

      <section className="g-black">
        <div className="wrap split">
          <div>
            <p className="prose">
              We are based in the Lead EPC Building on the corner of Hertz and Becquerel Street,
              Vanderbijlpark — inside the Vaal industrial triangle, minutes from the steel and
              petrochemical belt and within a day&apos;s haul of most of the country&apos;s mining
              and power infrastructure.
            </p>
            <p className="prose">
              What separates us is less about the machines than the discipline behind them. Service
              intervals, load-test certification and licence currency are tracked per asset, every
              month. Operator certification is tracked per person. Tier-1 sites audit all three
              before plant comes through the gate, so we keep them current rather than scrambling.
            </p>
            <p className="prose">
              The offer runs in three tiers: an owned fleet, managed hire for everything we
              don&apos;t own, and people — certified operators placed against the plant they run.
              One number, one order, one invoice.
            </p>
            <div className="hero__cta" style={{ marginTop: 26 }}>
              <Link className="btn btn--primary" href="/equipment">Browse the fleet</Link>
              <Link className="btn btn--ghost" href="/about/safety-compliance">Safety &amp; compliance</Link>
            </div>
          </div>
          <div>
            <div className="factbox">
              <h2>By the numbers</h2>
              <dl>
                <div><dt>Owned assets</dt><dd className="num">{owned}</dd></div>
                <div><dt>Equipment classes</dt><dd className="num">{cats.length}</dd></div>
                <div><dt>Items in the catalogue</dt><dd className="num">{equipment.length}</dd></div>
                <div><dt>Tools in stock</dt><dd className="num">{tools.length}</dd></div>
                <div><dt>Quote turnaround</dt><dd>24 hours</dd></div>
                <div><dt>Base</dt><dd>Vanderbijlpark</dd></div>
              </dl>
            </div>
          </div>
        </div>
      </section>

      <section className="g-dark">
        <div className="wrap">
          <div className="rule" />
          <div className="sec-head">
            <div>
              <p className="eyebrow" style={{ marginBottom: 14 }}>Coverage</p>
              <h2>Where we deliver</h2>
              <p>Nationwide delivery from Vanderbijlpark, cross-border on request.</p>
            </div>
          </div>
          <div className="provgrid">
            {PROVINCES.map((p) => (
              <div className={`prov__card${p.base ? " is-base" : ""}`} key={p.name}>
                <span className="prov__n">{p.name}</span>
                <span className="prov__s">{p.note}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
