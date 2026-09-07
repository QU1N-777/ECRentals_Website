import type { Metadata } from "next";
import Link from "next/link";
import ToolSearch from "@/components/ToolSearch";
import { getTools } from "@/lib/queries";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Tool Hire | EC Rentals Vanderbijlpark",
  description:
    "Hand tools, power tools, cable and electrical kit, pipe and hydraulic, measurement, lifting and safety equipment — searchable and available for hire.",
};

export default async function ToolsPage() {
  const tools = await getTools();

  return (
    <>
      <section className="pagehead">
        <div className="wrap">
          <div className="rule" />
          <p className="eyebrow" style={{ marginBottom: 14 }}>Tool hire</p>
          <h1>
            <span className="num">{tools.length}</span> tools in stock
          </h1>
          <p className="pagehead__lede">
            A complete, granular tool catalogue — most competitors never publish theirs. Search
            it, then add what you need to the same enquiry as your plant.
          </p>
        </div>
      </section>

      <section className="g-black">
        <div className="wrap">
          <ToolSearch tools={tools} />

          <div className="callout">
            <div>
              <h2>Hiring tools alongside plant?</h2>
              <p>
                Put both on one enquiry. We quote it as a single job, delivered together.
              </p>
            </div>
            <Link className="btn btn--primary" href="/enquiry">Start an enquiry</Link>
          </div>
        </div>
      </section>
    </>
  );
}
