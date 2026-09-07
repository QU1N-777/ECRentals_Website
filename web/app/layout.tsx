import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EnquiryModal from "@/components/EnquiryModal";
import { getCategories } from "@/lib/queries";
import { getContent, t } from "@/lib/content";

export async function generateMetadata(): Promise<Metadata> {
  const c = await getContent();
  return {
    title: t(c, "seo.home.title", "EC Rentals | Plant, Vehicle & Operator Hire | Vanderbijlpark"),
    description: t(
      c,
      "seo.home.description",
      "Plant, vehicles, tools and operators for South Africa's heavy industry."
    ),
    metadataBase: new URL("https://ecrentals.co.za"),
    openGraph: { type: "website", locale: "en_ZA" },
    // Staging stays out of the index until cutover.
    robots: process.env.VERCEL_ENV === "production" ? undefined : { index: false, follow: false },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cats = await getCategories();
  return (
    <html lang="en-ZA">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap"
        />
      </head>
      <body>
        <Header />
        {children}
        <Footer />
        <EnquiryModal categories={cats.map((c) => ({ slug: c.slug, title: c.title }))} />
      </body>
    </html>
  );
}
