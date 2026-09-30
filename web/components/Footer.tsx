import Link from "next/link";
import { getContent, t } from "@/lib/content";
import { getCategories } from "@/lib/queries";

export default async function Footer() {
  const [c, cats] = await Promise.all([getContent(), getCategories()]);
  const companyName = t(c, "footer.company_name", "EC Rentals (Pty) Ltd");
  const phone1 = t(c, "contact.phone_primary", "+27 66 429 5788");
  const phone2 = t(c, "contact.phone_secondary", "+27 82 850 4902");
  const whatsapp = t(c, "contact.whatsapp", "+27 66 429 5788");
  const info = t(c, "contact.email_info", "info@ecrentals.co.za");
  const sales = t(c, "contact.email_sales", "sales@ecrentals.co.za");
  const address = t(
    c,
    "contact.address",
    "Lead EPC Building\nCnr Hertz & Becquerel Street\nVanderbijlpark\nSouth Africa"
  );
  const hours = t(c, "contact.hours", "Mon – Fri: 07:00 – 17:00\n24/7 Breakdown Dispatch");
  const legalNotice = t(
    c,
    "footer.legal_notice",
    `© ${new Date().getFullYear()} ${companyName}. Heavy Plant, Crane Truck & Operator Hire across South Africa.`
  );
  const footerBlurb = t(c, "footer.blurb", "");
  const tel = (s: string) => `tel:${s.replace(/\s/g, "")}`;
  const wa = (s: string) => `https://wa.me/${s.replace(/[^0-9]/g, "")}`;

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
            <h4>Contact &amp; Yard</h4>
            <address>
              <strong className="ft__comp">{companyName}</strong>
              <div className="ft__address">{address}</div>

              <div className="ft__contact-links">
                {phone1 && (
                  <a href={tel(phone1)} className="ft__contact-link">
                    <span className="ft__icon">📞</span>
                    <span>{phone1}</span>
                  </a>
                )}
                {phone2 && (
                  <a href={tel(phone2)} className="ft__contact-link">
                    <span className="ft__icon">🚨</span>
                    <span>{phone2} <small style={{ color: "var(--amber)", fontSize: 11 }}>(24/7)</small></span>
                  </a>
                )}
                {whatsapp && (
                  <a href={wa(whatsapp)} target="_blank" rel="noopener noreferrer" className="ft__contact-link">
                    <span className="ft__icon">💬</span>
                    <span>{whatsapp} <small style={{ color: "#22c55e", fontSize: 11 }}>(WhatsApp)</small></span>
                  </a>
                )}
                {sales && (
                  <a href={`mailto:${sales}`} className="ft__contact-link">
                    <span className="ft__icon">💼</span>
                    <span>{sales}</span>
                  </a>
                )}
                {info && (
                  <a href={`mailto:${info}`} className="ft__contact-link">
                    <span className="ft__icon">✉️</span>
                    <span>{info}</span>
                  </a>
                )}
              </div>

              {hours && (
                <div className="ft__hours">
                  <strong>Yard &amp; Dispatch Hours</strong>
                  <div>{hours}</div>
                </div>
              )}
            </address>
          </div>
        </div>

        {footerBlurb && (
          <div className="ft__blurb">
            <p>{footerBlurb}</p>
          </div>
        )}

        <div className="ft__legal">
          <span>{legalNotice}</span>
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
