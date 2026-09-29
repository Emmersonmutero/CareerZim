"use client";
import * as React from "react";
import { JOBS } from "@/lib/jobs";
import { useStore } from "@/lib/store";
import { initials } from "@/components/ui/cards";
import { Paperclip, Send as SendIcon, Square, X, FileText, Briefcase, Sparkles } from "@/components/icons";
import { cn } from "@/lib/cn";
import type { Attachment } from "./types";

function attachmentKey(a: Attachment) {
  return `${a.kind}:${a.id}`;
}

/** Paperclip menu: reference one of your jobs or one of your CV versions. */
function AttachPicker({ attachments, onChange }: { attachments: Attachment[]; onChange: (a: Attachment[]) => void }) {
  const { cvs } = useStore();
  const [open, setOpen] = React.useState(false);
  const wrap = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const add = (a: Attachment) => {
    if (!attachments.some((x) => attachmentKey(x) === attachmentKey(a))) onChange([...attachments, a]);
    setOpen(false);
  };

  const jobOptions = JOBS.slice(0, 5);

  return (
    <div ref={wrap} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Attach a job or CV"
        className={cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)] transition",
          open ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-200" : "hover:bg-slate-100 dark:hover:bg-slate-800",
        )}
      >
        <Paperclip size={16} />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute bottom-11 left-0 z-30 w-[min(320px,calc(100vw-3rem))] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-lift)] shadow-[var(--shadow-pop)]"
        >
          <div className="border-b border-[var(--border)] px-3 py-2 text-[10px] font-extrabold uppercase tracking-widest opacity-60">Attach a job</div>
          <ul className="max-h-44 overflow-y-auto py-1">
            {jobOptions.map((j) => {
              const on = attachments.some((a) => attachmentKey(a) === attachmentKey({ kind: "job", id: j.id, label: j.title }));
              return (
                <li key={j.id}>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => add({ kind: "job", id: j.id, label: j.title, sub: `${j.company} · ${j.location}` })}
                    className={cn("flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] transition hover:bg-slate-100 dark:hover:bg-slate-800", on && "bg-emerald-50 dark:bg-emerald-950/60")}
                  >
                    <span aria-hidden className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-emerald-700 to-emerald-900 font-display text-[9px] font-extrabold text-white">
                      {initials(j.company)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-bold">{j.title}</span>
                      <span className="block truncate text-[11px] opacity-60">{j.company} · {j.location}</span>
                    </span>
                    <Briefcase size={12} className="shrink-0 opacity-50" />
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="border-y border-[var(--border)] px-3 py-2 text-[10px] font-extrabold uppercase tracking-widest opacity-60">Attach a CV</div>
          {cvs.length ? (
            <ul className="max-h-40 overflow-y-auto py-1">
              {cvs.map((c) => {
                const on = attachments.some((a) => attachmentKey(a) === attachmentKey({ kind: "cv", id: c.id, label: c.name }));
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => add({ kind: "cv", id: c.id, label: c.name, sub: `${c.template} · updated ${c.updatedAt}` })}
                      className={cn("flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] transition hover:bg-slate-100 dark:hover:bg-slate-800", on && "bg-emerald-50 dark:bg-emerald-950/60")}
                    >
                      <FileText size={14} className="shrink-0 opacity-60" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-bold">{c.name}</span>
                        <span className="block truncate text-[11px] opacity-60">{c.template} template · updated {c.updatedAt}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="px-3 py-3 text-[11px] opacity-60">No CV versions yet — create one in My CVs.</div>
          )}
        </div>
      )}
    </div>
  );
}

export interface ComposerProps {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  onStop: () => void;
  streaming: boolean;
  attachments: Attachment[];
  setAttachments: (a: Attachment[]) => void;
  usage: { used: number; limit: number };
  notice?: string | null;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}

/** Auto-growing composer with attach picker, Enter-to-send and a stop control. */
export function Composer(p: ComposerProps) {
  const ta = p.textareaRef;

  React.useEffect(() => {
    const el = ta.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [p.value, ta]);

  const remaining = Math.max(0, p.usage.limit - p.usage.used);
  const canSend = !p.streaming && (p.value.trim().length > 0 || p.attachments.length > 0) && remaining > 0;

  const removeAttachment = (a: Attachment) => p.setAttachments(p.attachments.filter((x) => attachmentKey(x) !== attachmentKey(a)));

  return (
    <div className="shrink-0 border-t border-[var(--border)] bg-[var(--surface-lift)] px-3 pb-3 pt-2 sm:px-4">
      <div className="mx-auto w-full max-w-3xl">
        {p.notice && (
          <div className="mb-2 rounded-xl border border-amber-500/30 bg-amber-50 px-3 py-2 text-[12px] font-semibold text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
            {p.notice}
          </div>
        )}

        {p.attachments.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {p.attachments.map((a) => (
              <span
                key={attachmentKey(a)}
                title={a.sub}
                className="inline-flex max-w-[240px] items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] py-1 pl-2 pr-1 text-[11px] font-semibold"
              >
                {a.kind === "job" ? <Briefcase size={12} className="shrink-0 opacity-60" /> : <FileText size={12} className="shrink-0 opacity-60" />}
                <span className="truncate">{a.label}</span>
                <button type="button" onClick={() => removeAttachment(a)} aria-label={`Remove ${a.label}`} className="rounded p-0.5 opacity-60 transition hover:bg-slate-200 hover:opacity-100 dark:hover:bg-slate-700">
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="flex items-end gap-1.5 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-1.5 shadow-[0_1px_0_rgba(2,6,23,.04)] transition focus-within:border-emerald-600/60">
          <AttachPicker attachments={p.attachments} onChange={p.setAttachments} />
          <textarea
            ref={ta}
            rows={1}
            value={p.value}
            onChange={(e) => p.onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                if (canSend) p.onSend();
              }
            }}
            placeholder="Ask about jobs, skills, your CV or applications…"
            aria-label="Message the Career Assistant"
            className="cz-scroll max-h-[200px] min-h-[38px] flex-1 resize-none bg-transparent py-2 text-sm leading-relaxed outline-none placeholder:opacity-60"
          />
          {p.streaming ? (
            <button
              type="button"
              onClick={p.onStop}
              aria-label="Stop generating"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50"
            >
              <Square size={14} />
            </button>
          ) : (
            <button
              type="button"
              onClick={p.onSend}
              disabled={!canSend}
              aria-label="Send message"
              className={cn(
                "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white transition",
                canSend ? "bg-emerald-700 shadow-[inset_0_1px_0_rgba(255,255,255,.2)] hover:bg-emerald-800" : "cursor-not-allowed bg-slate-300 dark:bg-slate-700",
              )}
            >
              <SendIcon size={16} />
            </button>
          )}
        </div>

        <div className="mt-1.5 flex items-center gap-2 px-1 text-[10px] opacity-60">
          <span><kbd className="rounded border border-[var(--border)] bg-[var(--card)] px-1 font-mono">Enter</kbd> send · <kbd className="rounded border border-[var(--border)] bg-[var(--card)] px-1 font-mono">Shift↵</kbd> new line</span>
          <span className={cn("ml-auto inline-flex items-center gap-1 font-semibold", remaining <= 5 ? "text-amber-600 dark:text-amber-400" : "")}>
            <Sparkles size={10} />{remaining} of {p.usage.limit} left today
          </span>
        </div>
      </div>
    </div>
  );
}

