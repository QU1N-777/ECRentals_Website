import Link from "next/link";
import BasketBadge from "./BasketBadge";

const NAV = [
  ["Equipment", "/equipment"],
  ["Tools", "/tools"],
  ["Services", "/services"],
  ["Industries", "/industries"],
  ["About", "/about"],
  ["Contact", "/contact"],
] as const;

export default function Header() {
  return (
    <header className="hdr">
      <div className="wrap hdr__in">
        <Link className="logo" href="/">
          EC<span>&nbsp;RENTALS</span>
        </Link>
        <nav className="nav" aria-label="Primary">
          {NAV.map(([label, href]) => (
            <Link key={href} href={href}>
              {label}
            </Link>
          ))}
        </nav>
        <BasketBadge />
      </div>
    </header>
  );
}
