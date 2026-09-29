"use client";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { JOBS } from "@/lib/jobs";
import { jobMatch } from "@/lib/safety";
import { JobCard } from "@/components/ui/cards";
import { EmptyState, useToast } from "@/components/ui/toaster";
import { uid, todayISO } from "@/lib/utils";
export const CITIES = ["All","Harare","Bulawayo","Mutare","Gweru","Masvingo","Chitungwiza","Remote","Nationwide"];
export function useJobList(q: string, city: string, sort: string, tab: string) {
  const { profile, saved } = useStore();
  return useMemo(() => {
    let rows = JOBS.map((j) => ({ j, m: jobMatch(profile as never, j) }))
      .filter((r) => (city === "All" || city === "Nationwide" ? true : city === "Remote" ? r.j.mode === "Remote" || r.j.location === "Remote" : r.j.location === city))
      .filter((r) => (r.j.title + r.j.company + r.j.location + " " + r.j.requirements.join(" ")).toLowerCase().includes(q.toLowerCase()));
    if (tab === "recommended") rows = rows.filter((r) => !r.m.unsafe && r.m.score >= 40);
    if (tab === "saved") rows = rows.filter((r) => saved.includes(r.j.id));
    return rows.sort((a, b) => {
      if (a.m.unsafe !== b.m.unsafe) return a.m.unsafe ? 1 : -1;
      if (sort === "new") return b.j.posted.localeCompare(a.j.posted);
      return b.m.score - a.m.score;
    });
  }, [q, city, sort, tab, profile, saved]);
}
export function useAlerts() {
  const { alerts, setAlerts, notes, setNotes } = useStore();
  const toast = useToast();
  const [aq, setAq] = useState("Software Developer");
  const [aloc, setAloc] = useState("Harare");
  const matchCount = (a: { query: string; location: string }) =>
    JOBS.filter((j) => (!a.query || (j.title + j.description).toLowerCase().includes(a.query.toLowerCase())) && (a.location === "All" || !a.location || j.location === a.location || (a.location === "Remote" && j.mode === "Remote"))).length;
  const createAlert = () => {
    if (!aq.trim()) { toast({ title: "Add a keyword first" }); return; }
    const a = { id: uid("al"), query: aq.trim(), location: aloc, category: "All", email: true, inApp: true, createdAt: todayISO(), on: true };
    setAlerts([a, ...alerts]);
    setNotes([{ id: uid("n"), title: "Alert created", body: `${matchCount(a)} current matches for ${a.query} in ${a.location}.`, date: todayISO(), read: false, kind: "alert" }, ...notes]);
    toast({ title: "Alert saved", body: "New matches will notify you." });
  };
  return { alerts, setAlerts, aq, setAq, aloc, setAloc, matchCount, createAlert };
}
export { JobCard, EmptyState };
