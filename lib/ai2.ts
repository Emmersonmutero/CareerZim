import type { Job, UserProfile } from './types';
function norm(s:string){ return s.toLowerCase().trim(); }
export function matchJob(p: UserProfile, j: Job){
  const have = new Set(p.skills.map(norm));
  const reqs = j.requirements.map(norm);
  const hit = reqs.filter(r => have.has(r));
  const skillPct = reqs.length? hit.length/reqs.length : 0.5;
  const expOk = p.experience.length>0 ? 0.7 : 0.3;
  const eduOk = p.education.length>0 ? 0.8 : 0.4;
  const locOk = p.preferredLocations.some(l=> norm(l)===norm(j.location) || norm(l)==='remote') ? 1 : 0.5;
  const certNeed = /acca|cima|pmp|aws|nurses council|eiz/i.test(j.description+j.requirements.join(' '));
  const certOk = certNeed ? (p.certifications.length?0.7:0.2) : 0.8;
  const score = Math.round(skillPct*45 + expOk*20 + eduOk*15 + locOk*10 + certOk*10);
  const label = (v:number)=> v>=0.75?'Strong match': v>=0.45?'Partial match':'Missing';
  return { jobId:j.id, score: Math.min(97,Math.max(21,score)),
    breakdown:{ skills:label(skillPct), experience:label(expOk), education:label(eduOk), location: locOk===1?'Match':'Partial', certification: certNeed? (p.certifications.length?'Partial':'Missing') : 'Match' },
    missing: reqs.filter(r=>!have.has(r)) };
}
export function scamCheck(j: Job): string[] {
  const t = (j.title+' '+j.description+' '+(j.salary||'')).toLowerCase();
  const flags:string[]=[];
  if(/registration fee|ecocash|send.*\$|unlock/i.test(t)) flags.push('Requests money / fee — real employers never ask for payment.');
  if(/guaranteed|10,000|no interview|whatsapp only/i.test(t)) flags.push('Unrealistic promises or no formal interview.');
  if(/gmail\.com|whatsapp/i.test(t) && /unverified|unknown/i.test((j.company+j.source).toLowerCase())) flags.push('Unverified employer, free email / WhatsApp-only.');
  if(!j.applyUrl && !j.applyEmail) flags.push('No clear application method.');
  return flags;
}
export function skillGaps(p: UserProfile, j: Job){
  const have = new Set(p.skills.map(norm));
  return j.requirements.filter(r=>!have.has(norm(r)));
}
export function tailorSummary(p: UserProfile, j: Job){
  return p.summary + ' Targeting '+j.title+' with strengths in '+j.requirements.slice(0,4).join(', ')+'. Based in '+p.location+', open to '+j.location+'.';
}
export function interviewPack(jobTitle: string, company: string){
  return {
    hr: ['Tell me about yourself.','Why '+company+'?','Why this '+jobTitle+'?','A challenge you overcame (use STAR)?','Where in 3 years?'],
    tech: ['Describe a project and your role.','How do you debug production issues?','Explain REST APIs and SQL joins.','How do you use Git in a team?'],
    askThem: ['Success in 90 days?','Stack and team?','How is performance measured?'],
    star: 'STAR = Situation, Task, Action, Result. 1-2 min answers with numbers.'
  };
}
