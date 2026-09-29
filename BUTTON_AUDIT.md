# CareerZim V2 — BUTTON_AUDIT
Generated 2026-09-28 by codebase scan. Status: works = persists + survives refresh (localStorage adapter now, Supabase schema ready) / fixed in V2 pass.

| Route | Label | Type | Expected | Status before | Action in V2 |
|---|---|---|---|---|---|
| / (landing) | Log in | link | -> /dashboard (auth in prod) | works | kept, now -> /onboarding |
| / | Get Started | link | -> onboarding/dashboard | works | kept |
| / | Create Your CV / Find Jobs | links | navigate | works | kept |
| / | city chips Harare.. | links | -> /jobs?city=X | works | kept, now sync to Jobs filter |
| /dashboard | Find Jobs / Tailor CV / Ask Assistant | links | navigate | works | kept |
| /dashboard | JobCard View+Apply | link | -> /jobs/[id] | works | kept |
| /dashboard | Save (bookmark) | button | persist saved[] | works (local) | kept, now single source |
| /dashboard | CV ring 72 (hardcoded) | display | show real completionOf | fake | FIXED -> real completionOf + missing list |
| /jobs | search input | input | filter list | works | kept + URL sync |
| /jobs | city chips (8) | buttons | filter | works | kept + added Nationwide + country selector |
| /jobs | sort select | select | sort match/new | works | kept |
| /jobs | tabs All/Recommended/Saved/Alerts | tabs | filter + alerts CRUD | missing | ADDED (Alerts merged) |
| /jobs | Save button | button | persist | works | kept |
| /jobs | View+Apply | link | detail | works | kept |
| /jobs/[id] | Back to jobs | link | navigate | works | kept + breadcrumb |
| /jobs/[id] | Apply + Track | button | create application, dup-block, open link | works | kept, now duplicate modal + email draft confirm |
| /jobs/[id] | Tailor my CV / Cover letter | links | navigate | works | kept |
| /jobs/[id] | Report job | button | no-op | fake | FIXED -> creates notification + toast, persisted |
| /zimbabwe | city links | links | -> jobs?city | works | REMOVED page -> redirect to /jobs?country=ZW |
| /zimbabwe | job cards | links | detail | works | merged into Jobs |
| /applications | + Add demo applications | button | seed fake | works but banned in prod | FIXED -> dev-only (?dev=1 or NODE_ENV dev) |
| /applications | status select | select | move persists | works | kept + dnd-lite (select + arrows persist) |
| /applications | Follow-up assistant | card | static text | fake | FIXED -> real 7+ day draft + copy/mailto |
| /cvs | Save version | button | persist | works | kept |
| /cvs | Generate bullets | button | naive split | works-weak | FIXED -> real bullet formatter, never invents |
| /cvs | Export TXT/JSON | buttons | download | works | kept + added PDF(print)/DOCX(html) real downloads |
| /cvs | Tabs My CVs/Templates/ATS | tabs | switch | missing | ADDED (ATS merged) |
| /ats | Analyse | display auto | computed | works | MERGED -> /cvs?tab=ats, redirect old route |
| /cover-letters | Generate | button | template gen | works-weak | FIXED -> facts-only + [add detail] placeholders |
| /cover-letters | Copy/Download | buttons | clipboard/download | partial | FIXED -> real |
| /documents | Add doc input | fake useState | upload | fake | FIXED -> Supabase-storage adapter (local fallback) + rename/move/delete/search/meter |
| /assistant | chips + Send | buttons | canned reply | works-weak | FIXED -> context answers + action buttons (Save job/Tailor/Create alert run for real) |
| /interview | tabs Package/Sim/Research | local state | static | fake | FIXED -> job selector + saved pack + simulator scoring + history persists |
| /roadmap | static | display | JOBS[0] only | fake | FIXED -> target selector + Have/Partial/Missing + radar + resources + mark done persists |
| /portfolio | static name | display | prototype | fake | FIXED -> builder + publish toggle + /p/[username] public, QR, views (persist) |
| /alerts | Create alert | button | persist basic | works-weak | MERGED -> /jobs?tab=alerts with full CRUD + toggle + new-match count |
| /profile | inputs | inputs | autosave | works | kept + tabs incl LinkedIn + Import from CV + avatar + completion |
| /linkedin | Analyse button (missing?) | static score? | | fake | MERGED -> /profile?tab=linkedin with real analysis |
| /settings | Mark all read | button | works | works | kept |
| /settings | Export JSON | button | works | works | kept |
| /settings | Delete all local data | button | clears | works | kept + typed confirm + Appearance + Notifications toggles |
| /onboarding | Continue/Skip | buttons | stepper | works | kept + real CV import entry |
| header | search pill | button | opens palette | works-weak | FIXED -> grouped, debounced, keyboard, recent, actions |
| header | Ctrl+K | shortcut | toggle palette | works | kept |
| header | theme toggle | button | toggle only dark/light, no persist/system | broken | FIXED -> Light/Dark/System dropdown, persist, live OS, no flash |
| header | bell | button | dropdown, no grouping/nav/realtime | broken | FIXED -> Today/Earlier, navigate+mark read, triggers |
| header | avatar | link | -> /profile | works | kept + menu (Profile/Settings) |
| sidebar | 16 links (4 sections) | links | navigate | works | FIXED -> final 10, fit 720p, Profile/Settings in avatar+bottom |
| mobile | tabs Home/Jobs/Track/Assistant + More | nav | navigate | works | kept |
| mobile | Ask Assistant pill | link | overlaps content | broken | FIXED -> compact circular, padding, hidden on /assistant |
| all | raw ISO dates (posted/deadline) | text | shows 2026-09-2X | fake | FIXED -> postedAgo + deadlineBadge from CURRENT date, seed relative |
| all | emmerson@example.com / +263 7X | placeholder | looks real | fake | FIXED -> email empty (auth), phone empty + hint |
| all | prototype wording | text | | | REMOVED everywhere |

100% target: every remaining element works end-to-end (persist + refresh) or removed/disabled with Coming soon tooltip. No fake buttons ship.
