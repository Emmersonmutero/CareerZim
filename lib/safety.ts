import type { Job } from './types';
import { daysUntil } from './utils';
import { matchJob as baseMatch, scamCheck } from './ai2';

export type SafetyLevel = 'Looks OK' | 'Caution' | 'Warning signs detected';
export function safetyLevel(job: Job): { level: SafetyLevel; flags: string[] } {
  const flags = scamCheck(job);
  const level: SafetyLevel = flags.length >= 2 ? 'Warning signs detected' : flags.length === 1 ? 'Caution' : 'Looks OK';
  return { level, flags };
}
// ONE match algorithm everywhere: base score, capped when scam flags exist.
export function jobMatch(profile: Parameters<typeof baseMatch>[0], job: Job) {
  const base = baseMatch(profile, job);
  const { level } = safetyLevel(job);
  const capped = level === 'Warning signs detected' ? Math.min(base.score, 24) : level === 'Caution' ? Math.min(base.score, 49) : base.score;
  return { ...base, score: capped, unsafe: level !== 'Looks OK', safety: level };
}
export function deadlineBadge(deadline?: string) {
  const n = daysUntil(deadline);
  if (n === null) return { label: 'No deadline', tone: 'slate' as const };
  if (n < 0) return { label: 'Expired', tone: 'slate' as const };
  if (n === 0) return { label: 'Closes today', tone: 'red' as const };
  if (n === 1) return { label: 'Closes tomorrow', tone: 'red' as const };
  if (n <= 3) return { label: `${n} days left`, tone: 'gold' as const };
  return { label: `${n} days left`, tone: 'default' as const };
}
export function completionOf(profile: { fullName: string; summary: string; skills: string[]; experience: unknown[]; education: unknown[]; projects: unknown[]; certifications: unknown[]; phone: string; linkedin?: string }): number {
  let s = 0;
  if (profile.fullName) s += 10;
  if (profile.summary?.length > 80) s += 20; else if (profile.summary) s += 10;
  if (profile.skills.length >= 8) s += 20; else s += profile.skills.length * 2;
  if (profile.experience.length) s += 15;
  if (profile.education.length) s += 10;
  if (profile.projects.length) s += 10;
  if (profile.certifications.length) s += 5;
  if (profile.phone && profile.linkedin) s += 10;
  return Math.min(100, s);
}
