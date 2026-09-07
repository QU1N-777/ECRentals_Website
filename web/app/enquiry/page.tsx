import type { Metadata } from "next";
import EnquiryForm from "./EnquiryForm";

export const metadata: Metadata = {
  title: "Your Enquiry | EC Rentals",
  description:
    "Review your selected plant, vehicles and tools, then send one enquiry. We quote it as a single job and reply within 24 hours.",
  robots: { index: false, follow: true },
};

export default function EnquiryPage() {
  return (
    <>
      <section className="pagehead">
        <div className="wrap">
          <div className="rule" />
          <p className="eyebrow" style={{ marginBottom: 14 }}>Enquiry</p>
          <h1>Review &amp; send</h1>
          <p className="pagehead__lede">
            Everything on one enquiry — plant, vehicles, tools and operators. We quote it as a
            single job, delivered together.
          </p>
        </div>
      </section>
      <section className="g-black">
        <div className="wrap">
          <EnquiryForm />
        </div>
      </section>
    </>
  );
}
