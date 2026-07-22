"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useT } from "@/lib/i18n/context";
import type { Board, Member, Status, Task, Workspace } from "@/lib/types";
import { TopBar } from "./TopBar";
import { Sidebar } from "./Sidebar";
import { BoardView } from "./BoardView";

const SIDEBAR_KEY = "task-board-sidebar-collapsed";

export function AppShell({
  userName,
  roleByWorkspace,
}: {
  userName: string;
  roleByWorkspace: Record<string, string>;
}) {
  const t = useT();

  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [boardsByWorkspace, setBoardsByWorkspace] = useState<
    Record<string, Board[]>
  >({});
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [collapsed, setCollapsed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(SIDEBAR_KEY);
    if (stored === "1") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from localStorage, unavailable during SSR
      setCollapsed(true);
    }
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((v) => {
      const next = !v;
      window.localStorage.setItem(SIDEBAR_KEY, next ? "1" : "0");
      return next;
    });
  }, []);

  // Load workspaces + their boards.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/workspaces");
        if (!res.ok) throw new Error("failed");
        const data = await res.json();
        if (cancelled) return;
        const ws: Workspace[] = data.workspaces;
        setWorkspaces(ws);

        const entries = await Promise.all(
          ws.map(async (w) => {
            const bRes = await fetch(`/api/workspaces/${w.id}/boards`);
            const bData = await bRes.json();
            return [w.id, bData.boards as Board[]] as const;
          })
        );
        if (cancelled) return;
        const map: Record<string, Board[]> = {};
        for (const [id, boards] of entries) map[id] = boards;
        setBoardsByWorkspace(map);

        const firstBoard = entries.find(([, boards]) => boards.length > 0)?.[1][0];
        if (firstBoard) setSelectedBoard(firstBoard);
      } catch {
        if (!cancelled) setError(t("errors.loadFailed"));
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load tasks + members for the selected board.
  useEffect(() => {
    if (!selectedBoard) return;
    let cancelled = false;
    (async () => {
      try {
        const [tRes, mRes] = await Promise.all([
          fetch(`/api/boards/${selectedBoard.id}/tasks`),
          fetch(`/api/workspaces/${selectedBoard.workspaceId}/members`),
        ]);
        const tData = await tRes.json();
        const mData = await mRes.json();
        if (cancelled) return;
        setTasks(tData.tasks);
        setMembers(mData.members);
      } catch {
        if (!cancelled) setError(t("errors.loadFailed"));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedBoard, t]);

  const addTask = useCallback(
    async (title: string, status: Status) => {
      if (!selectedBoard) return;
      const tempId = `temp-${Date.now()}`;
      const optimistic: Task = {
        id: tempId,
        title,
        status,
        boardId: selectedBoard.id,
        assigneeId: null,
        assignee: null,
      };
      setTasks((prev) => [...prev, optimistic]);
      try {
        const res = await fetch(`/api/boards/${selectedBoard.id}/tasks`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title }),
        });
        if (!res.ok) throw new Error("failed");
        const data = await res.json();
        const created: Task = { ...data.task, status };
        if (status !== "todo") {
          await fetch(`/api/tasks/${created.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
          });
        }
        setTasks((prev) =>
          prev.map((tk) => (tk.id === tempId ? created : tk))
        );
      } catch {
        setTasks((prev) => prev.filter((tk) => tk.id !== tempId));
        setError(t("errors.saveFailed"));
      }
    },
    [selectedBoard, t]
  );

  const changeStatus = useCallback(
    async (taskId: string, status: Status) => {
      const previous = tasks;
      setTasks((prev) =>
        prev.map((tk) => (tk.id === taskId ? { ...tk, status } : tk))
      );
      try {
        const res = await fetch(`/api/tasks/${taskId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });
        if (!res.ok) throw new Error("failed");
      } catch {
        setTasks(previous);
        setError(t("errors.saveFailed"));
      }
    },
    [tasks, t]
  );

  const updateTask = useCallback(
    async (
      taskId: string,
      updates: { title: string; status: Status; assigneeId: string | null }
    ) => {
      const previous = tasks;
      setTasks((prev) =>
        prev.map((tk) =>
          tk.id === taskId
            ? {
                ...tk,
                ...updates,
                assignee:
                  members.find((m) => m.id === updates.assigneeId) ?? null,
              }
            : tk
        )
      );
      try {
        const res = await fetch(`/api/tasks/${taskId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });
        if (!res.ok) throw new Error("failed");
        const data = await res.json();
        setTasks((prev) =>
          prev.map((tk) => (tk.id === taskId ? data.task : tk))
        );
      } catch {
        setTasks(previous);
        setError(t("errors.saveFailed"));
      }
    },
    [tasks, members, t]
  );

  const deleteTask = useCallback(
    async (taskId: string) => {
      const previous = tasks;
      setTasks((prev) => prev.filter((tk) => tk.id !== taskId));
      try {
        const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
        if (!res.ok) throw new Error("failed");
      } catch {
        setTasks(previous);
        setError(t("errors.saveFailed"));
      }
    },
    [tasks, t]
  );

  const hasBoards = useMemo(
    () => Object.values(boardsByWorkspace).some((b) => b.length > 0),
    [boardsByWorkspace]
  );

  return (
    <div className="flex h-screen flex-col">
      <TopBar userName={userName} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          workspaces={workspaces}
          boardsByWorkspace={boardsByWorkspace}
          selectedBoardId={selectedBoard?.id ?? null}
          onSelectBoard={setSelectedBoard}
          collapsed={collapsed}
          onToggleCollapsed={toggleCollapsed}
          roleByWorkspace={roleByWorkspace}
        />
        <main className="flex-1 overflow-hidden">
          {error && (
            <div
              className="mx-5 mt-3 rounded-md px-3 py-2 text-[13px]"
              style={{ background: "var(--danger-soft)", color: "var(--danger)" }}
              role="alert"
            >
              {error}
            </div>
          )}
          {selectedBoard ? (
            <BoardView
              board={selectedBoard}
              tasks={tasks}
              members={members}
              onAddTask={addTask}
              onChangeStatus={changeStatus}
              onUpdateTask={updateTask}
              onDeleteTask={deleteTask}
            />
          ) : (
            <div
              className="flex h-full flex-col items-center justify-center gap-1 text-center"
              style={{ color: "var(--muted)" }}
            >
              <p className="text-[14px]">
                {hasBoards ? t("board.selectBoard") : t("board.noBoards")}
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
