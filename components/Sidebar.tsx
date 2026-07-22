"use client";

import { useState } from "react";
import { useT } from "@/lib/i18n/context";
import type { Board, Workspace } from "@/lib/types";
import { MembersModal } from "./MembersModal";

export function Sidebar({
  workspaces,
  boardsByWorkspace,
  selectedBoardId,
  onSelectBoard,
  collapsed,
  onToggleCollapsed,
  roleByWorkspace,
}: {
  workspaces: Workspace[];
  boardsByWorkspace: Record<string, Board[]>;
  selectedBoardId: string | null;
  onSelectBoard: (board: Board) => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  roleByWorkspace: Record<string, string>;
}) {
  const t = useT();

  if (collapsed) {
    return (
      <div
        className="flex flex-col items-center border-r py-3 shrink-0"
        style={{ borderColor: "var(--border)", width: 48 }}
      >
        <button
          type="button"
          onClick={onToggleCollapsed}
          aria-label={t("sidebar.expand")}
          className="flex items-center justify-center rounded-md hover:opacity-70"
          style={{ width: 32, height: 32, color: "var(--muted)" }}
        >
          »
        </button>
      </div>
    );
  }

  return (
    <nav
      className="flex flex-col border-r shrink-0 overflow-y-auto"
      style={{ borderColor: "var(--border)", width: 232, background: "var(--surface)" }}
      aria-label={t("sidebar.workspaces")}
    >
      <div className="flex items-center justify-between px-3 pt-3 pb-1">
        <span
          className="text-xs font-semibold uppercase tracking-wide"
          style={{ color: "var(--muted)" }}
        >
          {t("sidebar.workspaces")}
        </span>
        <button
          type="button"
          onClick={onToggleCollapsed}
          aria-label={t("sidebar.collapse")}
          className="flex items-center justify-center rounded-md hover:opacity-70"
          style={{ width: 24, height: 24, color: "var(--muted)" }}
        >
          «
        </button>
      </div>

      <div className="flex flex-col gap-3 px-2 pb-4 pt-1">
        {workspaces.map((ws) => (
          <WorkspaceGroup
            key={ws.id}
            workspace={ws}
            boards={boardsByWorkspace[ws.id] ?? []}
            selectedBoardId={selectedBoardId}
            onSelectBoard={onSelectBoard}
            isOwner={roleByWorkspace[ws.id] === "owner"}
          />
        ))}
      </div>
    </nav>
  );
}

function WorkspaceGroup({
  workspace,
  boards,
  selectedBoardId,
  onSelectBoard,
  isOwner,
}: {
  workspace: Workspace;
  boards: Board[];
  selectedBoardId: string | null;
  onSelectBoard: (board: Board) => void;
  isOwner: boolean;
}) {
  const t = useT();
  const [open, setOpen] = useState(true);
  const [managingUsers, setManagingUsers] = useState(false);

  return (
    <div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex flex-1 min-w-0 items-center gap-1.5 rounded-md px-1.5 py-1 text-left text-[13px] font-semibold hover:opacity-80"
        >
          <span
            className="text-[10px] transition-transform"
            style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)" }}
            aria-hidden
          >
            ▸
          </span>
          <span className="truncate">{workspace.name}</span>
        </button>
        {isOwner && (
          <button
            type="button"
            onClick={() => setManagingUsers(true)}
            title={t("members.manage")}
            aria-label={t("members.manage")}
            className="shrink-0 rounded-md px-1.5 py-1 text-[12px] hover:opacity-70"
            style={{ color: "var(--muted)" }}
          >
            ⚙
          </button>
        )}
      </div>
      {open && (
        <ul className="mt-0.5 flex flex-col gap-0.5 pl-4">
          {boards.map((board) => {
            const active = board.id === selectedBoardId;
            return (
              <li key={board.id}>
                <button
                  type="button"
                  onClick={() => onSelectBoard(board)}
                  className="block w-full truncate rounded-md px-2 py-1.5 text-left text-[13px] transition-colors"
                  style={{
                    background: active ? "var(--accent-soft)" : "transparent",
                    color: active ? "var(--accent)" : "var(--text)",
                    fontWeight: active ? 600 : 400,
                  }}
                >
                  {board.name}
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {managingUsers && (
        <MembersModal
          workspaceId={workspace.id}
          workspaceName={workspace.name}
          onClose={() => setManagingUsers(false)}
        />
      )}
    </div>
  );
}
