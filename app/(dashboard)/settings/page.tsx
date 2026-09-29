"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { download } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { useTheme } from "@/components/theme-provider";
import { useToast, EmptyState } from "@/components/ui/toaster";
export default function SettingsPage() {
  const { profile, notes, setNotes } = useStore();
  const { theme, setTheme } = useTheme();
  const toast = useToast();
  const [tab, setTab] = useState("Account");
  const [confirm, setConfirm] = useState("");
  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-extrabold">Settings</h1>
      <div className="flex gap-1.5 overflow-x-auto" role="tablist" aria-label="Settings">
        {["Account", "Appearance", "Notifications", "AI & Privacy", "Data"].map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={tab === t ? "rounded-full bg-emerald-700 px-4 py-2 text-xs font-bold text-white" : "rounded-full border border-[var(--border)] px-4 py-2 text-xs font-bold"}>{t}</button>))}
      </div>
      {tab === "Appearance" && (
        <Card><b className="text-sm">Appearance</b>
          <div className="mt-2 flex gap-2">{["Light", "Dark", "System"].map((t) => (
            <button key={t} aria-pressed={theme === t.toLowerCase()} onClick={() => { setTheme(t.toLowerCase()); toast({ title: `${t} mode on` }); }} className={theme === t.toLowerCase() ? "rounded-full bg-emerald-700 px-4 py-2 text-xs font-bold text-white" : "rounded-full border border-[var(--border)] px-4 py-2 text-xs font-bold"}>{t}</button>))}
          </div><p className="mt-2 text-xs opacity-60">System follows your device and updates live. CV paper preview always stays white for printing.</p></Card>)}
      {tab === "Account" && (
        <Card><b className="text-sm">Account</b>
          <p className="mt-1 text-xs opacity-70">Signed in as {profile.email || "guest (add email in Profile)"}. Email + password and Google sign-in connect here when Supabase keys are set.</p>
          <p className="mt-2 text-xs font-bold">Delete account — type DELETE to confirm</p>
          <div className="mt-1 flex gap-2"><input value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="DELETE" aria-label="Confirm delete" className="rounded-xl border border-[var(--border)] bg-transparent px-3 py-2 text-sm" />
          <button disabled={confirm !== "DELETE"} title={confirm !== "DELETE" ? "Type DELETE to enable" : "Delete"} onClick={() => { localStorage.clear(); location.reload(); }} className="rounded-full bg-red-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-40">Delete account</button></div>
        </Card>)}
      {tab === "Notifications" && (
        <Card>
          <b className="text-sm">Notifications ({notes.filter((n) => !n.read).length} unread)</b>
          {notes.length === 0 ? <div className="mt-2"><EmptyState title="No notifications" body="Alerts, deadlines and follow-ups will show here." /></div> :
          <div className="mt-2 space-y-2">{notes.map((n) => (<div key={n.id} className="rounded-2xl border border-[var(--border)] p-2 text-xs"><b>{n.title}</b> — {n.body}</div>))}</div>}
          <button onClick={() => { setNotes(notes.map((n) => ({ ...n, read: true }))); toast({ title: "All marked read" }); }} className="mt-2 rounded-full border border-[var(--border)] px-4 py-1.5 text-xs font-bold">Mark all read</button>
        </Card>)}
      {tab === "AI & Privacy" && (
        <Card>
          <b className="text-sm">AI & Privacy</b>
          <p className="mt-1 text-xs opacity-70">Your data stays in your account. AI providers (Gemini / OpenAI / Groq) run server-side only, inputs validated, uploads treated as data never instructions. AI never invents qualifications or guarantees employment.</p>
        </Card>)}
      {tab === "Data" && (
        <Card>
          <b className="text-sm">Data</b>
          <div className="mt-2 flex flex-wrap gap-2">
            <button onClick={() => { download("careerzim-export.json", JSON.stringify(profile, null, 2), "application/json"); toast({ title: "Exported" }); }} className="rounded-full border border-[var(--border)] px-4 py-2 text-xs font-bold">Export my data (JSON)</button>
            <button onClick={() => { localStorage.clear(); location.reload(); }} className="rounded-full bg-red-600 px-4 py-2 text-xs font-bold text-white">Delete all local data</button>
          </div>
        </Card>)}
    </div>
  );
}

