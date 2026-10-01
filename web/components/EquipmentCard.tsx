"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { img } from "@/lib/images";
import AddToEnquiry from "./AddToEnquiry";
import type { Equipment } from "@/lib/types";

export default function EquipmentCard({ item }: { item: Equipment }) {
  const [imgError, setImgError] = useState(false);
  const src = img(item.image_url || "managed-hire.webp");
  const availStatus = item.availability_status || "available";

  const statusLabels: Record<string, string> = {
    available: "Available Now",
    limited: "Limited Stock",
    on_hire: "On Project Hire",
    maintenance: "In Workshop",
  };

  return (
    <article className="ecard">
      <Link className="ecard__img" href={`/equipment/item/${item.slug}`}>
        {src && !imgError ? (
          <Image
            key={src}
            src={src}
            alt={`${item.title} available for hire from EC Rentals`}
            width={520}
            height={390}
            sizes="(max-width:640px) 100vw, (max-width:1100px) 50vw, 33vw"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="ecard__fallback-box">
            <span className="ecard__fallback-icon">🚜</span>
            <span className="ecard__fallback-title">{item.title}</span>
            <span className="ecard__fallback-sub">EC Rentals Fleet · Plant &amp; Machinery</span>
          </div>
        )}
        <div className="ecard__badges">
          {item.featured && <span className="badge badge--featured">⭐ Featured</span>}
          {item.ownership === "Managed" ? (
            <span className="badge badge--managed">Managed hire</span>
          ) : (
            <span className={`badge badge--avail-${availStatus}`}>
              <span className={`pulse-dot pulse-dot--${availStatus}`} />
              {statusLabels[availStatus] || "Available"}
            </span>
          )}
          {item.operator_available && <span className="badge badge--op">Operator available</span>}
        </div>
      </Link>
      <div className="ecard__body">
        <h3>
          <Link href={`/equipment/item/${item.slug}`}>{item.title}</Link>
        </h3>
        <p className="ecard__desc">{item.short_description}</p>

        {item.specs_badges && item.specs_badges.length > 0 && (
          <div className="ecard__spec-chips">
            {item.specs_badges.slice(0, 4).map((badge) => (
              <span key={badge} className="badge badge--spec">
                {badge}
              </span>
            ))}
          </div>
        )}

        <div className="ecard__foot">
          <span className="ecard__meta num">
            {item.ownership === "Managed"
              ? "Sourced on request"
              : `${item.fleet_qty} in fleet`}
            {item.delivery_class ? ` · ${item.delivery_class} delivery` : ""}
          </span>
          <AddToEnquiry
            compact
            equipmentId={item.id}
            slug={item.slug}
            title={item.title}
          />
        </div>
      </div>
    </article>
  );
}
