// Roles and permissions: what each role can see and change, which records they can reach, saved with a reason into the audit history.
import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { IconDeviceFloppy, IconArrowBackUp, IconInfoCircle, IconLock } from '@tabler/icons-react';
import { PageHead, Card, CardHead, Modal, Field, Switch, Tag, useToast } from '../components/ui';
import { useStore } from '../data/store';
import { ROLES, ROLE_INFO, AREAS, LEVELS, Level, Role } from '../data/admin';

const tone: Record<Level, string> = { Full: '#0b6e5c', View: '#2f6fde', Own: '#9a6f00', None: '#a5b2af' };
const bg: Record<Level, string> = { Full: '#ebf7f3', View: '#eaf1fd', Own: '#fdf6e3', None: '#f4f6f5' };
const SCOPES = ['All customers and jobs', 'Only their own customers', 'Only visits booked for them', 'Only jobs booked with them', 'No customer or job data'];
const LOCKED: [Role, string][] = [['System Admin', 'Users and roles'], ['Director', 'Audit history']]; // never removed so nobody is locked out

export default function Roles() {
  const st = useStore();
  const toast = useToast();
  const [sp] = useSearchParams();
  const focus = sp.get('role');
  const [m, setM] = useState(st.matrix);
  const [scope, setScope] = useState(st.scope);
  const [save, setSave] = useState(false);
  const [why, setWhy] = useState('');
  const changes = useMemo(() => {
    const c: [string, string][] = [];
    ROLES.forEach(r => AREAS.forEach((a, i) => { if (m[r][i] !== st.matrix[r][i]) c.push([`${r} · ${a}`, `${LEVELS.find(l => l.id === st.matrix[r][i])!.label} → ${LEVELS.find(l => l.id === m[r][i])!.label}`]); }));
    ROLES.forEach(r => { if (scope[r] !== st.scope[r]) c.push([`${r} · records`, `${st.scope[r]} → ${scope[r]}`]); });
    return c;
  }, [m, scope, st.matrix, st.scope]);
  const count = (r: Role) => st.users.filter(u => u.role === r && u.status !== 'Deactivated').length;
  return (
    <>
      <PageHead title="Roles and permissions" crumbs={[{ label: 'Overview', to: '/' }, { label: 'Roles and permissions' }]}
        actions={<><button className="btn btn-grey" disabled={!changes.length} onClick={() => { setM(st.matrix); setScope(st.scope); }}><IconArrowBackUp size={16} />Undo changes</button><button className="btn btn-primary" disabled={!changes.length} onClick={() => { setWhy(''); setSave(true); }}><IconDeviceFloppy size={16} />Save {changes.length ? `${changes.length} change${changes.length > 1 ? 's' : ''}` : 'changes'}</button></>} />
      <div className="alert info"><IconInfoCircle size={18} />Six staff roles. Pick what each role can do in each part of the platform. Customers only ever see their own job in the customer portal.</div>
      <div className="grid-3">
        {ROLES.map(r => (
          <Link key={r} to={`/users?role=${encodeURIComponent(r)}`} className="card" style={{ flexDirection: 'row', gap: 12, alignItems: 'center', padding: 14, borderColor: focus === r ? 'var(--primary)' : undefined }}>
            <span style={{ width: 10, alignSelf: 'stretch', borderRadius: 5, background: ROLE_INFO[r].color }} />
            <span className="vstack grow" style={{ gap: 2 }}><b>{r}</b><span className="tiny muted">{ROLE_INFO[r].about}</span><span className="tiny muted">{ROLE_INFO[r].apps} · {count(r)} {count(r) === 1 ? 'person' : 'people'}</span></span>
          </Link>
        ))}
      </div>
      <Card className="flush">
        <div style={{ padding: '18px 18px 10px' }}><CardHead title="What each role can do" right={<span className="hstack" style={{ gap: 12 }}>{LEVELS.map(l => <span key={l.id} className="hstack tiny" style={{ gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: bg[l.id], border: `1px solid ${tone[l.id]}` }} />{l.label}</span>)}</span>} /></div>
        <div className="table-wrap">
          <table className="tbl">
            <thead><tr><th>Part of the platform</th>{ROLES.map(r => <th key={r} style={{ background: focus === r ? 'var(--tint)' : undefined }}>{r}</th>)}</tr></thead>
            <tbody>
              {AREAS.map((a, i) => (
                <tr key={a}>
                  <td className="b">{a}</td>
                  {ROLES.map(r => {
                    const v = m[r][i];
                    const lock = LOCKED.some(([lr, la]) => lr === r && la === a);
                    const changed = v !== st.matrix[r][i];
                    return (
                      <td key={r} style={{ background: focus === r ? '#f7fcfa' : undefined }}>
                        <span className="hstack" style={{ gap: 4 }}>
                          <select aria-label={`${r} · ${a}`} className="select" disabled={lock} value={v} onChange={e => setM({ ...m, [r]: m[r].map((x, j) => (j === i ? (e.target.value as Level) : x)) })}
                            style={{ height: 32, width: 124, fontSize: 12.5, fontWeight: 600, color: tone[v], background: bg[v], borderColor: changed ? 'var(--primary)' : 'transparent', boxShadow: changed ? '0 0 0 2px rgba(0,199,161,.2)' : undefined }}>
                            {LEVELS.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
                          </select>
                          {lock && <IconLock size={13} color="#6b7a78" aria-label="Cannot be removed" />}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <div className="grid-2">
        <Card>
          <CardHead title="Which records each role can reach" sub="Applies to customers, enquiries and jobs" />
          {ROLES.map(r => (
            <div key={r} className="between" style={{ gap: 12 }}>
              <span className="hstack small" style={{ gap: 8 }}><span style={{ width: 8, height: 8, borderRadius: 4, background: ROLE_INFO[r].color }} /><b>{r}</b></span>
              <select className="select" aria-label={`${r} records`} style={{ width: 260, borderColor: scope[r] !== st.scope[r] ? 'var(--primary)' : undefined }} value={scope[r]} onChange={e => setScope({ ...scope, [r]: e.target.value })}>{SCOPES.map(s => <option key={s}>{s}</option>)}</select>
            </div>
          ))}
        </Card>
        <Card>
          <CardHead title="Customer and job data for System Admins" />
          <div className="between" style={{ gap: 14 }}>
            <span className="vstack" style={{ gap: 2 }}><b className="small">Let System Admins open customer and job records</b><span className="tiny muted">Off by default. Turn on only when a Director agrees, for example to fix a problem.</span></span>
            <Switch on={st.sysData} onChange={v => { st.set('sysData', () => v); st.log(v ? 'Allowed System Admins to open customer data' : 'Stopped System Admins opening customer data', 'System Admin role', 'Roles', [['Customer and job data', v ? 'Off → On' : 'On → Off']]); toast(v ? 'Turned on · recorded in the audit history' : 'Turned off'); }} />
          </div>
          {st.sysData && <Tag tone="warn">On · remember to turn it off when you are done</Tag>}
          <div className="divider" />
          <span className="small t2" style={{ lineHeight: 1.5 }}>Every change on this page is saved in the audit history with who changed it, when, the reason, and what it was before.</span>
        </Card>
      </div>
      {save && (
        <Modal title="Save permission changes" sub="People see the change the next time a page loads" onClose={() => setSave(false)} width={600}
          footer={<><button className="btn btn-grey" onClick={() => setSave(false)}>Cancel</button><button className="btn btn-primary" disabled={why.trim().length < 3} onClick={() => { st.set('matrix', () => m); st.set('scope', () => scope); st.log('Changed permissions', Array.from(new Set(changes.map(c => c[0].split(' · ')[0]))).join(', ') + ' role', 'Roles', changes, why.trim()); toast('Permissions saved · recorded in the audit history'); setSave(false); }}>Save</button></>}>
          <div className="list">{changes.map(([k, v]) => <div key={k} className="between small" style={{ padding: '8px 0', gap: 12 }}><span>{k}</span><b>{v}</b></div>)}</div>
          <Field label="Why? (required)" hint="Saved in the audit history"><input className="input" value={why} onChange={e => setWhy(e.target.value)} placeholder="For example: agreed with James at the role review" /></Field>
        </Modal>
      )}
    </>
  );
}
