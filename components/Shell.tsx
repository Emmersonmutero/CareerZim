"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/lib/store';
const NAV = [
  ['/dashboard','Dashboard'],['/jobs','Jobs'],['/zimbabwe','Zimbabwe'],['/applications','My Applications'],
  ['/cvs','My CVs'],['/cover-letters','Cover Letters'],['/assistant','Career Assistant'],['/interview','Interview Prep'],
  ['/roadmap','Roadmap'],['/portfolio','Portfolio'],['/documents','Documents'],['/alerts','Job Alerts'],['/profile','Profile'],['/settings','Settings'],
];
export default function Shell({children}:{children:React.ReactNode}){
  const path = usePathname();
  const { notes } = useStore();
  const unread = notes.filter(n=>!n.read).length;
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-20 bg-emerald-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/" className="font-bold text-lg">🇿🇼 CareerZim</Link>
          <span className="text-xs bg-emerald-700 px-2 py-1 rounded">AI Career Assistant</span>
          <div className="ml-auto text-sm">🔔 {unread} • <Link href="/settings" className="underline">Settings</Link></div>
        </div>
        <nav className="bg-emerald-950 overflow-x-auto">
          <div className="max-w-7xl mx-auto px-2 flex gap-1 text-sm whitespace-nowrap">
            {NAV.map(([h,l])=>(
              <Link key={h} href={h} className={'px-3 py-2 rounded '+(path===h?'bg-emerald-600':'hover:bg-emerald-800')}>{l}</Link>
            ))}
          </div>
        </nav>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
      <footer className="text-center text-xs text-slate-500 py-8">CareerZim • CV is the starting point, not the product • Your data stays yours. Never sold.</footer>
    </div>
  );
}
