import * as React from "react";
import { cn } from "@/lib/cn";
export function Badge({ className, tone, ...p }: React.HTMLAttributes<HTMLSpanElement> & { tone?: "green" | "gold" | "slate" | "red" }) {
  const map = {
    green: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100",
    gold: "bg-amber-100 text-amber-900",
    slate: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
    red: "bg-red-100 text-red-800",
  };
  return <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold", map[tone ?? "green"], className)} {...p} />;
}
