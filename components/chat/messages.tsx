"use client";
import * as React from "react";
import { useStore } from "@/lib/store";
import { welcomeText, BASE_CHIPS } from "@/lib/copilot";
import { relativeTime } from "@/lib/utils";
import { cn } from "@/lib/cn";
import { LogoMark } from "@/components/LogoMark";
import { Markdown } from "./markdown";
import { ChatCardView } from "./cards";
import {
  Copy, Check, ThumbsUp, ThumbsDown, RotateCw, Square, AlertTriangle, Pencil, Briefcase, FileText, X, Sparkles,
} from "@/components/icons";
import type { ChatAction, ChatMessage, Conversation, Suggestion } from "./types";

export interface ChatListProps {
  conversation: Conversation;
  /** Assistant text is currently arriving for this conversation. */
  streaming: boolean;
  /** Request sent, first token not yet received (three-dot bubble). */
  thinking: boolean;
  /** Switching conversations — show skeletons. */
  loading: boolean;
  suggestions: Suggestion[];
  onSuggest: (s: Suggestion) => void;
  onAction: (a: ChatAction) => void;
  onRetry: () => void;
  onStop: () => void;
  onFeedback: (msgId: string, fb: "up" | "down") => void;
  onEditResend: (msgId: string, text: string) => void;
}

function useCopy() {
  const [copied, setCopied] = React.useState(false);
  const copy = React.useCallback((text: string) => {
    try {
      void navigator.clipboard?.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch { /* clipboard unavailable */ }
  }, []);
  return { copied, copy };
}

function IconButton({
  label, active, onClick, children, danger,
}: { label: string; active?: boolean; onClick?: () => void; children: React.ReactNode; danger?: boolean }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={cn(
        "rounded-lg p-1.5 transition",
        danger ? "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50"
          : active ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200"
          : "opacity-60 hover:bg-slate-100 hover:opacity-100 dark:hover:bg-slate-800",
      )}
    >
      {children}
    </button>
  );
}

