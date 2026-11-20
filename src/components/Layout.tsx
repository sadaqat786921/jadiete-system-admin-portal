import React, { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import {
  IconLayoutDashboard, IconUsers, IconUsersGroup, IconListDetails, IconChecklist, IconPlugConnected, IconAlertTriangle, IconHistory,
  IconDatabaseImport, IconLock, IconDatabase, IconSettings, IconSearch, IconBell, IconMenu2, IconChevronRight, IconArrowRight, IconHelpCircle,
  IconLogout, IconUser, IconRefresh, IconSelector, IconUserX, IconMailForward,
} from '@tabler/icons-react';
import { useStore } from '../data/store';
import { IMG, me, roleLabel } from '../data/admin';
import { Avatar, Tile, Tag } from './ui';

type NavDef = { to: string; label: string; icon: any; end?: boolean };
const NAV: { section: string; items: NavDef[] }[] = [
  { section: 'Main', items: [{ to: '/', label: 'Overview', icon: IconLayoutDashboard, end: true }] },
  { section: 'People', items: [{ to: '/users', label: 'Users', icon: IconUsers }, { to: '/teams', label: 'Teams', icon: IconUsersGroup }] },
  { section: 'Set-up', items: [{ to: '/statuses', label: 'Statuses and templates', icon: IconListDetails }, { to: '/checklists', label: 'Checklists', icon: IconChecklist }] },
  { section: 'Connections', items: [{ to: '/integrations', label: 'Integrations', icon: IconPlugConnected }, { to: '/sync-errors', label: 'Sync errors', icon: IconAlertTriangle }] },
  { section: 'Records', items: [{ to: '/audit', label: 'Audit history', icon: IconHistory }, { to: '/import', label: 'Data import', icon: IconDatabaseImport }] },
  { section: 'Protection', items: [{ to: '/security', label: 'Sign-in and security', icon: IconLock }, { to: '/backups', label: 'Backups and privacy', icon: IconDatabase }] },
];

export function useAlerts() {
  const st = useStore();
  const errs = st.errs.filter(e => e.status === 'Needs attention' || e.status === 'Retrying');
  const locked = st.users.filter(u => u.status === 'Locked');
  const custLocked = st.custs.filter(c => c.status === 'Locked');
  const invited = st.users.filter(u => u.status === 'Invited');
  const noMfa = st.users.filter(u => u.status === 'Active' && u.mfa === 'Not set up');
  const approval = st.imports.filter(i => i.step === 4);
  const reqs = st.reqs.filter(r => r.status === 'New');
  const list = [
    ...errs.map(e => ({ to: `/sync-errors?id=${e.id}`, icon: IconAlertTriangle, tone: '#d64545', t: e.what, s: `${e.id} · ${e.when}` })),
    ...locked.map(u => ({ to: `/users/${u.id}`, icon: IconLock, tone: '#e0a100', t: `${u.name} is locked out`, s: u.note || 'Wrong code 3 times' })),
    ...custLocked.map(c => ({ to: '/users?tab=customers', icon: IconLock, tone: '#e0a100', t: `${c.name} cannot sign in to the portal`, s: c.note || '' })),
    ...noMfa.map(u => ({ to: `/users/${u.id}`, icon: IconUserX, tone: '#e0a100', t: `${u.name} has no two-step sign-in`, s: 'Remind them to set it up' })),
    ...invited.map(u => ({ to: `/users/${u.id}`, icon: IconMailForward, tone: '#0b6e5c', t: `${u.name} has not joined yet`, s: u.note || 'Invite sent' })),
    ...approval.map(i => ({ to: `/import/${i.id}`, icon: IconDatabaseImport, tone: '#0b6e5c', t: `${i.name}: waiting for approval`, s: `${i.ok.toLocaleString()} rows ready` })),
    ...reqs.map(r => ({ to: '/backups?tab=requests', icon: IconDatabase, tone: '#0b6e5c', t: `${r.kind}: ${r.who.split(' · ')[0]}`, s: `${r.id} · asked ${r.asked}` })),
  ];
  return { errs, locked, custLocked, invited, noMfa, approval, reqs, list };
}

export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const a = useAlerts();
  const count: Record<string, number> = { '/users': a.locked.length + a.custLocked.length, '/sync-errors': a.errs.length, '/import': a.approval.length, '/backups': a.reqs.length };
  const todo = a.errs.length + a.locked.length + a.custLocked.length;
  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="brand">
        <img src="images/mark.svg" alt="" />
        <b>Jadeite</b>
        <button className="collapse" onClick={onToggle} aria-label="Collapse menu"><IconMenu2 size={20} /></button>
      </div>
      <div className="workspace">
        <span className="ws-logo"><img src="images/mark.svg" alt="" /></span>
        <span>Jadeite Glazing · System Admin</span>
        <IconSelector size={15} className="muted" style={{ marginLeft: 'auto' }} />
      </div>
      {NAV.map(s => (
        <React.Fragment key={s.section}>
          <div className="nav-label">{s.section}</div>
          {s.items.map(it => (
            <NavLink key={it.to} to={it.to} end={it.end} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title={it.label}>
              <it.icon size={18} stroke={1.8} />
              <span>{it.label}</span>
              {count[it.to] ? <em className="count" style={{ fontStyle: 'normal' }}>{count[it.to]}</em> : null}
            </NavLink>
          ))}
        </React.Fragment>
      ))}
      <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} style={{ marginTop: 6 }} title="My settings">
        <IconSettings size={18} stroke={1.8} /><span>My settings</span>
      </NavLink>
      <div className="promo">
        <img src={IMG.house} alt="" style={{ objectPosition: 'center 40%' }} />
        <div>
          <b>{todo ? `${todo} things need you` : 'All running smoothly'}</b>
          <p>{todo ? 'Sync errors and people who cannot sign in.' : 'No sync errors and nobody locked out.'}</p>
          <Link to={a.errs.length ? '/sync-errors' : '/users'}>{todo ? 'Sort them out' : 'See users'} <IconArrowRight size={13} /></Link>
        </div>
      </div>
    </aside>
  );
}

