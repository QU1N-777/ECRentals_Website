"use client";
import type { BasketLine } from "./types";

/**
 * Session storage, not localStorage — the basket should survive navigation
 * and clear when the browser closes (plan §7.4).
 */
const KEY = "ecr.basket.v1";
export const BASKET_EVENT = "ecr:basket";

function read(): BasketLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as BasketLine[]) : [];
  } catch {
    return [];
  }
}

function write(lines: BasketLine[]) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(lines));
  } catch {
    /* private mode, quota — the basket is a convenience, never block the UI */
  }
  window.dispatchEvent(new CustomEvent(BASKET_EVENT));
}

export const getBasket = read;
export const basketCount = () => read().reduce((n, l) => n + l.qty, 0);

export function addToBasket(line: BasketLine) {
  const lines = read();
  const i = lines.findIndex((l) => l.equipmentId === line.equipmentId);
  if (i >= 0) lines[i] = { ...lines[i], qty: lines[i].qty + line.qty };
  else lines.push(line);
  write(lines);
}

export function updateLine(equipmentId: string, patch: Partial<BasketLine>) {
  write(read().map((l) => (l.equipmentId === equipmentId ? { ...l, ...patch } : l)));
}

export function removeLine(equipmentId: string) {
  write(read().filter((l) => l.equipmentId !== equipmentId));
}

export function clearBasket() {
  write([]);
}
