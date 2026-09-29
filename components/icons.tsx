import * as React from "react";
export type IconProps = { size?: number; className?: string };
function base(path: React.ReactNode) {
  return function Icon({ size = 18, className }: IconProps) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">{path}</svg>
    );
  };
}
export const LayoutDashboard = base(<><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></>);
export const Briefcase = base(<><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /></>);
export const MapPin = base(<><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></>);
export const ClipboardList = base(<><rect x="8" y="2" width="8" height="4" rx="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><path d="M12 11h4M12 16h4M8 11h.01M8 16h.01" /></>);
export const FileText = base(<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6M9 13h6M9 17h6" /></>);
export const Mail = base(<><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m2 7 10 6L22 7" /></>);
export const Sparkles = base(<><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9Z" /><path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9Z" /></>);
export const Video = base(<><rect x="2" y="6" width="13" height="12" rx="2" /><path d="m15 10 7-3v10l-7-3" /></>);
export const Route = base(<><circle cx="6" cy="19" r="2" /><circle cx="18" cy="5" r="2" /><path d="M8 19h7a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h7" /></>);
export const ShieldCheck = base(<><path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5Z" /><path d="m9 12 2 2 4-4" /></>);
export const ShieldAlert = base(<><path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5Z" /><path d="M12 8v4M12 16h.01" /></>);
export const FolderOpen = base(<><path d="M2 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2Z" /></>);
export const BellRing = base(<><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a2 2 0 0 0 3.4 0" /><path d="M4 4l1 1M20 4l-1 1" /></>);
export const Bell = base(<><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a2 2 0 0 0 3.4 0" /></>);
export const User = base(<><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" /></>);
export const Settings = base(<><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5h0a1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" /></>);
export const Home = base(<><path d="m3 10 9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" /><path d="M9 22V12h6v10" /></>);
export const Menu = base(<><path d="M4 6h16M4 12h16M4 18h16" /></>);
export const X = base(<><path d="M18 6 6 18M6 6l12 12" /></>);
export const Search = base(<><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></>);
export const Sun = base(<><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>);
export const Moon = base(<><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" /></>);
export const MessageCircle = base(<><path d="M21 11.5a8.4 8.4 0 0 1-8.5 8.4c-1.5 0-3-.4-4.2-1L3 20l1.2-4.3a8.3 8.3 0 0 1-1.2-4.2A8.4 8.4 0 0 1 11.5 3h1A8.4 8.4 0 0 1 21 11.5Z" /></>);
export const MoreHorizontal = base(<><circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" /></>);
export const ArrowRight = base(<><path d="M5 12h14M13 6l6 6-6 6" /></>);
export const Bookmark = base(<><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z" /></>);
export const Clock = base(<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>);
export const Plus = base(<><path d="M12 5v14M5 12h14" /></>);
export const Check = base(<><path d="m4 12 5 5L20 6" /></>);

/* ── Chat / assistant icons ─────────────────────────────── */
export const Copy = base(<><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>);
export const ThumbsUp = base(<><path d="M7 10v11H4a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1Z" /><path d="M7 10 11 3a2.4 2.4 0 0 1 2.4 2.9L12.8 9H19a2 2 0 0 1 2 2.4l-1.4 6A2 2 0 0 1 17.6 19H7" /></>);
export const ThumbsDown = base(<><path d="M17 14V3h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1Z" /><path d="m17 14-4 7a2.4 2.4 0 0 1-2.4-2.9l.6-3.1H5a2 2 0 0 1-2-2.4l1.4-6A2 2 0 0 1 6.4 5H17" /></>);
export const RotateCw = base(<><path d="M21 12a9 9 0 1 1-3.2-6.9" /><path d="M21 3v5h-5" /></>);
export const Send = base(<><path d="M21 3 10.5 13.5" /><path d="M21 3 14.5 21l-4-8-8-4Z" /></>);
export const Square = base(<><rect x="6" y="6" width="12" height="12" rx="2" /></>);
export const Paperclip = base(<><path d="M20 11.5 12 19.4a5 5 0 0 1-7-7l7.6-7.5a3.3 3.3 0 0 1 4.7 4.7l-7.6 7.6a1.7 1.7 0 0 1-2.4-2.4l6.9-6.9" /></>);
export const ChevronDown = base(<><path d="m6 9 6 6 6-6" /></>);
export const ChevronRight = base(<><path d="m9 6 6 6-6 6" /></>);
export const Trash2 = base(<><path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /></>);
export const Pencil = base(<><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></>);
export const History = base(<><path d="M3 12a9 9 0 1 0 3.4-7" /><path d="M3 4v5h5" /><path d="M12 7v5l3.5 2" /></>);
export const ArrowDown = base(<><path d="M12 5v14M6 13l6 6 6-6" /></>);
export const AlertTriangle = base(<><path d="M10.3 3.9 2.6 17a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4M12 17h.01" /></>);
export const PanelLeft = base(<><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M9 4v16" /></>);
export const MessageSquare = base(<><path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" /><path d="M8 9h8M8 13h5" /></>);
export const FilePlus = base(<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6" /><path d="M12 12v6M9 15h6" /></>);
export const ExternalLink = base(<><path d="M14 4h6v6" /><path d="M20 4 11 13" /><path d="M18 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5" /></>);

