"use client";

import { useRef, useState } from "react";
import { useT } from "@/lib/i18n/context";

export function AddCardInline({
  onAdd,
}: {
  onAdd: (title: string) => void;
}) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  function submit() {
    const title = value.trim();
    if (title) {
      onAdd(title);
    }
    setValue("");
    setOpen(false);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          requestAnimationFrame(() => inputRef.current?.focus());
        }}
        className="rounded-md px-2 py-1.5 text-left text-[13px] transition-colors hover:opacity-100"
        style={{ color: "var(--muted)", minHeight: 40 }}
      >
        {t("board.addCard")}
      </button>
    );
  }

  return (
    <div
      className="flex flex-col gap-1.5 rounded-lg border p-2"
      style={{ borderColor: "var(--border)", background: "var(--surface)" }}
    >
      <textarea
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submit();
          } else if (e.key === "Escape") {
            setValue("");
            setOpen(false);
          }
        }}
        onBlur={() => {
          if (!value.trim()) setOpen(false);
        }}
        placeholder={t("board.addCardPlaceholder")}
        rows={2}
        className="resize-none rounded-md text-[13px] outline-none"
        style={{ color: "var(--text)", background: "transparent" }}
      />
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={submit}
          className="rounded-md px-2.5 py-1 text-[12px] font-medium"
          style={{ background: "var(--accent)", color: "var(--accent-fg)" }}
        >
          {t("task.save")}
        </button>
        <button
          type="button"
          onClick={() => {
            setValue("");
            setOpen(false);
          }}
          className="rounded-md px-2 py-1 text-[12px]"
          style={{ color: "var(--muted)" }}
        >
          {t("task.cancel")}
        </button>
      </div>
    </div>
  );
}
