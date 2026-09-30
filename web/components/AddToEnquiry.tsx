"use client";
import { useState, useEffect } from "react";
import { addToBasket, updateLine, removeLine, getBasket, BASKET_EVENT } from "@/lib/basket";
import type { BasketLine } from "@/lib/types";

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
  
  const [inBasket, setInBasket] = useState<BasketLine | null>(null);

  useEffect(() => {
    const check = () => {
      const line = getBasket().find(l => l.equipmentId === equipmentId);
      setInBasket(line || null);
    };
    check();
    window.addEventListener(BASKET_EVENT, check);
    return () => window.removeEventListener(BASKET_EVENT, check);
  }, [equipmentId]);

  const today = new Date().toISOString().slice(0, 10);

  function add() {
    addToBasket({ equipmentId, slug, title, qty, days, requiredFrom: from || null });
  }

  if (compact) {
    if (inBasket) {
      return (
        <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
          <button 
            type="button" 
            className="btn btn--primary btn--sm" 
            style={{ 
              background: "#3FB27F", 
              borderColor: "#3FB27F", 
              padding: "7px 10px", 
              fontSize: "11px",
              cursor: "pointer"
            }}
            onClick={() => removeLine(equipmentId)}
            title="Click to remove from enquiry"
          >
            Added ✓
          </button>
          <select
            style={{ 
              background: "var(--char2)", 
              border: "1px solid #3A3F45", 
              color: "#fff", 
              padding: "7px 8px", 
              borderRadius: "2px", 
              fontSize: "11.5px",
              cursor: "pointer"
            }}
            value={inBasket.qty}
            onChange={(e) => updateLine(equipmentId, { qty: Number(e.target.value) })}
            aria-label="Update quantity"
          >
            {[...Array(20)].map((_, i) => (
              <option key={i + 1} value={i + 1}>Qty: {i + 1}</option>
            ))}
          </select>
          <button
            type="button"
            className="btn btn--sm"
            style={{
              background: "rgba(220, 38, 38, 0.15)",
              color: "#F87171",
              border: "1px solid rgba(239, 68, 68, 0.4)",
              padding: "7px 10px",
              fontSize: "11px",
              borderRadius: "2px",
              fontWeight: 600,
              cursor: "pointer"
            }}
            onClick={() => removeLine(equipmentId)}
            title="Remove from enquiry"
          >
            Remove
          </button>
        </div>
      );
    }
    return (
      <button type="button" className="btn btn--primary btn--sm" onClick={add}>
        Add to Enquiry
      </button>
    );
  }

  if (inBasket) {
    return (
      <div className="enq">
        <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "16px", flexWrap: "wrap" }}>
          <button 
            type="button" 
            className="btn btn--primary" 
            style={{ background: "#3FB27F", borderColor: "#3FB27F", cursor: "pointer" }}
            onClick={() => removeLine(equipmentId)}
            title="Click to remove from enquiry"
          >
            Added to enquiry ✓
          </button>
          <select
            style={{ background: "var(--char2)", border: "1px solid #3A3F45", color: "#fff", padding: "14px", borderRadius: "2px", fontSize: "14.5px" }}
            value={inBasket.qty}
            onChange={(e) => updateLine(equipmentId, { qty: Number(e.target.value) })}
          >
            {[...Array(20)].map((_, i) => (
              <option key={i + 1} value={i + 1}>Qty: {i + 1}</option>
            ))}
          </select>
          <button
            type="button"
            className="btn"
            style={{
              background: "rgba(220, 38, 38, 0.15)",
              color: "#F87171",
              border: "1px solid rgba(239, 68, 68, 0.4)",
              padding: "14px 18px",
              fontSize: "14px",
              borderRadius: "2px",
              fontWeight: 600,
              cursor: "pointer"
            }}
            onClick={() => removeLine(equipmentId)}
            title="Remove from enquiry"
          >
            Remove
          </button>
        </div>
        <p className="enq__note">
          This item is in your enquiry. Click Added or Remove to deselect, or adjust quantity.
        </p>
      </div>
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
        Add to Enquiry
      </button>
      <p className="enq__note">
        Availability is confirmed on quotation. Nothing is committed until we come back to you.
      </p>
    </div>
  );
}
