# Jadeite Systems · System Admin portal (Figma Make)

Clickable prototype of the **System Admin** portal for Jadeite Glazing (windows, doors, bifolds, orangeries) — the web portal that looks after the whole platform: Office Admin, Sales, Surveyor and Installer apps, Director and the Customer portal.
React 19 + Vite + TypeScript, running inside Figma Make. Same design system and layout as the client-approved Office Admin (Figma node 25:2) — keep it.

The demo is signed in as **Tom Fletcher** (System Admin). Demo "today" is Friday 16 Oct 2026. Scope follows the BRD (4.1.1 User Management, 4.1.16 System Administration and Audit, 4.1.17 Data Migration, 4.2 Security / Backup / Privacy, 6 Roles and Permissions).

## Development server
A Vite dev server is already running on `$PORT` (default 8443). Changes hot-reload in the preview.

## Structure
- `src/main.tsx` – entry: HashRouter → StoreProvider → ToastProvider → App. Imports Sora font, `src/index.css`, `src/styles/app.css`.
- `src/App.tsx` – routes: login (password + two-step code, forgot password, locked), welcome tour, Overview, Users (+ user page, customer portal sign-in tab), Roles and permissions, Teams, Statuses and templates, Checklists, Integrations (+ Framepoint, Microsoft 365 · Outlook, Xero), Sync errors, Audit history, Data import (+ import steps), Sign-in and security, Backups and privacy, My settings.
- `src/components/Layout.tsx` – System Admin sidebar, header (⌘K search of people and pages, "needs your attention" notifications, profile menu), footer.
- `src/components/ui.tsx` – shared UI: Card, Tag, Avatar, Tabs, Modal, Drawer, Field, Switch, Toast, Stat…
- `src/pages/` – Auth, Overview, Users, Roles, Teams, Statuses, Checklists, Integrations (also Sync errors), Audit, Import, Protection (Sign-in and security, Backups and privacy, My settings).
- `src/data/admin.ts` – sample data (users, roles matrix, teams, customer sign-in, statuses, pick-lists, templates, checklists, integrations, sync errors, audit, imports, security, backups, retention, data requests); `src/data/store.tsx` – shared demo state and `log()` which writes every change into the audit history (saved in sessionStorage; "Reset demo data" in the profile menu clears it).
- `public/images` – property photos and the Jadeite J logo (use relative paths like `images/house.jpg`).

## System Admin flows (match the BRD and the other portals)
- **Users:** add a user (role, team, invite email, link works 7 days) → send again / cancel invite → unlock after 3 wrong codes → change role or team (reason required) → edit details → reset two-step sign-in (new phone) or remind to set it up → sign out a device or everywhere → deactivate (hand their work to someone, reason, signed out everywhere) → reactivate. Customer portal sign-in: unlock, send invite again, turn access off (reason) or on.
- **Roles and permissions:** six staff roles × 16 parts of the platform (Full / View only / Only theirs / No access) and which records each role reaches; save with a reason. System Admins cannot open customer or job data unless switched on.
- **Teams:** create, edit, add people, remove, make lead, delete an empty team.
- **Statuses and templates:** sales stages and job stages (late after N days, the words customers see), pick-lists (lost reasons, aftercare steps, customer problems, date-change reasons), message templates (edit, add details, preview, send a test, on/off — required ones always on), what documents customers see.
- **Checklists:** final survey site checks (+ 5mm rule, photos), before you start, final checks, customer getting-ready list, problem types, reasons not fixed — add, rename, reorder, required, remove.
- **Integrations:** Framepoint, Microsoft 365 · Outlook (mailboxes, calendars, who wins when an appointment is moved in Outlook), Xero (read only) — test, sync now, what is shared, how often, replace key / sign in again, disconnect (reason) and connect.
- **Sync errors:** plain-English why and what to do → try again (or try all), match to a job, mark fixed, ignore (reason), technical details.
- **Audit history:** who, when, where from, record, before and after, reason; filter, search, open, export CSV. Every action in this portal writes an entry.
- **Data import:** upload → match columns → duplicates → trial import → client approval → import; error report; cancel.
- **Sign-in and security:** two-step sign-in, code methods, lock after wrong codes, session lengths, customer code rules. **Backups and privacy:** hourly backups, back up now, test restore, how long data is kept, customer copy/delete requests.

## Design system (do not drift)
- Font: Sora (400–700). Plain CSS tokens in `src/styles/app.css` — reuse its classes (`card`, `tag`, `btn`, `input`, `list`, `grid-2`, `hstack`, `vstack`, `between`, `muted`…).
- Colours: primary `#00c7a1`, primary-dark `#0b6e5c`, deep `#0b1f1b`, tint `#ebf7f3`, page `#f6f8f7`, border `#e3e9e7`, text `#0f1414` / `#3a4a4a` / `#6b7a78`, ok `#1f9d5b`, warn `#e0a100`, error `#d64545` (use red sparingly).
- Calm, simple, jargon-free wording (main users are 60+). Real property photos where they help.
- Tailwind utilities are available, but Tailwind's base reset is intentionally not loaded.

## Demo sign-in
Any email and password · security code **482193** (3 wrong codes locks the account).

## Code quality
- Use double quotes for strings containing apostrophes, or escape them.
- Keep JSX balanced; pages export components used in `App.tsx`.
