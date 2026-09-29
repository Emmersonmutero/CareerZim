import { JOBS } from "@/lib/jobs";
import { jobMatch } from "@/lib/safety";
import { tailorSummary } from "@/lib/ai2";
import { BASE_CHIPS } from "@/lib/copilot";
import type { ChatCard, Suggestion, Topic } from "./types";
import type { UserProfile } from "@/lib/types";

/**
 * Rendering-layer helpers: they inspect the assistant reply that the (unchanged) copilot
 * produced and decide which structured card to attach. No AI logic lives here.
 */

/** Matches the numbered job lines emitted by copilotReply's jobs branch. */
const JOB_LINE = /^\s*\d+[.)]\s*(.+?)\s+at\s+(.+?)\s*\((.+?)\)\s*[—-]\s*(\d+)%\s*match\s*$/i;
const BULLET = /^\s*[•\-*]\s+(.*)$/;

function parseJobLines(text: string) {
  const items: { jobId: string; score: number }[] = [];
  text.split("\n").forEach((line) => {
    const m = JOB_LINE.exec(line);
    if (!m) return;
    const title = m[1].trim();
    const company = m[2].trim();
    const score = Number(m[4]);
    const job =
      JOBS.find((j) => j.title === title && j.company === company) ??
      JOBS.find((j) => j.title.toLowerCase() === title.toLowerCase()) ??
      JOBS.find((j) => j.title.toLowerCase().includes(title.toLowerCase().slice(0, 12)));
    if (job) items.push({ jobId: job.id, score: Number.isFinite(score) ? score : 0 });
  });
  return items.slice(0, 3);
}

function parseBullets(text: string) {
  return text
    .split("\n")
    .map((l) => BULLET.exec(l)?.[1]?.trim())
    .filter((x): x is string => Boolean(x))
    .slice(0, 6);
}

export function deriveCards(args: { topic: Topic; text: string; profile: UserProfile }): ChatCard[] {
  const { topic, text, profile } = args;
  const cards: ChatCard[] = [];

  if (topic === "jobs") {
    const items = parseJobLines(text);
    if (items.length) cards.push({ kind: "jobs", label: "Ready to act on", items });
  }

  if (topic === "skills") {
    const items = parseBullets(text);
    if (items.length) cards.push({ kind: "checklist", label: "Skill-gap checklist", items });
  }

  if (topic === "cv") {
    const best = JOBS.map((j) => ({ j, m: jobMatch(profile as never, j) })).sort((a, b) => b.m.score - a.m.score)[0];
    if (best) {
      cards.push({
        kind: "diff",
        label: `Summary — tailored for ${best.j.title}`,
        before: profile.summary?.trim() || "(no summary yet)",
        after: tailorSummary(profile, best.j).trim(),
      });
    }
  }

  if (topic === "interview") {
    cards.push({
      kind: "checklist",
      label: "STAR checklist",
      items: [
        "Situation — set the scene in one sentence",
        "Task — what you were responsible for",
        "Action — the specific steps you took",
        "Result — quantify it (%, USD, people, time saved)",
      ],
    });
  }

  return cards;
}

/** Chips that refresh after each reply so the next step is always obvious. */
export function suggestionsFor(topic: Topic, ctx: { apps: number; saved: number; cvs: number }): Suggestion[] {
  const reviewApps: Suggestion = {
    label: ctx.apps ? `Review my ${ctx.apps} active application${ctx.apps === 1 ? "" : "s"}` : "Review my active applications",
    ask: "Review my active applications",
  };
  const bestJobs: Suggestion = { label: "Which jobs fit me best?", ask: "Which jobs fit me best?" };
  const tailor: Suggestion = { label: "Tailor my CV for the top job", ask: "Tailor CV for top job" };
  const gaps: Suggestion = { label: "What skills am I missing?", ask: "What skills am I missing?" };

  switch (topic) {
    case "jobs":
      return [
        tailor,
        { label: "Draft a cover letter", href: "/cover-letters" },
        gaps,
        reviewApps,
      ];
    case "skills":
      return [
        { label: "Build me a learning roadmap", href: "/roadmap" },
        bestJobs,
        tailor,
        { label: "Update skills in Profile", href: "/profile" },
      ];
    case "applications":
      return [
        { label: "Draft a follow-up email", href: "/applications" },
        bestJobs,
        tailor,
        { label: "Interview tips for my skills", ask: "Interview tips for my skills" },
      ];
    case "cv":
      return [
        { label: ctx.cvs ? `Open my ${ctx.cvs} CV${ctx.cvs === 1 ? "" : "s"}` : "Open My CVs", href: "/cvs" },
        { label: "Draft a cover letter", href: "/cover-letters" },
        bestJobs,
        gaps,
      ];
    case "interview":
      return [
        { label: "Launch Interview Simulator", href: "/interview" },
        reviewApps,
        bestJobs,
        tailor,
      ];
    default:
      return [...BASE_CHIPS.slice(0, 3).map((label) => ({ label, ask: label })), { label: "Create a job alert", href: "/alerts" }];
  }
}
