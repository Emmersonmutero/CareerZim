import Link from "next/link";
import { Bookmark, MapPin } from "@/components/icons";
import { Card } from "./card";
import { Badge } from "./badge";
import { ProgressRing } from "./progress";
import { deadlineBadge } from "@/lib/safety";
import { postedAgo } from "@/lib/utils";
import type { Job } from "@/lib/types";
import { cn } from "@/lib/cn";

export function initials(name: string) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}
export function Avatar({ name, className }: { name: string; className?: string }) {
  return (
    <div aria-hidden className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-700 to-emerald-900 font-display text-sm font-extrabold text-white", className)}>
      {initials(name)}
    </div>
  );
}
export function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card className="card-hover">
      <div className="font-display text-2xl font-extrabold">{value}</div>
      <div className="text-xs font-bold uppercase tracking-wide opacity-60">{label}</div>
      {sub && <div className="mt-1 text-xs text-emerald-700 dark:text-emerald-300">{sub}</div>}
    </Card>
  );
}
export function JobCard({ job, score, saved, onSave, safetyLabel }: { job: Job; score: number; saved?: boolean; onSave?: () => void; safetyLabel?: string }) {
  const d = deadlineBadge(job.deadline);
  return (
    <Card className="card-hover group">
      <div className="flex items-start gap-3">
        <Avatar name={job.company} />
        <div className="min-w-0 flex-1">
          <Link href={`/jobs/${job.id}`} className="font-display font-bold leading-tight hover:underline">{job.title}</Link>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs opacity-70">
            <span>{job.company}</span><span>•</span>
            <span className="inline-flex items-center gap-1"><MapPin size={12} />{job.location}</span><span>•</span>
            <span suppressHydrationWarning>{postedAgo(job.posted)}</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Badge>{job.type}</Badge><Badge tone="slate">{job.salary ?? "Competitive"}</Badge>
            <Badge suppressHydrationWarning tone={d.tone === "default" ? "green" : d.tone}>{d.label}</Badge>
            <Badge tone={safetyLabel === "Looks OK" ? "green" : safetyLabel?.includes("Warning") ? "red" : "gold"}>{safetyLabel ?? "Looks OK"}</Badge>
          </div>
        </div>
        <ProgressRing value={score} size={64} />
      </div>
      <div className="mt-3 flex gap-2">
        <Link href={`/jobs/${job.id}`} className="flex-1 rounded-xl bg-emerald-700 px-3 py-2.5 text-center text-sm font-bold text-white hover:bg-emerald-800">View + Apply</Link>
        <button aria-label="Save job" onClick={onSave} className={cn("rounded-xl border border-[var(--border)] px-3", saved && "bg-amber-100")}>
          <Bookmark size={17} />
        </button>
      </div>
    </Card>
  );
}
