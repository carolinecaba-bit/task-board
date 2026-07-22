"use client";

import { useTheme, type ThemePreference } from "@/lib/theme";
import { useT } from "@/lib/i18n/context";

const OPTIONS: { value: ThemePreference; icon: string }[] = [
  { value: "light", icon: "☀" },
  { value: "dark", icon: "☾" },
  { value: "system", icon: "◐" },
];

export function ThemeToggle() {
  const { preference, setPreference } = useTheme();
  const t = useT();

  return (
    <div
      className="flex items-center gap-0.5 rounded-full border p-0.5"
      style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}
      role="group"
      aria-label={t("theme.toggle")}
    >
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => setPreference(opt.value)}
          aria-label={t(`theme.${opt.value}`)}
          aria-pressed={preference === opt.value}
          className="flex items-center justify-center rounded-full text-sm transition-colors"
          style={{
            width: 28,
            height: 28,
            background:
              preference === opt.value ? "var(--surface)" : "transparent",
            color:
              preference === opt.value ? "var(--text)" : "var(--muted)",
            boxShadow:
              preference === opt.value ? "var(--shadow-card)" : "none",
          }}
        >
          {opt.icon}
        </button>
      ))}
    </div>
  );
}
