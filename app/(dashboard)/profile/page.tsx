"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { completionOf } from "@/lib/safety";
export default function ProfilePage() {
  const { profile, setProfile } = useStore();
  const set = (k: string, v: never) => setProfile({ ...profile, [k]: v });
  const pct = completionOf(profile as never);
  const [tab, setTab] = useState("Personal");
  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-extrabold">Profile — {pct}% complete</h1>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"><div className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-amber-400" style={{ width: pct + "%" }} /></div>
      <div className="flex flex-wrap gap-1.5">{["Personal", "Career", "Skills"].map((t) => (<button key={t} onClick={() => setTab(t)} className={tab === t ? "rounded-full bg-emerald-700 px-4 py-2 text-xs font-bold text-white" : "rounded-full border border-[var(--border)] px-4 py-2 text-xs font-bold"}>{t}</button>))}</div>
      <Card>
        <div className="grid gap-2 text-sm md:grid-cols-2">
          {[["fullName", "Full name"], ["title", "Title"], ["email", "Email"], ["phone", "Phone"], ["location", "Location"], ["linkedin", "LinkedIn"], ["github", "GitHub"], ["careerGoal", "Career goal"]].map(([k, l]) => (
            <label key={k} className="block">{l}<input value={(profile as never as Record<string, string>)[k] || ""} onChange={(e) => set(k, e.target.value as never)} className="mt-1 w-full rounded-xl border border-[var(--border)] bg-transparent px-3 py-2" /></label>))}
          <label className="md:col-span-2">Summary<textarea value={profile.summary} onChange={(e) => set("summary", e.target.value as never)} rows={3} className="mt-1 w-full rounded-xl border border-[var(--border)] bg-transparent px-3 py-2" /></label>
          <label className="md:col-span-2">Skills (comma separated)<input value={profile.skills.join(", ")} onChange={(e) => set("skills", e.target.value.split(",").map((s) => s.trim()).filter(Boolean) as never)} className="mt-1 w-full rounded-xl border border-[var(--border)] bg-transparent px-3 py-2" /></label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={profile.activelyLooking} onChange={(e) => set("activelyLooking", e.target.checked as never)} /> Actively looking</label>
        </div>
        <p className="mt-2 text-xs opacity-60">Auto-saved to this device. Export anytime in Settings.</p>
      </Card>
    </div>
  );
}

