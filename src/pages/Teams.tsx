// Teams: fixed, one team per role (Office Admin, Sales, Surveyors, Installers, Directors, System Admin).
// Adding someone to a team gives them that role. Roles and what each one can do are set by Jadeite and cannot be changed here.
import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { IconUserPlus, IconInfoCircle, IconLock, IconEye, IconChevronRight } from '@tabler/icons-react';
import { PageHead, Card, Avatar, Modal, Tag } from '../components/ui';
import { useStore } from '../data/store';
import { TEAMS, Team, ROLE_INFO, AREAS, MATRIX0, SCOPE0, Level, roleLabel } from '../data/admin';
import { InviteModal, statusTone } from './Users';

const tone: Record<Level, string> = { Full: '#0b6e5c', View: '#2f6fde', Own: '#9a6f00', None: '#8a9794' };
const bg: Record<Level, string> = { Full: '#ebf7f3', View: '#eaf1fd', Own: '#fdf6e3', None: '#f4f6f5' };
const word: Record<Level, string> = { Full: 'Full', View: 'View only', Own: 'Only theirs', None: 'No access' };

export default function Teams() {
  const st = useStore();
  const nav = useNavigate();
  const [sp, setSp] = useSearchParams();
  const [add, setAdd] = useState<Team | null>(null);
  const can = TEAMS.find(t => t.role === sp.get('role')) || null;
  return (
    <>
      <PageHead title="Teams" crumbs={[{ label: 'Overview', to: '/' }, { label: 'Teams' }]} />
      <div className="alert info"><IconInfoCircle size={18} /><span>There is one team for each role, and they are set for the whole platform. When you add someone, they join the team for their role and stay in it. Use the button on each team to add someone.</span></div>
      <div className="grid-3">
        {TEAMS.map(t => {
          const n = st.users.filter(u => u.role === t.role && u.status !== 'Deactivated').length;
          return (
            <a key={t.role} href={`#team-${t.role.replace(' ', '-')}`} className="card" style={{ flexDirection: 'row', gap: 12, alignItems: 'center', padding: 14 }}>
              <span style={{ width: 10, alignSelf: 'stretch', borderRadius: 5, background: ROLE_INFO[t.role].color }} />
              <span className="vstack grow" style={{ gap: 2 }}><b>{t.name}</b><span className="tiny muted">{ROLE_INFO[t.role].apps}</span></span>
              <b style={{ fontSize: 22 }}>{n}</b>
            </a>
          );
        })}
      </div>
      <div className="grid-2" style={{ alignItems: 'start' }}>
        {TEAMS.map(t => {
          const people = st.users.filter(u => u.role === t.role);
          const active = people.filter(u => u.status !== 'Deactivated');
          const lead = t.role === 'Installer' ? active.filter(u => u.fitter === 'Lead fitter').length : 0;
          return (
            <Card key={t.role}>
              <div id={`team-${t.role.replace(' ', '-')}`} className="between" style={{ alignItems: 'flex-start', gap: 12, scrollMarginTop: 90 }}>
                <div className="hstack" style={{ gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ width: 6, height: 44, borderRadius: 3, background: ROLE_INFO[t.role].color }} />
                  <div className="vstack" style={{ gap: 3 }}>
                    <b style={{ fontSize: 16 }}>{t.name}</b>
                    <span className="small t2">{t.about}</span>
                    <span className="tiny muted">{active.length} {active.length === 1 ? 'person' : 'people'}{t.role === 'Installer' ? ` · ${lead} lead fitter${lead === 1 ? '' : 's'}, ${active.length - lead} fitter${active.length - lead === 1 ? '' : 's'}` : ''} · uses {ROLE_INFO[t.role].apps.toLowerCase()}</span>
                  </div>
                </div>
                <Tag tone="grey" icon={<IconLock size={12} />}>Fixed</Tag>
              </div>
              <div className="list">
                {people.map(u => (
                  <Link key={u.id} to={`/users/${u.id}`} className="hstack" style={{ gap: 10, padding: '8px 0' }}>
                    <Avatar i={u.initials} size={32} bg={u.status === 'Deactivated' ? '#eef2f1' : undefined} />
                    <span className="vstack grow" style={{ gap: 1 }}><b className="small" style={{ color: u.status === 'Deactivated' ? 'var(--muted)' : undefined }}>{u.name}</b><span className="tiny muted">{roleLabel(u)}</span></span>
                    {u.status !== 'Active' && <Tag tone={statusTone(u.status)}>{u.status}</Tag>}
                    <IconChevronRight size={15} color="#6b7a78" />
                  </Link>
                ))}
                {people.length === 0 && <span className="small muted" style={{ padding: '8px 0' }}>No one in this team yet.</span>}
              </div>
              <div className="hstack" style={{ gap: 8, flexWrap: 'wrap' }}>
                <button className="btn btn-primary btn-sm" onClick={() => setAdd(t)}><IconUserPlus size={15} />{t.add}</button>
                <button className="btn btn-outline btn-sm" onClick={() => setSp({ role: t.role })}><IconEye size={15} />What they can do</button>
              </div>
            </Card>
          );
        })}
      </div>
      {add && <InviteModal role={add.role} onClose={() => setAdd(null)} onDone={id => nav(`/users/${id}`)} />}
      {can && (
        <Modal title={`What ${can.name.toLowerCase() === 'system admin' ? 'a system admin' : `the ${can.name.toLowerCase()} team`} can do`} sub="Set for the whole platform · cannot be changed here" onClose={() => setSp({})} width={600}
          footer={<button className="btn btn-primary" onClick={() => setSp({})}>Close</button>}>
          <div className="between small" style={{ gap: 12 }}><span className="t2">Records they can reach</span><b>{SCOPE0[can.role]}</b></div>
          <div className="list" style={{ border: '1px solid var(--border)', borderRadius: 12, padding: '0 14px' }}>
            {AREAS.map((a, i) => { const v = MATRIX0[can.role][i]; return (
              <div key={a} className="between" style={{ gap: 12, padding: '9px 0' }}>
                <span className="small">{a}</span>
                <span className="tiny" style={{ fontWeight: 600, color: tone[v], background: bg[v], borderRadius: 8, padding: '4px 10px' }}>{word[v]}</span>
              </div>
            ); })}
          </div>
          {can.role === 'System Admin' && <span className="small t2">System Admins cannot open customer or job records unless that is switched on in Sign-in and security.</span>}
        </Modal>
      )}
    </>
  );
}
