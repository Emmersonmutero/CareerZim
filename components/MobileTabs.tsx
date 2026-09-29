"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, MoreHorizontal, Home, Briefcase, ClipboardList, X } from "./icons";
import { SECTIONS } from "./nav";
import { cn } from "@/lib/cn";
import * as React from "react";

export function MobileTabs() {
  const path = usePathname();
  const [more, setMore] = React.useState(false);
  const tabs = [
    { href: "/dashboard", label: "Home", icon: Home },
    { href: "/jobs", label: "Jobs", icon: Briefcase },
    { href: "/applications", label: "Track", icon: ClipboardList },
    { href: "/assistant", label: "Assistant", icon: MessageCircle },
  ];
  return (
    <>
      <nav aria-label="Mobile" className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--border)] bg-[var(--card)] pb-[env(safe-area-inset-bottom)] lg:hidden">
        <div className="grid grid-cols-5">
          {tabs.map((t) => {
            const Icon = t.icon; const active = path === t.href;
            return (<Link key={t.href} href={t.href} className={cn("flex min-h-[60px] flex-col items-center justify-center gap-1 text-[11px] font-bold", active ? "text-emerald-700 dark:text-emerald-300" : "opacity-60")}><Icon size={21} />{t.label}</Link>);
          })}
          <button onClick={() => setMore(true)} aria-label="More" className="flex min-h-[60px] flex-col items-center justify-center gap-1 text-[11px] font-bold opacity-60"><MoreHorizontal size={21} />More</button>
        </div>
      </nav>
      {more && (
        <div className="fixed inset-0 z-[80] overflow-y-auto bg-[var(--background)] p-5 lg:hidden" role="dialog" aria-label="All pages">
          <div className="flex items-center"><b className="font-display text-lg">All of CareerZim</b>
            <button aria-label="Close" onClick={() => setMore(false)} className="ml-auto rounded-xl border border-[var(--border)] p-2"><X size={18} /></button></div>
          <div className="mt-4 grid grid-cols-2 gap-2 pb-24">
            {SECTIONS.flatMap((s) => s.items).map((it) => (
              <Link key={it.href} href={it.href} onClick={() => setMore(false)} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-3 text-sm font-bold">{it.label}</Link>))}
          </div>
        </div>
      )}
      {path !== "/assistant" && (
        <Link href="/assistant" aria-label="Ask Career Assistant" title="Ask Career Assistant" className="fixed bottom-24 right-4 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-700 text-white shadow-2xl hover:bg-emerald-800 lg:bottom-6">
          <MessageCircle size={20} />
        </Link>
      )}
    </>
  );
}
