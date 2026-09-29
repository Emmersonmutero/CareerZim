import * as React from "react";
export interface SimpleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: "default" | "gold" | "outline" | "ghost" | "danger";
}
export function Button({ className, tone, ...props }: SimpleButtonProps & { className?: string }) {
  const map = {
    default: "bg-emerald-700 text-white shadow-lg",
    gold: "bg-amber-400 text-emerald-950 shadow-lg",
    outline: "border border-[var(--border)] bg-[var(--card)]",
    ghost: "px-3 py-2",
    danger: "bg-red-600 text-white",
  };
  return <button className={`${"inline-flex min-h-[44px] items-center justify-center gap-2 rounded-2xl px-5 text-sm font-bold transition"} ${map[tone ?? "default"]} ${className ?? ""}`} {...props} />;
}
