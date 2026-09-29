import type { UserProfile } from "./types";
import { download } from "./utils";

export function cvToPlainText(p: UserProfile): string {
  const lines: string[] = [];
  lines.push((p.fullName || "Candidate").toUpperCase());
  const contact = [p.title, p.email, p.phone, p.location, p.country].filter(Boolean).join(" | ");
  if (contact) lines.push(contact);
  const links = [p.linkedin, p.github, p.portfolio].filter(Boolean).join(" | ");
  if (links) lines.push(links);
  lines.push("");

  if (p.summary) {
    lines.push("PROFESSIONAL SUMMARY");
    lines.push("--------------------");
    lines.push(p.summary);
    lines.push("");
  }

  if (p.skills && p.skills.length > 0) {
    lines.push("CORE SKILLS & TECHNOLOGIES");
    lines.push("--------------------------");
    lines.push(p.skills.join(", "));
    lines.push("");
  }

  if (p.experience && p.experience.length > 0) {
    lines.push("WORK EXPERIENCE");
    lines.push("---------------");
    p.experience.forEach((e) => {
      lines.push(`${e.title} — ${e.company}`);
      const meta = [e.location, [e.start, e.current ? "Present" : e.end].filter(Boolean).join(" - ")].filter(Boolean).join(" | ");
      if (meta) lines.push(meta);
      (e.bullets || []).forEach((b) => lines.push(`  • ${b}`));
      lines.push("");
    });
  }

  if (p.education && p.education.length > 0) {
    lines.push("EDUCATION");
    lines.push("---------");
    p.education.forEach((ed) => {
      lines.push(`${ed.qualification} — ${ed.school}`);
      const yr = [ed.start, ed.end].filter(Boolean).join(" - ");
      if (yr) lines.push(yr);
      lines.push("");
    });
  }

  if (p.projects && p.projects.length > 0) {
    lines.push("KEY PROJECTS");
    lines.push("------------");
    p.projects.forEach((pr) => {
      lines.push(`${pr.name}${pr.link ? ` (${pr.link})` : ""}`);
      if (pr.description) lines.push(`  ${pr.description}`);
      if (pr.tech && pr.tech.length > 0) lines.push(`  Technologies: ${pr.tech.join(", ")}`);
      lines.push("");
    });
  }

  if (p.certifications && p.certifications.length > 0) {
    lines.push("CERTIFICATIONS");
    lines.push("--------------");
    p.certifications.forEach((c) => {
      lines.push(`${c.name}${c.issuer ? ` — ${c.issuer}` : ""}${c.year ? ` (${c.year})` : ""}`);
    });
    lines.push("");
  }

  return lines.join("\n");
}


