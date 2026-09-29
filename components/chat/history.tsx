"use client";
import * as React from "react";
import Link from "next/link";
import { relativeTime } from "@/lib/utils";
import { cn } from "@/lib/cn";
import { LogoMark } from "@/components/LogoMark";
import { Plus, Search, MessageSquare, Pencil, Trash2, X, Sparkles } from "@/components/icons";
import type { Conversation } from "./types";

function dayBucket(ts: number) {
  const startOfDay = (t: number) => new Date(new Date(t).setHours(0, 0, 0, 0)).getTime();
  const days = Math.round((startOfDay(Date.now()) - startOfDay(ts)) / 86400000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return "Previous 7 days";
  if (days < 30) return "Previous 30 days";
  return "Older";
}
const BUCKET_ORDER = ["Today", "Yesterday", "Previous 7 days", "Previous 30 days", "Older"];

export interface HistoryProps {
  conversations: Conversation[];
  activeId: string;
  usage: { used: number; limit: number };
  onSelect: (id: string) => void;
  onNew: () => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
}

/** Rail body — shared by the desktop sidebar and the mobile drawer. */
export function HistoryBody(props: HistoryProps) {
  const [q, setQ] = React.useState("");
  const [editing, setEditing] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState("");

  const filtered = React.useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = [...props.conversations].sort((a, b) => b.updatedAt - a.updatedAt);
    if (!needle) return list;
    return list.filter(
      (c) => c.title.toLowerCase().includes(needle) || c.messages.some((m) => m.text.toLowerCase().includes(needle)),
    );
  }, [props.conversations, q]);

  const groups = React.useMemo(() => {
    const map = new Map<string, Conversation[]>();
    filtered.forEach((c) => {
      const b = dayBucket(c.updatedAt);
      const arr = map.get(b);
      if (arr) arr.push(c); else map.set(b, [c]);
    });
    return BUCKET_ORDER.filter((b) => map.has(b)).map((b) => ({ bucket: b, items: map.get(b)! }));
  }, [filtered]);

  const pct = Math.min(100, Math.round((props.usage.used / Math.max(1, props.usage.limit)) * 100));

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 space-y-2 p-3">
        <button
          type="button"
          onClick={props.onNew}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-700 px-3 py-2.5 text-sm font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,.18)] transition hover:bg-emerald-800"
        >
          <Plus size={16} /> New chat
        </button>
        <div className="relative">
          <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 opacity-50" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search chats"
            aria-label="Search conversations"
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] py-2 pl-8 pr-7 text-[13px] outline-none transition focus:border-emerald-600/60"
          />
          {q && (
            <button type="button" onClick={() => setQ("")} aria-label="Clear search" className="absolute right-2 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100">
              <X size={13} />
            </button>
          )}
        </div>
      </div>
      <div className="cz-scroll min-h-0 flex-1 overflow-y-auto px-2 pb-3">
        {!groups.length && (
          <div className="px-3 py-8 text-center text-[12px] opacity-60">
            {q ? "No conversations match that search." : "Your conversations will appear here."}
          </div>
        )}
        {groups.map((g) => (
          <div key={g.bucket} className="mb-1">
            <div className="px-2 pb-1 pt-2 text-[10px] font-extrabold uppercase tracking-widest opacity-50">{g.bucket}</div>
            <ul className="space-y-0.5">
              {g.items.map((c) => (
                <HistoryRow
                  key={c.id}
                  convo={c}
                  isActive={c.id === props.activeId}
                  editing={editing === c.id}
                  draft={draft}
                  setDraft={setDraft}
                  onStartEdit={() => { setEditing(c.id); setDraft(c.title); }}
                  onEndEdit={() => setEditing(null)}
                  onOpen={() => props.onSelect(c.id)}
                  onRename={(t) => props.onRename(c.id, t)}
                  onDelete={() => { if (confirm(`Delete "${c.title}"? This cannot be undone.`)) props.onDelete(c.id); }}
                />
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="shrink-0 border-t border-[var(--border)] p-3">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold">
          <Sparkles size={12} className="text-emerald-700 dark:text-emerald-300" />
          Assistant usage
          <span className="ml-auto tabular-nums opacity-70">{props.usage.used}/{props.usage.limit}</span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <div
            className={cn("h-full rounded-full transition-all", pct > 85 ? "bg-amber-500" : "bg-emerald-600")}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-2 text-[10px] leading-relaxed opacity-60">
          Chats stay on this device (up to 40 kept).
        </p>
      </div>
    </div>
  );
}

/** One conversation row: open on click, inline rename, confirm-before-delete. */
function HistoryRow({
  convo, isActive, editing, draft, setDraft, onStartEdit, onEndEdit, onOpen, onRename, onDelete,
}: {
  convo: Conversation;
  isActive: boolean;
  editing: boolean;
  draft: string;
  setDraft: (v: string) => void;
  onStartEdit: () => void;
  onEndEdit: () => void;
  onOpen: () => void;
  onRename: (title: string) => void;
  onDelete: () => void;
}) {
  const last = convo.messages[convo.messages.length - 1];

  if (editing) {
    return (
      <li className="relative px-1 py-1">
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => onRename(draft)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onRename(draft);
            if (e.key === "Escape") onEndEdit();
          }}
          aria-label="Conversation title"
          className="w-full rounded-lg border border-emerald-600/70 bg-[var(--card)] px-2 py-1.5 text-[13px] font-semibold outline-none"
        />
      </li>
    );
  }

  return (
    <li className="group/row relative">
      <button
        type="button"
        onClick={onOpen}
        aria-current={isActive ? "true" : undefined}
        className={cn(
          "block w-full rounded-xl px-2.5 py-2 pr-16 text-left transition",
          isActive ? "bg-emerald-50 ring-1 ring-inset ring-emerald-600/30 dark:bg-emerald-950/50" : "hover:bg-slate-100 dark:hover:bg-slate-800/60",
        )}
      >
        <span className="flex items-center gap-1.5">
          <MessageSquare size={12} className={cn("shrink-0", isActive ? "text-emerald-700 dark:text-emerald-300" : "opacity-40")} />
          <span className="truncate text-[13px] font-semibold">{convo.title}</span>
        </span>
        <span className="mt-0.5 block truncate pl-[18px] text-[11px] opacity-60">
          {last
            ? `${last.role === "user" ? "You: " : ""}${last.text.replace(/\s+/g, " ")}`
            : "No messages yet"}
        </span>
        <span className="block pl-[18px] text-[10px] opacity-50">
          {relativeTime(new Date(convo.updatedAt).toISOString())} · {convo.messages.length} msg
        </span>
      </button>
      <span className="absolute right-1 top-1 flex items-center gap-0.5 opacity-0 transition group-hover/row:opacity-100 focus-within:opacity-100">
        <button
          type="button"
          aria-label={`Rename ${convo.title}`}
          onClick={onStartEdit}
          className="rounded-md p-1 opacity-70 transition hover:bg-slate-200 hover:opacity-100 dark:hover:bg-slate-700"
        >
          <Pencil size={12} />
        </button>
        <button
          type="button"
          aria-label={`Delete ${convo.title}`}
          onClick={onDelete}
          className="rounded-md p-1 opacity-70 transition hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-950 dark:hover:text-red-300"
        >
          <Trash2 size={12} />
        </button>
      </span>
    </li>
  );
}


/** Desktop history rail (shown at lg+ by the assistant page). */
export function HistoryRail(props: HistoryProps) {
  return (
    <aside className="hidden w-[272px] shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface-lift)] lg:flex">
      <div className="flex h-14 shrink-0 items-center gap-2 border-b border-[var(--border)] px-3">
        <LogoMark size={30} />
        <div className="min-w-0">
          <div className="truncate font-display text-[13px] font-extrabold leading-none">Career Assistant</div>
          <div className="mt-1 text-[10px] uppercase tracking-widest opacity-60">History</div>
        </div>
      </div>
      <div className="min-h-0 flex-1">
        <HistoryBody {...props} />
      </div>
    </aside>
  );
}

/** Slide-in history drawer for phones/tablets. */
export function HistoryDrawer(props: HistoryProps & { open: boolean; onClose: () => void }) {
  React.useEffect(() => {
    if (!props.open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") props.onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [props.open, props.onClose]);

  if (!props.open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Conversation history">
      <div className="absolute inset-0 bg-slate-950/50" onClick={props.onClose} aria-hidden />
      <div className="absolute inset-y-0 left-0 flex w-[86%] max-w-[320px] flex-col border-r border-[var(--border)] bg-[var(--surface-lift)] shadow-2xl">
        <div className="flex h-14 shrink-0 items-center gap-2 border-b border-[var(--border)] px-3">
          <LogoMark size={30} />
          <span className="min-w-0 flex-1 truncate font-display text-[13px] font-extrabold">Career Assistant</span>
          <button
            type="button"
            onClick={props.onClose}
            aria-label="Close history"
            className="rounded-xl border border-[var(--border)] p-2 transition hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={16} />
          </button>
        </div>
        <div className="min-h-0 flex-1">
          <HistoryBody {...props} onSelect={(id) => { props.onSelect(id); props.onClose(); }} />
        </div>
      </div>
    </div>
  );
}

