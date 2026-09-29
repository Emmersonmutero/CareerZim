import * as React from "react";
import { cn } from "@/lib/cn";

/**
 * Minimal markdown for assistant bubbles — bold, italic, inline code, code fences,
 * headings, bullet + numbered lists. No dependency, no dangerouslySetInnerHTML.
 */

const INLINE = /(\*\*[^*\n]+\*\*|__[^_\n]+__|`[^`\n]+`|\*[^*\n]+\*)/g;
const BULLET = /^\s*[-•*]\s+(.*)$/;
const ORDERED = /^\s*(\d+)[.)]\s+(.*)$/;
const HEADING = /^(#{1,4})\s+(.*)$/;

function inlineNodes(text: string, keyBase: string): React.ReactNode[] {
  return text
    .split(INLINE)
    .filter((p) => p !== "" && p !== undefined)
    .map((part, i) => {
      const key = `${keyBase}-${i}`;
      const isBold = (part.startsWith("**") && part.endsWith("**")) || (part.startsWith("__") && part.endsWith("__"));
      if (isBold && part.length > 4) return <strong key={key} className="font-bold">{part.slice(2, -2)}</strong>;
      if (part.length > 2 && part.startsWith("`") && part.endsWith("`"))
        return (
          <code key={key} className="rounded-md border border-[var(--border)] bg-[var(--background)] px-1.5 py-0.5 font-mono text-[0.82em]">
            {part.slice(1, -1)}
          </code>
        );
      if (part.length > 2 && part.startsWith("*") && part.endsWith("*")) return <em key={key}>{part.slice(1, -1)}</em>;
      return <React.Fragment key={key}>{part}</React.Fragment>;
    });
}

/** "… — 82% match" gets a small pill so numbered job lists scan faster. */
function withMatchPill(text: string, keyBase: string) {
  const m = /^(.*?)\s*[—–-]\s*(\d{1,3})\s*%\s*match\b(.*)$/i.exec(text);
  if (!m || !m[1]) return inlineNodes(text, keyBase);
  return (
    <>
      {inlineNodes(m[1], `${keyBase}-t`)}
      <span className="ml-1.5 inline-flex items-center rounded-full bg-emerald-100 px-1.5 py-0.5 align-middle text-[10px] font-extrabold text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100">
        {m[2]}% match
      </span>
      {m[3] ? inlineNodes(m[3], `${keyBase}-r`) : null}
    </>
  );
}

function Paragraph({ text, kb }: { text: string; kb: string }) {
  const lines = text.split("\n");
  return (
    <p className="leading-relaxed">
      {lines.map((l, i) => (
        <React.Fragment key={i}>
          {i > 0 && <br />}
          {inlineNodes(l, `${kb}-${i}`)}
        </React.Fragment>
      ))}
    </p>
  );
}

export function Markdown({ text, className }: { text: string; className?: string }) {
  const blocks = React.useMemo(() => {
    const lines = text.split("\n");
    const out: React.ReactNode[] = [];
    let para: string[] = [];
    let fence: string[] | null = null;

    const flushPara = (key: string) => {
      if (!para.length) return;
      out.push(<Paragraph key={key} text={para.join("\n")} kb={key} />);
      para = [];
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const key = `b${i}`;

      if (/^\s*```/.test(line)) {
        if (fence) {
          out.push(
            <pre key={key} className="cz-scroll overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-xs leading-relaxed">
              {fence.join("\n")}
            </pre>,
          );
          fence = null;
        } else {
          flushPara(`${key}-p`);
          fence = [];
        }
        continue;
      }
      if (fence) { fence.push(line); continue; }

      if (!line.trim()) { flushPara(`${key}-p`); continue; }

      const h = HEADING.exec(line);
      if (h) {
        flushPara(`${key}-p`);
        const level = h[1].length;
        const cls =
          level <= 1 ? "font-display text-[15px] font-extrabold" :
          level === 2 ? "font-display text-sm font-extrabold" :
          "text-sm font-extrabold uppercase tracking-wide opacity-80";
        out.push(<div key={key} className={cn("pt-0.5", cls)}>{inlineNodes(h[2], key)}</div>);
        continue;
      }

      if (BULLET.test(line)) {
        flushPara(`${key}-p`);
        const items: string[] = [];
        while (i < lines.length && BULLET.test(lines[i])) items.push(BULLET.exec(lines[i])![1]);
        out.push(
          <ul key={key} className="space-y-1">
            {items.map((it, idx) => (
              <li key={idx} className="flex gap-2">
                <span aria-hidden className="mt-[8px] h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                <span className="min-w-0 flex-1">{inlineNodes(it, `${key}-${idx}`)}</span>
              </li>
            ))}
          </ul>,
        );
        continue;
      }

      if (ORDERED.test(line)) {
        flushPara(`${key}-p`);
        const items: { n: string; t: string }[] = [];
        while (i < lines.length && ORDERED.test(lines[i])) {
          const m = ORDERED.exec(lines[i])!;
          items.push({ n: m[1], t: m[2] });
        }
        out.push(
          <ol key={key} className="space-y-1.5">
            {items.map((it, idx) => (
              <li key={idx} className="flex gap-2">
                <span className="mt-px w-4 shrink-0 text-right font-bold text-emerald-700 dark:text-emerald-300">{it.n}.</span>
                <span className="min-w-0 flex-1">{withMatchPill(it.t, `${key}-${idx}`)}</span>
              </li>
            ))}
          </ol>,
        );
        continue;
      }

      para.push(line);
    }
    flushPara("last-p");
    if (fence) {
      out.push(
        <pre key="fence-end" className="cz-scroll overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-xs leading-relaxed">
          {fence.join("\n")}
        </pre>,
      );
    }
    return out;
  }, [text]);

  return <div className={cn("space-y-2", className)}>{blocks}</div>;
}
