/** Shared chat model. Everything here must stay JSON-serialisable (localStorage). */

export type ChatRole = "user" | "assistant";

/** Structured follow-ups rendered as buttons. `intent` replaces the old onClick so messages persist. */
export type ChatAction =
  | { label: string; href: string }
  | { label: string; intent: "saveJob" | "createAlert"; jobId?: string };

/** Inline rich blocks rendered inside assistant bubbles. */
export type ChatCard =
  | { kind: "jobs"; label?: string; items: { jobId: string; score: number }[] }
  | { kind: "diff"; label?: string; before: string; after: string }
  | { kind: "checklist"; label?: string; items: string[] };

export type Attachment = { kind: "job" | "cv"; id: string; label: string; sub?: string };

export interface ChatMessage {
  id: string;
  role: ChatRole;
  /** Markdown source. */
  text: string;
  createdAt: number;
  cards?: ChatCard[];
  actions?: ChatAction[];
  attachments?: Attachment[];
  feedback?: "up" | "down";
  /** Assistant turn that errored — renders an error bubble with Retry. */
  failed?: boolean;
  errorText?: string;
  /** Stream interrupted by the user. */
  stopped?: boolean;
  /** User turn that was edited and resent. */
  edited?: boolean;
}

export interface Conversation {
  id: string;
  /** Derived from the first user message unless renamed. */
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
}

export type Topic = "jobs" | "skills" | "applications" | "cv" | "interview" | "general";

/** A suggestion chip: either sends a prompt or navigates somewhere. */
export type Suggestion = { label: string; ask?: string; href?: string };
