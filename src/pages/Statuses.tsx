// Statuses and templates: sales stages, job stages (and the words customers see), pick-lists, message templates, and which documents customers see.
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { IconDeviceFloppy, IconArrowBackUp, IconLock, IconPlus, IconX, IconSend, IconMail, IconMessage, IconInfoCircle, IconEye } from '@tabler/icons-react';
import { PageHead, Card, CardHead, Tabs, Switch, Tag, Field, useToast } from '../components/ui';
import { useStore } from '../data/store';
import { StageRow, ListDef, FIELDS, SAMPLE, me } from '../data/admin';

export default function Statuses() {
  const [sp, setSp] = useSearchParams();
  const tab = sp.get('tab') || 'sales';
  return (
    <>
      <PageHead title="Statuses and templates" crumbs={[{ label: 'Overview', to: '/' }, { label: 'Statuses and templates' }]} />
      <Tabs value={tab} onChange={v => setSp({ tab: v }, { replace: true })} items={[{ id: 'sales', label: 'Sales stages' }, { id: 'jobs', label: 'Job stages' }, { id: 'lists', label: 'Pick-lists' }, { id: 'templates', label: 'Message templates' }, { id: 'customers', label: 'What customers see' }]} />
      {tab === 'sales' && <StageTable k="stages" title="Sales pipeline stages" sub="Used on the sales pipeline in the Office Admin and the Sales portal and app. Stages agreed in the BRD cannot be removed." />}
      {tab === 'jobs' && <StageTable k="journey" title="Job stages after Won" sub="The office sees the name on the left. Customers see the words on the right in their portal and app." />}
      {tab === 'lists' && <Lists />}
      {tab === 'templates' && <Templates />}
      {tab === 'customers' && <CustomerSees />}
    </>
  );
}

