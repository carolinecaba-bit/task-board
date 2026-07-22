"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useT } from "@/lib/i18n/context";
import type { Status, Task } from "@/lib/types";
import { STATUSES } from "@/lib/types";
import { Avatar } from "./Avatar";
import { StatusChip } from "./StatusChip";

export function TaskCard({
  task,
  onOpen,
  onStatusChange,
}: {
  task: Task;
  onOpen: () => void;
  onStatusChange: (status: Status) => void;
}) {
  const t = useT();
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: task.id, data: { task } });

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        background: "var(--surface)",
        borderColor: "var(--border)",
        boxShadow: isDragging ? "var(--shadow-card-active)" : "var(--shadow-card)",
        opacity: isDragging ? 0.85 : 1,
        zIndex: isDragging ? 10 : undefined,
      }}
      className="animate-card-pop flex flex-col gap-2 rounded-lg border px-3 py-2.5 transition-shadow"
    >
      <button
        type="button"
        onClick={onOpen}
        className="text-left text-[13px] leading-snug"
        style={{ color: "var(--text)" }}
      >
        {task.title}
      </button>

      <div className="flex items-center justify-between gap-2">
        <div
          {...attributes}
          {...listeners}
          className="flex items-center gap-1.5 cursor-grab active:cursor-grabbing"
          style={{ touchAction: "none" }}
        >
          <StatusChip status={task.status} />
        </div>

        <div className="flex items-center gap-1.5">
          {task.assignee && <Avatar name={task.assignee.name} size={20} />}
          <label className="sr-only" htmlFor={`status-${task.id}`}>
            {t("task.status")}
          </label>
          <select
            id={`status-${task.id}`}
            value={task.status}
            onChange={(e) => onStatusChange(e.target.value as Status)}
            className="rounded-md border px-1 py-0.5 text-[11px]"
            style={{
              borderColor: "var(--border)",
              background: "var(--surface-2)",
              color: "var(--muted)",
              minHeight: 22,
            }}
            aria-label={t("task.status")}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {t(`columns.${s}`)}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
