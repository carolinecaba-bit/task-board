"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import type { Board, Member, Status, Task } from "@/lib/types";
import { STATUSES } from "@/lib/types";
import { Column } from "./Column";
import { TaskCard } from "./TaskCard";
import { TaskDetailModal } from "./TaskDetailModal";

export function BoardView({
  board,
  tasks,
  members,
  onAddTask,
  onChangeStatus,
  onUpdateTask,
  onDeleteTask,
}: {
  board: Board;
  tasks: Task[];
  members: Member[];
  onAddTask: (title: string, status: Status) => void;
  onChangeStatus: (taskId: string, status: Status) => void;
  onUpdateTask: (
    taskId: string,
    updates: { title: string; status: Status; assigneeId: string | null }
  ) => void;
  onDeleteTask: (taskId: string) => void;
}) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [openTask, setOpenTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  function handleDragStart(event: DragStartEvent) {
    const task = event.active.data.current?.task as Task | undefined;
    setActiveTask(task ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;
    const newStatus = over.id as Status;
    const task = active.data.current?.task as Task | undefined;
    if (task && task.status !== newStatus) {
      onChangeStatus(task.id, newStatus);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="px-5 pt-4 pb-3 shrink-0">
        <h1 className="text-[17px] font-semibold tracking-tight">
          {board.name}
        </h1>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-1 gap-3 overflow-x-auto px-5 pb-5">
          {STATUSES.map((status) => (
            <Column
              key={status}
              status={status}
              tasks={tasks.filter((tk) => tk.status === status)}
              onOpenTask={setOpenTask}
              onStatusChange={onChangeStatus}
              onAddCard={(title) => onAddTask(title, status)}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <TaskCard
              task={activeTask}
              onOpen={() => {}}
              onStatusChange={() => {}}
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      {openTask && (
        <TaskDetailModal
          task={openTask}
          members={members}
          onClose={() => setOpenTask(null)}
          onSave={(updates) => {
            onUpdateTask(openTask.id, updates);
            setOpenTask(null);
          }}
          onDelete={() => {
            onDeleteTask(openTask.id);
            setOpenTask(null);
          }}
        />
      )}
    </div>
  );
}
