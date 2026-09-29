"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { JOBS } from "@/lib/jobs";
import { jobMatch, completionOf } from "@/lib/safety";
import { Card } from "@/components/ui/card";
import { JobCard, StatCard } from "@/components/ui/cards";
import { ProgressRing } from "@/components/ui/progress";
import { deadlineBadge } from "@/lib/safety";
import { EmptyState, useToast } from "@/components/ui/toaster";

export default function Dashboard() {
  const { profile, apps, saved, setSaved, notes } = useStore();
  const toast = useToast();
  const scored = useMemo(() => JOBS.map((j) => ({ j, m: jobMatch(profile as never, j) })), [profile]);
  const safe = scored.filter((r) => !r.m.unsafe).sort((a, b) => b.m.score - a.m.score).slice(0, 3);
  const pct = completionOf(profile as never);
  const missing: string[] = [];
  if (!profile.fullName) missing.push("Add your full name (Profile)");
  if ((profile.summary || "").length < 80) missing.push("Expand summary to 3–4 lines (Profile)");
  if (profile.skills.length < 8) missing.push(`Add ${8 - profile.skills.length} more skills (Profile → Skills)`);
  const [showMissing, setShowMissing] = useState(false);
  if (!profile.experience.length) missing.push("Add at least one experience entry");
  if (!profile.education.length) missing.push("Add your education");
  if (!profile.phone) missing.push("Add a phone number so employers can reach you");
  const deadlines = apps.map((a) => ({ a, b: deadlineBadge(a.deadline || a.followUpDate) })).filter((x) => x.b.label !== "No deadline").slice(0, 4);
  const nextAction = apps.length === 0 ? { t: "Save your first job", d: "Browse Jobs and tap the bookmark.", href: "/jobs" } : pct < 80 ? { t: "Finish your profile", d: `${100 - pct}% to go — employers notice complete profiles.`, href: "/profile" } : { t: "Tailor your CV", d: "Pick a saved job and tailor in My CVs.", href: "/cvs" };
  return (
    <div className="space-y-5">
      <div className="rounded-[24px] bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-700 p-6 text-white">
        <h1 className="font-display text-2xl font-extrabold">Hi {(profile.fullName || "there").split(" ")[0]}</h1>
        <p className="text-sm text-emerald-100">{profile.title || "Add your target title in Profile"} • {profile.location}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/jobs" className="rounded-full bg-amber-400 px-4 py-2 text-sm font-bold text-emerald-950">Find Jobs</Link>
          <Link href="/cvs" className="rounded-full bg-white px-4 py-2 text-sm font-bold text-emerald-900">Tailor CV</Link>
          <Link href="/assistant" className="rounded-full bg-emerald-700 px-4 py-2 text-sm font-bold text-white">Ask Assistant</Link>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <Card>
          <b className="text-sm">Next best action</b>
          <p className="mt-1 font-display text-lg font-extrabold">{nextAction.t}</p>
          <p className="text-xs opacity-70">{nextAction.d}</p>
          <Link href={nextAction.href} className="mt-2 inline-block rounded-full bg-emerald-700 px-4 py-2 text-xs font-bold text-white">Do it now →</Link>
        </Card>
        <button onClick={() => setShowMissing((v) => !v)} className="text-left" aria-expanded={showMissing} aria-label="Profile completion details">
          <Card className="flex h-full items-center gap-3">
            <ProgressRing value={pct} size={72} label="Profile" />
            <span className="text-xs"><b>{pct}% complete</b><br /><span className="opacity-70">{missing.length ? `${missing.length} items missing — tap to see` : "All core fields filled. Nice!"}</span></span>
          </Card>
        </button>
        <Card>
          <b className="text-sm">Upcoming deadlines</b>
          {deadlines.length === 0 ? <p className="mt-1 text-xs opacity-60">No deadlines yet. Applications you track will appear here.</p> :
            <ul className="mt-2 space-y-1 text-xs">{deadlines.map(({ a, b }) => <li key={a.id} className="flex justify-between gap-2"><span className="truncate">{a.jobTitle}</span><b>{b.label}</b></li>)}</ul>}
        </Card>
      </div>
      {showMissing && missing.length > 0 && (
        <Card><b className="text-sm">What’s missing</b><ul className="mt-2 list-disc space-y-1 pl-5 text-sm">{missing.map((m) => <li key={m}>{m}</li>)}</ul>
          <Link href="/profile" className="mt-2 inline-block text-xs font-bold text-emerald-700 dark:text-emerald-300">Open Profile →</Link></Card>)}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Applications" value={String(apps.length)} />
        <StatCard label="Interviews" value={String(apps.filter((a) => ["Interview", "Final Interview", "Assessment", "Screening"].includes(a.status)).length)} />
        <StatCard label="Offers" value={String(apps.filter((a) => a.status === "Offer").length)} />
        <StatCard label="Saved" value={String(saved.length)} />
      </div>
      <div>
        <b>Recommended for you</b>
        <p className="text-xs opacity-60">Potential warning-sign jobs are never recommended. Match score is guidance, not a guarantee.</p>
        {safe.length === 0 ? <div className="mt-3"><EmptyState title="Add skills to unlock recommendations" body="Complete your profile and we'll rank safe jobs for you." action={<Link href="/profile" className="rounded-full bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white">Complete profile</Link>} /></div> :
        <div className="mt-3 grid gap-3 pb-20 md:grid-cols-3 lg:pb-0">
          {safe.map(({ j, m }) => (<JobCard key={j.id} job={j} score={m.score} safetyLabel={m.safety} saved={saved.includes(j.id)} onSave={() => { setSaved(saved.includes(j.id) ? saved.filter((s) => s !== j.id) : [...saved, j.id]); toast({ title: saved.includes(j.id) ? "Removed" : "Saved" }); }} />))}
        </div>}
      </div>
    </div>
  );
}

