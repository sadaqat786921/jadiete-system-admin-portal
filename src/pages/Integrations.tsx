// Integrations (Framepoint, Microsoft 365 · Outlook, Xero): status, test, sync now, what is shared, settings, reconnect, disconnect.
// Sync errors: what failed, why, retry, match to a job, mark fixed or ignore.
import React, { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  IconPlugConnected, IconRefresh, IconPlugConnectedX, IconKey, IconChevronRight, IconAlertTriangle, IconCircleCheck, IconInfoCircle, IconArrowRight,
  IconLink, IconCheck, IconEyeOff, IconCode, IconMail, IconCalendar, IconLogin,
} from '@tabler/icons-react';
import { PageHead, Card, CardHead, Tag, Switch, Modal, Drawer, Field, Empty, useToast } from '../components/ui';
import { IntegLogo } from './Overview';
import { useStore } from '../data/store';
import { Integ, SyncErr, JOBS } from '../data/admin';

const stTone = (s: Integ['status']) => (s === 'Connected' ? 'ok' : s === 'Needs attention' ? 'warn' : 'err');

export default function Integrations() {
  const st = useStore();
  return (
    <>
      <PageHead title="Integrations" crumbs={[{ label: 'Overview', to: '/' }, { label: 'Integrations' }]} actions={<Link to="/sync-errors" className="btn btn-outline"><IconAlertTriangle size={16} />Sync errors</Link>} />
      <div className="alert info"><IconInfoCircle size={18} />Framepoint stays the place for quotes, Xero stays the accounting system and Outlook stays everyone’s email and calendar. Jadeite keeps them in step.</div>
      <div className="grid-3">
        {st.integ.map(g => {
          const n = st.errs.filter(e => e.integ === g.id && e.status === 'Needs attention').length;
          return (
            <Link key={g.id} to={`/integrations/${g.id}`} className="card" style={{ gap: 14 }}>
              <div className="between"><IntegLogo logo={g.logo} color={g.color} size={48} /><Tag tone={stTone(g.status)}>{g.status}</Tag></div>
              <div className="vstack" style={{ gap: 3 }}><b style={{ fontSize: 16 }}>{g.name}</b><span className="small t2">{g.about}</span></div>
              <div className="grid-2" style={{ gap: 10 }}>
                {[['Last sync', g.status === 'Not connected' ? '—' : g.last], ['Today', `${g.today} updates`], ['Checks', g.every], ['Errors', String(n)]].map(([k, v]) => <div key={k} className="vstack" style={{ gap: 1 }}><span className="tiny muted">{k}</span><b className="small" style={{ color: k === 'Errors' && n ? 'var(--err)' : undefined }}>{v}</b></div>)}
              </div>
              <span className="link small">Open settings<IconChevronRight size={14} /></span>
            </Link>
          );
        })}
      </div>
    </>
  );
}

