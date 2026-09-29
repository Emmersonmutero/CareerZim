"use client";
import * as React from "react";
import { load, save, uid, todayISO } from "@/lib/utils";
import type { ChatMessage, Conversation } from "./types";

const CHATS_KEY = "cz_chats";
const ACTIVE_KEY = "cz_chat_active";
const USAGE_KEY = "cz_chat_usage";
const KEEP = 40;

/** Soft daily assistant cap — surfaces a hint when close, blocks when reached. */
export const MAX_DAILY = 60;

export function titleFromText(t: string) {
  const s = t.replace(/\s+/g, " ").trim();
  if (!s) return "New chat";
  return s.length > 44 ? s.slice(0, 44).trimEnd() + "…" : s;
}

export function newConversation(): Conversation {
  const now = Date.now();
  return { id: uid("chat"), title: "New chat", createdAt: now, updatedAt: now, messages: [] };
}

export function useConversations() {
  const [conversations, setConversations] = React.useState<Conversation[]>([]);
  const [activeId, setActiveId] = React.useState("");
  const [ready, setReady] = React.useState(false);
  /** Set while a past conversation is "loading" (skeleton bubbles). */
  const [loadingId, setLoadingId] = React.useState<string | null>(null);
  const timer = React.useRef<number | null>(null);

  React.useEffect(() => {
    const all = load<Conversation[]>(CHATS_KEY, []).filter((c) => c && Array.isArray(c.messages));
    let list = all;
    let active = load<string>(ACTIVE_KEY, "");
    if (!list.length) {
      const fresh = newConversation();
      list = [fresh];
      active = fresh.id;
    }
    if (!list.some((c) => c.id === active)) active = list[0].id;
    setConversations(list);
    setActiveId(active);
    setReady(true);
    return () => { if (timer.current) window.clearTimeout(timer.current); };
  }, []);

  React.useEffect(() => { if (ready) save(CHATS_KEY, conversations.slice(0, KEEP)); }, [conversations, ready]);
  React.useEffect(() => { if (ready && activeId) save(ACTIVE_KEY, activeId); }, [activeId, ready]);

  const active = conversations.find((c) => c.id === activeId) ?? null;

  /** Refs keep callbacks stable and avoid side effects inside state updaters. */
  const activeRef = React.useRef("");
  const listRef = React.useRef<Conversation[]>([]);
  React.useEffect(() => { activeRef.current = activeId; }, [activeId]);
  React.useEffect(() => { listRef.current = conversations; }, [conversations]);

  const patch = React.useCallback((id: string, fn: (c: Conversation) => Conversation) => {
    setConversations((cs) => cs.map((c) => (c.id === id ? fn(c) : c)));
  }, []);

  const appendMessage = React.useCallback(
    (convId: string, msg: ChatMessage) =>
      patch(convId, (c) => ({
        ...c,
        updatedAt: Date.now(),
        title: c.title === "New chat" && msg.role === "user" ? titleFromText(msg.text) : c.title,
        messages: [...c.messages, msg],
      })),
    [patch],
  );

  const updateMessage = React.useCallback(
    (convId: string, msgId: string, fn: (m: ChatMessage) => ChatMessage) =>
      patch(convId, (c) => ({ ...c, updatedAt: Date.now(), messages: c.messages.map((m) => (m.id === msgId ? fn(m) : m)) })),
    [patch],
  );

  /** Drop a message and everything after it (edit & resend / regenerate). */
  const truncateFrom = React.useCallback(
    (convId: string, msgId: string) =>
      patch(convId, (c) => ({ ...c, updatedAt: Date.now(), messages: c.messages.slice(0, c.messages.findIndex((m) => m.id === msgId)) })),
    [patch],
  );

  const setMessages = React.useCallback(
    (convId: string, next: ChatMessage[]) => patch(convId, (c) => ({ ...c, updatedAt: Date.now(), messages: next })),
    [patch],
  );

  const startNew = React.useCallback((): Conversation => {
    // Reuse an already-empty conversation instead of piling up blanks.
    const blank = listRef.current.find((x) => x.messages.length === 0);
    if (blank) { setActiveId(blank.id); return blank; }
    const c = newConversation();
    setConversations((cs) => [c, ...cs].slice(0, KEEP));
    setActiveId(c.id);
    return c;
  }, []);

  const select = React.useCallback((id: string) => {
    if (id === activeRef.current) return;
    setLoadingId(id);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setActiveId(id);
      setLoadingId(null);
    }, 420);
  }, []);

  const rename = React.useCallback(
    (id: string, title: string) => patch(id, (c) => ({ ...c, title: title.trim() || c.title })),
    [patch],
  );

  const remove = React.useCallback((id: string) => {
    const next = listRef.current.filter((c) => c.id !== id);
    const safe = next.length ? next : [newConversation()];
    setConversations(safe);
    if (activeRef.current === id) setActiveId(safe[0].id);
  }, []);

  const clearAll = React.useCallback(() => {
    const fresh = newConversation();
    setConversations([fresh]);
    setActiveId(fresh.id);
  }, []);

  return {
    conversations, active, activeId, ready, loadingId,
    appendMessage, updateMessage, truncateFrom, setMessages,
    startNew, select, rename, remove, clearAll,
  };
}

/** Daily message counter for the usage-cap hint. */
export function useDailyUsage() {
  const [used, setUsed] = React.useState(0);
  React.useEffect(() => {
    const u = load<{ date: string; n: number }>(USAGE_KEY, { date: todayISO(), n: 0 });
    setUsed(u.date === todayISO() ? u.n : 0);
  }, []);
  const inc = React.useCallback(() => {
    setUsed((n) => {
      const v = n + 1;
      save(USAGE_KEY, { date: todayISO(), n: v });
      return v;
    });
  }, []);
  return { used, limit: MAX_DAILY, remaining: Math.max(0, MAX_DAILY - used), inc };
}
