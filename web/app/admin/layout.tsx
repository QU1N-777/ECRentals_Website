import Link from "next/link";
import type { Metadata } from "next";
import { checkAdmin } from "@/lib/supabase/session";
import LoginPanel from "./LoginPanel";
import SignOut from "./SignOut";
import "./admin.css";

export const metadata: Metadata = {
  title: "Admin | EC Rentals",
  robots: { index: false, follow: false },
};

// Auth state is per-request; nothing here may be cached.
export const dynamic = "force-dynamic";

const NAV = [
  ["Content", "/admin"],
  ["Equipment", "/admin/equipment"],
  ["Enquiries", "/admin/enquiries"],
  ["Access", "/admin/access"],
] as const;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { email, isAdmin } = await checkAdmin();

  if (!isAdmin) {
    return (
      <main className="adm adm--auth">
        <LoginPanel signedInAs={email} />
      </main>
    );
  }

  return (
    <main className="adm">
      <header className="adm__bar">
        <div className="adm__brand">
          <Link href="/">
            EC<span>&nbsp;RENTALS</span>
          </Link>
          <span className="adm__tag">Admin</span>
        </div>
        <nav className="adm__nav">
          {NAV.map(([label, href]) => (
            <Link key={href} href={href}>{label}</Link>
          ))}
        </nav>
        <div className="adm__who">
          <span>{email}</span>
          <SignOut />
        </div>
      </header>
      <div className="adm__body">{children}</div>
    </main>
  );
}
