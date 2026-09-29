"use client";
import Link from "next/link";
import * as React from "react";
import { usePathname } from "next/navigation";
import { Menu } from "./icons";
import { LogoMark } from "./LogoMark";
import { useStore } from "@/lib/store";
import { completionOf } from "@/lib/safety";
import { SideNav } from "./Sidenav";
import { Topbar } from "./Topbar";
import { MobileTabs } from "./MobileTabs";
import { CommandPalette } from "./CommandPalette";
import { cn } from "@/lib/cn";

/** Routes that own their full viewport height (chat shell: list scrolls on its own). */
const FULL_HEIGHT_ROUTES = ["/assistant"];

export default function Shell({ children }: { children: React.ReactNode }) {
  const { profile } = useStore();
  const path = usePathname();
  const fullHeight = FULL_HEIGHT_ROUTES.includes(path);
  const [collapsed, setCollapsed] = React.useState(false);
  const [palette, setPalette] = React.useState(false);
  React.useEffect(() => {
    const fn = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPalette((v) => !v); } }
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);
  const pct = completionOf(profile as never);
  return (
    <div className={cn("min-h-screen", fullHeight && "h-[100dvh] overflow-hidden")}>
      <aside className={cn("fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-[var(--border)] bg-[var(--card)] p-3 lg:flex", collapsed ? "w-[76px]" : "w-[232px]")}>
        <div className="flex items-center gap-2 px-1">
          <LogoMark size={40} />
          {!collapsed && <div><div className="font-display font-extrabold leading-none">CareerZim</div><div className="text-[11px] opacity-60">AI Career Assistant</div></div>}
          <button aria-label="Toggle sidebar" onClick={() => setCollapsed((v) => !v)} className="ml-auto rounded-lg p-2 hover:bg-emerald-50 dark:hover:bg-emerald-950"><Menu size={18} /></button>
        </div>
        <div className="mt-3 max-h-[calc(100vh-190px)] flex-1 overflow-y-auto"><SideNav collapsed={collapsed} /></div>
        {!collapsed && pct < 100 && <Link href="/profile" className="mt-2 block rounded-2xl bg-emerald-800 p-3 text-xs font-bold text-white">Finish your profile ({pct}%) →</Link>}
      </aside>
      <div className={cn(collapsed ? "lg:pl-[76px]" : "lg:pl-[232px]", fullHeight && "flex h-full min-h-0 flex-col")}>
        <Topbar onSearch={() => setPalette(true)} />
        <main
          className={
            fullHeight
              ? "flex min-h-0 flex-1 flex-col"
              : "mx-auto max-w-6xl px-4 pb-32 pt-5 lg:pb-12"
          }
        >
          {children}
        </main>
      </div>
      <MobileTabs />
      <CommandPalette open={palette} onClose={() => setPalette(false)} />
    </div>
  );
}