function StageTable({ k, title, sub }: { k: 'stages' | 'journey'; title: string; sub: string }) {
  const st = useStore();
  const toast = useToast();
  const [rows, setRows] = useState<StageRow[]>(st[k]);
  const dirty = JSON.stringify(rows) !== JSON.stringify(st[k]);
  const up = (id: string, p: Partial<StageRow>) => setRows(rs => rs.map(r => (r.id === id ? { ...r, ...p } : r)));
  const save = () => {
    const before: [string, string][] = [];
    rows.forEach((r, i) => { const o = st[k][i]; (['name', 'late', 'customer', 'show'] as const).forEach(f => { if (r[f] !== o[f]) before.push([`${o.name} · ${f === 'late' ? 'late after' : f === 'show' ? 'shown to customer' : f === 'customer' ? 'customer sees' : 'name'}`, `${o[f]} → ${r[f]}`]); }); });
    st.set(k, () => rows); st.log(`Changed ${k === 'stages' ? 'sales stages' : 'job stages'}`, title, 'Settings', before); toast('Saved · every portal and app uses the new wording');
  };
  return (
    <Card className="flush">
      <div style={{ padding: '18px 18px 10px' }}><CardHead title={title} sub={sub} right={<span className="hstack" style={{ gap: 8 }}><button className="btn btn-grey btn-sm" disabled={!dirty} onClick={() => setRows(st[k])}><IconArrowBackUp size={15} />Undo</button><button className="btn btn-primary btn-sm" disabled={!dirty || rows.some(r => !r.name.trim())} onClick={save}><IconDeviceFloppy size={15} />Save</button></span>} /></div>
      <table className="tbl">
        <thead><tr><th style={{ width: 36 }}>#</th><th>Stage name (staff)</th><th>Flag as late after</th><th>Customer sees</th><th>Show to customer</th></tr></thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id}>
              <td className="muted">{i + 1}</td>
              <td><span className="hstack" style={{ gap: 6 }}><input className="input" aria-label={`Stage ${i + 1} name`} value={r.name} disabled={r.fixed} onChange={e => up(r.id, { name: e.target.value })} style={{ maxWidth: 260 }} />{r.fixed && <IconLock size={14} color="#6b7a78" />}</span></td>
              <td>{r.late ? <span className="hstack" style={{ gap: 6 }}><input className="input" type="number" min={1} aria-label={`${r.name} late after days`} value={r.late} onChange={e => up(r.id, { late: Math.max(1, +e.target.value || 1) })} style={{ width: 76 }} /><span className="small t2">days</span></span> : <span className="small muted">—</span>}</td>
              <td><input className="input" aria-label={`${r.name} customer wording`} value={r.customer} disabled={!r.show} onChange={e => up(r.id, { customer: e.target.value })} style={{ maxWidth: 240 }} /></td>
              <td><Switch on={r.show} onChange={v => !r.fixed && up(r.id, { show: v })} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function Lists() {
  const st = useStore();
  const toast = useToast();
  return <div className="grid-2">{st.lists.map(l => <ListCard key={l.id} l={l} onSave={items => { st.set('lists', ls => ls.map(x => (x.id === l.id ? { ...x, items } : x))); st.log('Changed a pick-list', l.name, 'Settings', [['Items', `${l.items.length} → ${items.length}`]]); toast(`${l.name} saved`); }} />)}</div>;
}
export function ListCard({ l, onSave }: { l: ListDef; onSave: (items: string[]) => void }) {
  const [items, setItems] = useState(l.items);
  const [nw, setNw] = useState('');
  const dirty = JSON.stringify(items) !== JSON.stringify(l.items);
  return (
    <Card>
      <CardHead title={l.name} sub={l.used} />
      <div className="vstack" style={{ gap: 8 }}>
        {items.map((it, i) => (
          <span key={i} className="hstack" style={{ gap: 6 }}>
            <input className="input" aria-label={`${l.name} item ${i + 1}`} value={it} onChange={e => setItems(xs => xs.map((x, j) => (j === i ? e.target.value : x)))} />
            <button className="icon-btn" aria-label={`Remove ${it}`} disabled={items.length <= 2} onClick={() => setItems(xs => xs.filter((_, j) => j !== i))}><IconX size={16} /></button>
          </span>
        ))}
        <span className="hstack" style={{ gap: 6 }}>
          <input className="input" placeholder="Add another…" value={nw} onChange={e => setNw(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && nw.trim()) { setItems(xs => [...xs, nw.trim()]); setNw(''); } }} />
          <button className="btn btn-outline" disabled={!nw.trim()} onClick={() => { setItems(xs => [...xs, nw.trim()]); setNw(''); }}><IconPlus size={15} />Add</button>
        </span>
      </div>
      <span className="hstack" style={{ gap: 8 }}><button className="btn btn-primary btn-sm" disabled={!dirty || items.some(x => !x.trim())} onClick={() => onSave(items.map(x => x.trim()))}>Save</button>{dirty && <button className="btn btn-grey btn-sm" onClick={() => setItems(l.items)}>Undo</button>}</span>
    </Card>
  );
}

function Templates() {
  const st = useStore();
  const toast = useToast();
  const [sel, setSel] = useState(st.tpls[0].id);
  const t = st.tpls.find(x => x.id === sel)!;
  const [draft, setDraft] = useState({ subject: t.subject || '', body: t.body });
  const [preview, setPreview] = useState(false);
  const ref = React.useRef<HTMLTextAreaElement>(null);
  const pick = (id: string) => { const x = st.tpls.find(y => y.id === id)!; setSel(id); setDraft({ subject: x.subject || '', body: x.body }); setPreview(false); };
  const dirty = draft.body !== t.body || draft.subject !== (t.subject || '');
  const fill = (s: string) => Object.entries(SAMPLE).reduce((acc, [k, v]) => acc.split(k).join(v), s);
  const insert = (f: string) => { const el = ref.current; if (!el) { setDraft(d => ({ ...d, body: d.body + f })); return; } const a = el.selectionStart, b = el.selectionEnd; setDraft(d => ({ ...d, body: d.body.slice(0, a) + f + d.body.slice(b) })); };
  const save = () => { st.set('tpls', ts => ts.map(x => (x.id === t.id ? { ...x, subject: draft.subject || undefined, body: draft.body, edited: `16 Oct · ${me.name}` } : x))); st.log('Edited a message template', t.name, 'Settings', [['Wording', 'Changed']]); toast('Template saved'); };
  return (
    <div className="row">
      <Card className="flush" style={{ width: 340, flex: '0 0 340px' }}>
        <div className="list">
          {st.tpls.map(x => (
            <button key={x.id} onClick={() => pick(x.id)} className="hstack" style={{ gap: 10, padding: '12px 16px', width: '100%', border: 0, textAlign: 'left', cursor: 'pointer', background: x.id === sel ? 'var(--tint)' : 'none', borderLeft: `3px solid ${x.id === sel ? 'var(--primary)' : 'transparent'}` }}>
              {x.channel === 'Text' ? <IconMessage size={18} color="#0b6e5c" /> : <IconMail size={18} color="#0b6e5c" />}
              <span className="vstack grow" style={{ gap: 2 }}><b className="small">{x.name}</b><span className="tiny muted">{x.channel} · to {x.to.toLowerCase()}</span></span>
              {!x.on && <Tag tone="grey">Off</Tag>}
            </button>
          ))}
        </div>
      </Card>
      <Card className="grow">
        <CardHead title={t.name} sub={`Sent when: ${t.when}`} right={<span className="hstack" style={{ gap: 8 }}><span className="small t2">{t.on ? 'On' : 'Off'}</span><Switch on={t.on} onChange={v => { if (t.required) { toast('This message is needed for the platform to work'); return; } st.set('tpls', ts => ts.map(x => (x.id === t.id ? { ...x, on: v } : x))); st.log(v ? 'Turned a message on' : 'Turned a message off', t.name, 'Settings', [['Sent', v ? 'Off → On' : 'On → Off']]); toast(v ? 'Message turned on' : 'Message turned off'); }} /></span>} />
        {t.required && <div className="alert info small"><IconInfoCircle size={16} />This message is always sent. You can change the wording.</div>}
        <span className="tiny muted">{t.channel} · last changed {t.edited}</span>
        {preview ? (
          <div className="card" style={{ background: 'var(--bg)', gap: 10 }}>
            {t.channel !== 'Text' && <b>{fill(draft.subject)}</b>}
            <div className="small" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{fill(draft.body)}</div>
            <span className="tiny muted">Example using Sarah and David Smith’s job</span>
          </div>
        ) : (
          <>
            {t.channel !== 'Text' && <Field label="Email subject"><input className="input" value={draft.subject} onChange={e => setDraft({ ...draft, subject: e.target.value })} /></Field>}
            <Field label={t.channel === 'Text' ? `Text message (${draft.body.length} of 160 characters)` : 'Message'}><textarea ref={ref} className="textarea" rows={9} value={draft.body} onChange={e => setDraft({ ...draft, body: e.target.value })} /></Field>
            <Field label="Add details" hint="Click to add where your cursor is. They are filled in for each customer."><div className="hstack" style={{ gap: 6, flexWrap: 'wrap' }}>{FIELDS.filter(f => !['{code}', '{role}', '{admin}', '{link}'].includes(f) || t.to === 'Staff' || f === '{code}').map(f => <button key={f} className="chip" onClick={() => insert(f)}>{f}</button>)}</div></Field>
          </>
        )}
        <div className="hstack" style={{ gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-outline" onClick={() => setPreview(!preview)}><IconEye size={16} />{preview ? 'Edit' : 'Preview'}</button>
          <button className="btn btn-outline" onClick={() => toast(`Test sent to ${t.channel === 'Text' ? me.phone : me.email}`)}><IconSend size={16} />Send me a test</button>
          <span className="grow" />
          {dirty && <button className="btn btn-grey" onClick={() => setDraft({ subject: t.subject || '', body: t.body })}><IconArrowBackUp size={16} />Undo</button>}
          <button className="btn btn-primary" disabled={!dirty || !draft.body.trim()} onClick={save}><IconDeviceFloppy size={16} />Save template</button>
        </div>
      </Card>
    </div>
  );
}

function CustomerSees() {
  const st = useStore();
  const toast = useToast();
  const [rows, setRows] = useState(st.docvis);
  const dirty = JSON.stringify(rows) !== JSON.stringify(st.docvis);
  return (
    <Card className="flush">
      <div style={{ padding: '18px 18px 10px' }}><CardHead title="Documents in the customer portal and app" sub="Customers only ever see their own job. Staff-only papers can never be shown." right={<span className="hstack" style={{ gap: 8 }}><button className="btn btn-grey btn-sm" disabled={!dirty} onClick={() => setRows(st.docvis)}><IconArrowBackUp size={15} />Undo</button><button className="btn btn-primary btn-sm" disabled={!dirty} onClick={() => { st.log('Changed what customers see', 'Customer portal documents', 'Settings', rows.filter((r, i) => r.show !== st.docvis[i].show).map(r => [r.name, r.show ? 'Hidden → Shown' : 'Shown → Hidden'])); st.set('docvis', () => rows); toast('Saved · the customer portal and app are updated'); }}><IconDeviceFloppy size={15} />Save</button></span>} /></div>
      <table className="tbl">
        <thead><tr><th>Document</th><th>When it appears</th><th>Customers see it</th></tr></thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id}>
              <td className="b"><span className="hstack" style={{ gap: 6 }}>{r.name}{r.fixed && <IconLock size={14} color="#6b7a78" />}</span></td>
              <td className="t2">{r.when}</td>
              <td><Switch on={r.show} onChange={v => !r.fixed && setRows(rs => rs.map(x => (x.id === r.id ? { ...x, show: v } : x)))} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
