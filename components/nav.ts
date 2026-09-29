import {
  LayoutDashboard, Briefcase, ClipboardList, FileText, Mail,
  Sparkles, Video, Route, FolderOpen, Home,
} from "./icons";
export const SECTIONS = [
  { title: "Main", items: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/jobs", label: "Jobs", icon: Briefcase },
    { href: "/applications", label: "My Applications", icon: ClipboardList },
    { href: "/cvs", label: "My CVs", icon: FileText },
    { href: "/cover-letters", label: "Cover Letters", icon: Mail },
  ]},
  { title: "AI Tools", items: [
    { href: "/assistant", label: "Career Assistant", icon: Sparkles },
    { href: "/interview", label: "Interview Prep", icon: Video },
    { href: "/roadmap", label: "Roadmap", icon: Route },
    { href: "/portfolio", label: "Portfolio", icon: Home },
    { href: "/documents", label: "Documents", icon: FolderOpen },
  ]},
];
