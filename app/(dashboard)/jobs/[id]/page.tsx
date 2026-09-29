"use client";
import { use, useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { JOBS } from "@/lib/jobs";
import { jobMatch, safetyLevel } from "@/lib/safety";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressRing, ProgressBar } from "@/components/ui/progress";
import { ShieldAlert } from "@/components/icons";

export default function JobIdPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { profile, apps, setApps } = useStore();
  const [msg, setMsg] = useState("");
  const job = JOBS.find((j) => j.id === id);
  if (!job) return <div>Not found <Link href="/jobs" className="underline">Back</Link></div>;
  const m = jobMatch(profile as never, job);
  const safety = safetyLevel(job);
  const dup = apps.find((a) => a.jobId === job.id);
  const apply = () => {
    if (dup) { setMsg("Already applied — duplicate blocked."); return; }
    setApps([{ id: "a" + Date.now(), jobId: job.id, jobTitle: job.title, company: job.company, status: "Applied", dateApplied: new Date().toISOString().slice(0, 10), deadline: job.deadline, method: job.applyUrl ? "Employer page" : "Email" }, ...apps]);
    setMsg("Tracked as Applied." + (job.applyUrl ? " Opening employer page…" : " Review the email draft below before sending."));
    if (job.applyUrl) window.open(job.applyUrl, "_blank");
  };
  return (
    <div className="space-y-4">
      <Link href="/jobs" className="text-sm font-bold underline">← Back to jobs</Link>
      {msg && <div className="rounded-2xl bg-amber-100 p-3 text-sm text-amber-950">{msg}</div>}
      {safety.level !== "Looks OK" && (
        <div role="alert" className={safety.level === "Warning signs detected" ? "rounded-[20px] border border-red-300 bg-red-50 p-4 text-sm text-red-950" : "rounded-[20px] border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950"}>
          <b className="flex items-center gap-2"><ShieldAlert size={18} /> Job safety: {safety.level}</b>
          <p className="mt-1">This posting shows potential warning signs — this is guidance, not proof of a scam.</p>
          <ul className="mt-2 list-disc pl-5">{safety.flags.map((f) => <li key={f}>{f}</li>)}</ul>
          <button onClick={() => setMsg("Thanks — reported. Our team reviews potential warning signs; this is guidance, not proof of a scam.")} className="mt-3 rounded-full border border-current px-4 py-2 text-xs font-bold">Report job</button>
        </div>
      )}
      <Card>
        <div className="flex flex-wrap items-start gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-2xl font-extrabold">{job.title}</h1>
            <p className="text-sm opacity-70">{job.company} • {job.location} • {job.salary}</p>
            <div className="mt-2 flex flex-wrap gap-1.5"><Badge>{job.type}</Badge><Badge tone="slate">{job.mode}</Badge><Badge tone="slate">{job.source}</Badge></div>
            <p className="mt-3 text-sm">{job.description}</p>
            <p className="mt-2 text-sm"><b>Requirements:</b> {job.requirements.join(", ")}</p>
          </div>
          <ProgressRing value={m.score} label="Match" />
        </div>
        <div className="mt-4 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
          <b className="text-sm">Match breakdown</b>
          <div className="mt-2 grid gap-2 text-xs font-bold sm:grid-cols-2">
            {Object.entries(m.breakdown).map(([k, v]) => (<div key={k}><div className="flex justify-between capitalize"><span>{k}</span><span>{v}</span></div><ProgressBar value={v === "Strong match" || v === "Match" ? 85 : v === "Partial match" || v === "Partial" ? 55 : 25} /></div>))}
          </div>
          {m.missing.length > 0 && <p className="mt-2 text-xs"><b>Missing keywords (learn, don’t invent):</b> {m.missing.join(", ")}</p>}
          <p className="mt-1 text-[11px] opacity-60">Match score is guidance, not a guarantee.</p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button onClick={apply} className="rounded-full bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white">Apply + Track</button>
          <Link href="/cvs" className="rounded-full border border-[var(--border)] px-5 py-2.5 text-sm font-bold">Tailor my CV</Link>
          <Link href="/cover-letters" className="rounded-full border border-[var(--border)] px-5 py-2.5 text-sm font-bold">Cover letter</Link>
          <button onClick={() => { const u = `https://wa.me/?text=${encodeURIComponent(`${job.title} @ ${job.company} (${job.location}) — ${location.origin}/jobs/${job.id}`)}`; window.open(u, "_blank"); }} className="rounded-full border border-[var(--border)] px-5 py-2.5 text-sm font-bold">Share via WhatsApp</button>
        </div>
        {dup && <p className="mt-2 text-xs font-bold text-red-700">You already applied ({dup.dateApplied}). Duplicate blocked.</p>}
        {job.applyEmail && !job.applyUrl && <p className="mt-3 rounded-2xl border border-[var(--border)] p-3 text-xs">Review &amp; send (never auto-sent)<br /><b>To:</b> {job.applyEmail}<br /><b>Subject:</b> Application for {job.title} — {profile.fullName}</p>}
      </Card>
    </div>
  );
}

