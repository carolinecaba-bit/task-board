"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/lib/i18n/context";

export function LoginForm() {
  const t = useT();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        setError(t("auth.invalid"));
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setError(t("auth.invalid"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex w-full max-w-sm flex-col gap-3 rounded-xl border p-6"
      style={{
        background: "var(--surface)",
        borderColor: "var(--border)",
        boxShadow: "var(--shadow-card-active)",
      }}
    >
      <h1 className="text-[17px] font-semibold">{t("auth.title")}</h1>
      <p className="text-[13px]" style={{ color: "var(--muted)" }}>
        {t("auth.subtitle")}
      </p>

      {error && (
        <div
          className="rounded-md px-3 py-2 text-[13px]"
          style={{ background: "var(--danger-soft)", color: "var(--danger)" }}
        >
          {error}
        </div>
      )}

      <label className="flex flex-col gap-1 text-[13px]">
        {t("auth.email")}
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-md border px-2.5 py-1.5 text-[13px]"
          style={{ borderColor: "var(--border)", background: "var(--bg)" }}
        />
      </label>

      <label className="flex flex-col gap-1 text-[13px]">
        {t("auth.password")}
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-md border px-2.5 py-1.5 text-[13px]"
          style={{ borderColor: "var(--border)", background: "var(--bg)" }}
        />
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="mt-1 rounded-md px-3 py-2 text-[13px] font-medium"
        style={{ background: "var(--accent)", color: "var(--accent-contrast, #fff)" }}
      >
        {t("auth.submit")}
      </button>
    </form>
  );
}
