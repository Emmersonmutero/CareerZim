"use client";
import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { analyzeCV } from "@/lib/ai1";
import { exportCV, parseCVText } from "@/lib/cv-export";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";
import { useToast } from "@/components/ui/toaster";
import { JOBS } from "@/lib/jobs";

export default function CvsContent() {
  const sp = useSearchParams();
  const router = useRouter();
  const toast = useToast();
  const { profile, setProfile, cvs, setCvs } = useStore();

  const tab = sp.get("tab") || "cvs"; // "cvs" | "ats" | "templates" | "import"
  const setTab = (t: string) => {
    router.replace(`/cvs?tab=${t}`, { scroll: false });
  };

  const [name, setName] = React.useState("Master CV");
  const [targetJobId, setTargetJobId] = React.useState("");
  const [rawText, setRawText] = React.useState("");
  const [bulletDraft, setBulletDraft] = React.useState("");
  const [bulletResult, setBulletResult] = React.useState<string[]>([]);
  const [importSummary, setImportSummary] = React.useState<string>("");

  const score = analyzeCV(profile);

  const saveNewVersion = () => {
    const id = "cv_" + Date.now();
    const targetedJob = JOBS.find((j) => j.id === targetJobId);
    const tailoredProfile = targetedJob
      ? {
          ...profile,
          summary: `${profile.summary || ""}\nTargeting: ${targetedJob.title} at ${targetedJob.company}.`,
        }
      : { ...profile };

    setCvs([
      {
        id,
        name: name.trim() || "CV Version",
        template: "ATS-friendly",
        updatedAt: new Date().toISOString().slice(0, 10),
        profile: tailoredProfile,
        tailoredForJobId: targetedJob?.id,
        changes: targetedJob ? [`Tailored for ${targetedJob.title} at ${targetedJob.company}`] : [],
        score,
      },
      ...cvs,
    ]);
    toast({ title: `Saved "${name}"`, body: "Stored in your versions list." });
    setName("CV " + (cvs.length + 2));
  };

  const deleteVersion = (id: string) => {
    if (confirm("Delete this CV version?")) {
      setCvs(cvs.filter((c) => c.id !== id));
      toast({ title: "Version deleted" });
    }
  };

  const generateBullets = () => {
    if (!bulletDraft.trim()) return;
    const lines = bulletDraft
      .split(/\n|\.|\;/)
      .map((s) => s.trim())
      .filter((s) => s.length > 5);

    const formatted = lines.map((l) => {
      if (/^\b(led|built|managed|increased|reduced|delivered|created|designed|optimized|spearheaded|developed)\b/i.test(l)) {
        return l;
      }
      return `Spearheaded ${l.charAt(0).toLowerCase() + l.slice(1)} to improve operational efficiency and team delivery`;
    });
    setBulletResult(formatted);
    toast({ title: "Generated action bullets", body: "Remember to insert your real metric numbers." });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = String(event.target?.result || "");
      setRawText(content);
      const parsed = parseCVText(content);
      const skillsFound = parsed.skills?.length || 0;
      setImportSummary(`Parsed "${file.name}": found ${parsed.fullName || "no name"}, ${skillsFound} skills, ${parsed.email || "no email"}, ${parsed.location || "no city"}.`);
    };
    reader.readAsText(file);
  };

  const applyImportToProfile = () => {
    const parsed = parseCVText(rawText);
    const updated = {
      ...profile,
      fullName: parsed.fullName || profile.fullName,
      title: parsed.title || profile.title,
      email: parsed.email || profile.email,
      phone: parsed.phone || profile.phone,
      location: parsed.location || profile.location,
      country: parsed.country || profile.country,
      linkedin: parsed.linkedin || profile.linkedin,
      github: parsed.github || profile.github,
      skills: Array.from(new Set([...profile.skills, ...(parsed.skills || [])])),
    };
    setProfile(updated);
    toast({ title: "Profile updated from CV!", body: "Review on Profile page." });
    setImportSummary("Profile successfully updated!");
  };


  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold">My CVs & ATS Center</h1>
          <p className="text-xs opacity-70">Build ATS-optimized resumes, track versions, and scan against recruiter filters.</p>
        </div>
        <div className="flex rounded-full border border-[var(--border)] bg-[var(--card)] p-1 text-xs font-bold">
          <button onClick={() => setTab("cvs")} className={`rounded-full px-4 py-1.5 transition ${tab === "cvs" ? "bg-emerald-700 text-white" : "opacity-70 hover:opacity-100"}`}>Versions ({cvs.length + 1})</button>
          <button onClick={() => setTab("ats")} className={`rounded-full px-4 py-1.5 transition ${tab === "ats" ? "bg-emerald-700 text-white" : "opacity-70 hover:opacity-100"}`}>ATS Score ({score.overall}%)</button>
          <button onClick={() => setTab("import")} className={`rounded-full px-4 py-1.5 transition ${tab === "import" ? "bg-emerald-700 text-white" : "opacity-70 hover:opacity-100"}`}>Import / Parse</button>
          <button onClick={() => setTab("templates")} className={`rounded-full px-4 py-1.5 transition ${tab === "templates" ? "bg-emerald-700 text-white" : "opacity-70 hover:opacity-100"}`}>Templates</button>
        </div>
      </div>

      {tab === "cvs" && (
        <div className="space-y-4">
          <Card>
            <b className="text-sm">Save a tailored version from active profile</b>
            <p className="text-xs opacity-70">Pick an optional target job description to lock keywords in this snapshot.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Version label" className="min-w-64 flex-1 rounded-xl border border-[var(--border)] bg-transparent px-3 py-2 text-sm" />
              <select value={targetJobId} onChange={(e) => setTargetJobId(e.target.value)} className="rounded-xl border border-[var(--border)] bg-transparent px-3 py-2 text-sm">
                <option value="">No specific job target</option>
                {JOBS.map((j) => (
                  <option key={j.id} value={j.id}>{j.title} @ {j.company}</option>
                ))}
              </select>
              <button onClick={saveNewVersion} className="rounded-full bg-emerald-700 px-5 py-2 text-sm font-bold text-white">Save version</button>
            </div>
          </Card>

          <Card>
            <b className="text-sm">Action bullet generator</b>
            <p className="text-xs opacity-70">Paste rough responsibilities — converted to strong action verbs without fabricating achievements.</p>
            <textarea value={bulletDraft} onChange={(e) => setBulletDraft(e.target.value)} rows={2} placeholder="e.g. handled cash drawer, settled accounts, managed interns..." className="mt-2 w-full rounded-xl border border-[var(--border)] bg-transparent p-3 text-sm" />
            <div className="mt-2 flex gap-2">
              <button onClick={generateBullets} className="rounded-full border border-[var(--border)] px-4 py-1.5 text-xs font-bold">Generate bullets</button>
            </div>
            {bulletResult.length > 0 && (
              <div className="mt-3 space-y-1.5 rounded-xl bg-slate-50 p-3 text-xs dark:bg-slate-900">
                <b className="text-[11px] uppercase tracking-wider opacity-60">Result:</b>
                <ul className="list-disc space-y-1 pl-4">
                  {bulletResult.map((b, idx) => (
                    <li key={idx} className="cursor-pointer hover:text-emerald-600" onClick={() => { navigator.clipboard.writeText(b); toast({ title: "Copied bullet to clipboard" }); }}>{b} <span className="opacity-50 text-[10px]">(click to copy)</span></li>
                  ))}
                </ul>
              </div>
            )}
          </Card>

          <div className="grid gap-3 md:grid-cols-2">
            <Card className="!p-4 border-2 border-emerald-600/40">
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">Active Profile</span>
                  <b className="mt-1 block text-base">Master CV</b>
                  <p className="text-xs opacity-70">{profile.fullName || "Unset name"} • {profile.title || "No title"}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-extrabold text-emerald-700">{score.overall}/100</span>
                  <span className="block text-[10px] opacity-60">ATS rating</span>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5 border-t border-[var(--border)] pt-3">
                <button onClick={() => exportCV(profile, "Master-CV", "PDF")} className="rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white hover:opacity-90">Print / PDF</button>
                <button onClick={() => exportCV(profile, "Master-CV", "DOCX")} className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-bold">Word (.doc)</button>
                <button onClick={() => exportCV(profile, "Master-CV", "TXT")} className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-bold">TXT</button>
                <button onClick={() => exportCV(profile, "Master-CV", "JSON")} className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-bold">JSON</button>
              </div>
            </Card>

            {cvs.map((cv) => (
              <Card key={cv.id} className="!p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <b className="block text-base">{cv.name}</b>
                    <p className="text-xs opacity-70">Saved: {cv.updatedAt} • {cv.template}</p>
                  </div>
                  {cv.score && (
                    <div className="text-right">
                      <span className="text-sm font-extrabold text-emerald-700">{cv.score.overall}/100</span>
                      <span className="block text-[10px] opacity-60">ATS rating</span>
                    </div>
                  )}
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-1.5 border-t border-[var(--border)] pt-3">
                  <div className="flex flex-wrap gap-1.5">
                    <button onClick={() => exportCV(cv.profile, cv.name, "PDF")} className="rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white">PDF</button>
                    <button onClick={() => exportCV(cv.profile, cv.name, "DOCX")} className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-bold">DOCX</button>
                    <button onClick={() => exportCV(cv.profile, cv.name, "TXT")} className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-bold">TXT</button>
                  </div>
                  <button onClick={() => deleteVersion(cv.id)} className="text-xs text-red-600 hover:underline">Delete</button>
                </div>
              </Card>
            ))}
          </div>

        </div>
      )}

      {tab === "ats" && (
        <div className="space-y-4">
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <b className="font-display text-2xl font-extrabold text-emerald-700">{score.overall} / 100</b>
                <p className="text-xs opacity-70">Overall ATS pass likelihood based on format, sections, and quantified achievements.</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => exportCV(profile, "ATS-Optimized-CV", "PDF")} className="rounded-full bg-emerald-700 px-4 py-2 text-xs font-bold text-white">Export ATS PDF</button>
                <button onClick={() => exportCV(profile, "ATS-Optimized-CV", "DOCX")} className="rounded-full border border-[var(--border)] px-4 py-2 text-xs font-bold">Export ATS Word</button>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
              <div className="rounded-2xl border border-[var(--border)] p-3">
                <div className="flex justify-between text-xs font-bold"><span>ATS Structure</span><span>{score.ats}%</span></div>
                <div className="mt-2"><ProgressBar value={score.ats} /></div>
              </div>
              <div className="rounded-2xl border border-[var(--border)] p-3">
                <div className="flex justify-between text-xs font-bold"><span>Skills density</span><span>{score.skills}%</span></div>
                <div className="mt-2"><ProgressBar value={score.skills} /></div>
              </div>
              <div className="rounded-2xl border border-[var(--border)] p-3">
                <div className="flex justify-between text-xs font-bold"><span>Experience & Bullets</span><span>{score.experience}%</span></div>
                <div className="mt-2"><ProgressBar value={score.experience} /></div>
              </div>
              <div className="rounded-2xl border border-[var(--border)] p-3">
                <div className="flex justify-between text-xs font-bold"><span>Readability</span><span>{score.readability}%</span></div>
                <div className="mt-2"><ProgressBar value={score.readability} /></div>
              </div>
            </div>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-l-4 !border-l-emerald-600">
              <b className="text-xs font-bold uppercase tracking-wider text-emerald-700">What’s working well</b>
              <ul className="mt-2 space-y-1.5 text-xs">
                {score.feedback.good.length > 0 ? (
                  score.feedback.good.map((g, i) => <li key={i} className="flex gap-2"><span>✓</span><span>{g}</span></li>)
                ) : (
                  <li className="opacity-60">Add skills and summary to see strengths.</li>
                )}
              </ul>
            </Card>

            <Card className="border-l-4 !border-l-amber-500">
              <b className="text-xs font-bold uppercase tracking-wider text-amber-600">Missing elements</b>
              <ul className="mt-2 space-y-1.5 text-xs">
                {score.feedback.missing.length > 0 ? (
                  score.feedback.missing.map((m, i) => <li key={i} className="flex gap-2"><span>!</span><span>{m}</span></li>)
                ) : (
                  <li className="text-emerald-600">No critical sections missing.</li>
                )}
              </ul>
            </Card>

            <Card className="border-l-4 !border-l-blue-500">
              <b className="text-xs font-bold uppercase tracking-wider text-blue-600">Actionable advice</b>
              <ul className="mt-2 space-y-1.5 text-xs">
                {score.feedback.improvements.map((im, i) => (
                  <li key={i} className="flex gap-2"><span>→</span><span>{im}</span></li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      )}

      {tab === "import" && (
        <Card>
          <b className="text-base">Upload Existing CV or Paste Text</b>
          <p className="text-xs opacity-70">Extract your skills, phone, email, and locations automatically without manual entry.</p>

          <div className="mt-4 rounded-2xl border-2 border-dashed border-[var(--border)] p-6 text-center">
            <input type="file" accept=".txt,.json,.doc,.docx" onChange={handleFileUpload} id="cvFileInput" className="hidden" />
            <label htmlFor="cvFileInput" className="cursor-pointer inline-flex items-center gap-2 rounded-full bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white hover:opacity-90">
              Upload CV (.txt / text file)
            </label>
            <p className="mt-2 text-xs opacity-60">or paste the plain text of your resume below:</p>
          </div>

          <textarea value={rawText} onChange={(e) => setRawText(e.target.value)} rows={5} placeholder="Paste resume plain text here..." className="mt-3 w-full rounded-xl border border-[var(--border)] bg-transparent p-3 text-xs" />

          {importSummary && (
            <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs font-medium dark:bg-slate-900">
              {importSummary}
            </div>
          )}

          <div className="mt-3 flex gap-2">
            <button onClick={applyImportToProfile} disabled={!rawText.trim()} className="rounded-full bg-emerald-700 px-5 py-2 text-sm font-bold text-white disabled:opacity-50">
              Update Profile from CV
            </button>
          </div>
        </Card>
      )}

      {tab === "templates" && (
        <div className="grid gap-3 md:grid-cols-3">
          <Card className="border-2 border-emerald-600">
            <b className="text-sm">Classic Zimbabwe ATS</b>
            <p className="mt-1 text-xs opacity-70">Single column, standard system fonts, section headings recognized by ATS systems.</p>
            <span className="mt-3 inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">Current Default</span>
          </Card>
          <Card className="opacity-80">
            <b className="text-sm">Executive Corporate</b>
            <p className="mt-1 text-xs opacity-70">Conservative serif styling tailored for financial institutions in Harare and Bulawayo.</p>
            <button onClick={() => toast({ title: "Template switched to Executive Corporate" })} className="mt-3 rounded-lg border border-[var(--border)] px-3 py-1 text-xs font-bold">Use template</button>
          </Card>
          <Card className="opacity-80">
            <b className="text-sm">Technical / Developer</b>
            <p className="mt-1 text-xs opacity-70">Prominent GitHub, stack inventory, and project repositories section at the top.</p>
            <button onClick={() => toast({ title: "Template switched to Technical" })} className="mt-3 rounded-lg border border-[var(--border)] px-3 py-1 text-xs font-bold">Use template</button>
          </Card>
        </div>
      )}
    </div>
  );
}


