// Sign-in and security (staff and customer sign-in rules), Backups and privacy (backups, test restore, how long data is kept, customer data requests), and My settings.
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { IconDeviceFloppy, IconArrowBackUp, IconShieldLock, IconInfoCircle, IconDatabase, IconRefresh, IconCircleCheck, IconDownload, IconTrash, IconAlertTriangle, IconPlayerPlay, IconKey, IconDeviceMobile } from '@tabler/icons-react';
import { PageHead, Card, CardHead, Switch, Tag, Tabs, Field, Modal, Avatar, useToast } from '../components/ui';
import { useStore } from '../data/store';
import { me, Req } from '../data/admin';

export function Security() {
  const st = useStore();
  const toast = useToast();
  const [s, setS] = useState(st.security);
  const [warn, setWarn] = useState(false);
  const dirty = JSON.stringify(s) !== JSON.stringify(st.security);
  const save = () => {
    const names: Record<string, string> = { mfa: 'Two-step sign-in for staff', tries: 'Wrong codes before locking', session: 'Staff stay signed in on the web', phoneApp: 'Phone app stays signed in', newDevice: 'Code on a new device', custCode: 'Customer code works for', custTries: 'Customer wrong codes before pausing', invite: 'Invite links work for' };
    const before: [string, string][] = (Object.keys(names) as (keyof typeof s)[]).filter(k => JSON.stringify(s[k]) !== JSON.stringify(st.security[k])).map(k => [names[k], `${String(st.security[k]).replace('true', 'On').replace('false', 'Off')} → ${String(s[k]).replace('true', 'On').replace('false', 'Off')}`]);
    if (JSON.stringify(s.ways) !== JSON.stringify(st.security.ways)) before.push(['Ways to get a code', `${[st.security.ways.text && 'Text', st.security.ways.app && 'App'].filter(Boolean).join(' and ')} → ${[s.ways.text && 'Text', s.ways.app && 'App'].filter(Boolean).join(' and ')}`]);
    st.set('security', () => s); st.log('Changed sign-in rules', 'Sign-in and security', 'Sign-in', before); toast('Sign-in rules saved');
  };
  const row = (t: string, d: string, ctl: React.ReactNode) => <div className="between" style={{ gap: 16, padding: '12px 0' }}><span className="vstack" style={{ gap: 2 }}><b className="small">{t}</b><span className="tiny muted">{d}</span></span>{ctl}</div>;
  const sel = (k: keyof typeof s, opts: string[]) => <select className="select" aria-label={String(k)} style={{ width: 160 }} value={s[k] as string} onChange={e => setS({ ...s, [k]: e.target.value })}>{opts.map(o => <option key={o}>{o}</option>)}</select>;
  return (
    <>
      <PageHead title="Sign-in and security" crumbs={[{ label: 'Overview', to: '/' }, { label: 'Sign-in and security' }]} actions={<><button className="btn btn-grey" disabled={!dirty} onClick={() => setS(st.security)}><IconArrowBackUp size={16} />Undo</button><button className="btn btn-primary" disabled={!dirty || (!s.ways.text && !s.ways.app)} onClick={save}><IconDeviceFloppy size={16} />Save</button></>} />
      <div className="grid-2" style={{ alignItems: 'start' }}>
        <Card>
          <CardHead title="Staff sign-in" sub="Office, sales, surveyors, installers, directors and admins" />
          <div className="list">
            {row('Two-step sign-in for everyone', 'A 6-digit code as well as a password. Agreed in the BRD.', <Switch on={s.mfa} onChange={v => (v ? setS({ ...s, mfa: true }) : setWarn(true))} />)}
            {row('Ways to get the code', 'Pick at least one', <span className="hstack" style={{ gap: 14 }}><label className="hstack small" style={{ gap: 6 }}><input type="checkbox" checked={s.ways.text} onChange={e => setS({ ...s, ways: { ...s.ways, text: e.target.checked } })} style={{ accentColor: '#00c7a1' }} />Text message</label><label className="hstack small" style={{ gap: 6 }}><input type="checkbox" checked={s.ways.app} onChange={e => setS({ ...s, ways: { ...s.ways, app: e.target.checked } })} style={{ accentColor: '#00c7a1' }} />Authenticator app</label></span>)}
            {row('Lock the account after', 'Wrong codes in a row. A System Admin unlocks it.', sel('tries', ['3', '5']))}
            {row('Stay signed in on the web for', 'Then sign in again', sel('session', ['1 hour', '8 hours', '12 hours']))}
            {row('Phone app stays signed in for', 'Field staff open it many times a day', sel('phoneApp', ['7 days', '30 days']))}
            {row('Ask for a code on a new phone or computer', 'Even inside the time above', <Switch on={s.newDevice} onChange={v => setS({ ...s, newDevice: v })} />)}
            {row('Invite links work for', 'For new staff', sel('invite', ['2 days', '7 days']))}
          </div>
          {(!s.ways.text && !s.ways.app) && <div className="alert warn small"><IconAlertTriangle size={16} />Pick at least one way to get the code.</div>}
        </Card>
        <div className="col">
          <Card>
            <CardHead title="Customer sign-in" sub="Customer portal and app" />
            <div className="list">
              {row('How customers sign in', 'A code sent to their email. No password.', <Tag tone="ok">Email code</Tag>)}
              {row('Code works for', 'After that they ask for a new one', sel('custCode', ['5 minutes', '10 minutes', '15 minutes']))}
              {row('Pause sign-in after', 'Wrong codes in a row', sel('custTries', ['3', '5']))}
              {row('What customers can see', 'Only their own job. Never internal notes or other customers.', <Tag tone="ok">Always</Tag>)}
            </div>
          </Card>
          <Card style={{ background: 'var(--tint)', borderColor: '#cfeee4' }}>
            <span className="hstack" style={{ gap: 8 }}><IconShieldLock size={18} color="#0b6e5c" /><b>Always on</b></span>
            <span className="small t2" style={{ lineHeight: 1.6 }}>Secure connections (TLS) everywhere · data and files encrypted when stored · files are private and only shared with the right people · passwords and keys stored safely.</span>
          </Card>
        </div>
      </div>
      {warn && (
        <Modal title="Turn off two-step sign-in?" onClose={() => setWarn(false)} width={480} footer={<><button className="btn btn-primary" onClick={() => setWarn(false)}>Keep it on</button><button className="btn btn-danger" onClick={() => { setS({ ...s, mfa: false }); setWarn(false); }}>Turn it off</button></>}>
          <div className="alert warn small"><IconAlertTriangle size={16} />The BRD asks for two-step sign-in. Without it, a stolen password is enough to see customer details.</div>
        </Modal>
      )}
    </>
  );
}

