import Image from "next/image";
import Link from "next/link";
import { img } from "@/lib/images";
import AddToEnquiry from "./AddToEnquiry";
import type { Equipment } from "@/lib/types";

export default function EquipmentCard({ item }: { item: Equipment }) {
  const src = img(item.image_url);
  return (
    <article className="ecard">
      <Link className="ecard__img" href={`/equipment/item/${item.slug}`}>
        {src ? (
          <Image
            src={src}
            alt={`${item.title} available for hire from EC Rentals`}
            width={520}
            height={390}
            sizes="(max-width:640px) 100vw, (max-width:1100px) 50vw, 33vw"
          />
        ) : (
          <span className="ecard__ph">Photography pending</span>
        )}
        <div className="ecard__badges">
          {item.ownership === "Managed" && <span className="badge badge--managed">Managed hire</span>}
          {item.operator_available && <span className="badge badge--op">Operator available</span>}
        </div>
      </Link>
      <div className="ecard__body">
        <h3>
          <Link href={`/equipment/item/${item.slug}`}>{item.title}</Link>
        </h3>
        <p className="ecard__desc">{item.short_description}</p>
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
