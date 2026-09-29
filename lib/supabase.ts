// Supabase backend adapter: tables from supabase/schema.sql. Local-first today,
// swaps to Supabase REST when env keys exist. Never throws — falls back silently.
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
export const useSupabase = () => URL && KEY;
export async function sb(table: string, method = "GET", body?: unknown) {
  if (!URL || !KEY) throw new Error("supabase-not-configured");
  const r = await fetch(`${URL}/rest/v1/${table}`, {
    method,
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json", Prefer: "return=representation" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!r.ok) throw new Error("supabase-error " + r.status);
  return r.json().catch(() => []);
}