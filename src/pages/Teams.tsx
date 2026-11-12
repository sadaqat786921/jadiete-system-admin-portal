// Teams: groups of people with a lead and an area (add, edit, add or remove members, delete an empty team).
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { IconPlus, IconPencil, IconTrash, IconUserPlus, IconX, IconMapPin, IconCrown, IconUsersGroup } from '@tabler/icons-react';
import { PageHead, Card, Avatar, Modal, Field, Tag, Empty, useToast } from '../components/ui';
import { useStore, userById } from '../data/store';
import { Team } from '../data/admin';

export default function Teams() {
  const st = useStore();
  const toast = useToast();
  const [edit, setEdit] = useState<Team | 'new' | null>(null);
  const [add, setAdd] = useState<Team | null>(null);
  const [del, setDel] = useState<Team | null>(null);
  const remove = (t: Team, id: string) => {
    const u = userById(st.users, id)!;
    st.set('teams', ts => ts.map(x => (x.id === t.id ? { ...x, members: x.members.filter(m => m !== id), lead: x.lead === id ? x.members.find(m => m !== id) || '' : x.lead } : x)));
    st.set('users', us => us.map(x => (x.id === id ? { ...x, team: 'No team' } : x)));
    st.log('Removed someone from a team', `${t.name} · ${u.name}`, 'Teams'); toast(`${u.name} removed from ${t.name}`);
  };
  return (
    <>
      <PageHead title="Teams" crumbs={[{ label: 'Overview', to: '/' }, { label: 'Teams' }]} actions={<button className="btn btn-primary" onClick={() => setEdit('new')}><IconPlus size={16} />New team</button>} />
      <div className="grid-2">
        {st.teams.map(t => {
          const lead = userById(st.users, t.lead);
          return (
            <Card key={t.id}>
              <div className="between" style={{ alignItems: 'flex-start' }}>
                <div className="vstack" style={{ gap: 3 }}><b style={{ fontSize: 16 }}>{t.name}</b><span className="small t2">{t.about}</span><span className="hstack tiny muted" style={{ gap: 6 }}><IconMapPin size={13} />{t.area}</span></div>
                <span className="hstack" style={{ gap: 4 }}>
                  <button className="icon-btn" aria-label={`Edit ${t.name}`} onClick={() => setEdit(t)}><IconPencil size={17} /></button>
                  <button className="icon-btn" aria-label={`Delete ${t.name}`} onClick={() => setDel(t)}><IconTrash size={17} /></button>
                </span>
              </div>
              <div className="list">
                {t.members.map(id => { const u = userById(st.users, id); if (!u) return null; return (
                  <div key={id} className="hstack" style={{ gap: 10, padding: '8px 0' }}>
                    <Avatar i={u.initials} size={32} />
                    <Link to={`/users/${u.id}`} className="vstack grow" style={{ gap: 1 }}><b className="small">{u.name}</b><span className="tiny muted">{u.role}{u.status !== 'Active' ? ` · ${u.status}` : ''}</span></Link>
                    {t.lead === id ? <Tag tone="jade" icon={<IconCrown size={12} />}>Lead</Tag> : <button className="link tiny" onClick={() => { st.set('teams', ts => ts.map(x => (x.id === t.id ? { ...x, lead: id } : x))); st.log('Changed a team lead', t.name, 'Teams', [['Lead', `${lead?.name || '—'} → ${u.name}`]]); toast(`${u.name} now leads ${t.name}`); }}>Make lead</button>}
                    <button className="icon-btn" aria-label={`Remove ${u.name}`} onClick={() => remove(t, id)} style={{ width: 30, height: 30 }}><IconX size={15} /></button>
                  </div>
                ); })}
                {t.members.length === 0 && <span className="small muted" style={{ padding: '8px 0' }}>No one in this team yet.</span>}
              </div>
              <button className="btn btn-outline btn-sm" style={{ alignSelf: 'flex-start' }} onClick={() => setAdd(t)}><IconUserPlus size={15} />Add people</button>
            </Card>
          );
        })}
      </div>
      {st.teams.length === 0 && <Empty icon={<IconUsersGroup size={22} />} title="No teams yet" />}
      {edit && <TeamModal t={edit === 'new' ? null : edit} onClose={() => setEdit(null)} />}
      {add && <AddModal t={add} onClose={() => setAdd(null)} />}
      {del && (
        <Modal title={`Delete ${del.name}?`} onClose={() => setDel(null)} width={480}
          footer={<><button className="btn btn-grey" onClick={() => setDel(null)}>Cancel</button><button className="btn btn-danger" disabled={del.members.length > 0} onClick={() => { st.set('teams', ts => ts.filter(x => x.id !== del.id)); st.log('Deleted a team', del.name, 'Teams'); toast('Team deleted'); setDel(null); }}>Delete team</button></>}>
          <span className="t2">{del.members.length ? `Move the ${del.members.length} people in this team to another team first.` : 'Nobody is in this team, so it can be deleted.'}</span>
        </Modal>
      )}
    </>
  );
}

