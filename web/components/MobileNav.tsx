"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  ["Equipment", "/equipment"],
  ["Tools", "/tools"],
  ["Services", "/services"],
  ["Industries", "/industries"],
  ["About", "/about"],
  ["Contact", "/contact"],
] as const;

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close on navigation
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button 
        className="nav-toggle" 
        onClick={() => setOpen(!open)}
        aria-label="Toggle navigation"
        aria-expanded={open}
      >
        <span className="nav-toggle__lines" aria-hidden="true">
          <span className={`nav-toggle__line ${open ? "is-open" : ""}`} />
          <span className={`nav-toggle__line ${open ? "is-open" : ""}`} />
        </span>
      </button>

      {open && (
        <div className="nav-mobile">
          <nav className="nav-mobile__in" aria-label="Mobile Navigation">
            {NAV.map(([label, href]) => (
              <Link key={href} href={href} className="nav-mobile__link">
                {label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
