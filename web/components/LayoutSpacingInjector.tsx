"use client";

import { useEffect, useState } from "react";
import { DEFAULT_SPACING, configToCssVariables, type SpacingConfig } from "@/lib/spacing";

export const SPACING_STORAGE_KEY = "ec_rentals_spacing_config";
export const SPACING_CHANGE_EVENT = "ec_rentals_spacing_changed";

export default function LayoutSpacingInjector({ initialConfig }: { initialConfig?: SpacingConfig }) {
  const [config, setConfig] = useState<SpacingConfig>(initialConfig || DEFAULT_SPACING);

  useEffect(() => {
    // 1. Check local storage for instantaneous client sync
    try {
      const local = localStorage.getItem(SPACING_STORAGE_KEY);
      if (local) {
        const parsed = JSON.parse(local);
        setConfig((prev) => ({ ...prev, ...parsed }));
      }
    } catch (e) {
      // ignore
    }

    // 2. Fetch latest from API
    fetch("/api/admin/spacing")
      .then((res) => res.json())
      .then((data) => {
        if (data?.config) {
          setConfig(data.config);
          try {
            localStorage.setItem(SPACING_STORAGE_KEY, JSON.stringify(data.config));
          } catch (e) {}
        }
      })
      .catch(() => {});

    // 3. Listen to live updates from Admin Spacing Studio
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<SpacingConfig>;
      if (customEvent.detail) {
        setConfig(customEvent.detail);
      }
    };

    window.addEventListener(SPACING_CHANGE_EVENT, handleUpdate);
    return () => {
      window.removeEventListener(SPACING_CHANGE_EVENT, handleUpdate);
    };
  }, []);

  return (
    <style id="dynamic-site-spacing">{`
      :root {
        ${configToCssVariables(config)}
      }
    `}</style>
  );
}
