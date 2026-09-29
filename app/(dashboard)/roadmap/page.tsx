"use client";
import { useStore } from "@/lib/store";
import { JOBS } from "@/lib/jobs";
import { jobMatch } from "@/lib/safety";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";
export default function RoadmapPage() {
  const { profile } = useStore();
  const target = JOBS[0];
  const m = jobMatch(profile as never, target);
  const steps = [
    { t: "Current: " + profile.skills.slice(0, 4).join(", "), done: true },
    { t: "Next: " + (m.missing.slice(0, 3).join(" + ") || "Advanced patterns + testing"), done: false },
    { t: "Projects: 2 portfolio builds with deploys", done: false },
    { t: "Apply: 10 quality apps/week in Harare + Remote", done: false },
    { t: "Goal: " + (profile.careerGoal || "Senior Engineer"), done: false },
  ];
  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-extrabold">Career Roadmap</h1>
      <Card>
        <b className="text-sm">Skill gap vs {target.title}</b>
        <div className="mt-2 space-y-2">
          {target.requirements.map((r) => {
            const has = profile.skills.map((s) => s.toLowerCase()).includes(r.toLowerCase());
            return (<div key={r}><div className="flex justify-between text-xs font-bold"><span>{r}</span><span>{has ? "Have ✓" : "Missing"}</span></div><ProgressBar value={has ? 90 : 22} /></div>);
          })}
        </div>
        <p className="mt-2 text-xs opacity-60">Learn free first: freeCodeCamp, MDN, Coursera audit. AI suggests — never invents — skills.</p>
      </Card>
      <div className="space-y-0">
        {steps.map((s, i) => (
          <div key={s.t} className="flex gap-3">
            <div className="flex flex-col items-center"><div className={s.done || i === 1 ? "flex h-8 w-8 items-center justify-center rounded-full bg-emerald-700 text-xs font-extrabold text-white" : "flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] text-xs font-bold"}>{s.done ? "✓" : i + 1}</div>{i < steps.length - 1 && <div className="w-0.5 flex-1 bg-[var(--border)]" />}</div>
            <Card className={i === 1 ? "!border-emerald-500 mb-3 flex-1" : "mb-3 flex-1"}><p className="text-sm font-semibold">{s.t}</p>{i === 1 && <p className="text-[11px] font-bold text-emerald-700">● Current step</p>}</Card>
          </div>))}
      </div>
    </div>
  );
}

