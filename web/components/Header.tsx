import Link from "next/link";
import BasketBadge from "./BasketBadge";
import SettingsMenu from "./SettingsMenu";
import MobileNav from "./MobileNav";
import AnnouncementBanner from "./AnnouncementBanner";
import { getContent, t } from "@/lib/content";

const NAV = [
  ["Equipment", "/equipment"],
  ["Tools", "/tools"],
  ["Services", "/services"],
  ["Industries", "/industries"],
  ["About", "/about"],
  ["Contact", "/contact"],
] as const;

export default async function Header() {
  const c = await getContent();
  const bannerEnabled = t(c, "banner.enabled", "false") === "true";
  const bannerType = (t(c, "banner.type", "alert") as "alert" | "seasonal" | "info") || "alert";
  const bannerText = t(c, "banner.text", "");
  const bannerLinkText = t(c, "banner.link_text", "");
  const bannerLinkUrl = t(c, "banner.link_url", "");

  return (
    <header className="hdr">
      <AnnouncementBanner
        enabled={bannerEnabled}
        type={bannerType}
        text={bannerText}
        linkText={bannerLinkText}
        linkUrl={bannerLinkUrl}
      />
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
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginLeft: "auto" }}>
          <BasketBadge />
          <SettingsMenu />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}

