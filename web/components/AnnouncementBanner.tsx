"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export type BannerProps = {
  enabled: boolean;
  type: "alert" | "seasonal" | "info";
  text: string;
  linkText?: string | null;
  linkUrl?: string | null;
};

export default function AnnouncementBanner({
  enabled,
  type = "info",
  text,
  linkText,
  linkUrl,
}: BannerProps) {
  const [dismissed, setDismissed] = useState(false);

  // Check if dismissed previously in session
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isDismissed = sessionStorage.getItem(`ec_banner_dismissed_${text}`);
      if (isDismissed) {
        setDismissed(true);
      }
    }
  }, [text]);

  if (!enabled || !text?.trim() || dismissed) {
    return null;
  }

  function handleDismiss() {
    setDismissed(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(`ec_banner_dismissed_${text}`, "true");
    }
  }

  const icons = {
    alert: "🚨",
    seasonal: "✨",
    info: "📢",
  };

  const badgeLabels = {
    alert: "URGENT NOTICE",
    seasonal: "SEASONAL UPDATE",
    info: "FLEET ANNOUNCEMENT",
  };

  return (
    <aside
      className={`ann-banner ann-banner--${type}`}
      role="alert"
      aria-label="Important Announcement"
    >
      <div className="ann-banner__wrap">
        <div className="ann-banner__content">
          <span className="ann-banner__badge">
            <span className="ann-banner__icon">{icons[type] || "📢"}</span>
            <span className="ann-banner__type-label">{badgeLabels[type]}</span>
          </span>

          <span className="ann-banner__text">{text}</span>

          {linkText && linkUrl && (
            <Link
              href={linkUrl}
              className="ann-banner__link"
              target={linkUrl.startsWith("http") ? "_blank" : undefined}
              rel={linkUrl.startsWith("http") ? "noopener noreferrer" : undefined}
            >
              <span>{linkText}</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>

        <button
          type="button"
          className="ann-banner__close"
          onClick={handleDismiss}
          aria-label="Dismiss banner"
          title="Dismiss notification"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </div>
    </aside>
  );
}
