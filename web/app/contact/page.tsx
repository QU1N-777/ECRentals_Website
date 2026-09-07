import type { Metadata } from "next";
import Link from "next/link";
import { getContent, t } from "@/lib/content";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Contact EC Rentals | Vanderbijlpark",
  description:
    "Lead EPC Building, Cnr Hertz & Becquerel Street, Vanderbijlpark. +27 66 429 5788 · +27 82 850 4902 · info@ecrentals.co.za",
};

export default async function Contact() {
  const c = await getContent();
  const phone1 = t(c, "contact.phone_primary", "+27 66 429 5788");
  const phone2 = t(c, "contact.phone_secondary", "+27 82 850 4902");
  const info = t(c, "contact.email_info", "info@ecrentals.co.za");
  const sales = t(c, "contact.email_sales", "sales@ecrentals.co.za");
  const address = t(
    c,
    "contact.address",
    "Lead EPC Building, Cnr Hertz & Becquerel Street, Vanderbijlpark, South Africa"
  );
  const tel = (s: string) => `tel:${s.replace(/\s/g, "")}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "EC Rentals (Pty) Ltd",
    description: "Plant, vehicle, tool and operator hire for South African heavy industry.",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Lead EPC Building, Cnr Hertz & Becquerel Street",
      addressLocality: "Vanderbijlpark",
      addressCountry: "ZA",
    },
    telephone: phone1,
    email: info,
    areaServed: "South Africa",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="pagehead">
        <div className="wrap">
          <div className="rule" />
          <p className="eyebrow" style={{ marginBottom: 14 }}>Contact</p>
          <h1>Tell us what<br />the job needs</h1>
          <p className="pagehead__lede">
            For anything with a list of equipment attached, the enquiry basket is faster — it
            reaches us itemised and we quote it as one job. For everything else, here we are.
          </p>
        </div>
      </section>

      <section className="g-black">
        <div className="wrap">
          <div className="egrid">
            <article className="pillcard">
              <h2>Phone</h2>
              <p className="pillcard__c">
                <a href={tel(phone1)}>{phone1}</a>
                <a href={tel(phone2)}>{phone2}</a>
              </p>
              <p>Answered during business hours. Quote your reference if you have one.</p>
            </article>
            <article className="pillcard">
              <h2>Email</h2>
              <p className="pillcard__c">
                <a href={`mailto:${info}`}>{info}</a>
                <a href={`mailto:${sales}`}>{sales}</a>
              </p>
              <p>Enquiries reach both inboxes. We come back within 24 hours.</p>
            </article>
            <article className="pillcard">
              <h2>Yard</h2>
              <p>{address}</p>
              <p className="pillcard__c">
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Cnr+Hertz+%26+Becquerel+Street+Vanderbijlpark"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open in Google Maps &rarr;
                </a>
              </p>
            </article>
          </div>

          <div className="callout">
            <div>
              <h2>Hiring several items?</h2>
              <p>
                Build an enquiry across plant, vehicles, tools and operators — it arrives
                itemised, with quantities, durations and dates already attached.
              </p>
            </div>
            <Link className="btn btn--primary" href="/equipment">Browse Equipment</Link>
          </div>
        </div>
      </section>
    </>
  );
}
