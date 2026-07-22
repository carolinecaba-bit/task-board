"use client";

import { useCallback, useEffect, useState } from "react";
import { useT } from "@/lib/i18n/context";
import type { Member } from "@/lib/types";

export function MembersModal({
  workspaceId,
  workspaceName,
  onClose,
}: {
  workspaceId: string;
  workspaceName: string;
  onClose: () => void;
}) {
  const t = useT();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"owner" | "member">("member");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/members`);
      const data = await res.json();
      setMembers(data.members ?? []);
    } catch {
      setError(t("errors.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [workspaceId, t]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch on mount/workspace change, mirrors AppShell's data-loading effects
    load();
  }, [load]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  async function addMember(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? t("errors.saveFailed"));
        return;
      }
      if (data.temporaryPassword) {
        setNotice(
          t("members.temporaryPassword", { password: data.temporaryPassword })
        );
      }
      setName("");
      setEmail("");
      setRole("member");
      await load();
    } catch {
      setError(t("errors.saveFailed"));
    } finally {
      setSubmitting(false);
    }
  }

  async function changeRole(userId: string, nextRole: string) {
    setError(null);
    try {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/members/${userId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: nextRole }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? t("errors.saveFailed"));
        return;
      }
      await load();
    } catch {
      setError(t("errors.saveFailed"));
    }
  }

  async function removeMember(userId: string) {
    setError(null);
    try {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/members/${userId}`,
        { method: "DELETE" }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? t("errors.saveFailed"));
        return;
      }
      await load();
    } catch {
      setError(t("errors.saveFailed"));
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.4)" }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="flex w-full max-w-lg flex-col gap-4 rounded-xl border p-5"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
          boxShadow: "var(--shadow-card-active)",
        }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-semibold">
            {t("members.title")} — {workspaceName}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-[13px] hover:opacity-70"
            style={{ color: "var(--muted)" }}
          >
            {t("members.close")}
          </button>
        </div>

        {error && (
          <div
            className="rounded-md px-3 py-2 text-[13px]"
            style={{ background: "var(--danger-soft)", color: "var(--danger)" }}
          >
            {error}
          </div>
        )}
        {notice && (
          <div
            className="rounded-md px-3 py-2 text-[13px] break-all"
            style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
          >
            {notice}
          </div>
        )}

        <ul className="flex flex-col gap-1.5 max-h-56 overflow-y-auto">
          {loading && <li className="text-[13px]" style={{ color: "var(--muted)" }}>…</li>}
          {!loading &&
            members.map((m) => (
              <li
                key={m.id}
                className="flex items-center justify-between gap-2 rounded-md border px-2.5 py-1.5 text-[13px]"
                style={{ borderColor: "var(--border)" }}
              >
                <div className="min-w-0">
                  <div className="truncate font-medium">{m.name}</div>
                  <div className="truncate" style={{ color: "var(--muted)" }}>
                    {m.email}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={m.role}
                    onChange={(e) => changeRole(m.id, e.target.value)}
                    className="rounded-md border px-1.5 py-1 text-[12px]"
                    style={{ borderColor: "var(--border)", background: "var(--bg)" }}
                  >
                    <option value="owner">{t("members.roleOwner")}</option>
                    <option value="member">{t("members.roleMember")}</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => removeMember(m.id)}
                    className="rounded-md px-2 py-1 text-[12px]"
                    style={{ color: "var(--danger)" }}
                  >
                    {t("members.remove")}
                  </button>
                </div>
              </li>
            ))}
        </ul>

        <form onSubmit={addMember} className="flex flex-col gap-2 border-t pt-3" style={{ borderColor: "var(--border)" }}>
          <span className="text-[13px] font-semibold">{t("members.addTitle")}</span>
          <div className="flex gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("members.name")}
              className="min-w-0 flex-1 rounded-md border px-2.5 py-1.5 text-[13px]"
              style={{ borderColor: "var(--border)", background: "var(--bg)" }}
            />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("members.email")}
              type="email"
              required
              className="min-w-0 flex-1 rounded-md border px-2.5 py-1.5 text-[13px]"
              style={{ borderColor: "var(--border)", background: "var(--bg)" }}
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "owner" | "member")}
              className="rounded-md border px-1.5 py-1.5 text-[13px]"
              style={{ borderColor: "var(--border)", background: "var(--bg)" }}
            >
              <option value="owner">{t("members.roleOwner")}</option>
              <option value="member">{t("members.roleMember")}</option>
            </select>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md px-3 py-1.5 text-[13px] font-medium"
              style={{ background: "var(--accent)", color: "var(--accent-contrast, #fff)" }}
            >
              {t("members.add")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
