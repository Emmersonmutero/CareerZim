"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { download } from "@/lib/utils";
import { Card } from "@/components/ui/card";
export default function LettersPage() {
  const { profile, letters, setLetters } = useStore();
  const [company, setCompany] = useState("");
  const [title, setTitle] = useState("");
  const [tone, setTone] = useState("Professional");
  const [body, setBody] = useState("");
  const gen = () => {
    if (!company.trim() || !title.trim()) return;
    const strengths = profile.skills.slice(0, 4).join(", ") || "[add detail: your top skills]";
    const proof = profile.experience[0] ? `${profile.experience[0].title} at ${profile.experience[0].company}` : "[add detail: most relevant role/project]";
    const L = tone === "Short" ? 2 : 4;
    const text = `Dear Hiring Manager,\n\nI am applying for ${title} at ${company}. ${profile.summary || "[add detail: one-line professional summary]"}\n\nWhy I'm a fit (${tone}):\n- Relevant strengths: ${strengths}.\n- Proof: ${proof}.\n- Based in ${profile.location || "Zimbabwe"}; excited to contribute to ${company}.` + (L > 2 ? `\n- I mirror your required keywords honestly — everything above comes from my CV.` : "") + `\n\nThank you for your consideration.\n\nSincerely,\n${profile.fullName || "[add detail: full name]"}${profile.email ? ` | ${profile.email}` : " | [add detail: email]"}${profile.phone ? ` | ${profile.phone}` : " | [add detail: phone]"}`;
    setBody(text);
  };
  const save = () => {
    if (!body) return;
    setLetters([{ id: "cl" + Date.now(), company, jobTitle: title, tone: tone as never, body, createdAt: new Date().toISOString().slice(0, 10) }, ...letters]);
    setBody("");
  };
  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-extrabold">Cover Letters ({letters.length})</h1>
      <Card>
        <div className="flex flex-wrap gap-2">
          <input value={company} onChange={(e) => setCompany(e.target.value)} aria-label="Company" placeholder="Company" className="rounded-xl border border-[var(--border)] bg-transparent px-3 py-2 text-sm" />
          <input value={title} onChange={(e) => setTitle(e.target.value)} aria-label="Job title" placeholder="Job title" className="rounded-xl border border-[var(--border)] bg-transparent px-3 py-2 text-sm" />
          <select value={tone} onChange={(e) => setTone(e.target.value)} aria-label="Tone" className="rounded-xl border border-[var(--border)] bg-transparent px-3 py-2 text-sm">{["Formal", "Professional", "Short", "Detailed"].map((t) => <option key={t}>{t}</option>)}</select>
          <button onClick={gen} className="rounded-full bg-emerald-700 px-5 py-2 text-sm font-bold text-white">Generate</button>
          {body && <button onClick={save} className="rounded-full border border-[var(--border)] px-5 py-2 text-sm font-bold">Save version</button>}
        </div>
        {body && <><textarea value={body} onChange={(e) => setBody(e.target.value)} rows={10} aria-label="Letter editor" className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-white p-3 text-sm text-slate-900" />
        <div className="mt-2 flex gap-2"><button onClick={() => navigator.clipboard?.writeText(body)} className="rounded-full border border-[var(--border)] px-4 py-1.5 text-xs font-bold">Copy</button>
        <button onClick={() => download(title + "-cover-letter.txt", body)} className="rounded-full border border-[var(--border)] px-4 py-1.5 text-xs font-bold">Export TXT</button></div></>}
        <p className="mt-2 text-[11px] opacity-60">Facts only from your CV. Fill every [add detail] before sending.</p>
      </Card>
      {letters.map((l) => (<Card key={l.id}><b className="text-sm">{l.jobTitle} @ {l.company} • {l.tone}</b><pre className="mt-2 whitespace-pre-wrap text-sm">{l.body}</pre>
        <div className="mt-2 flex gap-2"><button onClick={() => download(l.jobTitle + ".txt", l.body)} className="rounded-full border border-[var(--border)] px-4 py-1.5 text-xs font-bold">Export TXT</button>
        <button onClick={() => download(l.jobTitle + ".json", JSON.stringify(l, null, 2), "application/json")} className="rounded-full border border-[var(--border)] px-4 py-1.5 text-xs font-bold">Export JSON</button></div></Card>))}
    </div>
  );
}

