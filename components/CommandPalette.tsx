"use client";
import { useRouter } from "next/navigation";
import * as React from "react";
import { Search } from "./icons";
import { useStore } from "@/lib/store";
import { JOBS } from "@/lib/jobs";
import { jobMatch } from "@/lib/safety";

type Item = { group: string; label: string; sub: string; href: string; action?: () => void };
export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const { profile, apps, cvs, letters, saved, setSaved, setAlerts, alerts } = useStore();
  const [q, setQ] = React.useState("");
  const [dq, setDq] = React.useState("");
  const [idx, setIdx] = React.useState(0);
  // Hydration-safe: localStorage is unavailable during SSR, so seed empty and load when the palette opens.
  const [recent, setRecent] = React.useState<string[]>([]);
  React.useEffect(() => { const t = setTimeout(() => setDq(q), 180); return () => clearTimeout(t); }, [q]);
  React.useEffect(() => { if (open) { try { setRecent(JSON.parse(localStorage.getItem("cz_recent") || "[]") as string[]); } catch {} setQ(""); setIdx(0); } }, [open ]);
  const go = (href: string) => {
    try { const r = [href, ...recent].slice(0, 5); setRecent(r); localStorage.setItem("cz_recent", JSON.stringify(r)); } catch {}
    onClose(); router.push(href);
  };
  const t = dq.toLowerCase();
  const jobs = JOBS.filter((j) => !t || (j.title + " " + j.company + " " + j.location + " " + j.requirements.join(" ")).toLowerCase().includes(t)).slice(0, t ? 6 : 4);
  const items: Item[] = [
    ...jobs.map((j): Item => ({ group: "Jobs", label: j.title, sub: `${j.company} • ${j.location} • ${jobMatch(profile as never, j).score}%`, href: `/jobs/${j.id}` })),
    ...apps.filter((a) => !t || (a.jobTitle + a.company).toLowerCase().includes(t)).slice(0, 3).map((a): Item => ({ group: "Applications", label: a.jobTitle, sub: `${a.company} • ${a.status}`, href: "/applications" })),
    ...cvs.filter((c) => !t || c.name.toLowerCase().includes(t)).slice(0, 3).map((c): Item => ({ group: "CVs", label: c.name, sub: "CV version", href: "/cvs" })),
    ...letters.filter((l) => !t || (l.company + l.jobTitle).toLowerCase().includes(t)).slice(0, 3).map((l): Item => ({ group: "Cover letters", label: `${l.jobTitle} @ ${l.company}`, sub: l.tone, href: "/cover-letters" })),
    ...saved.slice(0, 3).filter((id) => !t || id.includes(t)).map((id): Item => {
      const j = JOBS.find((x) => x.id === id); return { group: "Saved", label: j ? j.title : id, sub: j ? `${j.company} • ${j.location}` : "Saved job", href: j ? `/jobs/${j.id}` : "/jobs?tab=saved" };
    }),
    { group: "Pages", label: "Dashboard", sub: "Overview", href: "/dashboard" },
    { group: "Pages", label: "My CVs + ATS Checker", sub: "Build & check", href: "/cvs" },
    { group: "Pages", label: "Jobs + Alerts", sub: "Search & alerts", href: "/jobs" },
    { group: "Pages", label: "Profile + LinkedIn", sub: "Personal brand", href: "/profile" },
    { group: "Actions", label: "Upload CV", sub: "Import into profile", href: "/cvs?tab=mine" },
    { group: "Actions", label: "New cover letter", sub: "Generate", href: "/cover-letters" },
    ...(!t || "alert".includes(t) ? [{ group: "Actions", label: "Create job alert", sub: "Get notified", href: "/jobs?tab=alerts" } as Item] : []),
  ];
  const filtered = items.filter((i) => !t || (i.label + i.sub + i.group).toLowerCase().includes(t)).slice(0, 24);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] bg-black/40 p-4 md:p-8" onClick={onClose} role="dialog" aria-modal="true" aria-label="Command palette">
      <div className="mx-auto mt-4 max-w-xl overflow-hidden rounded-3xl bg-[var(--card)] shadow-2xl md:mt-16" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-3">
          <Search size={17} />
          <input autoFocus value={q} onChange={(e) => { setQ(e.target.value); setIdx(0); }}
            onKeyDown={(e) => { if (e.key === "ArrowDown") setIdx((v) => Math.min(filtered.length - 1, v + 1)); if (e.key === "ArrowUp") setIdx((v) => Math.max(0, v - 1)); if (e.key === "Enter" && filtered[idx]) go(filtered[idx].href); if (e.key === "Escape") onClose(); }}
            placeholder="Search jobs, saved, applications, CVs, pages, actions…" className="w-full bg-transparent text-sm outline-none" aria-label="Search everything" />
          <kbd className="rounded-md border border-[var(--border)] bg-slate-100 px-1.5 text-[11px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-100">esc</kbd>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {!t && recent.length > 0 && <><p className="px-3 pt-2 text-[11px] font-extrabold uppercase opacity-60">Recent</p>
            {recent.slice(0, 3).map((r) => <button key={r} onClick={() => go(r)} className="block w-full truncate rounded-xl px-3 py-2 text-left text-xs opacity-70 hover:bg-emerald-50 dark:hover:bg-emerald-950">{r}</button>)}</>}
          {filtered.length === 0 && <p className="p-6 text-center text-sm opacity-60">No results for “{q}”. Try a skill (React), company (Econet) or city (Harare).</p>}
          {Array.from(new Set(filtered.map((f) => f.group))).map((g) => (
            <div key={g}>
              <p className="px-3 pt-2 text-[11px] font-extrabold uppercase opacity-60">{g}</p>
              {filtered.map((it, i) => it.group !== g ? null : (
                <button key={g + it.label + i} onClick={() => go(it.href)} onMouseEnter={() => setIdx(i)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left ${i === idx ? "bg-emerald-700 text-white" : "hover:bg-emerald-50 dark:hover:bg-emerald-950"}`}>
                  <span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold">{it.label}</span><span className={`text-xs ${i === idx ? "text-emerald-100" : "opacity-60"}`}>{it.sub}</span></span>
                </button>))}
            </div>))}
        </div>
      </div>
    </div>
  );
}