function TeamModal({ t, onClose }: { t: Team | null; onClose: () => void }) {
  const st = useStore();
  const toast = useToast();
  const [f, setF] = useState({ name: t?.name || '', about: t?.about || '', area: t?.area || '' });
  const save = () => {
    if (t) {
      st.set('teams', ts => ts.map(x => (x.id === t.id ? { ...x, ...f } : x)));
      if (f.name !== t.name) st.set('users', us => us.map(u => (u.team === t.name ? { ...u, team: f.name } : u)));
      st.log('Edited a team', f.name, 'Teams', (['name', 'about', 'area'] as const).filter(k => f[k] !== t[k]).map(k => [k === 'name' ? 'Name' : k === 'about' ? 'What they do' : 'Area', `${t[k]} → ${f[k]}`]));
    } else {
      st.set('teams', ts => [...ts, { id: 't' + Date.now(), ...f, lead: '', members: [] }]);
      st.log('Created a team', f.name, 'Teams');
    }
    toast(t ? 'Team saved' : 'Team created'); onClose();
  };
  return (
    <Modal title={t ? `Edit ${t.name}` : 'New team'} onClose={onClose} width={520} footer={<><button className="btn btn-grey" onClick={onClose}>Cancel</button><button className="btn btn-primary" disabled={!f.name.trim()} onClick={save}>{t ? 'Save' : 'Create team'}</button></>}>
      <Field label="Team name"><input className="input" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} placeholder="For example: Fitters · Nottingham" /></Field>
      <Field label="What they do"><input className="input" value={f.about} onChange={e => setF({ ...f, about: e.target.value })} /></Field>
      <Field label="Area they cover"><input className="input" value={f.area} onChange={e => setF({ ...f, area: e.target.value })} /></Field>
    </Modal>
  );
}

function AddModal({ t, onClose }: { t: Team; onClose: () => void }) {
  const st = useStore();
  const toast = useToast();
  const options = st.users.filter(u => u.status !== 'Deactivated' && !t.members.includes(u.id));
  const [pick, setPick] = useState<string[]>([]);
  const save = () => {
    st.set('teams', ts => ts.map(x => (x.id === t.id ? { ...x, members: [...x.members, ...pick], lead: x.lead || pick[0] } : { ...x, members: x.members.filter(m => !pick.includes(m)) })));
    st.set('users', us => us.map(u => (pick.includes(u.id) ? { ...u, team: t.name } : u)));
    st.log('Added people to a team', t.name, 'Teams', pick.map(id => { const u = userById(st.users, id)!; return [u.name, `${u.team} → ${t.name}`]; }));
    toast(`${pick.length} added to ${t.name}`); onClose();
  };
  return (
    <Modal title={`Add people to ${t.name}`} sub="Each person is in one team. Adding them here moves them from their old team." onClose={onClose} width={560}
      footer={<><button className="btn btn-grey" onClick={onClose}>Cancel</button><button className="btn btn-primary" disabled={!pick.length} onClick={save}>Add {pick.length || ''}</button></>}>
      <div className="list" style={{ maxHeight: 380, overflowY: 'auto' }}>
        {options.map(u => (
          <label key={u.id} className="hstack" style={{ gap: 10, padding: '8px 0', cursor: 'pointer' }}>
            <input type="checkbox" checked={pick.includes(u.id)} onChange={e => setPick(p => (e.target.checked ? [...p, u.id] : p.filter(x => x !== u.id)))} style={{ width: 18, height: 18, accentColor: '#00c7a1' }} />
            <Avatar i={u.initials} size={30} /><span className="vstack grow" style={{ gap: 1 }}><b className="small">{u.name}</b><span className="tiny muted">{u.role} · now in {u.team}</span></span>
          </label>
        ))}
      </div>
    </Modal>
  );
}