export function Backups() {
  const st = useStore();
  const toast = useToast();
  const [sp, setSp] = useSearchParams();
  const tab = sp.get('tab') || 'backups';
  const [busy, setBusy] = useState('');
  const [req, setReq] = useState<Req | null>(null);
  const [why, setWhy] = useState('');
  const [keep, setKeep] = useState(st.retention);
  const backupNow = () => { setBusy('backup'); setTimeout(() => { setBusy(''); st.set('backups', bs => [{ id: 'b' + Date.now(), when: 'Today, just now', kind: `Made by ${me.name}`, size: '4.2 GB', ok: true }, ...bs]); st.log('Made a backup', 'Backups', 'Settings'); toast('Backup made'); }, 1200); };
  const restore = () => { setBusy('restore'); setTimeout(() => { setBusy(''); st.set('lastRestore', () => ({ when: '16 Oct', took: '1 h 52 min', ok: true })); st.log('Tested a restore', 'Backup from today, 10:00', 'Settings'); toast('Test restore passed · nothing live was changed'); }, 1600); };
  const updReq = (r: Req, p: Partial<Req>) => st.set('reqs', rs => rs.map(x => (x.id === r.id ? { ...x, ...p } : x)));
  return (
    <>
      <PageHead title="Backups and privacy" crumbs={[{ label: 'Overview', to: '/' }, { label: 'Backups and privacy' }]} />
      <Tabs value={tab} onChange={v => setSp({ tab: v }, { replace: true })} items={[{ id: 'backups', label: 'Backups' }, { id: 'keep', label: 'How long we keep data' }, { id: 'requests', label: 'Customer data requests', n: st.reqs.filter(r => r.status === 'New').length }]} />
      {tab === 'backups' && (
        <div className="row">
          <div className="col grow">
            <Card className="flush">
              <div style={{ padding: '18px 18px 8px' }}><CardHead title="Latest backups" sub="Every hour, kept for 35 days. At most 1 hour of work could be lost." right={<button className="btn btn-primary btn-sm" disabled={!!busy} onClick={backupNow}>{busy === 'backup' ? <><span className="spin" />Backing up…</> : <><IconDatabase size={15} />Back up now</>}</button>} /></div>
              <table className="tbl"><thead><tr><th>When</th><th>Made by</th><th>Size</th><th>Result</th></tr></thead><tbody>
                {st.backups.slice(0, 8).map(b => <tr key={b.id}><td className="b">{b.when}</td><td className="t2">{b.kind}</td><td className="t2">{b.size}</td><td><Tag tone="ok" icon={<IconCircleCheck size={13} />}>Saved</Tag></td></tr>)}
              </tbody></table>
            </Card>
          </div>
          <div className="col" style={{ width: 360, flex: '0 0 360px' }}>
            <Card>
              <CardHead title="Test a restore" sub="Restores the latest backup into a separate copy to prove it works" />
              <div className="hstack" style={{ gap: 12 }}><IconCircleCheck size={22} color="#1f9d5b" /><span className="vstack" style={{ gap: 2 }}><b className="small">Last test {st.lastRestore.when} · passed</b><span className="tiny muted">Took {st.lastRestore.took}. Target: back up and running within 4 hours.</span></span></div>
              <button className="btn btn-outline btn-block" disabled={!!busy} onClick={restore}>{busy === 'restore' ? <><span className="spin" />Restoring a test copy…</> : <><IconPlayerPlay size={16} />Run a test restore</>}</button>
              <span className="tiny muted">The live platform is not touched.</span>
            </Card>
            <Card style={{ background: 'var(--tint)', borderColor: '#cfeee4' }}><span className="small t2" style={{ lineHeight: 1.5 }}>A real restore after a problem is done with the hosting team, so nobody restores over live data by mistake.</span></Card>
          </div>
        </div>
      )}
      {tab === 'keep' && (
        <Card className="flush">
          <div style={{ padding: '18px 18px 8px' }}><CardHead title="How long we keep data" sub="After this, records are deleted automatically. Agreed in the client privacy review." right={<button className="btn btn-primary btn-sm" disabled={JSON.stringify(keep) === JSON.stringify(st.retention)} onClick={() => { st.log('Changed how long data is kept', 'Privacy', 'Settings', keep.filter((k, i) => k.keep !== st.retention[i].keep).map(k => [k.what, `${st.retention.find(x => x.id === k.id)!.keep} → ${k.keep}`])); st.set('retention', () => keep); toast('Saved'); }}><IconDeviceFloppy size={15} />Save</button>} /></div>
          <table className="tbl"><thead><tr><th>What</th><th>Keep for</th><th>Note</th></tr></thead><tbody>
            {keep.map(k => <tr key={k.id}><td className="b">{k.what}</td><td><select className="select" aria-label={k.what} style={{ width: 130 }} value={k.keep} onChange={e => setKeep(ks => ks.map(x => (x.id === k.id ? { ...x, keep: e.target.value } : x)))}>{['1 year', '2 years', '6 years', '7 years', '10 years'].map(o => <option key={o}>{o}</option>)}</select></td><td className="t2 small">{k.note || ''}</td></tr>)}
          </tbody></table>
        </Card>
      )}
      {tab === 'requests' && (
        <Card className="flush">
          <div style={{ padding: '18px 18px 8px' }}><CardHead title="Customer data requests" sub="When a customer asks for a copy of their data, or asks us to delete it. The office logs the request." /></div>
          <table className="tbl"><thead><tr><th>Request</th><th>Customer</th><th>Asked</th><th>Status</th><th style={{ textAlign: 'right' }}>Action</th></tr></thead><tbody>
            {st.reqs.map(r => (
              <tr key={r.id}>
                <td><div className="vstack" style={{ gap: 2 }}><b>{r.kind}</b><span className="tiny muted">{r.id}{r.note ? ` · ${r.note}` : ''}</span></div></td>
                <td className="t2">{r.who}</td><td className="t2">{r.asked}</td>
                <td><Tag tone={r.status === 'Done' ? 'ok' : r.status === 'New' ? 'warn' : r.status === 'Ready to download' ? 'jade' : 'grey'}>{r.status}</Tag></td>
                <td style={{ textAlign: 'right' }}>
                  {r.kind === 'Copy of their data' && r.status === 'New' && <button className="btn btn-outline btn-sm" onClick={() => { updReq(r, { status: 'Ready to download' }); st.log('Prepared a copy of customer data', r.who, 'Customers'); toast('Copy prepared'); }}><IconRefresh size={15} />Prepare copy</button>}
                  {r.status === 'Ready to download' && <button className="btn btn-primary btn-sm" onClick={() => { updReq(r, { status: 'Done', note: 'Sent to the customer by the office' }); st.log('Downloaded a copy of customer data', r.who, 'Customers'); toast('Downloaded · the office sends it securely'); }}><IconDownload size={15} />Download</button>}
                  {r.kind === 'Delete their data' && r.status === 'New' && <button className="btn btn-outline btn-sm" style={{ color: 'var(--err)' }} onClick={() => { setWhy(''); setReq(r); }}><IconTrash size={15} />Check and delete</button>}
                </td>
              </tr>
            ))}
          </tbody></table>
        </Card>
      )}
      {req && (
        <Modal title={`Delete ${req.who.split(' · ')[0]}’s data?`} sub={req.who} onClose={() => setReq(null)} width={540}
          footer={<><button className="btn btn-grey" onClick={() => setReq(null)}>Cancel</button><button className="btn btn-danger" disabled={why.trim().length < 3} onClick={() => { updReq(req, { status: 'Done', note: 'Deleted · audit entry kept' }); st.log('Deleted a customer’s data', req.who, 'Customers', [['Customer record', 'Kept → Deleted']], why.trim()); toast('Customer data deleted'); setReq(null); }}><IconTrash size={16} />Delete for good</button></>}>
          <div className="vstack small" style={{ gap: 6 }}>
            {['No live job', 'No money owed either way', 'No guarantee still running'].map(c => <span key={c} className="hstack" style={{ gap: 8 }}><IconCircleCheck size={16} color="#1f9d5b" />{c}</span>)}
          </div>
          <div className="alert warn small"><IconAlertTriangle size={16} />This cannot be undone. A note that it was deleted stays in the audit history.</div>
          <Field label="Why? (required)"><input className="input" value={why} onChange={e => setWhy(e.target.value)} placeholder="For example: customer asked by email on 13 Oct" /></Field>
        </Modal>
      )}
    </>
  );
}

