"use client";

import { useState } from "react";
import { MANAGER_QUEUE } from "@/data/mock";
import { QueueItem } from "@/types/domain";
import { QueueRow } from "./QueueRow";

export function QueueList() {
  const [items, setItems] = useState<QueueItem[]>(MANAGER_QUEUE);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function decide(id: string, status: QueueItem["status"]) {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
  }

  if (items.length === 0) {
    return (
      <div className="rounded-[13px] border border-dashed border-[#C9CDD2] bg-card px-6 py-[52px] text-center">
        <div className="mx-auto mb-[14px] flex h-10 w-10 items-center justify-center rounded-[12px] bg-accent-tint text-[18px] text-accent">
          ✓
        </div>
        <div className="text-[15px] font-semibold">Queue clear</div>
        <div className="mx-auto mt-[5px] max-w-[340px] text-[13px] leading-[1.55] text-muted">
          Nothing is waiting on you. New requests appear here and notify you by email.
        </div>
        <button
          onClick={() => setItems(MANAGER_QUEUE)}
          className="mt-4 rounded-[8px] border border-line bg-card px-[15px] py-2 text-[12.5px] font-medium transition-colors hover:bg-surface"
        >
          Restore demo queue
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[10px]">
      {items.map((item) => (
        <QueueRow
          key={item.id}
          item={item}
          expanded={expandedId === item.id}
          onToggle={() => setExpandedId((current) => (current === item.id ? null : item.id))}
          onApprove={() => decide(item.id, "approved")}
          onReject={() => decide(item.id, "rejected")}
          onUndo={() => decide(item.id, "pending")}
        />
      ))}
    </div>
  );
}
