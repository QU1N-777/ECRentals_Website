"use client";
import { useState } from "react";
import { addToBasket } from "@/lib/basket";

/**
 * Captures quantity, duration and required-from at the point of adding —
 * the same data model as the current site's quote form (plan §2.2), which
 * is the one thing about it that was already right.
 */
export default function AddToEnquiry({
  equipmentId,
  slug,
  title,
  compact = false,
}: {
  equipmentId: string;
  slug: string;
  title: string;
  compact?: boolean;
}) {
  const [qty, setQty] = useState(1);
  const [days, setDays] = useState(30);
  const [from, setFrom] = useState("");
  const [added, setAdded] = useState(false);

  const today = new Date().toISOString().slice(0, 10);

  function add() {
    addToBasket({ equipmentId, slug, title, qty, days, requiredFrom: from || null });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2200);
  }

  if (compact) {
    return (
      <button type="button" className="btn btn--primary btn--sm" onClick={add}>
        {added ? "Added ✓" : "Add to Enquiry"}
      </button>
    );
  }

  return (
    <div className="enq">
      <div className="enq__row">
        <label>
          <span>Quantity</span>
          <input
            type="number"
            min={1}
            max={99}
            value={qty}
            onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
          />
        </label>
        <label>
          <span>Hire duration (days)</span>
          <input
            type="number"
            min={1}
            value={days}
            onChange={(e) => setDays(Math.max(1, Number(e.target.value) || 1))}
          />
        </label>
        <label>
          <span>Required from</span>
          <input type="date" min={today} value={from} onChange={(e) => setFrom(e.target.value)} />
        </label>
      </div>
      <button type="button" className="btn btn--primary" onClick={add}>
        {added ? "Added to enquiry ✓" : "Add to Enquiry"}
      </button>
      <p className="enq__note">
        Availability is confirmed on quotation. Nothing is committed until we come back to you.
      </p>
    </div>
  );
}
