"use client";
import Link from "next/link";
import * as React from "react";
import { useTheme } from "./theme-provider";
import { Search, Bell, Sun, Moon } from "./icons";
import { useStore } from "@/lib/store";
import { completionOf } from "@/lib/safety";
import { timeGroup } from "@/lib/utils";

export function Topbar({ onSearch }: { onSearch: () => void }) {
  const { theme, setTheme } = useTheme();
  const { profile, notes, setNotes } = useStore();
  const [open, setOpen] = React.useState(false);
  const [tOpen, setTOpen] = React.useState(false);
  const unread = notes.filter((n) => !n.read).length;
  const pct = completionOf(profile as never);
  const today = notes.filter((n) => timeGroup(n.date) === "Today");
  const earlier = notes.filter((n) => timeGroup(n.date) !== "Today");
  const markRead = (id: string) => setNotes(notes.map((n) => (n.id === id ? { ...n, read: true } : n)));
  return (
    <header className="glass sticky top-0 z-20 border-b border-[var(--border)]">
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3">
        <Link href="/" className="font-display font-extrabold lg:hidden">CareerZim</Link>
        <button onClick={onSearch} aria-label="Global search" className="mx-auto hidden w-full max-w-md items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm opacity-90 md:flex">
          <Search size={16} /> Search jobs, CVs, applications…
          <kbd className="ml-auto rounded-md border border-[var(--border)] bg-slate-100 px-1.5 py-0.5 text-[11px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-100">Ctrl K</kbd>
        </button>
        <button onClick={onSearch} aria-label="Search" className="rounded-xl p-2.5 hover:bg-emerald-50 md:hidden dark:hover:bg-emerald-950"><Search size={19} /></button>
        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <Link href="/profile" className="hidden rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-900 sm:block dark:bg-emerald-900 dark:text-emerald-100">{pct}% profile</Link>
          <div className="relative">
            <button aria-label="Appearance" aria-haspopup="menu" onClick={() => setTOpen((v) => !v)} className="rounded-xl p-2.5 hover:bg-emerald-50 dark:hover:bg-emerald-950">{theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}</button>
            {tOpen && (
              <div role="menu" className="absolute right-0 mt-2 w-40 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-1.5 shadow-2xl">
                {(["Light", "Dark", "System"] as const).map((t) => (
                  <button key={t} role="menuitemradio" aria-checked={theme.toLowerCase() === t.toLowerCase()} onClick={() => { setTheme(t.toLowerCase()); setTOpen(false); }} className="flex w-full items-center rounded-xl px-3 py-2 text-left text-sm font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-950">
                    {t}{theme.toLowerCase() === t.toLowerCase() && <span className="ml-auto">✓</span>}
                  </button>))}
              </div>)}
          </div>
          <div className="relative">
            <button aria-label="Notifications" onClick={() => setOpen((v) => !v)} className="relative rounded-xl p-2.5 hover:bg-emerald-50 dark:hover:bg-emerald-950">
              <Bell size={19} />{unread > 0 && <span className="absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-400 px-1 text-[10px] font-extrabold text-emerald-950">{unread}</span>}
            </button>
            {open && (
              <div className="absolute right-0 mt-2 w-[340px] rounded-2xl border border-[var(--border)] bg-[var(--card)] p-3 shadow-2xl">
                <div className="flex items-center"><b className="text-sm">Notifications</b>
                  <button onClick={() => setNotes(notes.map((n) => ({ ...n, read: true })))} className="ml-auto text-xs font-bold text-emerald-700 dark:text-emerald-300">Mark all read</button></div>
                <div className="mt-2 max-h-80 space-y-3 overflow-y-auto">
                  {notes.length === 0 && <p className="rounded-xl bg-slate-50 p-4 text-center text-xs dark:bg-slate-900">All caught up. New job matches, deadlines and follow-ups will appear here.</p>}
                  {today.length > 0 && <><p className="text-[11px] font-extrabold uppercase opacity-60">Today</p>{today.map((n) => (
                    <button key={n.id} onClick={() => markRead(n.id)} className="block w-full rounded-xl border border-[var(--border)] p-2 text-left text-xs hover:bg-emerald-50 dark:hover:bg-emerald-950">
                      <b>{!n.read && "● "}{n.title}</b><div className="opacity-70">{n.body}</div></button>))}</>}
                  {earlier.length > 0 && <><p className="text-[11px] font-extrabold uppercase opacity-60">Earlier</p>{earlier.map((n) => (
                    <button key={n.id} onClick={() => markRead(n.id)} className="block w-full rounded-xl border border-[var(--border)] p-2 text-left text-xs hover:bg-emerald-50 dark:hover:bg-emerald-950">
                      <b>{!n.read && "● "}{n.title}</b><div className="opacity-70">{n.body}</div></button>))}</>}
                </div>
                <Link href="/settings" onClick={() => setOpen(false)} className="mt-2 block text-center text-xs font-bold text-emerald-700 dark:text-emerald-300">Notification settings</Link>
              </div>)}
          </div>
          <div className="relative">
            <Link href="/profile" aria-label="Profile" className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-800 text-sm font-extrabold text-white">{(profile.fullName || "C").slice(0, 1).toUpperCase()}</Link>
          </div>
        </div>
      </div>
    </header>
  );
}
