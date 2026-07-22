"use client";

import { useRouter } from "next/navigation";
import { useT } from "@/lib/i18n/context";
import { ThemeToggle } from "./ThemeToggle";
import { LangToggle } from "./LangToggle";

export function TopBar({ userName }: { userName: string }) {
  const t = useT();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header
      className="flex items-center justify-between gap-4 border-b px-4 py-2.5 shrink-0"
      style={{ borderColor: "var(--border)", background: "var(--surface)" }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className="font-semibold text-[15px] tracking-tight shrink-0">
          {t("app.name")}
        </span>
        <span
          className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium truncate"
          style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
          title={t("banner.signedInAs", { name: userName })}
        >
          <span
            className="inline-block h-1.5 w-1.5 rounded-full shrink-0"
            style={{ background: "var(--accent)" }}
            aria-hidden
          />
          {t("banner.signedInAs", { name: userName })}
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <LangToggle />
        <ThemeToggle />
        <button
          type="button"
          onClick={logout}
          className="rounded-md px-2.5 py-1.5 text-xs font-medium hover:opacity-70"
          style={{ color: "var(--muted)" }}
        >
          {t("banner.logout")}
        </button>
      </div>
    </header>
  );
}
