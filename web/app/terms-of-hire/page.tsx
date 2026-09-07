import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Hire | EC Rentals",
  description: "The terms on which EC Rentals hires plant, vehicles, tools and operators.",
};

export default function Terms() {
  return (
    <>
      <section className="pagehead">
        <div className="wrap">
          <div className="rule" />
          <p className="eyebrow" style={{ marginBottom: 14 }}>Legal</p>
          <h1>Terms of hire</h1>
          <p className="pagehead__lede">
            The commercial terms on which plant, vehicles, tools and operators are hired.
          </p>
        </div>
      </section>

      <section className="g-black">
        <div className="wrap legal">
          <h2>What this site settles</h2>
          <p>
            Nothing on this website is an offer or a binding quotation. Submitting an enquiry
            places no obligation on you and reserves no equipment. Availability, rates and hire
            terms are confirmed in a written quotation.
          </p>

          <h2>Availability</h2>
          <p>
            Fleet quantities shown are what we own, not what is free on a given date. Availability
            is confirmed on quotation. Items marked <i>managed hire</i> are sourced from vetted
            partners and supplied under our contract.
          </p>

          <h2>Still to be supplied</h2>
          <p>
            The full commercial terms — rates and invoicing, deposits, minimum hire periods,
            delivery and collection, damage and loss, insurance and liability, breakdown and
            standby, operator conditions, and off-hire procedure — are to be supplied by EC
            Rentals and inserted here before launch.
          </p>

          <p className="legal__note">
            <b>Placeholder.</b> This page exists so it can be linked from the footer and the
            enquiry form, and so the structure is agreed. It must carry the actual hire terms,
            legally reviewed, before the site goes live.
          </p>

          <div className="hero__cta" style={{ marginTop: 28 }}>
            <Link className="btn btn--ghost" href="/privacy-policy">POPIA privacy notice</Link>
            <Link className="btn btn--primary" href="/contact">Contact us</Link>
          </div>
        </div>
      </section>
    </>
  );
}
