"use client";
import * as React from "react";
import { useStore } from "@/lib/store";
import { JOBS } from "@/lib/jobs";
import { jobMatch } from "@/lib/safety";
import { Card } from "@/components/ui/card";
import { EmptyState, useToast } from "@/components/ui/toaster";

const COLS = ["Saved", "Preparing", "Applied", "Screening", "Interview", "Offer", "Rejected", "Withdrawn"];
export default function AppsPage() {
  const { apps, setApps, profile } = useStore();
  const toast = useToast();
  const [q, setQ] = React.useState("");
  const [view, setView] = React.useState("board");
  const move = (id: string, status: string) => {
    setApps(apps.map((a) => (a.id === id ? { ...a, status: status as never } : a)));
    toast({ title: `Moved to ${status}` });
  };
  const filtered = apps.filter((a) => (a.jobTitle + a.company).toLowerCase().includes(q.toLowerCase()));
  const stale = apps.filter((a) => {
    const d = new Date(a.dateApplied).getTime(); if (isNaN(d)) return false;
    const days = (Date.now() - d) / 86400000;
    return days >= 7 && ["Applied", "Screening"].includes(a.status);
  });
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="font-display text-2xl font-extrabold">My Applications ({apps.length})</h1>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter…" aria-label="Filter applications" className="ml-auto w-32 rounded-full border border-[var(--border)] bg-transparent px-3 py-2 text-xs" />
        <button onClick={() => setView(view === "board" ? "list" : "board")} className="rounded-full border border-[var(--border)] px-4 py-2 text-xs font-bold">{view === "board" ? "List view" : "Board view"}</button>
      </div>
      {stale.length > 0 && (
        <Card>
          <b className="text-sm">Follow-up assistant ({stale.length} need a nudge)</b>
          {stale.slice(0, 2).map((a) => {
            const draft = `Subject: Following up — ${a.jobTitle} application\n\nDear Hiring Team at ${a.company},\n\nI applied for ${a.jobTitle} on ${a.dateApplied} and wanted to kindly follow up. I'm ${profile.fullName || "a candidate"} (${profile.title || "applicant"}) and remain keen on the role.\n\nThank you for your time.\n\nKind regards,\n${profile.fullName}\n${profile.phone}`;
            return (
              <div key={a.id} className="mt-2 rounded-2xl border border-[var(--border)] p-3 text-xs">
                <b>{a.jobTitle} @ {a.company}</b> — no reply in 7+ days
                <pre className="mt-1 whitespace-pre-wrap rounded-xl bg-slate-50 p-2 dark:bg-slate-900">{draft}</pre>
                <div className="mt-2 flex gap-2">
                  <button onClick={() => { navigator.clipboard?.writeText(draft); toast({ title: "Copied" }); }} className="rounded-full border border-[var(--border)] px-3 py-1.5 font-bold">Copy</button>
                  <a href={`mailto:?subject=${encodeURIComponent(`Following up — ${a.jobTitle}`)}&body=${encodeURIComponent(draft)}`} className="rounded-full bg-emerald-700 px-3 py-1.5 font-bold text-white">Open in mail</a>
                </div>
              </div>);
          })}
        </Card>)}
      {view === "board" ? (
      <div className="flex snap-x gap-3 overflow-x-auto pb-2">
        {COLS.map((c) => (
          <div key={c} className="min-w-[240px] flex-1 snap-start rounded-[20px] border border-[var(--border)] bg-[var(--card)] p-3">
            <b className="text-sm">{c} ({filtered.filter((a) => a.status === c).length})</b>
            <div className="mt-2 space-y-2">
              {filtered.filter((a) => a.status === c).map((a) => (
                <div key={a.id} className="rounded-2xl border border-[var(--border)] p-3 text-xs">
                  <b className="text-sm">{a.jobTitle}</b><div className="opacity-70">{a.company} • {a.dateApplied}</div>
                  <select value={a.status} onChange={(e) => move(a.id, e.target.value)} className="mt-2 w-full rounded-lg border border-[var(--border)] bg-transparent p-1.5" aria-label="Move application">
                    {COLS.map((x) => <option key={x}>{x}</option>)}
                  </select>
                </div>))}
              {filtered.filter((a) => a.status === c).length === 0 && <p className="rounded-xl border border-dashed border-[var(--border)] p-3 text-center text-[11px] opacity-60">No {c.toLowerCase()} yet</p>}
            </div>
          </div>))}
      </div>) : (
      <Card>
        {filtered.length === 0 ? <p className="text-sm opacity-60">No applications match.</p> :
        <ul className="divide-y divide-[var(--border)] text-sm">{filtered.map((a) => (
          <li key={a.id} className="flex flex-wrap items-center gap-2 py-2"><b>{a.jobTitle}</b><span className="opacity-60">{a.company} • {a.status} • {a.dateApplied}</span>
            <select value={a.status} onChange={(e) => move(a.id, e.target.value)} aria-label="Move" className="ml-auto rounded-lg border border-[var(--border)] bg-transparent px-2 py-1 text-xs">{COLS.map((x) => <option key={x}>{x}</option>)}</select></li>))}</ul>}
      </Card>)}
    </div>
  );
}

