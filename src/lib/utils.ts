import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Generate a URL-safe slug from a string */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 80);
}

/** Generate a random hex color for collaboration cursors */
export function randomCursorColor(): string {
  const colors = [
    "#f03e3e", "#e8590c", "#f59f00", "#37b24d",
    "#1098ad", "#4c6ef5", "#7048e8", "#e64980",
    "#0ca678", "#3b5bdb", "#ae3ec9", "#d6336c",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

/** Format a date for display */
export function formatDate(date: Date | string, locale = "de-DE"): string {
  return new Date(date).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** Truncate text to a max length */
export function truncate(text: string, maxLength = 150): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trimEnd() + "…";
}
