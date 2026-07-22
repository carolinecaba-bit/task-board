export type Status = "todo" | "doing" | "done";

export type Workspace = {
  id: string;
  name: string;
};

export type Board = {
  id: string;
  name: string;
  workspaceId: string;
};

export type Member = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export type Task = {
  id: string;
  title: string;
  status: Status;
  boardId: string;
  assigneeId: string | null;
  assignee: { id: string; name: string; email: string } | null;
};

export const STATUSES: Status[] = ["todo", "doing", "done"];
