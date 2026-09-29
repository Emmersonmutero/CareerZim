import { JOBS } from "./jobs";
import { jobMatch } from "./safety";
import type { ChatAction, Topic } from "@/components/chat/types";
import type { Application, UserProfile } from "./types";

/**
 * Relocated 1:1 from app/(dashboard)/assistant/page.tsx so the UI layer can stream,
 * persist and decorate replies. Branch conditions and reply wording are unchanged.
 * The only difference is that follow-up actions are declarative (href/intent) instead of
 * closures, because messages are now stored in localStorage.
 */
export function copilotReply(
  queryText: string,
  ctx: { profile: UserProfile; apps: Application[] },
): { text: string; actions?: ChatAction[]; topic: Topic } {
  const { profile, apps } = ctx;
  const t = queryText.toLowerCase();
  let reply = "";
  let actions: ChatAction[] | undefined = undefined;
  let topic: Topic = "general";

  const scoredJobs = JOBS.map((j) => ({ j, m: jobMatch(profile as never, j) })).sort((a, b) => b.m.score - a.m.score);
  const topJob = scoredJobs[0]?.j;
  const top3 = scoredJobs.slice(0, 3);

  if (t.includes("fit") || t.includes("best") || t.includes("job")) {
    topic = "jobs";
    reply =
      `Based on your ${profile.skills.length} skills (${profile.skills.slice(0, 4).join(", ")}), here are your highest matching roles:\n` +
      top3.map((x, i) => `${i + 1}. ${x.j.title} at ${x.j.company} (${x.j.location}) — ${x.m.score}% match`).join("\n");

    if (topJob) {
      actions = [
        { label: `View ${topJob.title}`, href: `/jobs/${topJob.id}` },
        { label: `Save ${topJob.title}`, intent: "saveJob", jobId: topJob.id },
        { label: "View all in Jobs", href: "/jobs" },
      ];
    }
  } else if (t.includes("skill") || t.includes("missing") || t.includes("gap")) {
    topic = "skills";
    const allMissing = Array.from(new Set(top3.flatMap((x) => x.m.missing)));
    reply =
      allMissing.length > 0
        ? `To increase your match rate across top Zimbabwe roles, consider learning:\n• ${allMissing.slice(0, 5).join("\n• ")}\n\nNever fabricate these — you can audit free courses on freeCodeCamp, MDN, and Coursera.`
        : "You currently meet key requirements for your top jobs! Consider adding quantified metrics or project repos to stand out.";
    actions = [
      { label: "Explore Roadmap", href: "/roadmap" },
      { label: "Update skills in Profile", href: "/profile" },
    ];
  } else if (t.includes("app") || t.includes("status")) {
    topic = "applications";
    if (apps.length === 0) {
      reply = "You haven't tracked any applications yet. When you apply to jobs on CareerZim, track them to receive follow-up email reminders.";
      actions = [{ label: "Browse Open Jobs", href: "/jobs" }];
    } else {
      const byStatus = apps.reduce((acc, a) => {
        acc[a.status] = (acc[a.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      const breakdown = Object.entries(byStatus).map(([st, cnt]) => `${st}: ${cnt}`).join(" • ");
      reply = `You have ${apps.length} tracked applications (${breakdown}).\nLatest: ${apps[0].jobTitle} at ${apps[0].company} [${apps[0].status}].`;
      actions = [{ label: "Open Applications Tracker", href: "/applications" }];
    }
  } else if (t.includes("cv") || t.includes("tailor")) {
    topic = "cv";
    reply = topJob
      ? `I recommend tailoring your CV for "${topJob.title}" at ${topJob.company}. Highlight: ${topJob.requirements.slice(0, 3).join(", ")}. In CareerZim, tailoring will never invent facts — it re-orders your genuine achievements.`
      : "Head to My CVs to run an ATS scan on your resume, generate action bullets, or export to PDF/Word.";
    actions = [
      { label: "Open My CVs", href: "/cvs" },
      { label: "Draft a Cover Letter", href: "/cover-letters" },
    ];
  } else if (t.includes("interview") || t.includes("prep")) {
    topic = "interview";
    reply = `For roles like ${profile.title || "your target role"}, prepare STAR examples (Situation, Task, Action, Result). Quantify your impact (e.g. 'reduced latency by 30%', 'served 200+ clients/day').`;
    actions = [{ label: "Launch Interview Simulator", href: "/interview" }];
  } else {
    reply = `I heard: "${queryText}". I can help you filter jobs in Harare/Bulawayo, audit ATS compatibility, follow up on applications, or check interview questions.`;
    actions = [{ label: "Create Job Alert for " + (profile.title || "Developer"), intent: "createAlert" }];
  }

  return { text: reply, actions, topic };
}

/** Welcome copy — unchanged wording, used as the empty-state greeting. */
export function welcomeText(profile: UserProfile) {
  return `Hi ${profile.fullName ? profile.fullName.split(" ")[0] : "there"}! I'm your CareerZim Copilot. I analyze your profile (${profile.title || "Job Seeker"}, ${profile.skills.length} skills listed, based in ${profile.location || "Harare"}) against live Zimbabwe roles and active applications.`;
}

/** Same keyword routing as copilotReply — used by the rendering layer. */
export function detectTopic(text: string): Topic {
  const t = text.toLowerCase();
  if (t.includes("fit") || t.includes("best") || t.includes("job")) return "jobs";
  if (t.includes("skill") || t.includes("missing") || t.includes("gap")) return "skills";
  if (t.includes("app") || t.includes("status")) return "applications";
  if (t.includes("cv") || t.includes("tailor")) return "cv";
  if (t.includes("interview") || t.includes("prep")) return "interview";
  return "general";
}

/** Suggestion chips shown on the empty state (original five, unchanged). */
export const BASE_CHIPS: string[] = [
  "Which jobs fit me best?",
  "What skills am I missing?",
  "Review my active applications",
  "Tailor CV for top job",
  "Interview tips for my skills",
];
