"use client";
import * as React from "react";
import { cn } from "@/lib/cn";
type Toast = { id: number; title: string; body?: string };
const Ctx = React.createContext<(t: Omit<Toast, "id">) => void>(() => {});
export const useToast = () => React.useContext(Ctx);
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<Toast[]>([]);
  const push = React.useCallback((t: Omit<Toast, "id">) => {
    const id = Date.now() + Math.random();
    setItems((s) => [...s, { ...t, id }]);
    setTimeout(() => setItems((s) => s.filter((x) => x.id !== id)), 3400);
  }, []);
  return (
    <Ctx.Provider value={push}>
      {children}
      <div aria-live="polite" className="fixed bottom-20 right-4 z-[100] flex w-[320px] flex-col gap-2 md:bottom-6">
        {items.map((t) => (
          <div key={t.id} className="glass rounded-2xl border border-emerald-900/10 p-3 shadow-xl">
            <div className="text-sm font-bold">{t.title}</div>
            {t.body && <div className="text-xs opacity-70">{t.body}</div>}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
export function Toaster() { return null; }
export function Skeleton({ className }: { className?: string }) { return <div className={cn("skeleton h-16", className)} />; }
export function EmptyState({ title, body, action }: { title: string; body: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-[20px] border border-dashed border-[var(--border)] bg-[var(--card)] p-8 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-2xl dark:bg-emerald-900">✦</div>
      <div className="font-display text-lg font-bold">{title}</div>
      <p className="mx-auto mt-1 max-w-sm text-sm opacity-70">{body}</p>
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}
