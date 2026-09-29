"use client";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "@/components/icons";
const feats = ["AI CV Builder", "Zimbabwe Jobs", "Smart Matching", "CV Tailoring", "Cover Letters", "Email Apply", "Tracking", "Interview Prep"];
export default function Home() {
  return (
    <div className="min-h-screen">
      <header className="glass sticky top-0 z-40 border-b border-[var(--border)]">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <b className="font-display text-lg">CareerZim</b>
          <div className="ml-auto flex gap-2">
            <Link href="/dashboard" className="rounded-full px-4 py-2.5 text-sm font-bold">Log in</Link>
            <Link href="/dashboard" className="rounded-full bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white">Get Started</Link>
          </div>
        </div>
      </header>
      <section className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-700 text-white">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold"><ShieldCheck size={14} /> Made for Zimbabwean job seekers</p>
          <h1 className="mt-4 font-display text-4xl font-extrabold md:text-6xl">Your AI Career Assistant</h1>
          <p className="mt-4 max-w-2xl text-lg text-emerald-100">Build your CV, discover jobs, tailor applications and manage your career, all in one place.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/cvs" className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-6 py-3 font-bold text-emerald-950">Create Your CV <ArrowRight size={17} /></Link>
            <Link href="/jobs" className="rounded-full bg-white px-6 py-3 font-bold text-emerald-900">Find Jobs</Link>
          </div>
          <div className="mt-8 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {feats.map((f) => (<div key={f} className="rounded-2xl bg-white/10 p-3 text-sm font-semibold">{f}</div>))}
          </div>
          <p className="mt-4 text-xs text-emerald-200">Your data is never sold. Match score is guidance, not a guarantee.</p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="font-display text-2xl font-extrabold">Zimbabwe-first job discovery</h2>
        <div className="mt-3 flex flex-wrap gap-2">{["Harare", "Bulawayo", "Mutare", "Gweru", "Masvingo", "Chitungwiza"].map((c) => (<Link key={c} href={`/jobs?city=${c}`} className="rounded-full border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm font-bold">{c}</Link>))}</div>
        <Link href="/dashboard" className="mt-6 inline-block rounded-full bg-emerald-700 px-6 py-3 text-sm font-bold text-white">Open dashboard →</Link>
      </section>
    </div>
  );
}

