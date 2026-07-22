"use client";

import { useLocale } from "@/lib/i18n/context";
import type { Locale } from "@/lib/i18n/dictionaries";

const OPTIONS: Locale[] = ["es", "en"];

export function LangToggle() {
  const { locale, setLocale } = useLocale();

  return (
    <div
      className="flex items-center gap-0.5 rounded-full border p-0.5"
      style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}
      role="group"
      aria-label="Language"
    >
      {OPTIONS.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => setLocale(opt)}
          aria-pressed={locale === opt}
          className="flex items-center justify-center rounded-full text-xs font-medium uppercase transition-colors"
          style={{
            width: 28,
            height: 28,
            background: locale === opt ? "var(--surface)" : "transparent",
            color: locale === opt ? "var(--text)" : "var(--muted)",
            boxShadow: locale === opt ? "var(--shadow-card)" : "none",
          }}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
