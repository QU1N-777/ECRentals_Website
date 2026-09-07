import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Safety & Compliance | EC Rentals",
  description:
    "Load-test certification, licence currency, service discipline and operator certification — tracked per asset and per operator, every month.",
};

const PILLARS = [
  {
    h: "Load-test certification",
    p: "Lifting equipment is load-tested and certified. Expiry dates are tracked per asset so a machine is not dispatched against a lapsed certificate.",
  },
  {
    h: "Licence currency",
    p: "Vehicle and plant licensing is tracked per asset alongside the service record, because a licensing lapse stops a machine at the gate just as fast as a mechanical one.",
  },
  {
    h: "Service discipline",
    p: "Service intervals and next-service-due are recorded per asset and reviewed monthly. Machines leave serviced to schedule, not serviced after a breakdown.",
  },
  {
    h: "Operator certification",
    p: "Operators are certified against the machine class they run, and that certification is tracked per person — not assumed.",
  },
];

export default function Safety() {
  return (
    <>
      <section className="pagehead">
        <div className="wrap">
          <div className="rule" />
          <p className="eyebrow" style={{ marginBottom: 14 }}>
            <Link href="/about" style={{ color: "inherit" }}>About</Link> · Safety &amp; compliance
          </p>
          <h1>Certified.<br />Serviced. On site.</h1>
          <p className="pagehead__lede">
            The strapline is a description of a process, not a slogan. Three records are kept
            current per asset, and a fourth per operator — because tier-1 sites audit all of them.
          </p>
        </div>
      </section>

      <section className="g-black">
        <div className="wrap">
          <div className="egrid">
            {PILLARS.map((x) => (
              <article className="pillcard" key={x.h}>
                <h2>{x.h}</h2>
                <p>{x.p}</p>
              </article>
            ))}
          </div>

          <div className="callout">
            <div>
              <h2>Need documentation with a quotation?</h2>
              <p>
                Say so on your enquiry and we will supply current certification with the quote,
                so vendor onboarding is not a second round of emails.
              </p>
            </div>
            <Link className="btn btn--primary" href="/enquiry">Start an enquiry</Link>
          </div>
        </div>
      </section>
    </>
  );
}
