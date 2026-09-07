"use client";

import { openEnquiry } from "./EnquiryModal";

/**
 * Any "Request a Quote" / "Enquiry" affordance. Renders a real <button> so it
 * is keyboard-operable and never looks like a navigation it isn't.
 */
export default function QuoteButton({
  children = "Request a Quote",
  variant = "primary",
  size,
  category,
  className,
}: {
  children?: React.ReactNode;
  variant?: "primary" | "ghost" | "onlight" | "plain";
  size?: "sm" | "lg";
  /** Pre-tick a category when the modal opens. */
  category?: string;
  className?: string;
}) {
  const cls = [
    "btn",
    variant === "plain" ? "" : `btn--${variant}`,
    size ? `btn--${size}` : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type="button" className={cls} onClick={() => openEnquiry(category)}>
      {children}
    </button>
  );
}