/** Empty-state greeting + starter chips (original copy, unchanged). */
function Welcome({ suggestions, onSuggest }: { suggestions: Suggestion[]; onSuggest: (s: Suggestion) => void }) {
  const { profile } = useStore();
  return (
    <div className="mx-auto flex min-h-full max-w-3xl flex-col justify-center px-4 py-10">
      <div className="flex items-center gap-3">
        <LogoMark size={52} />
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight">CareerZim Copilot</h1>
          <p className="mt-0.5 inline-flex items-center gap-1.5 text-[12px] font-bold text-emerald-700 dark:text-emerald-300">
            <Sparkles size={12} /> Private · on-device chat history
          </p>
        </div>
      </div>

      <p className="mt-5 rounded-2xl rounded-tl-md border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm leading-relaxed">
        {welcomeText(profile)}
      </p>

      <div className="mt-5 text-[10px] font-extrabold uppercase tracking-widest opacity-60">Try asking</div>
      <div className="mt-2 flex flex-wrap gap-2">
        {suggestions.map((s) => (
          <button
            key={s.label}
            type="button"
            onClick={() => onSuggest(s)}
            className="rounded-full border border-[var(--border)] bg-[var(--card)] px-3.5 py-2 text-[13px] font-semibold transition hover:border-emerald-600/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-2 sm:grid-cols-3">
        {[
          { t: "Match jobs", d: "See which Zimbabwe roles fit your real skills." },
          { t: "Close gaps", d: "Turn missing requirements into a roadmap." },
          { t: "Track apps", d: "Follow-ups, statuses and interview prep." },
        ].map((f) => (
          <div key={f.t} className="rounded-xl border border-dashed border-[var(--border)] p-3">
            <div className="text-[12px] font-extrabold">{f.t}</div>
            <div className="mt-0.5 text-[11px] leading-relaxed opacity-70">{f.d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Skeleton bubbles shown while a past conversation is loading. */
function LoadingTurn() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 px-4 py-6" aria-busy="true" aria-label="Loading conversation">
      <div className="flex gap-3"><span className="cz-skeleton h-7 w-7 shrink-0 rounded-xl" /><span className="cz-skeleton h-20 w-2/3 rounded-2xl" /></div>
      <div className="flex justify-end"><span className="cz-skeleton h-12 w-1/3 rounded-2xl" /></div>
      <div className="flex gap-3"><span className="cz-skeleton h-7 w-7 shrink-0 rounded-xl" /><span className="cz-skeleton h-28 w-3/4 rounded-2xl" /></div>
    </div>
  );
}

/** Action buttons under an assistant reply (navigation + save/alert intents). */
function ActionButtons({ actions, onAction }: { actions: ChatAction[]; onAction: (a: ChatAction) => void }) {
  const { saved } = useStore();
  return (
    <div className="mt-2.5 flex flex-wrap gap-1.5">
      {actions.map((a, i) => {
        const isSaved = "intent" in a && a.intent === "saveJob" && !!a.jobId && saved.includes(a.jobId);
        const label = isSaved ? "Already saved" : a.label;
        const node = (
          <span className={cn("inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[12px] font-bold transition", isSaved && "border-amber-500/50 bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300")}>
            {label}
            {isSaved && <Check size={12} />}
          </span>
        );
        const href = "href" in a ? a.href : undefined;
        return href ? (
          <a key={i} href={href} className="rounded-lg border border-[var(--border)] transition hover:border-emerald-600/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/50">
            {node}
          </a>
        ) : (
          <button key={i} type="button" onClick={() => onAction(a)} className="rounded-lg border border-[var(--border)] transition hover:border-emerald-600/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/50">
            {node}
          </button>
        );
      })}
    </div>
  );
}

function AttachmentPills({ items }: { items: NonNullable<ChatMessage["attachments"]> }) {
  return (
    <div className="mb-1.5 flex flex-wrap gap-1.5">
      {items.map((a) => (
        <span key={`${a.kind}:${a.id}`} title={a.sub} className="inline-flex max-w-[220px] items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] px-2 py-1 text-[11px] font-semibold">
          {a.kind === "job" ? <Briefcase size={11} className="shrink-0 opacity-60" /> : <FileText size={11} className="shrink-0 opacity-60" />}
          <span className="truncate">{a.label}</span>
        </span>
      ))}
    </div>
  );
}

interface TurnHandlers {
  streaming: boolean;
  onAction: (a: ChatAction) => void;
  onRetry: () => void;
  onStop: () => void;
  onFeedback: (msgId: string, fb: "up" | "down") => void;
  onEditResend: (msgId: string, text: string) => void;
}

function AssistantTurn({ m, h }: { m: ChatMessage; h: TurnHandlers }) {
  const { copied, copy } = useCopy();
  const isStreaming = h.streaming;

  if (m.failed) {
    return (
      <div className="flex gap-3">
        <LogoMark size={28} className="rounded-xl" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2 rounded-2xl rounded-tl-md border border-red-500/40 bg-red-50 px-3.5 py-3 text-sm text-red-800 dark:bg-red-950/40 dark:text-red-200">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="font-semibold">{m.errorText || "Something went wrong while generating a reply."}</p>
              <button type="button" onClick={h.onRetry} className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-red-500/50 px-2.5 py-1.5 text-[12px] font-bold transition hover:bg-red-100 dark:hover:bg-red-900/50">
                <RotateCw size={12} /> Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group/turn flex gap-3">
      <LogoMark size={28} className="mt-1 rounded-xl" />
      <div className="min-w-0 flex-1">
        <div className="inline-block max-w-full rounded-2xl rounded-tl-md border border-[var(--border)] bg-[var(--card)] px-3.5 py-3">
          <Markdown text={m.text} />
          {isStreaming && <span aria-hidden className="cz-caret" />}
          {(m.cards ?? []).map((card, i) => <ChatCardView key={i} card={card} />)}
          {m.stopped && !isStreaming && (
            <div className="mt-2 text-[11px] font-semibold text-amber-700 dark:text-amber-400">Stopped early</div>
          )}
          {!isStreaming && m.actions?.length ? <ActionButtons actions={m.actions} onAction={h.onAction} /> : null}
        </div>

        {!isStreaming && (
          <div className="mt-1 flex items-center gap-0.5 opacity-0 transition group-hover/turn:opacity-100 focus-within:opacity-100">
            <span className="px-1.5 text-[10px] tabular-nums opacity-50">{relativeTime(new Date(m.createdAt).toISOString())}</span>
            <IconButton label={copied ? "Copied" : "Copy reply"} active={copied} onClick={() => copy(m.text)}>
              {copied ? <Check size={13} /> : <Copy size={13} />}
            </IconButton>
            <IconButton label="Helpful" active={m.feedback === "up"} onClick={() => h.onFeedback(m.id, "up")}>
              <ThumbsUp size={13} />
            </IconButton>
            <IconButton label="Not helpful" active={m.feedback === "down"} onClick={() => h.onFeedback(m.id, "down")}>
              <ThumbsDown size={13} />
            </IconButton>
            {!m.failed && <IconButton label="Regenerate" onClick={h.onRetry}><RotateCw size={13} /></IconButton>}
          </div>
        )}
      </div>
    </div>
  );
}

/** Your own turn — right aligned, copy + edit-and-resend. */
function UserTurn({ m, h }: { m: ChatMessage; h: TurnHandlers }) {
  const { copied, copy } = useCopy();
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(m.text);
  const ta = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (!editing) return;
    const el = ta.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    }
  }, [editing]);

  const submit = () => {
    const next = draft.trim();
    setEditing(false);
    if (next && next !== m.text) h.onEditResend(m.id, next);
    else setDraft(m.text);
  };

  if (editing) {
    return (
      <div className="flex justify-end">
        <form className="w-full max-w-[85%]" onSubmit={(e) => { e.preventDefault(); submit(); }}>
          <textarea
            ref={ta}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
              if (e.key === "Escape") { setEditing(false); setDraft(m.text); }
            }}
            aria-label="Edit your message"
            className="cz-scroll max-h-[200px] w-full resize-none rounded-2xl border border-emerald-600/70 bg-[var(--card)] px-3.5 py-2.5 text-sm leading-relaxed outline-none"
          />
          <div className="mt-1.5 flex justify-end gap-1.5">
            <button type="button" onClick={() => { setEditing(false); setDraft(m.text); }} className="rounded-lg border border-[var(--border)] px-2.5 py-1.5 text-[12px] font-bold transition hover:bg-slate-100 dark:hover:bg-slate-800">
              Cancel
            </button>
            <button type="submit" className="rounded-lg bg-emerald-700 px-3 py-1.5 text-[12px] font-bold text-white transition hover:bg-emerald-800">
              Send
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="group/turn flex justify-end">
      <div className="min-w-0 max-w-[85%]">
        {m.attachments?.length ? <div className="flex justify-end"><AttachmentPills items={m.attachments} /></div> : null}
        <div className="whitespace-pre-wrap break-words rounded-2xl rounded-tr-md bg-[var(--chat-bubble)] px-3.5 py-2.5 text-sm leading-relaxed shadow-[0_1px_0_rgba(2,6,23,.05)]">
          {m.text}
        </div>
        <div className="mt-1 flex items-center justify-end gap-0.5 opacity-0 transition group-hover/turn:opacity-100 focus-within:opacity-100">
          <span className="px-1.5 text-[10px] tabular-nums opacity-50">{relativeTime(new Date(m.createdAt).toISOString())}</span>
          <IconButton label={copied ? "Copied" : "Copy message"} active={copied} onClick={() => copy(m.text)}>
            {copied ? <Check size={13} /> : <Copy size={13} />}
          </IconButton>
          <IconButton label="Edit & resend" onClick={() => setEditing(true)}><Pencil size={13} /></IconButton>
        </div>
      </div>
    </div>
  );
}

/** Waiting for the first token. */
function ThinkingTurn() {
  return (
    <div className="flex gap-3" role="status" aria-live="polite" aria-label="Assistant is thinking">
      <LogoMark size={28} className="mt-1 rounded-xl" />
      <div className="rounded-2xl rounded-tl-md border border-[var(--border)] bg-[var(--card)] px-4 py-3.5">
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="cz-dot" style={{ animationDelay: "0ms" }} />
          <span aria-hidden className="cz-dot" style={{ animationDelay: "150ms" }} />
          <span aria-hidden className="cz-dot" style={{ animationDelay: "300ms" }} />
          <span className="ml-1 text-[11px] font-semibold opacity-60">Thinking…</span>
        </span>
      </div>
    </div>
  );
}

/** Renders the active conversation: welcome state, turns, thinking + next-step chips. */
export function MessageList(props: ChatListProps) {
  const { conversation, loading } = props;

  if (loading) return <LoadingTurn />;

  if (!conversation.messages.length && !props.thinking) {
    return <Welcome suggestions={props.suggestions} onSuggest={props.onSuggest} />;
  }

  const handlers = (streaming: boolean): TurnHandlers => ({
    streaming,
    onAction: props.onAction,
    onRetry: props.onRetry,
    onStop: props.onStop,
    onFeedback: props.onFeedback,
    onEditResend: props.onEditResend,
  });

  const isLast = conversation.messages.length - 1;
  const busy = props.thinking || props.streaming;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 px-4 py-6">
      {conversation.messages.map((m, i) => {
        const streaming = props.streaming && i === isLast;
        return m.role === "user"
          ? <UserTurn key={m.id} m={m} h={handlers(false)} />
          : <AssistantTurn key={m.id} m={m} h={handlers(streaming)} />;
      })}

      {props.thinking && <ThinkingTurn />}

      {!busy && props.suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5 border-t border-dashed border-[var(--border)] pt-3">
          <span className="w-full text-[10px] font-extrabold uppercase tracking-widest opacity-60">Next steps</span>
          {props.suggestions.map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => props.onSuggest(s)}
              className="rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-[12px] font-semibold transition hover:border-emerald-600/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
            >
              {s.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

