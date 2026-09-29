"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { SECTIONS } from "./nav";
import { User, Settings } from "./icons";
import { cn } from "@/lib/cn";
export function SideNav({ collapsed }: { collapsed?: boolean }) {
  const path = usePathname();
  const isActive = (href: string) => path === href || (href === "/cvs" && path === "/ats") || (href === "/profile" && path === "/linkedin") || (href === "/jobs" && path === "/alerts");
  return (
    <nav aria-label="Primary" className="space-y-4">
      {SECTIONS.map((s) => (
        <div key={s.title}>
          {!collapsed && <div className="px-3 text-[11px] font-extrabold uppercase tracking-widest opacity-60">{s.title}</div>}
          <div className="mt-1 space-y-0.5">
            {s.items.map((it) => {
              const active = isActive(it.href);
              const Icon = it.icon as unknown as (p: { size?: number }) => React.ReactElement;
              return (
                <Link key={it.href} href={it.href} className={cn("flex min-h-[44px] items-center gap-3 rounded-2xl px-3 text-sm font-semibold", active ? "bg-emerald-700 text-white shadow-lg" : "hover:bg-emerald-50 dark:hover:bg-emerald-950")}>
                  <Icon size={19} />{!collapsed && it.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
      <div className="border-t border-[var(--border)] pt-2">
        {[{ href: "/profile", label: "Profile", icon: User }, { href: "/settings", label: "Settings", icon: Settings }].map((it) => {
          const active = path === it.href;
          const Icon = it.icon;
          return (
            <Link key={it.href} href={it.href} className={cn("flex min-h-[40px] items-center gap-3 rounded-2xl px-3 text-sm font-semibold", active ? "bg-emerald-700 text-white" : "opacity-80 hover:bg-emerald-50 dark:hover:bg-emerald-950")}>
              <Icon size={18} />{!collapsed && it.label}
            </Link>);
        })}
      </div>
    </nav>
  );
}
