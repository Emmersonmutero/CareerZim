"use client";
import * as React from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { JOBS } from "@/lib/jobs";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";
import { useToast } from "@/components/ui/toaster";
import { load, save } from "@/lib/utils";

interface PracticeRecord {
  id: string;
  jobTitle: string;
  question: string;
  answer: string;
  score: number;
  feedback: string;
  date: string;
}

export default function InterviewPage() {
  const { profile } = useStore();
  const toast = useToast();

  const [tab, setTab] = React.useState<"sim" | "package" | "research">("sim");
  const [selectedJobId, setSelectedJobId] = React.useState<string>(JOBS[0]?.id || "");
  const [qIndex, setQIndex] = React.useState(0);
  const [ans, setAns] = React.useState("");
  const [feedback, setFeedback] = React.useState<{ score: number; text: string; tips: string[] } | null>(null);
  const [history, setHistory] = React.useState<PracticeRecord[]>([]);

  React.useEffect(() => {
    setHistory(load("cz_interview_history", []));
  }, []);

  const activeJob = JOBS.find((j) => j.id === selectedJobId) || JOBS[0];

  const questions = [
    `Tell me about yourself and why you're interested in the ${activeJob.title} position at ${activeJob.company}.`,
    `How have you used ${profile.skills[0] || activeJob.requirements[0] || "your core skills"} to solve a difficult production problem?`,
    `Describe a situation where a project missed a deadline or hit unexpected obstacles (STAR method).`,
    `How do you collaborate across teams in ${activeJob.location} or remote setups?`,
    `What questions do you have for us regarding the engineering culture at ${activeJob.company}?`,
  ];

  const currentQ = questions[qIndex] || questions[0];

  const evaluateAnswer = () => {
    const text = ans.trim();
    if (!text) {
      toast({ title: "Please enter an answer", body: "Type your draft response to receive feedback." });
      return;
    }

    const words = text.split(/\s+/).length;
    let score = 50;
    const tips: string[] = [];

    if (words > 75) score += 20;
    else tips.push("Expand your answer with more context (aim for 80+ words).");

    if (/\d+[%kKmM]?|\$\d+/.test(text)) {
      score += 15;
    } else {
      tips.push("Quantify your result with specific metrics (%, hours saved, revenue, users).");
    }

    const starHits = ["situation", "task", "action", "result", "because", "led to", "achieved", "built", "spearheaded"].filter((w) => text.toLowerCase().includes(w)).length;
    if (starHits >= 2) {
      score += 15;
    } else {
      tips.push("Use structured STAR transitions (e.g. 'The situation was...', 'My action was...').");
    }

    const finalScore = Math.min(96, score);
    const summary = finalScore >= 80 ? "Strong response! Clear concrete actions and good impact." : "Promising start — strengthen with quantifiable outcomes.";

    const res = { score: finalScore, text: summary, tips };
    setFeedback(res);

    const record: PracticeRecord = {
      id: "rec_" + Date.now(),
      jobTitle: activeJob.title,
      question: currentQ,
      answer: text,
      score: finalScore,
      feedback: summary,
      date: new Date().toISOString().slice(0, 10),
    };
    const updatedHistory = [record, ...history].slice(0, 15);
    setHistory(updatedHistory);
    save("cz_interview_history", updatedHistory);
    toast({ title: `Scored ${finalScore}/100`, body: "Saved to practice history." });
  };

  const nextQuestion = () => {
    setQIndex((i) => (i + 1) % questions.length);
    setAns("");
    setFeedback(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold">Interview Prep & Simulator</h1>
          <p className="text-xs opacity-70">Practice STAR answers tailored to real Zimbabwe employers and job descriptions.</p>
        </div>

        <div className="flex rounded-full border border-[var(--border)] bg-[var(--card)] p-1 text-xs font-bold">
          <button onClick={() => setTab("sim")} className={`rounded-full px-4 py-1.5 transition ${tab === "sim" ? "bg-emerald-700 text-white" : "opacity-70"}`}>Simulator</button>
          <button onClick={() => setTab("package")} className={`rounded-full px-4 py-1.5 transition ${tab === "package" ? "bg-emerald-700 text-white" : "opacity-70"}`}>Prep Package</button>
          <button onClick={() => setTab("research")} className={`rounded-full px-4 py-1.5 transition ${tab === "research" ? "bg-emerald-700 text-white" : "opacity-70"}`}>Company Research</button>
        </div>
      </div>

      <Card className="!p-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-bold opacity-75">Target Role for Practice:</span>
          <select value={selectedJobId} onChange={(e) => { setSelectedJobId(e.target.value); setQIndex(0); setAns(""); setFeedback(null); }} className="rounded-xl border border-[var(--border)] bg-transparent px-3 py-1.5 text-xs font-bold">
            {JOBS.map((j) => (
              <option key={j.id} value={j.id}>{j.title} @ {j.company} ({j.location})</option>
            ))}
          </select>
        </div>
      </Card>

      {tab === "sim" && (
        <div className="space-y-4">
          <Card>
            <div className="flex items-center justify-between text-xs font-bold opacity-70">
              <span>Question {qIndex + 1} of {questions.length}</span>
              <span>Target: {activeJob.company}</span>
            </div>
            <div className="mt-2 flex gap-1.5">
              {questions.map((_, idx) => (
                <div key={idx} className={`h-1.5 flex-1 rounded-full ${idx <= qIndex ? "bg-emerald-600" : "bg-slate-200 dark:bg-slate-800"}`} />
              ))}
            </div>

            <b className="mt-4 block text-base">{currentQ}</b>

            <textarea
              value={ans}
              onChange={(e) => setAns(e.target.value)}
              rows={4}
              className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-transparent p-3.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-600"
              placeholder="Structure your answer using STAR: Situation → Task → Action → Result. Include real numbers..."
            />

            <div className="mt-3 flex flex-wrap gap-2">
              <button onClick={evaluateAnswer} className="rounded-full bg-emerald-700 px-5 py-2 text-xs font-bold text-white hover:opacity-90">
                Score Answer
              </button>
              <button onClick={nextQuestion} className="rounded-full border border-[var(--border)] px-4 py-2 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800">
                Next Question →
              </button>
            </div>

            {feedback && (
              <div className="mt-4 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <b className="text-sm">Feedback & Evaluation</b>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-extrabold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    {feedback.score} / 100
                  </span>
                </div>
                <p className="mt-1 text-xs">{feedback.text}</p>
                {feedback.tips.length > 0 && (
                  <ul className="mt-2 space-y-1 text-xs opacity-80">
                    {feedback.tips.map((tip, idx) => (
                      <li key={idx} className="flex gap-2"><span>💡</span><span>{tip}</span></li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </Card>

          {history.length > 0 && (
            <Card>
              <div className="flex items-center justify-between">
                <b className="text-sm">Recent Practice Attempts ({history.length})</b>
                <button onClick={() => { setHistory([]); save("cz_interview_history", []); }} className="text-xs text-red-600 hover:underline">Clear History</button>
              </div>
              <div className="mt-3 space-y-2">
                {history.slice(0, 4).map((rec) => (
                  <div key={rec.id} className="rounded-xl border border-[var(--border)] p-3 text-xs">
                    <div className="flex justify-between font-bold">
                      <span className="truncate pr-2">{rec.jobTitle} — {rec.question.slice(0, 50)}...</span>
                      <span className="text-emerald-700">{rec.score}%</span>
                    </div>
                    <p className="mt-1 opacity-70 line-clamp-1">"{rec.answer}"</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {tab === "package" && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <b className="text-sm">The Zimbabwe Interview Toolkit</b>
            <div className="mt-3 space-y-3 text-xs">
              <div className="rounded-xl border border-[var(--border)] p-3">
                <b className="block text-emerald-700">1. Master the STAR Technique</b>
                <p className="mt-1 opacity-75"><b>Situation:</b> Describe the context in 1 sentence.<br/><b>Task:</b> What was your specific responsibility?<br/><b>Action:</b> What steps did YOU take?<br/><b>Result:</b> Quantify the outcome (saved 4 hrs/week, onboarded 50 merchants).</p>
              </div>
              <div className="rounded-xl border border-[var(--border)] p-3">
                <b className="block text-emerald-700">2. Salary Discussion in USD vs ZiG</b>
                <p className="mt-1 opacity-75">When asked about expectations: quote your baseline in USD or split package (USD hard currency allowance + local currency). CareerZim benchmarks show local tech roles range $600 - $2,500/mo.</p>
              </div>
              <div className="rounded-xl border border-[var(--border)] p-3">
                <b className="block text-emerald-700">3. Reverse Questions to Ask Them</b>
                <p className="mt-1 opacity-75">• What does success look like in the first 90 days?<br/>• What is the deployment cadence and tech stack roadmap?<br/>• How is performance evaluated during probation?</p>
              </div>
            </div>
          </Card>

          <Card>
            <b className="text-sm">Preparation Progress</b>
            <p className="text-xs opacity-70">Based on practiced questions and profile readiness.</p>
            <div className="mt-4 space-y-3 text-xs font-bold">
              <div>
                <div className="flex justify-between"><span>STAR Stories Ready</span><span>{Math.min(100, history.length * 25)}%</span></div>
                <div className="mt-1"><ProgressBar value={Math.min(100, history.length * 25)} /></div>
              </div>
              <div>
                <div className="flex justify-between"><span>Profile Qualifications</span><span>{profile.skills.length >= 6 ? "90%" : "55%"}</span></div>
                <div className="mt-1"><ProgressBar value={profile.skills.length >= 6 ? 90 : 55} /></div>
              </div>
              <div>
                <div className="flex justify-between"><span>Company Dossier</span><span>100%</span></div>
                <div className="mt-1"><ProgressBar value={100} /></div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {tab === "research" && (
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <b className="text-lg">{activeJob.company}</b>
              <p className="text-xs opacity-70">Location: {activeJob.location} • Sector: Technology & Telecommunications</p>
            </div>
            <Link href={`/jobs/${activeJob.id}`} className="rounded-full bg-emerald-700 px-4 py-1.5 text-xs font-bold text-white">
              View Full Job
            </Link>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3 text-xs">
            <div className="rounded-xl border border-[var(--border)] p-3">
              <b className="opacity-60 uppercase text-[10px] block">Role Applied For</b>
              <span className="font-bold">{activeJob.title}</span>
            </div>
            <div className="rounded-xl border border-[var(--border)] p-3">
              <b className="opacity-60 uppercase text-[10px] block">Work Mode</b>
              <span className="font-bold">{activeJob.mode} ({activeJob.type})</span>
            </div>
            <div className="rounded-xl border border-[var(--border)] p-3">
              <b className="opacity-60 uppercase text-[10px] block">Compensation Bracket</b>
              <span className="font-bold">{activeJob.salary}</span>
            </div>
          </div>

          <div className="mt-4 space-y-2 text-xs">
            <b className="text-sm">Requirements Checklist for this Interview</b>
            <div className="flex flex-wrap gap-1.5">
              {activeJob.requirements.map((req) => {
                const has = profile.skills.some((s) => s.toLowerCase() === req.toLowerCase());
                return (
                  <span key={req} className={`rounded-full px-2.5 py-1 text-xs font-semibold ${has ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"}`}>
                    {has ? "✓ " : "○ "} {req}
                  </span>
                );
              })}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

