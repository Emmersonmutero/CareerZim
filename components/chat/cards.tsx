"use client";
import * as React from "react";
import Link from "next/link";
import { JOBS } from "@/lib/jobs";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/toaster";
import { initials } from "@/components/ui/cards";
import { Bookmark, MapPin, Check, ExternalLink } from "@/components/icons";
import { cn } from "@/lib/cn";
import type { ChatCard } from "./types";

function scoreTone(n: number) {
  if (n >= 70) return "bg-emerald-100 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100";
  if (n >= 45) return "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300";
  return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200";
}

/** Compact, interactive job card sized to sit inside a chat bubble. */
export function MiniJobCard({ jobId, score }: { jobId: string; score: number }) {
  const job = JOBS.find((j) => j.id === jobId);
  const { saved, setSaved } = useStore();
  const toast = useToast();
  if (!job) return null;
  const isSaved = saved.includes(job.id);

  const toggle = () => {
    if (isSaved) {
      setSaved(saved.filter((s) => s !== job.id));
      toast({ title: "Removed from saved", body: job.title });
    } else {
      setSaved([...saved, job.id]);
      toast({ title: `Saved "${job.title}"`, body: "Added to your bookmarks." });
    }
  };

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-2.5 transition hover:border-emerald-600/50">
      <div className="flex items-start gap-2">
        <span aria-hidden className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-700 to-emerald-900 font-display text-[11px] font-extrabold text-white">
          {initials(job.company)}
        </span>
        <div className="min-w-0 flex-1">
          <Link href={`/jobs/${job.id}`} className="block truncate text-[13px] font-bold leading-snug hover:underline">{job.title}</Link>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[11px] opacity-70">
            <span className="truncate">{job.company}</span>
            <span aria-hidden>•</span>
            <span className="inline-flex items-center gap-1"><MapPin size={11} />{job.location}</span>
          </div>
        </div>
        <span className={cn("shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-extrabold", scoreTone(score))} title="Match score">{score}%</span>
      </div>
      <div className="mt-2 flex gap-1.5">
        <Link href={`/jobs/${job.id}`} className="flex-1 rounded-lg bg-emerald-700 px-2.5 py-1.5 text-center text-[11px] font-bold text-white transition hover:bg-emerald-800">
          View
        </Link>
        <button
          type="button"
          onClick={toggle}
          aria-pressed={isSaved}
          className={cn(
            "inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-[var(--border)] px-2.5 py-1.5 text-[11px] font-bold transition hover:bg-slate-50 dark:hover:bg-slate-800",
            isSaved && "bg-amber-100 text-amber-900 hover:bg-amber-200 dark:bg-amber-950 dark:text-amber-300",
          )}
        >
          <Bookmark size={12} />{isSaved ? "Saved" : "Save"}
        </button>
      </div>
    </div>
  );
}

export function JobsCardGroup({ label, items }: { label?: string; items: { jobId: string; score: number }[] }) {
  return (
    <div className="mt-2 space-y-1.5">
      {label && <div className="text-[10px] font-extrabold uppercase tracking-widest opacity-60">{label}</div>}
      {items.map((it) => <MiniJobCard key={it.jobId} jobId={it.jobId} score={it.score} />)}
    </div>
  );
}

/* ── diff ────────────────────────────────────────────────── */
type Op = { t: "same" | "add" | "del"; w: string };

/** Word-level LCS diff so CV suggestions read like a real change block. */
function wordDiff(beforeText: string, afterText: string): Op[] {
  const A = beforeText.split(/(\s+)/).filter((x) => x.length);
  const B = afterText.split(/(\s+)/).filter((x) => x.length);
  const n = A.length, m = B.length;
  if (n * m > 60000) return [{ t: "del", w: beforeText }, { t: "add", w: afterText }];
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) dp[i][j] = A[i] === B[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const out: Op[] = [];
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (A[i] === B[j]) { out.push({ t: "same", w: A[i] }); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) { out.push({ t: "del", w: A[i] }); i++; }
    else { out.push({ t: "add", w: B[j] }); j++; }
  }
  while (i < n) { out.push({ t: "del", w: A[i] }); i++; }
  while (j < m) { out.push({ t: "add", w: B[j] }); j++; }
  return out;
}