export function cvToHtmlDocument(p: UserProfile, title = "Curriculum Vitae"): string {
  const escape = (s: string | undefined) => (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>${escape(title)} - ${escape(p.fullName || "Candidate")}</title>
<style>
  @page { size: A4; margin: 18mm 16mm; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #0f172a; line-height: 1.45; font-size: 10.5pt; max-width: 800px; margin: 0 auto; padding: 24px; }
  h1 { font-size: 20pt; margin: 0 0 4px 0; letter-spacing: -0.5px; color: #064e3b; text-transform: uppercase; }
  .contact { font-size: 9.5pt; color: #475569; margin-bottom: 14px; border-bottom: 1.5px solid #064e3b; padding-bottom: 8px; }
  h2 { font-size: 11.5pt; text-transform: uppercase; letter-spacing: 0.5px; color: #064e3b; border-bottom: 1px solid #cbd5e1; margin: 16px 0 6px 0; padding-bottom: 2px; }
  .role-head { display: flex; justify-content: space-between; font-weight: 700; font-size: 10.5pt; }
  .role-sub { color: #64748b; font-size: 9pt; margin-bottom: 4px; }
  ul { margin: 4px 0 10px 18px; padding: 0; }
  li { margin-bottom: 3px; }
  .skills-pill { display: inline-block; background: #f1f5f9; border-radius: 4px; padding: 2px 6px; margin: 2px; font-size: 9pt; }
  @media print { body { padding: 0; max-width: none; } }
</style>
</head>
<body>
  <h1>${escape(p.fullName || "Candidate")}</h1>
  <div class="contact">
    ${[p.title, p.email, p.phone, p.location, p.country].filter(Boolean).map(escape).join(" &bull; ")}
    ${[p.linkedin, p.github, p.portfolio].filter(Boolean).length > 0 ? `<br/>${[p.linkedin, p.github, p.portfolio].filter(Boolean).map(escape).join(" &bull; ")}` : ""}
  </div>

  ${p.summary ? `<h2>Professional Summary</h2><p style="margin:4px 0 10px 0;">${escape(p.summary)}</p>` : ""}

  ${p.skills && p.skills.length > 0 ? `<h2>Core Skills</h2><p style="margin:4px 0 10px 0;">${p.skills.map((s) => `<span class="skills-pill">${escape(s)}</span>`).join(" ")}</p>` : ""}

  ${p.experience && p.experience.length > 0 ? `<h2>Experience</h2>${p.experience.map((e) => `
    <div style="margin-bottom:10px;">
      <div class="role-head"><span>${escape(e.title)} &mdash; ${escape(e.company)}</span><span>${escape([e.start, e.current ? "Present" : e.end].filter(Boolean).join(" - "))}</span></div>
      ${e.location ? `<div class="role-sub">${escape(e.location)}</div>` : ""}
      ${e.bullets && e.bullets.length > 0 ? `<ul>${e.bullets.map((b) => `<li>${escape(b)}</li>`).join("")}</ul>` : ""}
    </div>`).join("")}` : ""}

  ${p.education && p.education.length > 0 ? `<h2>Education</h2>${p.education.map((ed) => `
    <div style="margin-bottom:6px;">
      <div class="role-head"><span>${escape(ed.qualification)}</span><span>${escape([ed.start, ed.end].filter(Boolean).join(" - "))}</span></div>
      <div class="role-sub">${escape(ed.school)}</div>
    </div>`).join("")}` : ""}

  ${p.projects && p.projects.length > 0 ? `<h2>Projects</h2>${p.projects.map((pr) => `
    <div style="margin-bottom:6px;">
      <div class="role-head"><span>${escape(pr.name)}</span>${pr.link ? `<span style="font-weight:normal;font-size:9pt;">${escape(pr.link)}</span>` : ""}</div>
      ${pr.description ? `<p style="margin:2px 0;font-size:9.5pt;">${escape(pr.description)}</p>` : ""}
      ${pr.tech && pr.tech.length > 0 ? `<div class="role-sub">Tech: ${escape(pr.tech.join(", "))}</div>` : ""}
    </div>`).join("")}` : ""}

  ${p.certifications && p.certifications.length > 0 ? `<h2>Certifications</h2><ul style="margin-top:4px;">${p.certifications.map((c) => `<li>${escape(c.name)}${c.issuer ? ` &mdash; ${escape(c.issuer)}` : ""}${c.year ? ` (${escape(c.year)})` : ""}</li>`).join("")}</ul>` : ""}
</body>
</html>`;
}

export function exportCV(p: UserProfile, filename: string, fmt: "TXT" | "JSON" | "DOCX" | "PDF") {
  const safeBase = filename.replace(/\.[^/.]+$/, "");
  if (fmt === "TXT") {
    download(`${safeBase}.txt`, cvToPlainText(p), "text/plain;charset=utf-8");
    return;
  }
  if (fmt === "JSON") {
    download(`${safeBase}.json`, JSON.stringify(p, null, 2), "application/json");
    return;
  }
  if (fmt === "DOCX") {
    const html = cvToHtmlDocument(p, safeBase);
    const wordDoc = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>${html.replace("<!DOCTYPE html>", "")}</html>`;
    download(`${safeBase}.doc`, wordDoc, "application/msword;charset=utf-8");
    return;
  }
  if (fmt === "PDF") {
    const html = cvToHtmlDocument(p, safeBase);
    const win = window.open("", "_blank");
    if (!win) {
      alert("Popups are blocked. Please allow popups to print/save PDF.");
      return;
    }
    win.document.open();
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
    }, 300);
  }
}

export function parseCVText(rawText: string): Partial<UserProfile> {
  const text = rawText.replace(/\r\n/g, "\n");
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const result: Partial<UserProfile> = {};

  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) result.email = emailMatch[0];

  const phoneMatch = text.match(/(?:\+263|00263|0)(?:7[1378]\d{7}|24\d{6,7}|\d{9})/);
  if (phoneMatch) result.phone = phoneMatch[0];

  const liMatch = text.match(/linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);
  if (liMatch) result.linkedin = "https://" + liMatch[0];

  const ghMatch = text.match(/github\.com\/[a-zA-Z0-9_-]+/i);
  if (ghMatch) result.github = "https://" + ghMatch[0];

  if (lines.length > 0 && !lines[0].includes("@") && !lines[0].includes("http") && lines[0].length < 40) {
    result.fullName = lines[0].replace(/^(curriculum vitae|resume|cv)\s*[-:]*\s*/i, "").trim();
  }
  if (lines.length > 1 && !lines[1].includes("@") && !lines[1].includes("http") && lines[1].length < 50) {
    result.title = lines[1];
  }

  const SKILL_LIST = [
    "JavaScript", "TypeScript", "React", "Next.js", "Node.js", "Python", "Django", "FastAPI",
    "Tailwind CSS", "HTML5", "CSS3", "Git", "GitHub", "SQL", "PostgreSQL", "MySQL", "MongoDB",
    "REST APIs", "GraphQL", "Docker", "Linux", "AWS", "Supabase", "Firebase", "C#", ".NET",
    "Java", "Spring Boot", "PHP", "Laravel", "Excel", "Accounting", "Project Management",
    "Communication", "Customer Service", "Sales", "Agile", "Scrum"
  ];
  const detectedSkills: string[] = [];
  const lower = text.toLowerCase();
  for (const sk of SKILL_LIST) {
    const pattern = new RegExp(`\\b${sk.replace(".", "\\.").toLowerCase()}\\b`, "i");
    if (pattern.test(lower)) {
      detectedSkills.push(sk);
    }
  }
  if (detectedSkills.length > 0) {
    result.skills = detectedSkills;
  }

  const cities = ["Harare", "Bulawayo", "Mutare", "Gweru", "Kwekwe", "Masvingo", "Chitungwiza", "Victoria Falls"];
  for (const c of cities) {
    if (new RegExp(`\\b${c}\\b`, "i").test(text)) {
      result.location = c;
      result.country = "Zimbabwe";
      break;
    }
  }

  return result;
}

