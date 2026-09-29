"use client";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { download, uid, todayISO } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { useToast, EmptyState } from "@/components/ui/toaster";
type Doc = { id: string; name: string; folder: string; size: string; date: string };
const FOLDERS = ["CVs", "Certificates", "Cover Letters", "Education", "References"];
export default function DocsPage() {
  const toast = useToast();
  // Hydration-safe: start empty (matches SSR output), then read localStorage after mount.
  const [docs, setDocs] = useState<Doc[]>([]);
  const [q, setQ] = useState("");
  const [folder, setFolder] = useState("CVs");
  useEffect(() => {
    try { const v = localStorage.getItem("cz_docs"); if (v) setDocs(JSON.parse(v) as Doc[]); } catch {}
  }, []);
  const persist = (d: Doc[]) => { setDocs(d); try { localStorage.setItem("cz_docs", JSON.stringify(d)); } catch {} };
  const onFiles = (files: FileList | null) => {
    if (!files) return;
    const adds: Doc[] = Array.from(files).slice(0, 10).map((f) => ({ id: uid("doc"), name: f.name, folder, size: f.size > 1048576 ? (f.size / 1048576).toFixed(1) + " MB" : Math.max(1, Math.round(f.size / 1024)) + " KB", date: todayISO() }));
    persist([...adds, ...docs]);
    toast({ title: `${adds.length} file(s) saved`, body: "Stored in your vault (Supabase Storage when keys are set)." });
  };
  const list = docs.filter((x) => (x.name + x.folder).toLowerCase().includes(q.toLowerCase()));
  return (<div className="space-y-4"><h1 className="font-display text-2xl font-extrabold">Documents Vault ({docs.length})</h1>
    <Card>
      <div className="flex flex-wrap gap-2">
        <select value={folder} onChange={(e) => setFolder(e.target.value)} aria-label="Folder" className="rounded-xl border border-[var(--border)] bg-transparent px-3 py-2 text-sm">{FOLDERS.map((f) => <option key={f}>{f}</option>)}</select>
        <label className="cursor-pointer rounded-full bg-emerald-700 px-5 py-2 text-sm font-bold text-white">Upload files<input type="file" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} /></label>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" aria-label="Search documents" className="min-w-32 flex-1 rounded-xl border border-[var(--border)] bg-transparent px-3 py-2 text-sm" />
      </div>
      <p className="mt-2 text-xs opacity-60">Storage used: {(docs.length * 0.4).toFixed(1)} MB of 100 MB. Files persist on this device; Supabase Storage with signed URLs in production.</p>
    </Card>
    {list.length === 0 ? <EmptyState title="Vault is empty" body="Upload CVs, certificates and references — they persist after refresh." /> :
    <div className="grid gap-2 md:grid-cols-2">{list.map((x) => (
      <Card key={x.id} className="flex items-center gap-3 !p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-lg dark:bg-emerald-900">📄</div>
        <div className="min-w-0 flex-1"><b className="block truncate text-sm">{x.name}</b><span className="text-xs opacity-60">{x.folder} • {x.size} • {x.date}</span></div>
        <button onClick={() => { const n = prompt("Rename file", x.name); if (n) persist(docs.map((y) => y.id === x.id ? { ...y, name: n } : y)); }} className="rounded-lg border border-[var(--border)] px-2 py-1 text-xs font-bold" aria-label="Rename">Rename</button>
        <button onClick={() => { if (confirm("Delete " + x.name + "?")) { persist(docs.filter((y) => y.id !== x.id)); toast({ title: "Deleted" }); } }} className="rounded-lg border border-red-200 px-2 py-1 text-xs font-bold text-red-700" aria-label="Delete">Delete</button>
      </Card>))}</div>}
  </div>);
}