export function IntegrationDetail() {
  const { id } = useParams();
  const st = useStore();
  const toast = useToast();
  const nav = useNavigate();
  const g = st.integ.find(x => x.id === id);
  const [busy, setBusy] = useState('');
  const [modal, setModal] = useState<string | null>(null);
  const [why, setWhy] = useState('');
  const [key, setKey] = useState('');
  if (!g) return <Empty icon={<IconPlugConnected size={22} />} title="Integration not found" action={<Link to="/integrations" className="btn btn-primary btn-sm">Back</Link>} />;
  const upd = (p: Partial<Integ>) => st.set('integ', xs => xs.map(x => (x.id === g.id ? { ...x, ...p } : x)));
  const errs = st.errs.filter(e => e.integ === g.id && e.status === 'Needs attention');
  const off = g.status === 'Not connected';
  const test = () => { setBusy('test'); setTimeout(() => { setBusy(''); const calErr = g.id === 'microsoft' && errs.length; toast(calErr ? 'Connected · but 1 calendar cannot be updated (see sync errors)' : `${g.name} is connected and working`); st.log('Tested a connection', g.name, 'Integrations'); }, 900); };
  const sync = () => { setBusy('sync'); setTimeout(() => { setBusy(''); upd({ last: 'Just now', today: g.today + 3 }); st.log('Synced now', g.name, 'Integrations'); toast(`${g.name} synced · 3 updates`); }, 1100); };
  const toggle = (bid: string, v: boolean) => { const b = g.brings.find(x => x.id === bid)!; upd({ brings: g.brings.map(x => (x.id === bid ? { ...x, on: v } : x)) }); st.log('Changed what is shared', `${g.name} · ${b.label}`, 'Integrations', [[b.label, v ? 'Off → On' : 'On → Off']]); toast('Saved'); };
  return (
    <>
      <PageHead title={g.name} crumbs={[{ label: 'Overview', to: '/' }, { label: 'Integrations', to: '/integrations' }, { label: g.name }]}
        actions={off ? <button className="btn btn-primary" onClick={() => setModal('connect')}><IconLogin size={16} />Connect</button> : <>
          <button className="btn btn-grey" disabled={!!busy} onClick={test}>{busy === 'test' ? <><span className="spin" />Testing…</> : <><IconPlugConnected size={16} />Test connection</>}</button>
          <button className="btn btn-primary" disabled={!!busy} onClick={sync}>{busy === 'sync' ? <><span className="spin" />Syncing…</> : <><IconRefresh size={16} />Sync now</>}</button></>} />
      {off && <div className="alert err"><IconPlugConnectedX size={18} />Not connected. Nothing is being shared with {g.name} until it is connected again.</div>}
      {!off && errs.length > 0 && <div className="alert warn"><IconAlertTriangle size={18} /><span className="grow">{errs.length} sync error{errs.length > 1 ? 's' : ''} need{errs.length > 1 ? '' : 's'} you · {g.note}</span><Link to={`/sync-errors?integ=${g.id}`} className="btn btn-outline btn-sm">See errors<IconArrowRight size={14} /></Link></div>}
      <div className="row">
        <div className="col grow">
          <Card>
            <div className="hstack" style={{ gap: 14 }}>
              <IntegLogo logo={g.logo} color={g.color} size={56} />
              <div className="vstack grow" style={{ gap: 3 }}><b style={{ fontSize: 18 }}>{g.name}</b><span className="t2">{g.about}</span></div>
              <Tag tone={stTone(g.status)}>{g.status}</Tag>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
              {[['Account', g.account], ['Connected since', off ? '—' : g.since], ['Last sync', off ? '—' : g.last], ['Updates today', String(g.today)]].map(([k, v]) => <div key={k} className="vstack" style={{ gap: 2 }}><span className="tiny muted">{k}</span><b className="small">{v}</b></div>)}
            </div>
            <span className="small t2">{g.note.includes('stays') ? g.note : ''}</span>
          </Card>
          <Card className="flush">
            <div style={{ padding: '18px 18px 8px' }}><CardHead title="What is shared" sub="Switch something off to stop it syncing" /></div>
            <table className="tbl"><thead><tr><th>Information</th><th>Direction</th><th>On</th></tr></thead><tbody>
              {g.brings.map(b => { const fixed = b.dir.startsWith('Stays') || b.dir.startsWith('Not'); return (
                <tr key={b.id}><td className="b">{b.label}</td><td className="t2">{b.dir}</td><td>{fixed ? <span className="tiny muted">Not part of the agreed scope</span> : <Switch on={b.on} onChange={v => toggle(b.id, v)} />}</td></tr>
              ); })}
            </tbody></table>
          </Card>
          {g.id === 'microsoft' && <Outlook />}
        </div>
        <div className="col" style={{ width: 340, flex: '0 0 340px' }}>
          <Card>
            <CardHead title="Settings" />
            <Field label="How often to check"><select className="select" value={g.every} disabled={g.id === 'microsoft'} onChange={e => { upd({ every: e.target.value }); st.log('Changed how often it checks', g.name, 'Integrations', [['Checks', `${g.every} → ${e.target.value}`]]); toast('Saved'); }}>{(g.id === 'microsoft' ? ['Live'] : ['Every 5 minutes', 'Every 15 minutes', 'Every hour']).map(o => <option key={o}>{o}</option>)}</select></Field>
            {g.id === 'framepoint' && <button className="btn btn-outline btn-block" onClick={() => { setKey(''); setModal('key'); }}><IconKey size={16} />Replace the access key</button>}
            {g.id !== 'framepoint' && !off && <button className="btn btn-outline btn-block" onClick={() => setModal('reconnect')}><IconLogin size={16} />Sign in to {g.id === 'xero' ? 'Xero' : 'Microsoft'} again</button>}
            {!off && <button className="btn btn-outline btn-block" style={{ color: 'var(--err)' }} onClick={() => { setWhy(''); setModal('disconnect'); }}><IconPlugConnectedX size={16} />Disconnect</button>}
          </Card>
          <Card>
            <CardHead title="Recent activity" right={<Link to={`/audit?q=${encodeURIComponent(g.name)}`} className="link">All</Link>} />
            <div className="vstack small" style={{ gap: 10 }}>
              {[...st.audit.filter(a => a.record.includes(g.name)).slice(0, 3).map(a => [a.action, a.when]), [`${g.today} updates synced`, 'Today'], ...st.errs.filter(e => e.integ === g.id).slice(0, 2).map(e => [`${e.status === 'Needs attention' ? 'Failed' : e.status}: ${e.what}`, e.when])].map(([t, w], i) => (
                <span key={i} className="vstack" style={{ gap: 1 }}><b>{t}</b><span className="tiny muted">{w}</span></span>
              ))}
            </div>
          </Card>
        </div>
      </div>
      {modal === 'key' && (
        <Modal title="Replace the Framepoint access key" sub="Get a new key from Framepoint › Settings › Access" onClose={() => setModal(null)} width={520}
          footer={<><button className="btn btn-grey" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary" disabled={key.trim().length < 12} onClick={() => { st.log('Replaced the access key', g.name, 'Integrations', [['Access key', '••••4f21 → ••••' + key.trim().slice(-4)]]); toast('New key saved and tested'); setModal(null); }}>Save and test</button></>}>
          <Field label="Current key"><input className="input" value="••••••••••••4f21" disabled /></Field>
          <Field label="New key" hint="It is stored safely and never shown again"><input className="input" value={key} onChange={e => setKey(e.target.value)} placeholder="Paste the key from Framepoint" /></Field>
        </Modal>
      )}
      {(modal === 'reconnect' || modal === 'connect') && (
        <Modal title={`${modal === 'connect' ? 'Connect' : 'Sign in to'} ${g.name}`} onClose={() => setModal(null)} width={500}
          footer={<><button className="btn btn-grey" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary" onClick={() => { upd({ status: g.id === 'microsoft' && errs.length ? 'Needs attention' : 'Connected', last: 'Just now', since: modal === 'connect' ? '16 Oct' : g.since }); st.log(modal === 'connect' ? 'Connected an integration' : 'Signed in to an integration again', g.name, 'Integrations', modal === 'connect' ? [['Status', 'Not connected → Connected']] : undefined); toast(`${g.name} connected`); setModal(null); }}>Continue to {g.id === 'xero' ? 'Xero' : g.id === 'microsoft' ? 'Microsoft' : 'Framepoint'}</button></>}>
          <span className="t2" style={{ lineHeight: 1.5 }}>A {g.id === 'xero' ? 'Xero' : g.id === 'microsoft' ? 'Microsoft' : 'Framepoint'} sign-in window opens. Sign in with the company admin account and agree to share {g.brings.filter(b => b.on).map(b => b.label.toLowerCase()).join(', ')}.</span>
        </Modal>
      )}
      {modal === 'disconnect' && (
        <Modal title={`Disconnect ${g.name}?`} onClose={() => setModal(null)} width={540}
          footer={<><button className="btn btn-grey" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-danger" disabled={why.trim().length < 3} onClick={() => { upd({ status: 'Not connected' }); st.log('Disconnected an integration', g.name, 'Integrations', [['Status', `${g.status} → Not connected`]], why.trim()); toast(`${g.name} disconnected`); setModal(null); }}>Disconnect</button></>}>
          <div className="alert warn small"><IconAlertTriangle size={16} />{g.id === 'framepoint' ? 'New quotes will not come in from Framepoint.' : g.id === 'xero' ? 'Deposits, invoices and balances stop updating. Sales cannot mark deals as Won.' : 'Emails and calendars stop updating for everyone.'}</div>
          <Field label="Why? (required)"><input className="input" value={why} onChange={e => setWhy(e.target.value)} placeholder="For example: changing to a new Xero organisation" /></Field>
        </Modal>
      )}
    </>
  );
}

function Outlook() {
  const st = useStore();
  const toast = useToast();
  return (
    <>
      <Card className="flush">
        <div style={{ padding: '18px 18px 8px' }}><CardHead title="Mailboxes" sub="Emails in these mailboxes are matched to customers and jobs" /></div>
        <table className="tbl"><thead><tr><th>Mailbox</th><th>Belongs to</th><th>Read</th></tr></thead><tbody>
          {st.mailboxes.map(m => (
            <tr key={m.id}><td><span className="hstack" style={{ gap: 8 }}><IconMail size={16} color="#0b6e5c" />{m.box}</span></td><td className="t2">{m.who}</td>
              <td><Switch on={m.on} onChange={v => { st.set('mailboxes', ms => ms.map(x => (x.id === m.id ? { ...x, on: v } : x))); st.log(v ? 'Started reading a mailbox' : 'Stopped reading a mailbox', m.box, 'Integrations', [['Read', v ? 'Off → On' : 'On → Off']]); toast('Saved'); }} /></td></tr>
          ))}
        </tbody></table>
      </Card>
      <Card>
        <CardHead title="Calendars" sub="Appointments, surveys and fittings appear in each person’s Outlook calendar" />
        <span className="small b">When someone moves an appointment in Outlook</span>
        {[['Jadeite', 'Keep the Jadeite time and put it back in Outlook', 'The diary in Jadeite is always right'], ['Outlook', 'Use the new Outlook time', 'The office gets a note to check it']].map(([v, t, s]) => (
          <label key={v} className="hstack" style={{ gap: 10, padding: 10, border: `1px solid ${st.calOwner === v ? 'var(--primary)' : 'var(--border)'}`, borderRadius: 10, cursor: 'pointer', background: st.calOwner === v ? 'var(--tint)' : '#fff' }}>
            <input type="radio" name="cal" checked={st.calOwner === v} onChange={() => { st.set('calOwner', () => v); st.log('Changed who wins calendar changes', 'Microsoft 365 · Outlook', 'Integrations', [['Calendar edits', `${st.calOwner} → ${v}`]]); toast('Saved'); }} style={{ accentColor: '#00c7a1' }} />
            <span className="vstack" style={{ gap: 1 }}><b className="small">{t}</b><span className="tiny muted">{s}</span></span>
          </label>
        ))}
        <span className="hstack tiny muted" style={{ gap: 6 }}><IconCalendar size={14} />{st.users.filter(u => u.status === 'Active' && u.role !== 'Installer').length} staff calendars connected</span>
      </Card>
    </>
  );
}

/* ---------------- Sync errors ---------------- */
export function SyncErrors() {
  const st = useStore();
  const toast = useToast();
  const [sp, setSp] = useSearchParams();
  const f = sp.get('f') || 'open';
  const integ = sp.get('integ') || 'all';
  const open = sp.get('id');
  const set = (k: string, v: string) => { const n = new URLSearchParams(sp); n.set(k, v); setSp(n, { replace: true }); };
  const rows = st.errs.filter(e => (f === 'all' || (f === 'open' ? e.status === 'Needs attention' || e.status === 'Retrying' : e.status === 'Fixed' || e.status === 'Ignored')) && (integ === 'all' || e.integ === integ));
  const openN = st.errs.filter(e => e.status === 'Needs attention').length;
  const retry = useRetry();
  const retryAll = () => { const list = st.errs.filter(e => e.status === 'Needs attention' && !e.canMatch); list.forEach(e => retry(e, true)); toast(`Trying ${list.length} again · ones that need a choice are left for you`); };
  const e = st.errs.find(x => x.id === open);
  return (
    <>
      <PageHead title="Sync errors" crumbs={[{ label: 'Overview', to: '/' }, { label: 'Sync errors' }]} actions={<button className="btn btn-primary" disabled={!st.errs.some(x => x.status === 'Needs attention' && !x.canMatch)} onClick={retryAll}><IconRefresh size={16} />Try all again</button>} />
      <div className="card flush">
        <div className="toolbar">
          {[['open', 'To fix', openN], ['done', 'Fixed or ignored', st.errs.filter(x => x.status === 'Fixed' || x.status === 'Ignored').length], ['all', 'All', st.errs.length]].map(([id, l, n]) => <button key={id} className={`chip ${f === id ? 'on' : ''}`} onClick={() => set('f', String(id))}>{l}<span className="n">{n}</span></button>)}
          <select className="select" aria-label="Integration" style={{ width: 200, height: 36, marginLeft: 'auto' }} value={integ} onChange={ev => set('integ', ev.target.value)}><option value="all">All integrations</option>{st.integ.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}</select>
        </div>
        <table className="tbl">
          <thead><tr><th>What went wrong</th><th>Record</th><th>When</th><th>Tries</th><th>Status</th><th style={{ textAlign: 'right' }}>Action</th></tr></thead>
          <tbody>
            {rows.map(x => { const g = st.integ.find(i => i.id === x.integ)!; return (
              <tr key={x.id} className="click" onClick={() => set('id', x.id)}>
                <td><div className="hstack" style={{ gap: 10 }}><IntegLogo logo={g.logo} color={g.color} size={32} /><div className="vstack" style={{ gap: 2 }}><b>{x.what}</b><span className="tiny muted">{x.id} · {g.name}</span></div></div></td>
                <td className="t2">{x.record}</td><td className="t2">{x.when}</td><td className="t2">{x.tries}</td>
                <td><Tag tone={x.status === 'Fixed' ? 'ok' : x.status === 'Ignored' ? 'grey' : x.status === 'Retrying' ? 'jade' : 'err'}>{x.status}</Tag></td>
                <td style={{ textAlign: 'right' }} onClick={ev => ev.stopPropagation()}>
                  {x.status === 'Needs attention' && (x.canMatch ? <button className="btn btn-outline btn-sm" onClick={() => set('id', x.id)}><IconLink size={15} />Match to a job</button> : <button className="btn btn-outline btn-sm" onClick={() => retry(x)}><IconRefresh size={15} />Try again</button>)}
                  {x.status === 'Retrying' && <span className="hstack small t2" style={{ gap: 6, justifyContent: 'flex-end' }}><span className="spin" />Trying…</span>}
                </td>
              </tr>
            ); })}
            {rows.length === 0 && <tr><td colSpan={6}><Empty icon={<IconCircleCheck size={22} />} title={f === 'open' ? 'No sync errors' : 'Nothing here'} sub={f === 'open' ? 'Framepoint, Outlook and Xero are all in step.' : undefined} /></td></tr>}
          </tbody>
        </table>
      </div>
      {e && <ErrDrawer e={e} onClose={() => { const n = new URLSearchParams(sp); n.delete('id'); setSp(n, { replace: true }); }} />}
    </>
  );
}

function useRetry() {
  const st = useStore();
  const toast = useToast();
  return (e: SyncErr, quiet?: boolean) => {
    st.set('errs', es => es.map(x => (x.id === e.id ? { ...x, status: 'Retrying' } : x)));
    setTimeout(() => {
      const ok = e.integ === 'framepoint';
      st.set('errs', es => es.map(x => (x.id === e.id ? { ...x, status: ok ? 'Fixed' : 'Needs attention', tries: x.tries + 1, fixedBy: ok ? 'Fixed on retry · 16 Oct' : undefined, log: [...x.log, ok ? 'Today · tried again · worked' : 'Today · tried again · still failing'] } : x)));
      st.log(ok ? 'Retried a sync error · fixed' : 'Retried a sync error · still failing', e.id, 'Integrations');
      if (!quiet) toast(ok ? `${e.id} fixed` : `Still failing. ${e.fix}`);
    }, 1200);
  };
}

function ErrDrawer({ e, onClose }: { e: SyncErr; onClose: () => void }) {
  const st = useStore();
  const toast = useToast();
  const retry = useRetry();
  const g = st.integ.find(i => i.id === e.integ)!;
  const [mode, setMode] = useState<'' | 'match' | 'fixed' | 'ignore'>('');
  const [job, setJob] = useState(e.record.includes('Patel') ? JOBS[4] : JOBS[3]);
  const [note, setNote] = useState('');
  const [tech, setTech] = useState(false);
  const close = (status: SyncErr['status'], line: string, action: string, reason?: string) => {
    st.set('errs', es => es.map(x => (x.id === e.id ? { ...x, status, fixedBy: `Tom Fletcher · 16 Oct`, log: [...x.log, `Today · ${line}`] } : x)));
    st.log(action, `${e.id} · ${e.record}`, 'Integrations', undefined, reason); toast(`${e.id} ${status.toLowerCase()}`); onClose();
  };
  const open = e.status === 'Needs attention';
  return (
    <Drawer title={e.what} sub={`${e.id} · ${g.name} · ${e.when}`} onClose={onClose} width={560}
      footer={!open ? <button className="btn btn-grey" onClick={onClose}>Close</button>
        : mode === 'match' ? <><button className="btn btn-grey" onClick={() => setMode('')}>Back</button><button className="btn btn-primary" onClick={() => close('Fixed', `matched to ${job}`, 'Matched a sync error to a job', `Matched to ${job}`)}><IconLink size={16} />Match and save</button></>
        : mode ? <><button className="btn btn-grey" onClick={() => setMode('')}>Back</button><button className="btn btn-primary" disabled={note.trim().length < 3} onClick={() => (mode === 'fixed' ? close('Fixed', `marked fixed: ${note.trim()}`, 'Marked a sync error as fixed', note.trim()) : close('Ignored', `ignored: ${note.trim()}`, 'Ignored a sync error', note.trim()))}>{mode === 'fixed' ? 'Mark as fixed' : 'Ignore it'}</button></>
        : <><button className="btn btn-grey" onClick={() => { setNote(''); setMode('ignore'); }}><IconEyeOff size={16} />Ignore</button><button className="btn btn-outline" onClick={() => { setNote(''); setMode('fixed'); }}><IconCheck size={16} />Mark as fixed</button>{e.canMatch ? <button className="btn btn-primary" onClick={() => setMode('match')}><IconLink size={16} />Match to a job</button> : <button className="btn btn-primary" onClick={() => { retry(e); onClose(); }}><IconRefresh size={16} />Try again</button>}</>}>
      <div className="hstack" style={{ gap: 12 }}><IntegLogo logo={g.logo} color={g.color} size={40} /><span className="vstack grow" style={{ gap: 2 }}><b>{e.record}</b><span className="tiny muted">Tried {e.tries} time{e.tries > 1 ? 's' : ''}</span></span><Tag tone={e.status === 'Fixed' ? 'ok' : e.status === 'Ignored' ? 'grey' : 'err'}>{e.status}</Tag></div>
      <div className="vstack" style={{ gap: 4 }}><span className="tiny muted">Why it happened</span><span className="t2" style={{ lineHeight: 1.5 }}>{e.why}</span></div>
      <div className="alert info small" style={{ alignItems: 'flex-start' }}><IconInfoCircle size={16} style={{ marginTop: 1 }} /><span>{e.fix}</span></div>
      {mode === 'match' && <Field label="Which job is it for?"><select className="select" value={job} onChange={ev => setJob(ev.target.value)}>{JOBS.map(j => <option key={j}>{j}</option>)}</select></Field>}
      {(mode === 'fixed' || mode === 'ignore') && <Field label={mode === 'fixed' ? 'What did you do? (required)' : 'Why ignore it? (required)'}><input className="input" value={note} onChange={ev => setNote(ev.target.value)} placeholder={mode === 'fixed' ? 'For example: Rob shared his calendar again' : 'For example: test record'} /></Field>}
      <div className="vstack" style={{ gap: 6 }}><span className="tiny muted">What has happened</span>{e.log.map((l, i) => <span key={i} className="small">• {l}</span>)}{e.fixedBy && <span className="small">• {e.status} by {e.fixedBy}</span>}</div>
      <button className="link" style={{ alignSelf: 'flex-start' }} onClick={() => setTech(!tech)}><IconCode size={14} />{tech ? 'Hide' : 'Show'} technical details</button>
      {tech && <code className="small" style={{ background: 'var(--bg)', padding: 10, borderRadius: 8, display: 'block', wordBreak: 'break-word' }}>{e.tech}</code>}
      <Link to={`/integrations/${g.id}`} className="link small">Open {g.name} settings<IconChevronRight size={14} /></Link>
    </Drawer>
  );
}
