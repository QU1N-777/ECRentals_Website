import Image from "next/image";
import Link from "next/link";
import { img } from "@/lib/images";
import type { EquipmentCategory } from "@/lib/types";

export default function CategoryCard({
  category,
  count,
  priority = false,
}: {
  category: EquipmentCategory;
  count: number;
  priority?: boolean;
}) {
  const src = img(category.image_url);
  return (
    <Link className="card" href={`/equipment#${category.slug}`}>
      <div className="card__img">
        {src && (
          <Image
            src={src}
            alt={`${category.title} — EC Rentals fleet`}
            width={620}
            height={465}
            priority={priority}
            sizes="(max-width:640px) 100vw, (max-width:1100px) 50vw, 33vw"
          />
        )}
      </div>
      <div className="card__body">
        <h3>{category.title}</h3>
        <p className="card__benefit">{category.benefit_line}</p>
        <div className="card__meta">
          <span className="card__count num">
            {count} item{count === 1 ? "" : "s"}
          </span>
          <span className="card__go">View &rarr;</span>
        </div>
      </div>
    </Link>
  );
}
