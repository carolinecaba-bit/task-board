"use client";

import { useDroppable } from "@dnd-kit/core";
import { useT } from "@/lib/i18n/context";
import type { Status, Task } from "@/lib/types";
import { TaskCard } from "./TaskCard";
import { AddCardInline } from "./AddCardInline";

export function Column({
  status,
  tasks,
  onOpenTask,
  onStatusChange,
  onAddCard,
}: {
  status: Status;
  tasks: Task[];
  onOpenTask: (task: Task) => void;
  onStatusChange: (taskId: string, status: Status) => void;
  onAddCard: (title: string) => void;
}) {
  const t = useT();
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      className="flex h-full flex-col rounded-lg"
      style={{ width: 280, minWidth: 280, background: "var(--surface-2)" }}
    >
      <div className="flex items-center gap-2 px-3 pt-3 pb-2">
        <h2 className="text-[13px] font-semibold" style={{ color: "var(--text)" }}>
          {t(`columns.${status}`)}
        </h2>
        <span
          className="rounded-full px-1.5 text-[11px] font-medium"
          style={{ background: "var(--surface)", color: "var(--muted)" }}
        >
          {tasks.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className="flex flex-1 flex-col gap-2 overflow-y-auto px-2 pb-2"
        style={{
          outline: isOver ? "2px dashed var(--accent)" : "none",
          outlineOffset: -4,
          borderRadius: 8,
          minHeight: 80,
        }}
      >
        {tasks.length === 0 && (
          <div
            className="flex flex-col items-center gap-1 rounded-lg border border-dashed px-3 py-6 text-center"
            style={{ borderColor: "var(--border)", color: "var(--muted)" }}
          >
            <p className="text-[12px]">{t("board.emptyColumn")}</p>
          </div>
        )}
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onOpen={() => onOpenTask(task)}
            onStatusChange={(s) => onStatusChange(task.id, s)}
          />
        ))}
      </div>

      <div className="px-2 pb-3">
        <AddCardInline onAdd={onAddCard} />
      </div>
    </div>
  );
}
