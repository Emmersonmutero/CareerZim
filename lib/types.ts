export type EmploymentType = 'Full-time' | 'Part-time' | 'Internship' | 'Graduate Trainee' | 'Contract' | 'Freelance' | 'Apprenticeship';
export type WorkMode = 'Remote' | 'Hybrid' | 'Onsite';
export type AppStatus = 'Saved' | 'Preparing' | 'Applied' | 'Screening' | 'Interview' | 'Assessment' | 'Final Interview' | 'Offer' | 'Rejected' | 'Withdrawn';

export interface Experience { id: string; title: string; company: string; location?: string; start: string; end?: string; current?: boolean; bullets: string[]; }
export interface Education { id: string; school: string; qualification: string; field?: string; start?: string; end?: string; }
export interface Project { id: string; name: string; description: string; tech?: string[]; link?: string; }
export interface Certification { id: string; name: string; issuer?: string; year?: string; }

export interface UserProfile {
  fullName: string; title: string; email: string; phone: string;
  location: string; country: string; linkedin?: string; github?: string; portfolio?: string;
  summary: string; skills: string[]; softSkills: string[];
  experience: Experience[]; education: Education[]; projects: Project[];
  certifications: Certification[]; languages: string[];
  desiredTitles: string[]; industries: string[]; preferredLocations: string[];
  workMode: WorkMode; salaryExpectation?: string; employmentTypes: EmploymentType[];
  activelyLooking: boolean; careerGoal?: string;
}

export interface CVVersion { id: string; name: string; template: string; updatedAt: string; profile: UserProfile; tailoredForJobId?: string; changes?: string[]; score?: CVScore; }
export interface CVScore { overall: number; ats: number; structure: number; skills: number; experience: number; keywords: number; achievements: number; readability: number; completeness: number; feedback: { good: string[]; missing: string[]; improvements: string[] }; }

export interface Job {
  id: string; title: string; company: string; location: string; country: string;
  category: string; type: EmploymentType; mode: WorkMode; salary?: string;
  posted: string; deadline?: string; description: string; requirements: string[];
  preferred?: string[]; applyUrl?: string; applyEmail?: string; source: string; featured?: boolean;
}

export interface JobMatch { jobId: string; score: number; breakdown: { skills: string; experience: string; education: string; location: string; certification: string }; missing: string[]; }
export interface Application { id: string; jobId: string; jobTitle: string; company: string; status: AppStatus; dateApplied: string; deadline?: string; cvId?: string; coverLetter?: string; method?: string; contact?: string; notes?: string; interviewDate?: string; followUpDate?: string; }
export interface CoverLetter { id: string; jobId?: string; company: string; jobTitle: string; tone: 'Formal' | 'Professional' | 'Short' | 'Detailed'; body: string; createdAt: string; }
export interface JobAlert { id: string; query: string; location: string; category: string; email: boolean; inApp: boolean; createdAt: string; }
export interface Notification { id: string; title: string; body: string; date: string; read: boolean; kind: string; }