export function MySettings() {
  const st = useStore();
  const toast = useToast();
  const [reset, setReset] = useState(false);
  const p = st.myPrefs;
  return (
    <>
      <PageHead title="My settings" crumbs={[{ label: 'Overview', to: '/' }, { label: 'My settings' }]} />
      <div className="grid-2" style={{ alignItems: 'start' }}>
        <Card>
          <CardHead title="My details" />
          <div className="hstack" style={{ gap: 14 }}><Avatar i={me.initials} size={56} bg="#00c7a1" fg="#0b1f1b" /><span className="vstack" style={{ gap: 2 }}><b style={{ fontSize: 16 }}>{me.name}</b><span className="small t2">{me.role} · Management</span></span></div>
          <Field label="Work email"><input className="input" value={me.email} disabled /></Field>
          <Field label="Mobile phone"><input className="input" defaultValue={me.phone} /></Field>
          <span className="tiny muted">Another System Admin or the Director changes your name, email or role.</span>
          <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }} onClick={() => toast('Your details are saved')}>Save</button>
        </Card>
        <div className="col">
          <Card>
            <CardHead title="My sign-in" />
            <div className="hstack" style={{ gap: 12 }}><IconKey size={20} color="#0b6e5c" /><span className="vstack grow" style={{ gap: 1 }}><b className="small">Password</b><span className="tiny muted">Changed 20 Sep</span></span><button className="btn btn-outline btn-sm" onClick={() => toast(`We have emailed you a link to change it`)}>Change</button></div>
            <div className="hstack" style={{ gap: 12 }}><IconDeviceMobile size={20} color="#0b6e5c" /><span className="vstack grow" style={{ gap: 1 }}><b className="small">Two-step sign-in</b><span className="tiny muted">Authenticator app</span></span><button className="btn btn-outline btn-sm" onClick={() => setReset(true)}>Set up again</button></div>
          </Card>
          <Card>
            <CardHead title="Email me when" />
            {([['errors', 'A sync error needs me'], ['locked', 'Someone is locked out'], ['backups', 'A backup or test restore fails'], ['weekly', 'A weekly summary every Monday']] as const).map(([k, t]) => (
              <div key={k} className="between"><span className="small">{t}</span><Switch on={p[k]} onChange={v => { st.set('myPrefs', x => ({ ...x, [k]: v })); toast('Saved'); }} /></div>
            ))}
          </Card>
        </div>
      </div>
      {reset && (
        <Modal title="Set up two-step sign-in again" sub="For a new phone" onClose={() => setReset(false)} width={480} footer={<><button className="btn btn-grey" onClick={() => setReset(false)}>Cancel</button><button className="btn btn-primary" onClick={() => { st.log('Set up two-step sign-in again', me.name, 'Sign-in'); toast('Two-step sign-in set up on your new phone'); setReset(false); }}>I have scanned it</button></>}>
          <div className="hstack" style={{ gap: 16 }}>
            <div style={{ width: 120, height: 120, borderRadius: 10, background: 'repeating-conic-gradient(#0b1f1b 0% 25%, #fff 0% 50%) 50% / 20px 20px', border: '8px solid #fff', boxShadow: '0 0 0 1px var(--border)' }} aria-label="QR code" />
            <span className="small t2" style={{ lineHeight: 1.6 }}>1. Open your authenticator app<br />2. Add an account and scan this code<br />3. Your old phone stops working for Jadeite</span>
          </div>
        </Modal>
      )}
    </>
  );
}
