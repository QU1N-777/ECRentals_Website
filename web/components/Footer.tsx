import Link from "next/link";
import { getContent, t } from "@/lib/content";
import { getCategories } from "@/lib/queries";

export default async function Footer() {
  const [c, cats] = await Promise.all([getContent(), getCategories()]);
  const phone1 = t(c, "contact.phone_primary", "+27 66 429 5788");
  const phone2 = t(c, "contact.phone_secondary", "+27 82 850 4902");
  const info = t(c, "contact.email_info", "info@ecrentals.co.za");
  const sales = t(c, "contact.email_sales", "sales@ecrentals.co.za");
  const tel = (s: string) => `tel:${s.replace(/\s/g, "")}`;

  return (
    <footer className="ft" id="contact">
      <div className="wrap">
        <div className="ft__cols">
          <div>
            <h4>Equipment</h4>
            <ul>
              {cats.slice(0, 5).map((cat) => (
                <li key={cat.slug}>
                  <Link href={`/equipment/${cat.slug}`}>{cat.title}</Link>
                </li>
              ))}
              <li>
                <Link href="/equipment">All {cats.length} categories &rarr;</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4>Services</h4>
            <ul>
              <li><Link href="/services/plant-hire">Plant Hire</Link></li>
              <li><Link href="/services/operator-supply">Operator Supply</Link></li>
              <li><Link href="/services/site-establishment">Site Establishment</Link></li>
              <li><Link href="/services/hv-diagnostics">HV Diagnostics</Link></li>
              <li><Link href="/services/transport-logistics">Transport &amp; Logistics</Link></li>
              <li><Link href="/services/solar-piling">Solar Piling</Link></li>
            </ul>
          </div>
          <div>
            <h4>Company</h4>
            <ul>
              <li><Link href="/about">About EC Rentals</Link></li>
              <li><Link href="/about/safety-compliance">Safety &amp; Compliance</Link></li>
              <li><Link href="/about/team">Our Team</Link></li>
              <li><Link href="/projects">Projects</Link></li>
              <li><Link href="/tools">Tool Hire</Link></li>
            </ul>
          </div>
          <div>
            <h4>Contact</h4>
            <address>
              <strong>EC Rentals (Pty) Ltd</strong>
              {t(c, "contact.address", "Lead EPC Building, Cnr Hertz & Becquerel Street, Vanderbijlpark, South Africa")}
              <br />
              <br />
              <a href={tel(phone1)}>{phone1}</a>
              <a href={tel(phone2)}>{phone2}</a>
              <a href={`mailto:${info}`}>{info}</a>
              <a href={`mailto:${sales}`}>{sales}</a>
            </address>
          </div>
        </div>
        <div className="ft__legal">
          <span>© {new Date().getFullYear()} EC Rentals (Pty) Ltd. Company registration — to confirm.</span>
          <ul>
            <li><Link href="/privacy-policy">POPIA Privacy Notice</Link></li>
            <li><Link href="/terms-of-hire">Terms of Hire</Link></li>
            <li><Link href="/admin" className="ft__staff">Staff Sign In</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
