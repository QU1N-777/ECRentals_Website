"use client";
import { useState, useEffect } from "react";
import { BASKET_EVENT } from "@/lib/basket";

export default function CartToast() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let timer: number;
    const onBasket = (e: any) => {
      // The event is fired whenever the basket updates.
      // We only want to show the toast if something was ADDED.
      // We'll dispatch a custom detail from addToBasket.
      if (e.detail?.action === "add") {
        setShow(true);
        window.clearTimeout(timer);
        timer = window.setTimeout(() => setShow(false), 20000);
      }
    };
    window.addEventListener(BASKET_EVENT, onBasket);
    return () => {
      window.removeEventListener(BASKET_EVENT, onBasket);
      window.clearTimeout(timer);
    };
  }, []);

  if (!show) return null;

  return (
    <div className="toast">
      <div className="toast__in">
        <span className="toast__icon">✓</span>
        <div className="toast__txt">
          <strong>Added to Enquiry</strong>
          <p>Your item has been added.</p>
        </div>
        <button
          className="btn btn--primary btn--sm"
          onClick={() => {
            setShow(false);
            window.dispatchEvent(new CustomEvent("ecr:open-enquiry"));
          }}
        >
          View Enquiry
        </button>
        <button className="toast__x" onClick={() => setShow(false)}>✕</button>
      </div>
    </div>
  );
}
