import type { Job, UserProfile } from './types';
function norm(s:string){ return s.toLowerCase().trim(); }
export function extractKeywords(text: string, top = 30) {
  const stop = new Set(['and','the','with','for','you','are','will','our','from','have','has','that','this','work','job','role','team','harare','bulawayo','mutare','gweru','masvingo','zimbabwe','junior','senior','remote','onsite','hybrid','about','into','your','their']);
  const phrases: string[] = [];
  const lower = text.toLowerCase();
  // phrase-aware: keep multi-word tech terms as ONE keyword
  const known = ['rest apis','rest api','node.js','next.js','tailwind css','power bi','active directory','machine learning','data analysis','project management','customer service','it support','digital marketing','social media','computer science'];
  let t = ' ' + lower + ' ';
  known.forEach((k) => { if (t.includes(' ' + k + ' ') || t.includes(' ' + k + ',')) { phrases.push(k.replace(/\b\w/g, (c) => c.toUpperCase())); t = t.split(k).join(' '); } });
  const f: Record<string, number> = {};
  t.split(/[^a-z0-9+#.]+/).filter((x) => x.length > 2).forEach((w) => { if (!stop.has(w)) f[w] = (f[w] || 0) + 1; });
  const singles = Object.entries(f).sort((a, b) => b[1] - a[1]).slice(0, Math.max(0, top - phrases.length)).map((e) => e[0].replace(/\b\w/g, (c) => c.toUpperCase()));
  return [...phrases, ...singles].slice(0, top);
}
export function analyzeCV(p: UserProfile){
  const skills = p.skills.length;
  const bullets = p.experience.reduce((n,e)=>n+e.bullets.length,0);
  const ats = Math.min(96, 55 + (skills>4?15:5) + (p.summary.length>80?10:0) + (p.experience.length?10:0));
  const structure = p.experience.length && p.education.length && p.summary ? 85 : 60;
  const sk = Math.min(95, 40 + skills*8);
  const ex = Math.min(92, 35 + p.experience.length*15 + bullets*4);
  const kw = Math.min(90, 45 + skills*5);
  const ach = bullets>=4 ? 78 : 52;
  const read = p.summary.length>60 ? 84 : 62;
  const comp = Math.min(98, 44 + skills*3 + p.experience.length*6 + p.education.length*6 + p.projects.length*5);
  const overall = Math.round((ats+structure+sk+ex+kw+ach+read+comp)/8);
  const good:string[]=[]; const missing:string[]=[]; const improvements:string[]=[];
  if(p.summary.length>80) good.push('Clear professional summary present.');
  else missing.push('Summary is short — expand to 3-4 lines with target role + top skills.');
  if(skills>=6) good.push(skills+' relevant skills listed.');
  else missing.push('Add more technical skills (aim for 8+).');
  if(bullets>=3) good.push('Experience uses bullet points.');
  else missing.push('Add quantified achievements (numbers, %).');
  if(p.projects.length) good.push('Projects included.');
  else missing.push('Add 1-2 projects with tech stack.');
  improvements.push('Mirror keywords from each job description for ATS.');
  improvements.push('Keep 1-2 pages, standard headings, no tables/images for ATS.');
  if(!p.certifications.length) improvements.push('Consider a certification (AWS, Google IT, ACCA, CompTIA).');
  return { overall, ats, structure, skills:sk, experience:ex, keywords:kw, achievements:ach, readability:read, completeness:comp, feedback:{good,missing,improvements} };
}