const PAGES = [
  ['Overview', '/'], ['Users', '/users'], ['Customer portal sign-in', '/users?tab=customers'], ['Teams', '/teams'], ['What each team can do', '/teams?role=Office%20Admin'],
  ['Statuses and templates', '/statuses'], ['Message templates', '/statuses?tab=templates'], ['What customers see', '/statuses?tab=customers'], ['Checklists', '/checklists'],
  ['Integrations', '/integrations'], ['Framepoint', '/integrations/framepoint'], ['Microsoft 365 · Outlook', '/integrations/microsoft'], ['Xero', '/integrations/xero'],
  ['Sync errors', '/sync-errors'], ['Audit history', '/audit'], ['Data import', '/import'], ['Sign-in and security', '/security'], ['Backups and privacy', '/backups'], ['My settings', '/settings'],
];

function CommandSearch({ onClose }: { onClose: () => void }) {
  const { users } = useStore();
  const [q, setQ] = useState('');
  const nav = useNavigate();
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { ref.current?.focus(); const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose(); window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h); }, [onClose]);
  const s = q.toLowerCase();
  const u = users.filter(x => !s || (x.name + x.email + x.role + x.team).toLowerCase().includes(s)).slice(0, 6);
  const p = PAGES.filter(([n]) => !s || n.toLowerCase().includes(s)).slice(0, 6);
  const go = (to: string) => { onClose(); nav(to); };
  return (
    <div className="overlay" onMouseDown={onClose} style={{ alignItems: 'flex-start' }}>
      <div className="cmd" onMouseDown={e => e.stopPropagation()}>
        <div className="hstack" style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', gap: 10 }}>
          <IconSearch size={18} color="#6b7a78" />
          <input ref={ref} value={q} onChange={e => setQ(e.target.value)} placeholder="Search people, teams or settings…" aria-label="Search" style={{ border: 0, outline: 0, fontSize: 15, flex: 1 }} />
          <kbd className="tiny muted">Esc</kbd>
        </div>
        <div style={{ maxHeight: 420, overflowY: 'auto', padding: 8 }}>
          {u.length > 0 && <div className="nav-label">People</div>}
          {u.map(x => (
            <button key={x.id} onClick={() => go(`/users/${x.id}`)} className="nav-item" style={{ width: '100%', border: 0, background: 'none', height: 50, gap: 12 }}>
              <Avatar i={x.initials} size={34} />
              <div className="vstack" style={{ alignItems: 'flex-start', gap: 1 }}><b style={{ fontSize: 13 }}>{x.name}</b><span className="tiny muted">{roleLabel(x)} · {x.team} team</span></div>
              <span style={{ marginLeft: 'auto' }}><Tag tone={x.status === 'Active' ? 'ok' : x.status === 'Deactivated' ? 'grey' : 'warn'}>{x.status}</Tag></span>
            </button>
          ))}
          {p.length > 0 && <div className="nav-label">Pages</div>}
          {p.map(([n, to]) => <button key={to} onClick={() => go(to)} className="nav-item" style={{ width: '100%', border: 0, background: 'none' }}><IconChevronRight size={16} /><span>{n}</span></button>)}
          {!u.length && !p.length && <div className="small muted" style={{ padding: 16 }}>Nothing found for “{q}”.</div>}
        </div>
      </div>
    </div>
  );
}

