import * as React from "react";
import { cn } from "@/lib/cn";
export function Card({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-[20px] border border-[var(--border)] bg-[var(--card)] p-5 shadow-[0_10px_30px_-18px_rgb(2_6_23/.25)]", className)} {...p} />;
}
export function CardTitle({ className, ...p }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("font-display text-lg font-bold", className)} {...p} />;
}
