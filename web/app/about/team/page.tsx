import type { Metadata } from "next";
import Link from "next/link";
import { getContent, t } from "@/lib/content";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Our Team | EC Rentals Vanderbijlpark",
  description: "Talk to a person. Direct contact details for the EC Rentals team.",
};

export default async function Team() {
  const c = await getContent();
  const phone1 = t(c, "contact.phone_primary", "+27 66 429 5788");
  const phone2 = t(c, "contact.phone_secondary", "+27 82 850 4902");
  const info = t(c, "contact.email_info", "info@ecrentals.co.za");
  const sales = t(c, "contact.email_sales", "sales@ecrentals.co.za");
  const tel = (s: string) => `tel:${s.replace(/\s/g, "")}`;

  return (
    <>
      <section className="pagehead">
        <div className="wrap">
          <div className="rule" />
          <p className="eyebrow" style={{ marginBottom: 14 }}>
            <Link href="/about" style={{ color: "inherit" }}>About</Link> · Team
          </p>
          <h1>Talk to a person</h1>
          <p className="pagehead__lede">
            Enquiries reach both our general and sales inboxes, and someone comes back within
            24 hours. If it is urgent, phone — the numbers below are answered.
          </p>
        </div>
      </section>

      <section className="g-black">
        <div className="wrap">
          <div className="egrid">
            <article className="pillcard">
              <h2>Sales &amp; quotations</h2>
              <p>New enquiries, quotations, availability and project hire.</p>
              <p className="pillcard__c">
                <a href={`mailto:${sales}`}>{sales}</a>
                <a href={tel(phone2)}>{phone2}</a>
              </p>
            </article>
            <article className="pillcard">
              <h2>General &amp; operations</h2>
              <p>Deliveries, off-hire, site coordination and accounts.</p>
              <p className="pillcard__c">
                <a href={`mailto:${info}`}>{info}</a>
                <a href={tel(phone1)}>{phone1}</a>
              </p>
            </article>
            <article className="pillcard">
              <h2>Yard</h2>
              <p>
                Lead EPC Building<br />
                Cnr Hertz &amp; Becquerel Street<br />
                Vanderbijlpark
              </p>
            </article>
          </div>

          <div className="callout">
            <div>
              <h2>Named contacts coming</h2>
              <p>
                A directory of named staff with direct numbers is a strong trust signal in South
                African B2B, and it is planned here. We are waiting on EC Rentals to confirm who
                should be listed rather than publishing names without permission.
              </p>
            </div>
            <Link className="btn btn--ghost" href="/contact">Contact us</Link>
          </div>
        </div>
      </section>
    </>
  );
}
