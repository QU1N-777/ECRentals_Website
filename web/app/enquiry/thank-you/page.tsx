import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Enquiry Received | EC Rentals",
  robots: { index: false, follow: false },
};

export default async function ThankYou({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;

  return (
    <section className="pagehead" style={{ borderBottom: "none" }}>
      <div className="wrap">
        <div className="rule" />
        <p className="eyebrow" style={{ marginBottom: 14 }}>Enquiry received</p>
        <h1>We have it. Thank you.</h1>

        {ref && (
          <p className="refbox">
            <span>Your reference</span>
            <b className="num">{ref}</b>
          </p>
        )}

        <p className="pagehead__lede">
          A confirmation is on its way to your inbox. We come back on enquiries within{" "}
          <b>24 hours</b>, and availability is confirmed on quotation.
        </p>

        <p className="pagehead__lede" style={{ marginTop: 18 }}>
          Need it sooner? Call <a href="tel:+27664295788">+27 66 429 5788</a> or{" "}
          <a href="tel:+27828504902">+27 82 850 4902</a> and quote the reference above.
        </p>

        <div className="hero__cta" style={{ marginTop: 30 }}>
          <Link className="btn btn--primary" href="/equipment">Back to Equipment</Link>
          <Link className="btn btn--ghost" href="/">Home</Link>
        </div>
      </div>
    </section>
  );
}
