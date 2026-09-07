import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { supabasePublic } from "@/lib/supabase/server";
import { img } from "@/lib/images";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Projects | EC Rentals Vanderbijlpark",
  description:
    "Where the EC Rentals fleet works — described by sector and province.",
};

export default async function Projects() {
  const { data } = await supabasePublic()
    .from("projects")
    .select("*")
    .eq("published", true)
    .order("sort_order");
  const projects = data ?? [];

  return (
    <>
      <section className="pagehead">
        <div className="wrap">
          <div className="rule" />
          <p className="eyebrow" style={{ marginBottom: 14 }}>Proof</p>
          <h1>Where the<br />fleet works</h1>
          <p className="pagehead__lede">
            Our plant runs on mining, steel, petrochemical, power and renewables sites across
            South Africa. Case studies are described by sector and province.
          </p>
        </div>
      </section>

      <section className="g-black">
        <div className="wrap">
          {projects.length === 0 ? (
            <div className="empty">
              <h2>Case studies in preparation</h2>
              <p>
                We do not publish a client&apos;s name, plant or site without their written
                permission, so this page stays empty until those approvals are in hand. It is
                the slower route, and the right one.
              </p>
              <div className="hero__cta" style={{ marginTop: 24 }}>
                <Link className="btn btn--primary" href="/equipment">Browse the fleet</Link>
                <Link className="btn btn--ghost" href="/industries">Industries we serve</Link>
              </div>
            </div>
          ) : (
            <div className="proj">
              {projects.map((p) => {
                const src = img(p.image_url);
                return (
                  <article className="proj__card" key={p.id}>
                    {src && (
                      <div className="proj__img">
                        <Image src={src} alt={p.title} width={660} height={440} />
                      </div>
                    )}
                    <div className="proj__b">
                      <span className="proj__tag">
                        {[p.sector, p.location].filter(Boolean).join(" · ")}
                      </span>
                      <h3>{p.title}</h3>
                      <p>{p.summary}</p>
                      {p.equipment_used && <p className="proj__kit">{p.equipment_used}</p>}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
