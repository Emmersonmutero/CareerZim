"use client";
import { useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { completionOf } from "@/lib/safety";
export default function OnboardingPage() {
  const { profile, setProfile } = useStore();
  const [step, setStep] = useState(0);
  const [cities, setCities] = useState<string[]>(profile.preferredLocations);
  const steps = ["Account", "Upload CV", "AI analysis", "Profile", "Goals", "Preferences", "Done"];
  const next = () => setStep((s) => Math.min(steps.length - 1, s + 1));
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex gap-1.5">{steps.map((s, i) => (<div key={s} className={i <= step ? "h-2 flex-1 rounded-full bg-emerald-600" : "h-2 flex-1 rounded-full bg-slate-200"} />))}</div>
      <p className="text-xs font-bold uppercase tracking-widest opacity-60">Step {step + 1} of {steps.length} — {steps[step]}</p>
      <Card>
        {step === 0 && (<><h1 className="font-display text-2xl font-extrabold">Create your account</h1><p className="text-sm opacity-70">Email + Google in production. Prototype continues as guest.</p><input value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} className="mt-3 w-full rounded-xl border border-[var(--border)] bg-transparent px-3 py-2.5 text-sm" aria-label="Email" /></>)}
        {step === 1 && (<><h1 className="font-display text-2xl font-extrabold">Upload your CV</h1><div className="mt-3 rounded-2xl border border-dashed border-[var(--border)] p-8 text-center text-sm">Drag & drop PDF / DOCX / TXT here (prototype: continue without upload)</div></>)}
        {step === 2 && (<><h1 className="font-display text-2xl font-extrabold">AI is analyzing…</h1><p className="text-sm opacity-70">Found {profile.skills.length} skills, {profile.experience.length} role(s), {profile.projects.length} project(s).</p><div className="skeleton mt-3 h-16" /></>)}
        {step === 3 && (<><h1 className="font-display text-2xl font-extrabold">Confirm your profile</h1><input value={profile.fullName} onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} className="mt-3 w-full rounded-xl border border-[var(--border)] bg-transparent px-3 py-2.5 text-sm" aria-label="Full name" /><input value={profile.title} onChange={(e) => setProfile({ ...profile, title: e.target.value })} className="mt-2 w-full rounded-xl border border-[var(--border)] bg-transparent px-3 py-2.5 text-sm" aria-label="Title" /></>)}
        {step === 4 && (<><h1 className="font-display text-2xl font-extrabold">Career goal</h1><input value={profile.careerGoal || ""} onChange={(e) => setProfile({ ...profile, careerGoal: e.target.value })} placeholder="e.g. Senior Software Engineer" className="mt-3 w-full rounded-xl border border-[var(--border)] bg-transparent px-3 py-2.5 text-sm" aria-label="Career goal" /></>)}
        {step === 5 && (<><h1 className="font-display text-2xl font-extrabold">Where should we look?</h1><div className="mt-3 flex flex-wrap gap-2">{["Harare", "Bulawayo", "Mutare", "Gweru", "Masvingo", "Remote"].map((c) => (<button key={c} onClick={() => { const v = cities.includes(c) ? cities.filter((x) => x !== c) : [...cities, c]; setCities(v); setProfile({ ...profile, preferredLocations: v }); }} className={cities.includes(c) ? "rounded-full bg-emerald-700 px-4 py-2 text-xs font-bold text-white" : "rounded-full border border-[var(--border)] px-4 py-2 text-xs font-bold"}>{c}</button>))}</div></>)}
        {step === 6 && (<><h1 className="font-display text-2xl font-extrabold">You’re all set 🎉</h1><p className="text-sm opacity-70">Profile {completionOf(profile as never)}% complete. Here are safe, recommended jobs.</p><Link href="/dashboard" className="mt-3 inline-block rounded-full bg-emerald-700 px-6 py-3 text-sm font-bold text-white">Go to dashboard</Link></>)}
        {step < 6 && (<div className="mt-4 flex gap-2"><button onClick={next} className="flex-1 rounded-full bg-emerald-700 py-3 text-sm font-bold text-white">Continue</button><Link href="/dashboard" className="rounded-full border border-[var(--border)] px-5 py-3 text-sm font-bold">Skip for now</Link></div>)}
      </Card>
    </div>
  );
}
