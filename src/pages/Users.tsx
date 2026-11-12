// Users: staff accounts (invite, change role or team, unlock, reset two-step sign-in, sign out devices, deactivate / reactivate)
// and customer portal sign-in (unlock, send a new invite, turn access off or on).
import React, { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  IconSearch, IconPlus, IconDownload, IconChevronRight, IconUser, IconLock, IconLockOpen, IconMailForward, IconUserOff, IconUserCheck, IconKey, IconDeviceMobile,
  IconDeviceLaptop, IconLogout, IconPencil, IconInfoCircle, IconAlertTriangle, IconHistory, IconShieldLock, IconX,
} from '@tabler/icons-react';
import { PageHead, Card, CardHead, Tag, Avatar, Modal, Field, Check, Tabs, Empty, useToast } from '../components/ui';
import { useStore, userById } from '../data/store';
import { ROLES, ROLE_INFO, Role, User, UStatus, Cust } from '../data/admin';

export const statusTone = (s: string) => (s === 'Active' ? 'ok' : s === 'Locked' ? 'warn' : s === 'Invited' ? 'jade' : 'grey');

export default function Users() {
  const st = useStore();
  const toast = useToast();
  const nav = useNavigate();
  const [sp, setSp] = useSearchParams();
  const tab = sp.get('tab') || 'staff';
  const [q, setQ] = useState('');
  const status = sp.get('status') || 'All';
  const role = sp.get('role') || 'All';
  const [invite, setInvite] = useState(false);
  const setParam = (k: string, v: string) => { const n = new URLSearchParams(sp); if (v === 'All' || !v) n.delete(k); else n.set(k, v); setSp(n, { replace: true }); };
  const rows = st.users.filter(u => (status === 'All' || u.status === status) && (role === 'All' || u.role === role) && (u.name + u.email + u.team).toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <PageHead title="Users" crumbs={[{ label: 'Overview', to: '/' }, { label: 'Users' }]}
        actions={tab === 'staff' ? <><button className="btn btn-grey" onClick={() => toast(`${rows.length} users exported to CSV`)}><IconDownload size={16} />Export</button><button className="btn btn-primary" onClick={() => setInvite(true)}><IconPlus size={16} />Add a user</button></> : undefined} />
      <Tabs value={tab} onChange={v => setSp(v === 'staff' ? {} : { tab: v })} items={[{ id: 'staff', label: 'Staff', n: st.users.length }, { id: 'customers', label: 'Customer portal sign-in', n: st.custs.length }]} />
      {tab === 'staff' ? (
        <div className="card flush">
          <div className="toolbar">
            <div className="input-icon" style={{ width: 280 }}><IconSearch size={16} /><input className="input" style={{ height: 36 }} placeholder="Search name, email or team" value={q} onChange={e => setQ(e.target.value)} /></div>
            {(['All', 'Active', 'Invited', 'Locked', 'Deactivated'] as const).map(s => <button key={s} className={`chip ${status === s ? 'on' : ''}`} onClick={() => setParam('status', s)}>{s}<span className="n">{st.users.filter(u => s === 'All' || u.status === s).length}</span></button>)}
            <select className="select" aria-label="Role" style={{ width: 170, height: 36, marginLeft: 'auto' }} value={role} onChange={e => setParam('role', e.target.value)}><option value="All">All roles</option>{ROLES.map(r => <option key={r}>{r}</option>)}</select>
          </div>
          <table className="tbl">
            <thead><tr><th>Name</th><th>Role</th><th>Team</th><th>Uses</th><th>Two-step sign-in</th><th>Last signed in</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {rows.map(u => (
                <tr key={u.id} className="click" onClick={() => nav(`/users/${u.id}`)}>
                  <td><div className="hstack" style={{ gap: 10 }}><Avatar i={u.initials} size={34} bg={u.status === 'Deactivated' ? '#eef2f1' : undefined} /><div className="vstack" style={{ gap: 2 }}><b style={{ color: u.status === 'Deactivated' ? 'var(--muted)' : undefined }}>{u.name}</b><span className="tiny muted">{u.email}</span></div></div></td>
                  <td><span className="hstack" style={{ gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: 4, background: ROLE_INFO[u.role].color }} />{u.role}</span></td>
                  <td className="t2">{u.team}</td>
                  <td className="t2">{ROLE_INFO[u.role].apps}</td>
                  <td>{u.mfa === 'On' ? <span className="small t2">On · {u.mfaWay}</span> : <Tag tone="warn">Not set up</Tag>}</td>
                  <td className="t2">{u.last}</td>
                  <td><Tag tone={statusTone(u.status)}>{u.status}</Tag></td>
                  <td><IconChevronRight size={16} color="#6b7a78" /></td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={8}><Empty icon={<IconUser size={22} />} title="No users found" sub="Try another search or filter." /></td></tr>}
            </tbody>
          </table>
        </div>
      ) : <Customers />}
      {invite && <InviteModal onClose={() => setInvite(false)} onDone={id => nav(`/users/${id}`)} />}
    </>
  );
}

function InviteModal({ onClose, onDone }: { onClose: () => void; onDone: (id: string) => void }) {
  const st = useStore();
  const toast = useToast();
  const [f, setF] = useState({ first: '', last: '', email: '', phone: '', role: 'Office Admin' as Role, team: 'of' });
  const ok = f.first.trim() && f.last.trim() && /.+@.+\..+/.test(f.email) && f.phone.replace(/\D/g, '').length >= 10;
  const taken = st.users.some(u => u.email.toLowerCase() === f.email.trim().toLowerCase());
  const save = () => {
    const id = 'u' + Date.now();
    const name = `${f.first.trim()} ${f.last.trim()}`;
    const team = st.teams.find(t => t.id === f.team)!;
    const u: User = { id, name, initials: (f.first[0] + f.last[0]).toUpperCase(), role: f.role, email: f.email.trim(), phone: f.phone.trim(), team: team.name, status: 'Invited', mfa: 'Not set up', last: 'Never', devices: [], since: 'Invited today', note: 'Invite sent today · not opened yet' };
    st.set('users', us => [...us, u]);
    st.set('teams', ts => ts.map(t => (t.id === f.team ? { ...t, members: [...t.members, id] } : t)));
    st.log('Invited a new user', name, 'Users', [['Role', `— → ${f.role}`], ['Team', `— → ${team.name}`]]);
    toast(`Invite sent to ${f.email.trim()}`); onClose(); onDone(id);
  };
  return (
    <Modal title="Add a user" sub="They get an email to set their password and two-step sign-in. The link works for 7 days." onClose={onClose} width={620}
      footer={<><button className="btn btn-grey" onClick={onClose}>Cancel</button><button className="btn btn-primary" disabled={!ok || taken} onClick={save}><IconMailForward size={16} />Send invite</button></>}>
      <div className="grid-2">
        <Field label="First name"><input className="input" value={f.first} onChange={e => setF({ ...f, first: e.target.value })} /></Field>
        <Field label="Last name"><input className="input" value={f.last} onChange={e => setF({ ...f, last: e.target.value })} /></Field>
        <Field label="Work email"><input className="input" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} placeholder="name@jadeiteglazing.co.uk" /></Field>
        <Field label="Mobile phone" hint="For sign-in codes"><input className="input" value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} placeholder="07700 900 000" /></Field>
      </div>
      {taken && <div className="alert warn small"><IconAlertTriangle size={16} />Someone already uses this email.</div>}
      <Field label="Role"><div className="grid-3">{ROLES.map(r => (
        <button key={r} type="button" className="doc-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 4, borderColor: f.role === r ? 'var(--primary)' : undefined, background: f.role === r ? 'var(--tint)' : undefined }} onClick={() => setF({ ...f, role: r, team: st.teams.find(t => (r === 'Sales' ? t.id === 'sa' : r === 'Surveyor' ? t.id === 'su' : r === 'Installer' ? t.id === 'fl' : r === 'Office Admin' ? t.id === 'of' : t.id === 'mg'))!.id })}>
          <b className="small">{r}</b><span className="tiny muted">{ROLE_INFO[r].apps}</span>
        </button>))}</div></Field>
      <span className="small t2">{ROLE_INFO[f.role].about}.</span>
      <Field label="Team"><select className="select" value={f.team} onChange={e => setF({ ...f, team: e.target.value })}>{st.teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></Field>
    </Modal>
  );
}

export function UserDetail() {
  const { id } = useParams();
  const st = useStore();
  const toast = useToast();
  const nav = useNavigate();
  const [modal, setModal] = useState<string | null>(null);
  const u = userById(st.users, id);
  if (!u) return <Empty icon={<IconUser size={22} />} title="User not found" action={<Link to="/users" className="btn btn-primary btn-sm">Back to users</Link>} />;
  const upd = (p: Partial<User>) => st.set('users', us => us.map(x => (x.id === u.id ? { ...x, ...p } : x)));
  const isMe = u.id === 'tf';
  const history = st.audit.filter(x => x.record.includes(u.name) || x.who === u.name).slice(0, 8);
  const unlock = () => { upd({ status: 'Active', note: undefined }); st.log('Unlocked an account', u.name, 'Sign-in', [['Status', 'Locked → Active']]); toast(`${u.name.split(' ')[0]} can sign in again`); };
  const resend = () => { upd({ note: 'Invite sent again today · not opened yet' }); st.log('Sent an invite again', u.name, 'Users'); toast(`Invite sent again to ${u.email}`); };
  const cancelInvite = () => { st.set('users', us => us.filter(x => x.id !== u.id)); st.set('teams', ts => ts.map(t => ({ ...t, members: t.members.filter(m => m !== u.id) }))); st.log('Cancelled an invite', u.name, 'Users'); toast('Invite cancelled'); nav('/users'); };
  const acts = u.status === 'Deactivated' ? [] : [
    ...(u.status === 'Locked' ? [{ l: 'Unlock account', i: IconLockOpen, on: unlock, primary: true }] : []),
    ...(u.status === 'Invited' ? [{ l: 'Send invite again', i: IconMailForward, on: resend, primary: true }] : []),
    { l: 'Change role or team', i: IconShieldLock, on: () => setModal('role') },
    { l: 'Edit details', i: IconPencil, on: () => setModal('edit') },
    ...(u.status !== 'Invited' ? [{ l: u.mfa === 'On' ? 'Reset two-step sign-in' : 'Remind to set up two-step sign-in', i: IconKey, on: () => (u.mfa === 'On' ? setModal('mfa') : (st.log('Sent a two-step sign-in reminder', u.name, 'Sign-in'), toast(`Reminder sent to ${u.name.split(' ')[0]}`))) }] : []),
  ];
  return (
    <>
      <PageHead title={u.name} crumbs={[{ label: 'Overview', to: '/' }, { label: 'Users', to: '/users' }, { label: u.name }]}
        actions={u.status === 'Deactivated' ? <button className="btn btn-primary" onClick={() => setModal('reactivate')}><IconUserCheck size={16} />Reactivate</button>
          : u.status === 'Invited' ? <button className="btn btn-outline" onClick={cancelInvite}><IconX size={16} />Cancel invite</button>
          : !isMe ? <button className="btn btn-outline" style={{ color: 'var(--err)' }} onClick={() => setModal('deactivate')}><IconUserOff size={16} />Deactivate</button> : undefined} />
      {u.note && <div className={`alert ${u.status === 'Locked' ? 'warn' : 'info'}`}><IconInfoCircle size={18} /><span className="grow">{u.note}</span>{u.status === 'Locked' && <button className="btn btn-primary btn-sm" onClick={unlock}>Unlock now</button>}</div>}
      <div className="row">
        <div className="col grow">
          <Card>
            <div className="hstack" style={{ gap: 16 }}>
              <Avatar i={u.initials} size={64} bg={ROLE_INFO[u.role].color} fg="#fff" />
              <div className="vstack grow" style={{ gap: 4 }}><b style={{ fontSize: 20 }}>{u.name}</b><span className="t2">{u.role} · {u.team}</span><span className="hstack" style={{ gap: 8 }}><Tag tone={statusTone(u.status)}>{u.status}</Tag>{u.mfa === 'Not set up' && u.status !== 'Invited' && <Tag tone="warn">No two-step sign-in</Tag>}</span></div>
            </div>
            <div className="dl-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 4 }}>
              {[['Email', u.email], ['Mobile', u.phone], ['Uses', ROLE_INFO[u.role].apps], ['Can see', st.scope[u.role]], ['Two-step sign-in', u.mfa === 'On' ? `On · ${u.mfaWay}` : 'Not set up'], ['Joined', u.since], ['Last signed in', u.last], ...(u.work ? [['Their work', u.work]] : [])].map(([k, v]) => <div key={k} className="vstack" style={{ gap: 2 }}><span className="tiny muted">{k}</span><b className="small">{v}</b></div>)}
            </div>
          </Card>
          <Card>
            <CardHead title="Signed in on" sub="Sign out a lost or old phone or computer" right={u.devices.length > 1 ? <button className="btn btn-outline btn-sm" onClick={() => { upd({ devices: [] }); st.log('Signed out everywhere', u.name, 'Sign-in'); toast(`${u.name.split(' ')[0]} is signed out everywhere`); }}><IconLogout size={15} />Sign out everywhere</button> : undefined} />
            {u.devices.length === 0 ? <span className="small muted">Not signed in anywhere.</span> : (
              <div className="list">{u.devices.map(d => (
                <div key={d.name} className="hstack" style={{ gap: 12, padding: '10px 0' }}>
                  {d.name.includes('app') || d.name.includes('iPhone') || d.name.includes('Android') ? <IconDeviceMobile size={20} color="#3a4a4a" /> : <IconDeviceLaptop size={20} color="#3a4a4a" />}
                  <span className="vstack grow" style={{ gap: 1 }}><b className="small">{d.name}</b><span className="tiny muted">{d.where} · {d.when}</span></span>
                  {!(isMe && d.when === 'Now') && <button className="btn btn-grey btn-sm" onClick={() => { upd({ devices: u.devices.filter(x => x !== d) }); st.log('Signed out a device', `${u.name} · ${d.name}`, 'Sign-in'); toast(`Signed out of ${d.name}`); }}>Sign out</button>}
                </div>))}</div>
            )}
          </Card>
          <Card>
            <CardHead title="History" right={<Link to={`/audit?q=${encodeURIComponent(u.name)}`} className="link">All in audit history</Link>} />
            {history.length === 0 ? <span className="small muted">No changes recorded yet.</span> : <div className="timeline">{history.map(x => <div key={x.id} className="tl-item"><span className="tile" style={{ width: 30, height: 30, borderRadius: 15, background: 'var(--tint)', color: 'var(--primary-dark)' }}><IconHistory size={15} /></span><span className="vstack" style={{ gap: 2, paddingTop: 4 }}><b className="small">{x.who} · {x.action}</b><span className="tiny muted">{x.when}{x.reason ? ` · ${x.reason}` : ''}</span></span></div>)}</div>}
          </Card>
        </div>
        <div className="col" style={{ width: 340, flex: '0 0 340px' }}>
          {acts.length > 0 && <Card>
            <CardHead title="Actions" />
            {acts.map(x => <button key={x.l} className={`btn ${(x as any).primary ? 'btn-primary' : 'btn-outline'} btn-block`} style={{ justifyContent: 'flex-start' }} onClick={x.on}><x.i size={16} />{x.l}</button>)}
          </Card>}
          <Card>
            <CardHead title={`What a ${u.role.toLowerCase()} can do`} right={<Link to={`/roles?role=${encodeURIComponent(u.role)}`} className="link">Permissions</Link>} />
            <span className="small t2">{ROLE_INFO[u.role].about}.</span>
          </Card>
        </div>
      </div>
      {modal === 'role' && <RoleModal u={u} onClose={() => setModal(null)} />}
      {modal === 'edit' && <EditModal u={u} onClose={() => setModal(null)} />}
      {modal === 'mfa' && (
        <Modal title="Reset two-step sign-in?" sub={u.name} onClose={() => setModal(null)} width={500}
          footer={<><button className="btn btn-grey" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary" onClick={() => { upd({ mfa: 'Not set up', mfaWay: undefined }); st.log('Reset two-step sign-in', u.name, 'Sign-in', [['Two-step sign-in', `On → Not set up`]]); toast(`${u.name.split(' ')[0]} will set it up again next time`); setModal(null); }}>Reset</button></>}>
          <span className="t2" style={{ lineHeight: 1.5 }}>Use this when someone has a new phone. Next time they sign in, they will be asked to set up two-step sign-in again.</span>
        </Modal>
      )}
      {modal === 'deactivate' && <DeactivateModal u={u} onClose={() => setModal(null)} />}
      {modal === 'reactivate' && (
        <Modal title={`Reactivate ${u.name}?`} sub="They get an email to sign in again" onClose={() => setModal(null)} width={500}
          footer={<><button className="btn btn-grey" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary" onClick={() => { upd({ status: 'Invited', note: 'Reactivated today · invite sent', last: u.last }); st.log('Reactivated a user', u.name, 'Users', [['Status', 'Deactivated → Invited']]); toast(`Invite sent to ${u.email}`); setModal(null); }}>Reactivate and send invite</button></>}>
          <span className="t2">They come back as {u.role} in {u.team}. Their old customers are not given back automatically.</span>
        </Modal>
      )}
    </>
  );
}

function RoleModal({ u, onClose }: { u: User; onClose: () => void }) {
  const st = useStore();
  const toast = useToast();
  const [role, setRole] = useState<Role>(u.role);
  const [team, setTeam] = useState(st.teams.find(t => t.name === u.team)?.id || 'of');
  const [why, setWhy] = useState('');
  const tName = st.teams.find(t => t.id === team)!.name;
  const changed = role !== u.role || tName !== u.team;
  const save = () => {
    st.set('users', us => us.map(x => (x.id === u.id ? { ...x, role, team: tName } : x)));
    st.set('teams', ts => ts.map(t => ({ ...t, members: t.id === team ? Array.from(new Set([...t.members, u.id])) : t.members.filter(m => m !== u.id) })));
    st.log('Changed role or team', u.name, 'Roles', [...(role !== u.role ? [['Role', `${u.role} → ${role}`] as [string, string]] : []), ...(tName !== u.team ? [['Team', `${u.team} → ${tName}`] as [string, string]] : [])], why.trim());
    toast('Saved · recorded in the audit history'); onClose();
  };
  return (
    <Modal title="Change role or team" sub={u.name} onClose={onClose} width={560}
      footer={<><button className="btn btn-grey" onClick={onClose}>Cancel</button><button className="btn btn-primary" disabled={!changed || why.trim().length < 3} onClick={save}>Save change</button></>}>
      <Field label="Role"><select className="select" value={role} onChange={e => setRole(e.target.value as Role)}>{ROLES.map(r => <option key={r}>{r}</option>)}</select></Field>
      <span className="small t2">{ROLE_INFO[role].about} · uses {ROLE_INFO[role].apps.toLowerCase()}.</span>
      <Field label="Team"><select className="select" value={team} onChange={e => setTeam(e.target.value)}>{st.teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></Field>
      {role !== u.role && <div className="alert warn small"><IconAlertTriangle size={16} />{u.name.split(' ')[0]} will see different things straight away. Anything they were working on stays with them until the office moves it.</div>}
      <Field label="Why? (required)" hint="Saved in the audit history"><input className="input" value={why} onChange={e => setWhy(e.target.value)} placeholder="For example: moved from sales to the office" /></Field>
    </Modal>
  );
}

function EditModal({ u, onClose }: { u: User; onClose: () => void }) {
  const st = useStore();
  const toast = useToast();
  const [f, setF] = useState({ name: u.name, email: u.email, phone: u.phone });
  const ok = f.name.trim() && /.+@.+\..+/.test(f.email) && f.phone.replace(/\D/g, '').length >= 10;
  const save = () => {
    const before: [string, string][] = (['name', 'email', 'phone'] as const).filter(k => f[k] !== u[k]).map(k => [k === 'name' ? 'Name' : k === 'email' ? 'Email' : 'Mobile', `${u[k]} → ${f[k]}`]);
    st.set('users', us => us.map(x => (x.id === u.id ? { ...x, ...f, initials: f.name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase() } : x)));
    st.log('Edited user details', f.name, 'Users', before); toast('Details saved'); onClose();
  };
  return (
    <Modal title="Edit details" sub={u.name} onClose={onClose} width={520} footer={<><button className="btn btn-grey" onClick={onClose}>Cancel</button><button className="btn btn-primary" disabled={!ok} onClick={save}>Save</button></>}>
      <Field label="Full name"><input className="input" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /></Field>
      <Field label="Work email" hint="They sign in with this"><input className="input" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} /></Field>
      <Field label="Mobile phone" hint="For sign-in codes"><input className="input" value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} /></Field>
    </Modal>
  );
}

function DeactivateModal({ u, onClose }: { u: User; onClose: () => void }) {
  const st = useStore();
  const toast = useToast();
  const others = st.users.filter(x => x.id !== u.id && x.role === u.role && x.status === 'Active');
  const [to, setTo] = useState(others[0]?.id || '');
  const [why, setWhy] = useState('');
  const [sure, setSure] = useState(false);
  const toName = userById(st.users, to)?.name;
  const save = () => {
    st.set('users', us => us.map(x => (x.id === u.id ? { ...x, status: 'Deactivated' as UStatus, devices: [], note: `${why.trim()}${u.work && toName ? ` · work moved to ${toName}` : ''}` } : x)));
    st.log('Deactivated a user', u.name, 'Users', [['Status', `${u.status} → Deactivated`], ...(u.work && toName ? [['Their work', `${u.name} → ${toName}`] as [string, string]] : [])], why.trim());
    toast(`${u.name} can no longer sign in`); onClose();
  };
  return (
    <Modal title={`Deactivate ${u.name}?`} sub="They are signed out everywhere and cannot sign in again" onClose={onClose} width={560}
      footer={<><button className="btn btn-grey" onClick={onClose}>Cancel</button><button className="btn btn-danger" disabled={!sure || why.trim().length < 3 || (!!u.work && !to)} onClick={save}><IconUserOff size={16} />Deactivate</button></>}>
      {u.work && (
        <>
          <div className="alert warn small"><IconAlertTriangle size={16} />{u.name.split(' ')[0]} still has work: {u.work}.</div>
          <Field label="Give their work to"><select className="select" value={to} onChange={e => setTo(e.target.value)}>{others.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}</select></Field>
        </>
      )}
      <Field label="Why? (required)" hint="Saved in the audit history"><input className="input" value={why} onChange={e => setWhy(e.target.value)} placeholder="For example: left the company" /></Field>
      <span className="small t2">Their name stays on past records. You can reactivate them later.</span>
      <Check on={sure} onChange={setSure} label={`I understand ${u.name.split(' ')[0]} will lose access straight away`} />
    </Modal>
  );
}

function Customers() {
  const st = useStore();
  const toast = useToast();
  const [q, setQ] = useState('');
  const [off, setOff] = useState<Cust | null>(null);
  const [why, setWhy] = useState('');
  const rows = st.custs.filter(c => (c.name + c.job + c.email).toLowerCase().includes(q.toLowerCase()));
  const upd = (c: Cust, p: Partial<Cust>) => st.set('custs', cs => cs.map(x => (x.id === c.id ? { ...x, ...p } : x)));
  return (
    <>
      <div className="alert info"><IconInfoCircle size={18} />Customers sign in with a code sent to their email. The office invites them from the job. Here you can unlock them or switch access off.</div>
      <div className="card flush">
        <div className="toolbar"><div className="input-icon" style={{ width: 300 }}><IconSearch size={16} /><input className="input" style={{ height: 36 }} placeholder="Search customer, job or email" value={q} onChange={e => setQ(e.target.value)} /></div></div>
        <table className="tbl">
          <thead><tr><th>Customer</th><th>Job</th><th>Email</th><th>Last signed in</th><th>Status</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead>
          <tbody>
            {rows.map(c => (
              <tr key={c.id}>
                <td><div className="vstack" style={{ gap: 2 }}><b>{c.name}</b>{c.note && <span className="tiny muted">{c.note}</span>}</div></td>
                <td className="t2">{c.job}</td><td className="t2">{c.email}</td><td className="t2">{c.last}</td>
                <td><Tag tone={c.status === 'Active' ? 'ok' : c.status === 'Locked' ? 'warn' : c.status === 'Invited' ? 'jade' : 'grey'}>{c.status}</Tag></td>
                <td><div className="hstack" style={{ gap: 6, justifyContent: 'flex-end' }}>
                  {c.status === 'Locked' && <button className="btn btn-primary btn-sm" onClick={() => { upd(c, { status: 'Active', note: undefined }); st.log('Unlocked a customer', `${c.job} · ${c.name}`, 'Sign-in', [['Status', 'Locked → Active']]); toast(`${c.name} can sign in again`); }}><IconLockOpen size={15} />Unlock</button>}
                  {c.status === 'Invited' && <button className="btn btn-outline btn-sm" onClick={() => { upd(c, { note: 'Invite sent again today' }); st.log('Sent a customer invite again', `${c.job} · ${c.name}`, 'Sign-in'); toast(`Invite sent again to ${c.email}`); }}><IconMailForward size={15} />Send again</button>}
                  {c.status === 'Turned off' ? <button className="btn btn-outline btn-sm" onClick={() => { upd(c, { status: 'Active', note: undefined }); st.log('Turned customer access back on', `${c.job} · ${c.name}`, 'Sign-in', [['Status', 'Turned off → Active']]); toast('Access turned back on'); }}><IconUserCheck size={15} />Turn on</button>
                    : <button className="btn btn-grey btn-sm" onClick={() => { setOff(c); setWhy(''); }}><IconLock size={15} />Turn off</button>}
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {off && (
        <Modal title={`Turn off portal access for ${off.name}?`} sub={`${off.job} · ${off.email}`} onClose={() => setOff(null)} width={520}
          footer={<><button className="btn btn-grey" onClick={() => setOff(null)}>Cancel</button><button className="btn btn-danger" disabled={why.trim().length < 3} onClick={() => { upd(off, { status: 'Turned off', note: why.trim() }); st.log('Turned off customer access', `${off.job} · ${off.name}`, 'Sign-in', [['Status', `${off.status} → Turned off`]], why.trim()); toast('Access turned off'); setOff(null); }}>Turn off</button></>}>
          <span className="t2">They will not be able to sign in. Their job and documents are not deleted.</span>
          <Field label="Why? (required)"><input className="input" value={why} onChange={e => setWhy(e.target.value)} placeholder="For example: wrong email address used" /></Field>
        </Modal>
      )}
    </>
  );
}
