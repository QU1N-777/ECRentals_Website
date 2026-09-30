"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { getBasket, BASKET_EVENT, removeLine } from "@/lib/basket";
import { openEnquiry } from "./EnquiryModal";
import type { BasketLine } from "@/lib/types";

export default function BasketBadge() {
  const [basket, setBasket] = useState<BasketLine[]>([]);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sync = () => setBasket(getBasket());
    sync();
    window.addEventListener(BASKET_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(BASKET_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const n = basket.reduce((acc, l) => acc + l.qty, 0);

  useEffect(() => {
    const click = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", click);
    return () => document.removeEventListener("mousedown", click);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        className="basket"
        onClick={() => {
          if (n > 0) setOpen(!open);
          else openEnquiry();
        }}
      >
        Enquiry <b className="num">{n}</b>
      </button>

      {open && n > 0 && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            marginTop: "16px",
            background: "var(--char2)",
            border: "1px solid #3A3F45",
            borderRadius: "4px",
            padding: "20px",
            width: "360px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
            zIndex: 100,
            animation: "toastIn 0.2s ease-out",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h4 style={{ color: "#fff", fontSize: "15px", textTransform: "uppercase", letterSpacing: "0.5px", margin: 0 }}>
              Enquiry Preview
            </h4>
            <span style={{ fontSize: "12px", color: "var(--steel-lift)", background: "var(--black)", padding: "2px 6px", borderRadius: "2px" }}>
              {n} Item{n !== 1 && "s"}
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "320px", overflowY: "auto", marginBottom: "20px" }}>
            {basket.map((line) => (
              <div
                key={line.equipmentId}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "14px",
                  background: "var(--black)",
                  padding: "10px 14px",
                  borderRadius: "2px",
                }}
              >
                <div style={{ flex: 1, color: "var(--offwhite)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  <span style={{ color: "var(--amber)", fontWeight: "bold", marginRight: "8px" }}>
                    {line.qty}x
                  </span>
                  {line.title}
                </div>
                <button
                  onClick={() => removeLine(line.equipmentId)}
                  title="Remove item"
                  style={{ background: "none", border: "none", color: "var(--steel)", cursor: "pointer", padding: "0 4px", fontSize: "18px" }}
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
          <button
            className="btn btn--primary"
            style={{ width: "100%", padding: "14px", fontSize: "15px" }}
            onClick={() => {
              setOpen(false);
              router.push("/enquiry");
            }}
          >
            Commit Enquiry &rarr;
          </button>
        </div>
      )}
    </div>
  );
}
