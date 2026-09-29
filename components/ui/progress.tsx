"use client";
import * as React from "react";
import { cn } from "@/lib/cn";
export function ProgressRing({ value, size = 88, label }: { value: number; size?: number; label?: string }) {
  const r = (size - 12) / 2; const c = 2 * Math.PI * r;
  const [v, setV] = React.useState(0);
  React.useEffect(() => { const t = requestAnimationFrame(() => setV(value)); return () => cancelAnimationFrame(t); }, [value]);
  return (
    <div className="relative inline-flex items-center justify-center" role="img" aria-label={`${label ?? "Score"} ${value} percent`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} stroke="var(--border)" strokeWidth={10} fill="none" />
        <circle cx={size/2} cy={size/2} r={r} stroke="url(#czg)" strokeWidth={10} fill="none" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c - (c * Math.min(100, v)) / 100} style={{ transition: "stroke-dashoffset 1s ease" }} />
        <defs><linearGradient id="czg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#059669" /><stop offset="100%" stopColor="#FBBF24" />
        </linearGradient></defs>
      </svg>
      <div className="absolute text-center"><div className="font-display text-xl font-extrabold">{value}%</div>
      {label && <div className="text-[10px] font-bold uppercase tracking-wide opacity-60">{label}</div>}</div>
    </div>
  );
}
export function ProgressBar({ value, className }: { value: number; className?: string }) {
  return <div className={cn("h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800", className)}>
    <div className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-amber-400 transition-all duration-700" style={{ width: `${Math.min(100, value)}%` }} />
  </div>;
}
