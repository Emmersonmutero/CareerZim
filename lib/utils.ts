export function uid(p='id'){ return p+'_'+Math.random().toString(36).slice(2,9); }
export function todayISO(){ return new Date().toISOString().slice(0,10); }
export function daysUntil(d?: string){
  if(!d) return null;
  const ms = new Date(d).getTime() - Date.now();
  return Math.ceil(ms/86400000);
}
export function deadlineLabel(d?: string){
  const n = daysUntil(d);
  if(n===null) return 'No deadline';
  if(n<0) return 'Expired';
  if(n===1) return 'Tomorrow';
  if(n===0) return 'Today';
  if(n!==null && n<=3) return n+' days remaining';
  if(n!==null && n<=7) return '1 week remaining';
  if(n!==null && n<0) return 'Expired';
  return (n??0)+' days left';
}
export function load<T>(k:string, fb:T):T{
  try{ const v = localStorage.getItem(k); return v? JSON.parse(v) as T : fb; }catch{ return fb; }
}
export function save(k:string, v:unknown){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch{} }
export function download(name:string, text:string, mime='text/plain'){
  const b = new Blob([text],{type:mime});
  const u = URL.createObjectURL(b);
  const a = document.createElement('a'); a.href=u; a.download=name; a.click();
  setTimeout(()=>URL.revokeObjectURL(u),2000);
}
/** Generic "just now / 5m ago / 2d ago" label for chat timestamps. */
export function relativeTime(iso?: string) {
  if (!iso) return "just now";
  const ms = Date.now() - new Date(iso).getTime();
  if (isNaN(ms)) return "just now";
  const s = Math.floor(ms / 1000);
  if (s < 45) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function postedAgo(iso?: string) {
  if (!iso) return "Recently";
  const ms = Date.now() - new Date(iso).getTime();
  const d = Math.floor(ms / 86400000);
  if (isNaN(d)) return "Recently";
  if (d <= 0) return "Posted today";
  if (d === 1) return "Posted 1d ago";
  if (d < 30) return `Posted ${d}d ago`;
  const m = Math.floor(d / 30);
  return m <= 1 ? "Posted 1mo ago" : `Posted ${m}mo ago`;
}
export function timeGroup(iso?: string): "Today" | "Earlier" {
  if (!iso) return "Earlier";
  const d = new Date(iso); const n = new Date();
  return d.toDateString() === n.toDateString() ? "Today" : "Earlier";
}

