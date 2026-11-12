// Checklists: the checks used by surveyors, fitters and customers (add, rename, reorder, make required, remove, extra rules). Saved changes reach the phones next time the app opens.
import React, { useState } from 'react';
import { IconArrowUp, IconArrowDown, IconX, IconPlus, IconDeviceFloppy, IconArrowBackUp, IconInfoCircle, IconDeviceMobile } from '@tabler/icons-react';
import { PageHead, Card, CardHead, Switch, Tag, useToast } from '../components/ui';
import { useStore } from '../data/store';
import { Checklist } from '../data/admin';

export default function Checklists() {
  const st = useStore();
  const [sel, setSel] = useState(st.checklists[0].id);
  const c = st.checklists.find(x => x.id === sel)!;
  return (
    <>
      <PageHead title="Checklists" crumbs={[{ label: 'Overview', to: '/' }, { label: 'Checklists' }]} />
      <div className="alert info"><IconInfoCircle size={18} />These are the agreed checks. Changes reach the phone apps and portals the next time they are opened. Jobs already started keep the checks they began with.</div>
      <div className="row">
        <Card className="flush" style={{ width: 340, flex: '0 0 340px' }}>
          <div className="list">
            {st.checklists.map(x => (
              <button key={x.id} onClick={() => setSel(x.id)} className="vstack" style={{ gap: 2, padding: '12px 16px', width: '100%', border: 0, textAlign: 'left', cursor: 'pointer', background: x.id === sel ? 'var(--tint)' : 'none', borderLeft: `3px solid ${x.id === sel ? 'var(--primary)' : 'transparent'}` }}>
                <b className="small">{x.name}</b><span className="tiny muted">{x.app} · {x.items.length} items</span>
              </button>
            ))}
          </div>
        </Card>
        <Editor key={c.id} c={c} />
      </div>
    </>
  );
}

function Editor({ c }: { c: Checklist }) {
  const st = useStore();
  const toast = useToast();
  const [d, setD] = useState(c);
  const [nw, setNw] = useState('');
  const dirty = JSON.stringify(d) !== JSON.stringify(c);
  const items = d.items;
  const setItems = (fn: (x: typeof items) => typeof items) => setD(v => ({ ...v, items: fn(v.items) }));
  const move = (i: number, by: number) => setItems(xs => { const n = [...xs]; [n[i], n[i + by]] = [n[i + by], n[i]]; return n; });
  const add = () => { if (!nw.trim()) return; setItems(xs => [...xs, { id: 'x' + Date.now(), text: nw.trim(), required: c.items[0]?.required ?? true }]); setNw(''); };
  const save = () => {
    const before: [string, string][] = [];
    if (d.items.length !== c.items.length) before.push(['Number of checks', `${c.items.length} → ${d.items.length}`]);
    d.items.forEach(x => { const o = c.items.find(y => y.id === x.id); if (!o) before.push(['Added', x.text]); else { if (o.text !== x.text) before.push(['Renamed', `${o.text} → ${x.text}`]); if (o.required !== x.required) before.push([x.text, o.required ? 'Required → Optional' : 'Optional → Required']); } });
    c.items.forEach(o => { if (!d.items.some(x => x.id === o.id)) before.push(['Removed', o.text]); });
    (d.extra || []).forEach((e, i) => { if (e.value !== c.extra![i].value) before.push([e.label, `${c.extra![i].value} → ${e.value}`]); });
    st.set('checklists', cs => cs.map(x => (x.id === c.id ? d : x))); st.log('Changed a checklist', c.name, 'Settings', before.length ? before : [['Order', 'Changed']]); toast('Checklist saved');
  };
  const showReq = c.who !== 'Customer' && !['problem', 'notfixed'].includes(c.id);
  return (
    <Card className="grow">
      <CardHead title={c.name} sub={`Used in: ${c.app} · by the ${c.who.toLowerCase()}`} right={<span className="hstack" style={{ gap: 8 }}><button className="btn btn-grey btn-sm" disabled={!dirty} onClick={() => setD(c)}><IconArrowBackUp size={15} />Undo</button><button className="btn btn-primary btn-sm" disabled={!dirty || items.some(x => !x.text.trim()) || !items.length} onClick={save}><IconDeviceFloppy size={15} />Save</button></span>} />
      <div className="list">
        {items.map((x, i) => (
          <div key={x.id} className="hstack" style={{ gap: 8, padding: '8px 0' }}>
            <span className="tiny muted" style={{ width: 20, textAlign: 'right' }}>{i + 1}</span>
            <input className="input" aria-label={`Check ${i + 1}`} value={x.text} onChange={e => setItems(xs => xs.map(y => (y.id === x.id ? { ...y, text: e.target.value } : y)))} />
            {showReq && <span className="hstack small t2" style={{ gap: 6, whiteSpace: 'nowrap' }}><Switch on={x.required} onChange={v => setItems(xs => xs.map(y => (y.id === x.id ? { ...y, required: v } : y)))} />Required</span>}
            <button className="icon-btn" aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)}><IconArrowUp size={16} /></button>
            <button className="icon-btn" aria-label="Move down" disabled={i === items.length - 1} onClick={() => move(i, 1)}><IconArrowDown size={16} /></button>
            <button className="icon-btn" aria-label={`Remove ${x.text}`} onClick={() => setItems(xs => xs.filter(y => y.id !== x.id))}><IconX size={16} /></button>
          </div>
        ))}
      </div>
      <span className="hstack" style={{ gap: 6 }}>
        <input className="input" placeholder="Add a check…" value={nw} onChange={e => setNw(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} />
        <button className="btn btn-outline" disabled={!nw.trim()} onClick={add}><IconPlus size={15} />Add</button>
      </span>
      {d.extra && (
        <>
          <div className="divider" />
          <b className="small">Rules</b>
          {d.extra.map((e, i) => (
            <div key={e.label} className="between" style={{ gap: 12 }}>
              <span className="small">{e.label}</span>
              <select className="select" aria-label={e.label} style={{ width: 230 }} value={e.value} onChange={ev => setD(v => ({ ...v, extra: v.extra!.map((x, j) => (j === i ? { ...x, value: ev.target.value } : x)) }))}>{e.options.map(o => <option key={o}>{o}</option>)}</select>
            </div>
          ))}
        </>
      )}
      <div className="divider" />
      <span className="hstack small t2" style={{ gap: 8 }}><IconDeviceMobile size={16} />How it looks on the phone</span>
      <div className="vstack" style={{ gap: 6, maxWidth: 380, padding: 14, borderRadius: 16, background: 'var(--bg)' }}>
        {items.slice(0, 5).map(x => <span key={x.id} className="hstack small" style={{ gap: 10, padding: '8px 10px', background: '#fff', borderRadius: 10, border: '1px solid var(--border)' }}><span style={{ width: 18, height: 18, borderRadius: 5, border: '1.5px solid var(--border-input)', flex: '0 0 auto' }} />{x.text}{showReq && x.required && <span style={{ marginLeft: 'auto' }}><Tag tone="grey">Required</Tag></span>}</span>)}
        {items.length > 5 && <span className="tiny muted">+ {items.length - 5} more</span>}
      </div>
    </Card>
  );
}
