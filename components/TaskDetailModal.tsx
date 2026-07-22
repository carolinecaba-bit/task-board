"use client";

import { useEffect, useState } from "react";
import { useT } from "@/lib/i18n/context";
import type { Member, Status, Task } from "@/lib/types";
import { STATUSES } from "@/lib/types";
import { Avatar } from "./Avatar";

export function TaskDetailModal({
  task,
  members,
  onClose,
  onSave,
  onDelete,
}: {
  task: Task;
  members: Member[];
  onClose: () => void;
  onSave: (updates: {
    title: string;
    status: Status;
    assigneeId: string | null;
  }) => void;
  onDelete: () => void;
}) {
  const t = useT();
  const [title, setTitle] = useState(task.title);
  const [status, setStatus] = useState<Status>(task.status);
  const [assigneeId, setAssigneeId] = useState<string | null>(task.assigneeId);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  function save() {
    const trimmed = title.trim();
    if (!trimmed) return;
    onSave({ title: trimmed, status, assigneeId });
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
        className="flex w-full max-w-md flex-col gap-4 rounded-xl border p-5"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
          boxShadow: "var(--shadow-card-active)",
        }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-semibold">{t("task.edit")}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("task.close")}
            className="rounded-md px-1.5 py-1 text-sm hover:opacity-70"
            style={{ color: "var(--muted)" }}
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-medium" style={{ color: "var(--muted)" }}>
            {t("task.title")}
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-md border px-2.5 py-1.5 text-[13px] outline-none"
            style={{ borderColor: "var(--border)", background: "var(--bg)" }}
          />
        </div>

        <div className="flex gap-3">
          <div className="flex flex-1 flex-col gap-1.5">
            <label className="text-[12px] font-medium" style={{ color: "var(--muted)" }}>
              {t("task.status")}
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Status)}
              className="rounded-md border px-2.5 py-1.5 text-[13px]"
              style={{ borderColor: "var(--border)", background: "var(--bg)" }}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {t(`columns.${s}`)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-1 flex-col gap-1.5">
            <label className="text-[12px] font-medium" style={{ color: "var(--muted)" }}>
              {t("task.assignee")}
            </label>
            <select
              value={assigneeId ?? ""}
              onChange={(e) => setAssigneeId(e.target.value || null)}
              className="rounded-md border px-2.5 py-1.5 text-[13px]"
              style={{ borderColor: "var(--border)", background: "var(--bg)" }}
            >
              <option value="">{t("board.unassigned")}</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {assigneeId && (
          <div className="flex items-center gap-2 text-[12px]" style={{ color: "var(--muted)" }}>
            <Avatar
              name={members.find((m) => m.id === assigneeId)?.name ?? "?"}
              size={20}
            />
            {members.find((m) => m.id === assigneeId)?.name}
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          {confirmingDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-[12px]" style={{ color: "var(--danger)" }}>
                {t("task.deleteConfirmTitle")}
              </span>
              <button
                type="button"
                onClick={onDelete}
                className="rounded-md px-2.5 py-1 text-[12px] font-medium"
                style={{ background: "var(--danger)", color: "#fff" }}
              >
                {t("task.delete")}
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                className="text-[12px]"
                style={{ color: "var(--muted)" }}
              >
                {t("task.cancel")}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              className="rounded-md px-2.5 py-1.5 text-[12px] font-medium"
              style={{ background: "var(--danger-soft)", color: "var(--danger)" }}
            >
              {t("task.delete")}
            </button>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-2.5 py-1.5 text-[12px]"
              style={{ color: "var(--muted)" }}
            >
              {t("task.cancel")}
            </button>
            <button
              type="button"
              onClick={save}
              className="rounded-md px-3 py-1.5 text-[12px] font-medium"
              style={{ background: "var(--accent)", color: "var(--accent-fg)" }}
            >
              {t("task.save")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
