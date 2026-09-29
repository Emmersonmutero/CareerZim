"use client";
import { useStore } from "@/lib/store";
export default function PortfolioPage(){
  const { profile } = useStore();
  return (<div className="space-y-3"><h1 className="text-2xl font-bold">Portfolio — {profile.fullName}</h1>
    <div className="bg-white p-6 rounded-2xl shadow"><h2 className="text-xl font-bold">{profile.title}</h2><p className="text-sm mt-1">{profile.summary}</p>
    <p className="text-sm mt-2"><b>Skills:</b> {profile.skills.join(", ")}</p>
    <p className="text-sm"><b>Projects:</b> {profile.projects.map(p=>p.name).join(", ")}</p>
    <p className="text-xs mt-2 text-slate-500">Shareable URL: careerzim.com/p/{profile.fullName.toLowerCase().replace(/ /g,"-")} (prototype)</p></div>
  </div>);
}
