// Audit history: every important change across the platform — who, when, where from, what it was before and after, and why. Search, filter, open, export.
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { IconSearch, IconDownload, IconHistory, IconChevronRight } from '@tabler/icons-react';
import { PageHead, Tag, Drawer, Empty, Avatar, useToast } from '../components/ui';
import { useStore } from '../data/store';

const AREAS = ['All', 'Users', 'Sign-in', 'Settings', 'Integrations', 'Jobs', 'Customers'];
const SOURCES = ['All', 'System Admin', 'Office Admin', 'Sales portal', 'Director', 'Installer app', 'Phone app', 'Customer portal', 'Xero', 'Outlook', 'Framepoint'];
const ini = (n: string) => n.split(/[ &]+/).filter(Boolean).map(p => p[0]).join('').slice(0, 2).toUpperCase();

export default function Audit() {
  const st = useStore();
  const toast = useToast();
  const [sp, setSp] = useSearchParams();
  const [q, setQ] = useState(sp.get('q') || '');
  const [area, setArea] = useState('All');
  const [src, setSrc] = useState('All');
  const [days, setDays] = useState('30');
  const rows = st.audit.filter(a => (area === 'All' || a.area === area) && (src === 'All' || a.source === src) && a.day <= +days && (a.who + a.action + a.record + (a.reason || '')).toLowerCase().includes(q.toLowerCase()));
  const open = st.audit.find(a => a.id === sp.get('id'));
  const exportCsv = () => {
    const csv = ['When,Who,What,Record,Area,Source,Reason', ...rows.map(a => [a.when, a.who, a.action, a.record, a.area, a.source, a.reason || ''].map(v => `"${v.replace(/"/g, '""')}"`).join(','))].join('\n');
    try { const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); const l = document.createElement('a'); l.href = url; l.download = 'jadeite-audit-history.csv'; document.body.appendChild(l); l.click(); l.remove(); } catch { /* ignore */ }
    st.log('Exported the audit history', `${rows.length} rows`, 'Settings'); toast(`${rows.length} rows exported to CSV`);
  };
  return (
    <>
      <PageHead title="Audit history" crumbs={[{ label: 'Overview', to: '/' }, { label: 'Audit history' }]} actions={<button className="btn btn-grey" onClick={exportCsv}><IconDownload size={16} />Export CSV</button>} />
      <div className="card flush">
        <div className="toolbar">
          <div className="input-icon" style={{ width: 280 }}><IconSearch size={16} /><input className="input" style={{ height: 36 }} placeholder="Search person, change or record" value={q} onChange={e => setQ(e.target.value)} /></div>
          <select className="select" aria-label="Area" style={{ width: 150, height: 36 }} value={area} onChange={e => setArea(e.target.value)}>{AREAS.map(a => <option key={a} value={a}>{a === 'All' ? 'All areas' : a}</option>)}</select>
          <select className="select" aria-label="Where from" style={{ width: 170, height: 36 }} value={src} onChange={e => setSrc(e.target.value)}>{SOURCES.map(a => <option key={a} value={a}>{a === 'All' ? 'From anywhere' : a}</option>)}</select>
          <select className="select" aria-label="When" style={{ width: 150, height: 36 }} value={days} onChange={e => setDays(e.target.value)}><option value="0">Today</option><option value="7">Last 7 days</option><option value="30">Last 30 days</option></select>
          <span className="small muted" style={{ marginLeft: 'auto' }}>{rows.length} change{rows.length === 1 ? '' : 's'}</span>
        </div>
        <table className="tbl">
          <thead><tr><th>When</th><th>Who</th><th>What changed</th><th>Record</th><th>Where from</th><th>Area</th><th></th></tr></thead>
          <tbody>
            {rows.map(a => (
              <tr key={a.id} className="click" onClick={() => setSp({ id: a.id }, { replace: true })}>
                <td className="t2" style={{ whiteSpace: 'nowrap' }}>{a.when}</td>
                <td><span className="hstack" style={{ gap: 8 }}><Avatar i={ini(a.who)} size={28} />{a.who}</span></td>
                <td><div className="vstack" style={{ gap: 2 }}><b>{a.action}</b>{a.reason && <span className="tiny muted">Reason: {a.reason}</span>}</div></td>
                <td className="t2">{a.record}</td>
                <td><Tag tone="grey">{a.source}</Tag></td>
                <td className="t2">{a.area}</td>
                <td><IconChevronRight size={16} color="#6b7a78" /></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={7}><Empty icon={<IconHistory size={22} />} title="No changes found" sub="Try another search or a longer time." /></td></tr>}
          </tbody>
        </table>
      </div>
      {open && (
        <Drawer title={open.action} sub={`${open.when} · ${open.who}`} onClose={() => setSp({}, { replace: true })} width={520} footer={<button className="btn btn-grey" onClick={() => setSp({}, { replace: true })}>Close</button>}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {[['Who', open.who], ['When', open.when], ['Where from', open.source], ['Area', open.area], ['Record', open.record], ['Reason', open.reason || '—']].map(([k, v]) => <div key={k} className="vstack" style={{ gap: 2 }}><span className="tiny muted">{k}</span><b className="small">{v}</b></div>)}
          </div>
          <b className="small">Before and after</b>
          {open.before?.length ? (
            <table className="tbl" style={{ border: '1px solid var(--border)', borderRadius: 10 }}>
              <thead><tr><th>What</th><th>Before</th><th>After</th></tr></thead>
              <tbody>{open.before.map(([k, v], i) => { const [b, af] = v.includes(' → ') ? v.split(' → ') : ['—', v]; return <tr key={i}><td className="b">{k}</td><td className="t2" style={{ textDecoration: 'line-through' }}>{b}</td><td style={{ color: 'var(--primary-dark)', fontWeight: 600 }}>{af}</td></tr>; })}</tbody>
            </table>
          ) : <span className="small muted">Nothing was changed on a record, this is a note of what happened.</span>}
          <span className="tiny muted">Audit entries cannot be edited or deleted.</span>
        </Drawer>
      )}
    </>
  );
}
