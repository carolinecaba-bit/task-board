import { useT } from "@/lib/i18n/context";
import type { Status } from "@/lib/types";

const VARS: Record<Status, { fg: string; bg: string }> = {
  todo: { fg: "var(--status-todo)", bg: "var(--status-todo-bg)" },
  doing: { fg: "var(--status-doing)", bg: "var(--status-doing-bg)" },
  done: { fg: "var(--status-done)", bg: "var(--status-done-bg)" },
};

export function StatusChip({ status }: { status: Status }) {
  const t = useT();
  const colors = VARS[status];
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
      style={{ color: colors.fg, background: colors.bg }}
    >
      {t(`columns.${status}`)}
    </span>
  );
}
