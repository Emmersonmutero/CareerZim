"use client";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/toaster";
import { CITIES, useJobList, useAlerts, JobCard, EmptyState } from "./job-hooks";
export function JobsBrowser(p: { q: string; setQ: (v: string) => void; city: string; setCity: (v: string) => void; sort: string; setSort: (v: string) => void; tab: string; setTab: (v: string) => void; country: string; setCountry: (v: string) => void }) {
  const { saved, setSaved } = useStore();
  const toast = useToast();
  const list = useJobList(p.q, p.city, p.sort, p.tab);
  const al = useAlerts();
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="font-display text-2xl font-extrabold">Jobs ({p.tab === "alerts" ? al.alerts.length : list.length})</h1>
        <select value={p.country} onChange={(e) => p.setCountry(e.target.value)} aria-label="Country" className="ml-auto rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-xs font-bold">
          <option value="ZW">Zimbabwe</option><option value="ALL">All (soon)</option>
        </select>
      </div>
      <div className="flex gap-1.5 overflow-x-auto" role="tablist" aria-label="Jobs tabs">
        {[["all", "All"], ["recommended", "Recommended"], ["saved", `Saved (${saved.length})`], ["alerts", `Alerts (${al.alerts.length})`]].map(([v, l]) => (
          <button key={v} role="tab" aria-selected={p.tab === v} onClick={() => p.setTab(v)} className={p.tab === v ? "rounded-full bg-emerald-700 px-4 py-2 text-xs font-bold text-white" : "rounded-full border border-[var(--border)] px-4 py-2 text-xs font-bold"}>{l}</button>))}
      </div>
      {p.tab !== "alerts" ? (<>
        <div className="sticky top-[65px] z-10 rounded-[20px] border border-[var(--border)] bg-[var(--card)] p-3">
          <div className="flex gap-2">
            <input value={p.q} onChange={(e) => p.setQ(e.target.value)} placeholder="Search title, company, skill…" className="w-full rounded-xl border border-[var(--border)] bg-transparent px-3 py-2.5 text-sm" aria-label="Search jobs" />
            <select value={p.sort} onChange={(e) => p.setSort(e.target.value)} className="rounded-xl border border-[var(--border)] bg-transparent px-2 text-sm" aria-label="Sort"><option value="match">Best match</option><option value="new">Newest</option></select>
          </div>
          <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto" aria-label="Filter by city">
            {CITIES.map((c) => (<button key={c} aria-pressed={p.city === c} onClick={() => p.setCity(c)} className={p.city === c ? "rounded-full bg-emerald-700 px-4 py-2 text-xs font-bold text-white" : "rounded-full border border-[var(--border)] px-4 py-2 text-xs font-bold"}>{c}</button>))}
          </div>
        </div>
        {list.length === 0 && <EmptyState title={p.tab === "saved" ? "No saved jobs yet" : "No jobs found"} body={p.tab === "saved" ? "Tap the bookmark on any job to save it here." : "Try another keyword or city."} />}
        <div className="grid gap-3 md:grid-cols-2">
          {list.map(({ j, m }) => (<JobCard key={j.id} job={j} score={m.score} safetyLabel={m.safety} saved={saved.includes(j.id)} onSave={() => { setSaved(saved.includes(j.id) ? saved.filter((s) => s !== j.id) : [...saved, j.id]); toast({ title: saved.includes(j.id) ? "Removed from saved" : "Job saved" }); }} />))}
        </div>
        <p className="text-xs opacity-60">Match score is guidance, not a guarantee. Jobs with potential warning signs are ranked low and never recommended.</p>
      </>) : (
        <div className="space-y-3">
          <div className="rounded-[20px] border border-[var(--border)] bg-[var(--card)] p-4">
            <b className="text-sm">Create alert</b>
            <div className="mt-2 flex flex-wrap gap-2">
              <input value={al.aq} onChange={(e) => al.setAq(e.target.value)} aria-label="Alert keywords" placeholder="e.g. Software Developer" className="min-w-40 flex-1 rounded-xl border border-[var(--border)] bg-transparent px-3 py-2 text-sm" />
              <select value={al.aloc} onChange={(e) => al.setAloc(e.target.value)} aria-label="Alert city" className="rounded-xl border border-[var(--border)] bg-transparent px-3 py-2 text-sm">{["All", "Harare", "Bulawayo", "Mutare", "Gweru", "Masvingo", "Chitungwiza", "Remote"].map((c) => <option key={c}>{c}</option>)}</select>
              <button onClick={al.createAlert} className="rounded-full bg-emerald-700 px-5 py-2 text-sm font-bold text-white">Create alert</button>
            </div>
          </div>
          {al.alerts.length === 0 && <EmptyState title="No alerts yet" body="Create one above — matching jobs trigger a notification." />}
          {al.alerts.map((a) => (
            <div key={a.id} className="flex flex-wrap items-center gap-2 rounded-[20px] border border-[var(--border)] bg-[var(--card)] p-4 text-sm">
              <div className="min-w-0 flex-1"><b>{a.query}</b> in <b>{a.location}</b>
                <div className="text-xs opacity-60">{al.matchCount(a)} current matches • email + in-app</div></div>
              <button aria-label="Toggle alert" onClick={() => al.setAlerts(al.alerts.map((x) => x.id === a.id ? { ...x, on: !(x as { on?: boolean }).on } as typeof x : x))} className="rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-bold">{(a as { on?: boolean }).on === false ? "Off" : "On"}</button>
              <button onClick={() => { al.setAlerts(al.alerts.filter((x) => x.id !== a.id)); toast({ title: "Alert deleted" }); }} className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-bold text-red-700">Delete</button>
            </div>))}
        </div>)}
    </div>
  );
}