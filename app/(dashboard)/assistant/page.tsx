"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { JOBS } from "@/lib/jobs";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/toaster";
import { relativeTime, uid } from "@/lib/utils";
import type { JobAlert } from "@/lib/types";
import { copilotReply, detectTopic, BASE_CHIPS } from "@/lib/copilot";
import { deriveCards, suggestionsFor } from "@/components/chat/rich";
import { useConversations, useDailyUsage } from "@/components/chat/use-conversations";
import { MessageList } from "@/components/chat/messages";
import { Composer } from "@/components/chat/composer";
import { HistoryRail, HistoryDrawer } from "@/components/chat/history";
import type { Attachment, ChatAction, ChatCard, ChatMessage, Conversation, Suggestion } from "@/components/chat/types";
import { PanelLeft, Plus, ArrowDown } from "@/components/icons";

const EMPTY_CONV: Conversation = { id: "", title: "", createdAt: 0, updatedAt: 0, messages: [] };

export default function AssistantPage() {
  const { profile, apps, saved, setSaved, alerts, setAlerts } = useStore();
  const toast = useToast();
  const router = useRouter();

  const chat = useConversations();
  const usage = useDailyUsage();

  const [input, setInput] = React.useState("");
  const [attachments, setAttachments] = React.useState<Attachment[]>([]);
  const [streamingId, setStreamingId] = React.useState<string | null>(null);
  const [thinkingId, setThinkingId] = React.useState<string | null>(null);
  const [drawer, setDrawer] = React.useState(false);
  const [showJump, setShowJump] = React.useState(false);

  const scrollRef = React.useRef<HTMLDivElement>(null);
  const stickRef = React.useRef(true);
  const timerRef = React.useRef<number | null>(null);
  const partialRef = React.useRef("");
  const streamConvRef = React.useRef<string | null>(null);
  const streamMsgRef = React.useRef<string | null>(null);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  const active = chat.active;
  const lastMsg = active && active.messages.length ? active.messages[active.messages.length - 1] : undefined;
  const streaming = Boolean(lastMsg && lastMsg.id === streamingId);
  const thinking = Boolean(lastMsg && lastMsg.id === thinkingId);

  React.useEffect(() => () => { if (timerRef.current) window.clearInterval(timerRef.current); }, []);

  // A new conversation always starts pinned to the bottom.
  React.useEffect(() => {
    stickRef.current = true;
    setShowJump(false);
  }, [chat.activeId]);

  // Follow the stream unless the user scrolled up to read something.
  React.useEffect(() => {
    const el = scrollRef.current;
    if (el && stickRef.current) el.scrollTop = el.scrollHeight;
  }, [lastMsg?.text, chat.activeId, thinking, chat.loadingId]);

  const onScroll = React.useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const dist = el.scrollHeight - el.scrollTop - el.clientHeight;
    stickRef.current = dist < 140;
    setShowJump(dist > 360);
  }, []);

  const stopStream = React.useCallback(() => {
    if (timerRef.current) { window.clearInterval(timerRef.current); timerRef.current = null; }
    const convId = streamConvRef.current;
    const mid = streamMsgRef.current;
    if (convId && mid) {
      chat.updateMessage(convId, mid, (m) => ({ ...m, text: partialRef.current || m.text, stopped: true }));
    }
    streamConvRef.current = null;
    streamMsgRef.current = null;
    setStreamingId(null);
    setThinkingId(null);
  }, [chat]);

  /**
   * The only place an assistant turn is produced. Reply logic is the unchanged
   * copilotReply(); this just reveals its text token by token.
   */
  const beginReply = React.useCallback(
    (convId: string, prompt: string) => {
      const mid = uid("m");
      streamConvRef.current = convId;
      streamMsgRef.current = mid;
      partialRef.current = "";

      chat.appendMessage(convId, { id: mid, role: "assistant", text: "", createdAt: Date.now() });
      setThinkingId(mid);
      setStreamingId(mid);
      stickRef.current = true;

      let reply: string;
      let actions: ChatAction[] | undefined;
      let cards: ChatCard[] | undefined;

      try {
        const r = copilotReply(prompt, { profile, apps });
        reply = r.text;
        actions = r.actions;
        cards = deriveCards({ topic: r.topic, text: r.text, profile });
      } catch (err) {
        chat.updateMessage(convId, mid, (m) => ({
          ...m,
          failed: true,
          errorText: err instanceof Error ? err.message : "The assistant could not generate a reply.",
        }));
        streamConvRef.current = null;
        streamMsgRef.current = null;
        setStreamingId(null);
        setThinkingId(null);
        return;
      }

      const finish = () => {
        if (timerRef.current) { window.clearInterval(timerRef.current); timerRef.current = null; }
        partialRef.current = reply;
        chat.updateMessage(convId, mid, (m) => ({ ...m, text: reply, cards, actions, stopped: false }));
        streamConvRef.current = null;
        streamMsgRef.current = null;
        setStreamingId(null);
        setThinkingId(null);
      };

      const tokens = reply.split(/(\s+)/).filter(Boolean);
      const step = reply.length > 900 ? 3 : 2;
      let i = 0;
      timerRef.current = window.setInterval(() => {
        i += step;
        if (i >= tokens.length) { finish(); return; }
        const text = tokens.slice(0, i).join("");
        partialRef.current = text;
        chat.updateMessage(convId, mid, (m) => ({ ...m, text }));
        setThinkingId(null);
      }, 26);
    },
    [chat, profile, apps],
  );

  const usageNotice =
    usage.remaining === 0
      ? `You've used all ${usage.limit} assistant messages today — the counter resets at midnight.`
      : usage.remaining <= 5
        ? `Heads up: ${usage.remaining} assistant message${usage.remaining === 1 ? "" : "s"} left today.`
        : null;

  const blocked = () => {
    toast({
      title: "Daily limit reached",
      body: `You've used all ${usage.limit} assistant messages today. Resets at midnight.`,
    });
  };

  /** Send from the composer (or a suggestion chip / action phrase). */
  const send = React.useCallback(
    (override?: string) => {
      const text = (override ?? input).trim();
      const hasAttach = attachments.length > 0;
      if (!text && !hasAttach) return;
      if (!active || thinkingId || streamingId) return;
      if (usage.remaining <= 0) { blocked(); return; }

      const convId = active.id;
      setInput("");
      setAttachments([]);
      usage.inc();

      const userMsg: ChatMessage = {
        id: uid("m"),
        role: "user",
        text: text || "See attached context",
        createdAt: Date.now(),
        attachments: hasAttach ? [...attachments] : undefined,
      };
      chat.appendMessage(convId, userMsg);
      beginReply(convId, userMsg.text);
    },
    [input, attachments, active, thinkingId, streamingId, usage, chat, beginReply],
  );

  /** Regenerate the last assistant reply (toolbar button or error Retry). */
  const retry = React.useCallback(() => {
    if (!active || thinkingId || streamingId) return;
    const msgs = active.messages;
    const lastUser = [...msgs].reverse().find((m) => m.role === "user");
    if (!lastUser) return;
    if (usage.remaining <= 0) { blocked(); return; }

    const convId = active.id;
    const last = msgs[msgs.length - 1];
    if (last.role === "assistant") chat.truncateFrom(convId, last.id);
    usage.inc();
    beginReply(convId, lastUser.text);
  }, [active, thinkingId, streamingId, usage, chat, beginReply]);

  /** Edit a sent message: history is truncated from that point, then re-sent. */
  const editResend = React.useCallback(
    (msgId: string, newText: string) => {
      if (!active) return;
      if (thinkingId || streamingId) stopStream();
      if (usage.remaining <= 0) { blocked(); return; }

      const convId = active.id;
      chat.truncateFrom(convId, msgId);
      usage.inc();

      const userMsg: ChatMessage = { id: uid("m"), role: "user", text: newText, createdAt: Date.now(), edited: true };
      chat.appendMessage(convId, userMsg);
      beginReply(convId, newText);
    },
    [active, thinkingId, streamingId, stopStream, usage, chat, beginReply],
  );

  const onFeedback = React.useCallback(
    (msgId: string, fb: "up" | "down") => {
      if (!active) return;
      chat.updateMessage(active.id, msgId, (m) => ({ ...m, feedback: m.feedback === fb ? undefined : fb }));
      toast(
        fb === "up"
          ? { title: "Marked helpful", body: "Glad it helped — keep the questions coming." }
          : { title: "Thanks for the feedback", body: "We'll tune future replies." },
      );
    },
    [active, chat, toast],
  );

  /** Declarative follow-up actions on assistant replies (persisted with the chat). */
  const onAction = React.useCallback(
    (a: ChatAction) => {
      if ("href" in a) return; // plain navigation — rendered as <a> inside the bubble
      if (a.intent === "saveJob" && a.jobId) {
        const job = JOBS.find((j) => j.id === a.jobId);
        if (!job) return;
        if (saved.includes(a.jobId)) {
          setSaved(saved.filter((s) => s !== a.jobId));
          toast({ title: "Removed from saved", body: job.title });
        } else {
          setSaved([...saved, a.jobId]);
          toast({ title: `Saved "${job.title}"`, body: "Find it under Jobs → Saved." });
        }
        return;
      }
      if (a.intent === "createAlert") {
        const query =
          a.label.replace(/^create\s+(a\s+)?job\s+alert(\s+for)?\s*/i, "").trim() || profile.title || "Any role";
        const alert: JobAlert = {
          id: uid("al"),
          query,
          location: profile.location || "Harare",
          category: "",
          email: true,
          inApp: true,
          createdAt: new Date().toISOString(),
        };
        setAlerts([alert, ...alerts]);
        toast({ title: "Job alert created", body: `${query} · ${alert.location}` });
      }
    },
    [saved, setSaved, alerts, setAlerts, profile, toast],
  );

  const onSuggest = React.useCallback(
    (s: Suggestion) => {
      if (s.href) { router.push(s.href); return; }
      if (s.ask) send(s.ask);
    },
    [router, send],
  );

  /** Chips are derived from the last prompt's topic so they stay contextual. */
  const suggestions: Suggestion[] = React.useMemo(() => {
    const base: Suggestion[] = BASE_CHIPS.map((label) => ({ label, ask: label }));
    if (!active || !active.messages.length) return base;
    const lastUser = [...active.messages].reverse().find((m) => m.role === "user");
    if (!lastUser) return base;
    return suggestionsFor(detectTopic(lastUser.text), {
      apps: apps.length,
      saved: saved.length,
      cvs: 0,
    });
  }, [active, apps.length, saved.length]);

  const railProps = {
    conversations: chat.conversations,
    activeId: chat.activeId,
    usage: { used: usage.used, limit: usage.limit },
    onSelect: chat.select,
    onNew: () => { chat.startNew(); setDrawer(false); },
    onRename: chat.rename,
    onDelete: chat.remove,
  };

  const jumpToBottom = () => {
    stickRef.current = true;
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
    setShowJump(false);
  };

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden pb-[64px] lg:pb-0">
      <HistoryRail {...railProps} />

      <main className="relative flex min-h-0 min-w-0 flex-1 flex-col bg-[var(--background)]">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-[var(--border)] bg-[var(--surface-lift)] px-3 sm:px-4">
          <button
            type="button"
            onClick={() => setDrawer(true)}
            aria-label="Open conversation history"
            className="rounded-xl border border-[var(--border)] p-2 transition hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
          >
            <PanelLeft size={16} />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-display text-[15px] font-extrabold leading-tight">
              {active?.title ?? "Career Assistant"}
            </h1>
            <p className="truncate text-[11px] opacity-60">
              {active && active.messages.length
                ? `${active.messages.length} message${active.messages.length === 1 ? "" : "s"} · updated ${relativeTime(new Date(active.updatedAt).toISOString())}`
                : "Ask anything about jobs, skills, your CV or applications"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => { chat.startNew(); inputRef.current?.focus(); }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] px-2.5 py-2 text-[12px] font-bold transition hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Plus size={14} />
            <span className="hidden sm:inline">New chat</span>
          </button>
        </header>

        <div
          ref={scrollRef}
          onScroll={onScroll}
          className="cz-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain"
        >
          <MessageList
            conversation={active ?? EMPTY_CONV}
            loading={Boolean(chat.loadingId)}
            streaming={streaming}
            thinking={thinking}
            suggestions={suggestions}
            onSuggest={onSuggest}
            onAction={onAction}
            onRetry={retry}
            onStop={stopStream}
            onFeedback={onFeedback}
            onEditResend={editResend}
          />
        </div>

        {showJump && (
          <button
            type="button"
            onClick={jumpToBottom}
            aria-label="Scroll to latest"
            className="absolute bottom-32 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-pop)] transition hover:bg-slate-100 dark:hover:bg-slate-800 sm:right-6"
          >
            <ArrowDown size={16} />
          </button>
        )}

        <Composer
          value={input}
          onChange={setInput}
          onSend={() => send()}
          onStop={stopStream}
          streaming={thinking || streaming}
          attachments={attachments}
          setAttachments={setAttachments}
          usage={{ used: usage.used, limit: usage.limit }}
          notice={usageNotice}
          textareaRef={inputRef}
        />
      </main>

      <HistoryDrawer {...railProps} open={drawer} onClose={() => setDrawer(false)} />
    </div>
  );
}