export function Header() {
  const st = useStore();
  const a = useAlerts();
  const [search, setSearch] = useState(false);
  const [bell, setBell] = useState(false);
  const [menu, setMenu] = useState(false);
  const nav = useNavigate();
  const loc = useLocation();
  useEffect(() => { setBell(false); setMenu(false); }, [loc.pathname, loc.search]);
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setSearch(true); } };
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h);
  }, []);
  return (
    <header className="header">
      <div className="search" onClick={() => setSearch(true)}><IconSearch size={16} />Search<kbd>⌘K</kbd></div>
      <div className="spacer" />
      <div style={{ position: 'relative' }}>
        <button className="icon-btn" onClick={() => { setBell(!bell); setMenu(false); }} aria-label="Notifications"><IconBell size={18} />{!st.notifsRead && a.list.length > 0 && <span className="dot" />}</button>
        {bell && (
          <div className="popover" style={{ width: 380 }}>
            <div className="between" style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}><b style={{ fontSize: 14 }}>Needs your attention</b>{!st.notifsRead && a.list.length > 0 ? <button className="link" onClick={() => st.set('notifsRead', () => true)}>Mark all as read</button> : <span className="tiny muted">All read</span>}</div>
            <div className="list" style={{ maxHeight: 400, overflowY: 'auto' }}>
              {a.list.length === 0 && <div className="small muted" style={{ padding: 16 }}>Nothing needs you right now.</div>}
              {a.list.map((n, i) => (
                <button key={i} className="hstack" style={{ padding: '12px 16px', gap: 12, alignItems: 'flex-start', width: '100%', border: 0, background: 'none', textAlign: 'left', cursor: 'pointer' }} onClick={() => { st.set('notifsRead', () => true); nav(n.to); }}>
                  <Tile icon={<n.icon size={17} />} color={n.tone} size={34} radius={17} />
                  <div className="vstack" style={{ gap: 2, flex: 1 }}><b style={{ fontSize: 13 }}>{n.t}</b><span className="small muted">{n.s}</span></div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <div style={{ position: 'relative' }}>
        <button className="me" aria-label="My account" onClick={() => { setMenu(!menu); setBell(false); }}>{me.initials}</button>
        {menu && (
          <div className="popover" style={{ width: 250 }}>
            <div className="hstack" style={{ padding: 14, gap: 10, borderBottom: '1px solid var(--border)' }}><Avatar i={me.initials} size={38} bg="#00c7a1" fg="#0b1f1b" /><div className="vstack" style={{ gap: 1 }}><b>{me.name}</b><span className="tiny muted">{me.role}</span></div></div>
            <div style={{ padding: 6 }}>
              <button className="nav-item" style={{ width: '100%', border: 0, background: 'none' }} onClick={() => nav('/settings')}><IconUser size={17} /><span>My settings</span></button>
              <button className="nav-item" style={{ width: '100%', border: 0, background: 'none' }} onClick={() => nav('/welcome/1')}><IconHelpCircle size={17} /><span>Take the tour again</span></button>
              <button className="nav-item" style={{ width: '100%', border: 0, background: 'none' }} onClick={() => { st.reset(); setMenu(false); nav('/'); }}><IconRefresh size={17} /><span>Reset demo data</span></button>
              <button className="nav-item" style={{ width: '100%', border: 0, background: 'none' }} onClick={() => nav('/login')}><IconLogout size={17} /><span>Sign out</span></button>
            </div>
          </div>
        )}
      </div>
      {search && <CommandSearch onClose={() => setSearch(false)} />}
    </header>
  );
}

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const loc = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [loc.pathname]);
  return (
    <div className="app">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div className="main">
        <Header />
        <main className="content"><Outlet /></main>
        <footer className="footer"><span>© 2026 Jadeite Systems · Jadeite Glazing</span><span>System Admin · Help · Privacy</span></footer>
      </div>
    </div>
  );
}