export function DiffBlock({ label, before, after }: { label?: string; before: string; after: string }) {
  const ops = React.useMemo(() => wordDiff(before, after), [before, after]);
  const added = ops.filter((o) => o.t === "add").length;
  const removed = ops.filter((o) => o.t === "del").length;
  return (
    <div className="mt-2 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]">
      <div className="flex items-center gap-2 border-b border-[var(--border)] px-2.5 py-1.5">
        <span className="truncate font-mono text-[10px] font-bold opacity-70">{label ?? "cv-summary"}</span>
        <span className="ml-auto flex shrink-0 items-center gap-1.5 font-mono text-[10px] font-bold">
          <span className="text-red-600 dark:text-red-400">−{removed}</span>
          <span className="text-emerald-700 dark:text-emerald-400">+{added}</span>
        </span>
      </div>
      <div className="cz-scroll max-h-44 overflow-y-auto break-words px-2.5 py-2 font-mono text-[11px] leading-relaxed">
        {ops.map((o, idx) => {
          if (o.t === "same") return <span key={idx}>{o.w}</span>;
          if (o.t === "del")
            return <del key={idx} className="rounded-sm bg-red-500/15 text-red-700 line-through decoration-red-500/60 dark:text-red-300">{o.w}</del>;
          return <ins key={idx} className="rounded-sm bg-emerald-500/15 text-emerald-800 no-underline dark:text-emerald-300">{o.w}</ins>;
        })}
      </div>
      <div className="border-t border-[var(--border)] px-2.5 py-1.5">
        <Link href="/cvs" className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:underline dark:text-emerald-300">
          Apply in My CVs <ExternalLink size={11} />
        </Link>
      </div>
    </div>
  );
}

/* ── checklist ───────────────────────────────────────────── */
export function ChecklistCard({ label, items }: { label?: string; items: string[] }) {
  const [done, setDone] = React.useState<Set<string>>(() => new Set());
  const toggle = (v: string) =>
    setDone((s) => {
      const next = new Set(s);
      if (next.has(v)) next.delete(v); else next.add(v);
      return next;
    });
  return (
    <div className="mt-2 rounded-xl border border-[var(--border)] bg-[var(--card)] p-2.5">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-extrabold uppercase tracking-widest opacity-60">{label ?? "Checklist"}</span>
        <span className="ml-auto text-[10px] font-bold text-emerald-700 dark:text-emerald-300">{done.size}/{items.length}</span>
      </div>
      <ul className="mt-1.5 space-y-1">
        {items.map((it) => {
          const on = done.has(it);
          return (
            <li key={it}>
              <button
                type="button"
                onClick={() => toggle(it)}
                aria-pressed={on}
                className="flex w-full items-start gap-2 rounded-lg px-1 py-1 text-left text-[12px] transition hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <span
                  aria-hidden
                  className={cn(
                    "mt-px flex h-4 w-4 shrink-0 items-center justify-center rounded-[6px] border transition",
                    on ? "border-emerald-700 bg-emerald-700 text-white" : "border-[var(--border)]",
                  )}
                >
                  {on && <Check size={11} />}
                </span>
                <span className={cn("min-w-0 flex-1 leading-snug", on && "line-through opacity-60")}>{it}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <Link href="/roadmap" className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:underline dark:text-emerald-300">
        Build these into a roadmap <ExternalLink size={11} />
      </Link>
    </div>
  );
}

export function ChatCardView({ card }: { card: ChatCard }) {
  if (card.kind === "jobs") return <JobsCardGroup label={card.label} items={card.items} />;
  if (card.kind === "diff") return <DiffBlock label={card.label} before={card.before} after={card.after} />;
  return <ChecklistCard label={card.label} items={card.items} />;
}

