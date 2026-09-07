"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { basketCount, BASKET_EVENT } from "@/lib/basket";
import { openEnquiry } from "./EnquiryModal";

/**
 * One button, two jobs. With items in the basket it goes to the itemised
 * review page; empty, it opens the quick-quote modal — so the button is never
 * a dead end.
 */
export default function BasketBadge() {
  const [n, setN] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const sync = () => setN(basketCount());
    sync();
    window.addEventListener(BASKET_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(BASKET_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return (
    <button
      type="button"
      className="basket"
      onClick={() => (n > 0 ? router.push("/enquiry") : openEnquiry())}
    >
      Enquiry <b className="num">{n}</b>
    </button>
  );
}
