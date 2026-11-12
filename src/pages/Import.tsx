// Data import (moving data in from the old system): upload → match columns → check duplicates → trial import → client approval → import, with an error report.
import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { IconPlus, IconUpload, IconFileSpreadsheet, IconChevronRight, IconCheck, IconDownload, IconAlertTriangle, IconCircleCheck, IconArrowRight, IconInfoCircle, IconDatabaseImport, IconX } from '@tabler/icons-react';
import { PageHead, Card, CardHead, Tag, Field, Check, Empty, Modal, useToast } from '../components/ui';
import { useStore } from '../data/store';
import { IMPORT_STEPS, COLUMNS, IMPORT_ERRORS, Import } from '../data/admin';

const tone = (i: Import) => (i.step >= 6 && i.done ? 'ok' : i.step === 4 ? 'warn' : 'jade');
const label = (i: Import) => (i.step >= 6 && i.done ? 'Imported' : i.step === 4 ? 'Waiting for approval' : IMPORT_STEPS[i.step]);

export default function Imports() {
  const st = useStore();
  const nav = useNavigate();
  const toast = useToast();
  const [nw, setNw] = useState(false);
  const [name, setName] = useState('');
  const [file, setFile] = useState('');
  const start = () => {
    const id = 'IM-' + String(st.imports.length + 1).padStart(2, '0');
    st.set('imports', xs => [{ id, name: name.trim(), file, rows: 342, step: 1, by: 'Tom Fletcher', started: '16 Oct', ok: 0, dupes: 0, errors: 0 }, ...xs]);
    st.log('Started a data import', `${id} · ${name.trim()}`, 'Settings'); toast('File uploaded · 342 rows found'); setNw(false); nav(`/import/${id}`);
  };
  return (
    <>
      <PageHead title="Data import" crumbs={[{ label: 'Overview', to: '/' }, { label: 'Data import' }]} actions={<button className="btn btn-primary" onClick={() => { setName(''); setFile(''); setNw(true); }}><IconPlus size={16} />New import</button>} />
      <div className="alert info"><IconInfoCircle size={18} />Bring customers and active jobs in from the old system. Every import is tried on a copy first and only goes live once the client has approved it.</div>
      <div className="card flush">
        <table className="tbl">
          <thead><tr><th>Import</th><th>File</th><th>Rows</th><th>Started</th><th>Step</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {st.imports.map(i => (
              <tr key={i.id} className="click" onClick={() => nav(`/import/${i.id}`)}>
                <td><div className="vstack" style={{ gap: 2 }}><b>{i.name}</b><span className="tiny muted">{i.id} · by {i.by}</span></div></td>
                <td className="t2"><span className="hstack" style={{ gap: 6 }}><IconFileSpreadsheet size={16} />{i.file}</span></td>
                <td className="t2">{i.rows.toLocaleString()}</td><td className="t2">{i.started}</td>
                <td className="t2">{Math.min(i.step + 1, 6)} of 6</td>
                <td><Tag tone={tone(i)}>{label(i)}</Tag></td>
                <td><IconChevronRight size={16} color="#6b7a78" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {nw && (
        <Modal title="New import" sub="Step 1 of 6 · upload the file" onClose={() => setNw(false)} width={560}
          footer={<><button className="btn btn-grey" onClick={() => setNw(false)}>Cancel</button><button className="btn btn-primary" disabled={!name.trim() || !file} onClick={start}>Upload and continue<IconArrowRight size={16} /></button></>}>
          <Field label="What is in the file?"><input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="For example: Closed jobs 2024–2025" /></Field>
          <button type="button" className="doc-row" style={{ flexDirection: 'column', gap: 8, padding: 28, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center' }} onClick={() => setFile('closed-jobs-2024-2025.xlsx')}>
            {file ? <><IconFileSpreadsheet size={28} color="#0b6e5c" /><b className="small">{file}</b><span className="tiny muted">342 rows · click to choose another</span></> : <><IconUpload size={28} color="#0b6e5c" /><b className="small">Choose a file</b><span className="tiny muted">Excel or CSV, up to 20MB</span></>}
          </button>
        </Modal>
      )}
    </>
  );
}

export function ImportDetail() {
  const { id } = useParams();
  const st = useStore();
  const toast = useToast();
  const nav = useNavigate();
  const i = st.imports.find(x => x.id === id);
  const [map, setMap] = useState<Record<string, string>>(Object.fromEntries(COLUMNS.map(([a, b]) => [a, b])));
  const [dupe, setDupe] = useState('merge');
  const [busy, setBusy] = useState(false);
  const [appr, setAppr] = useState({ by: 'James Whitfield', ok: false });
  const [cancel, setCancel] = useState(false);
  if (!i) return <Empty icon={<IconDatabaseImport size={22} />} title="Import not found" action={<Link to="/import" className="btn btn-primary btn-sm">Back</Link>} />;
  const upd = (p: Partial<Import>) => st.set('imports', xs => xs.map(x => (x.id === i.id ? { ...x, ...p } : x)));
  const done = i.step >= 6 && !!i.done;
  const report = () => {
    const csv = ['Row,Problem,Customer', ...IMPORT_ERRORS.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
    try { const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); const l = document.createElement('a'); l.href = url; l.download = `${i.id}-error-report.csv`; document.body.appendChild(l); l.click(); l.remove(); } catch { /* ignore */ }
    toast('Error report downloaded');
  };
  const next = () => {
    if (i.step === 1) { upd({ step: 2 }); st.log('Matched import columns', i.id, 'Settings'); }
    else if (i.step === 2) { upd({ step: 3, dupes: 9 }); st.log('Chose how to handle duplicates', i.id, 'Settings', [['Duplicates', dupe === 'merge' ? 'Add to the existing customer' : 'Skip them']]); }
    else if (i.step === 3) { setBusy(true); setTimeout(() => { setBusy(false); upd({ step: 4, ok: i.rows - 7, errors: 4, dupes: 9 }); st.log('Ran a trial import', i.id, 'Settings'); toast('Trial import finished'); }, 1300); }
    else if (i.step === 4) { upd({ step: 5, approvedBy: appr.by }); st.log('Recorded client approval for an import', i.id, 'Settings', [['Approved by', appr.by]]); toast('Approval recorded'); }
    else if (i.step === 5) { setBusy(true); setTimeout(() => { setBusy(false); upd({ step: 6, done: '16 Oct' }); st.log('Imported data into the live platform', `${i.id} · ${i.ok.toLocaleString()} rows`, 'Settings'); toast(`${i.ok.toLocaleString()} rows imported`); }, 1500); }
  };
  const nextLabel = ['', 'Save column matches', 'Save and check duplicates', 'Run the trial import', 'Record approval', 'Import into the live platform'][i.step];
  return (
    <>
      <PageHead title={i.name} crumbs={[{ label: 'Overview', to: '/' }, { label: 'Data import', to: '/import' }, { label: i.id }]}
        actions={!done ? <button className="btn btn-grey" onClick={() => setCancel(true)}><IconX size={16} />Cancel import</button> : <button className="btn btn-grey" onClick={report} disabled={!i.errors}><IconDownload size={16} />Error report</button>} />
      <Card>
        <div className="hstack" style={{ gap: 8 }}>
          {IMPORT_STEPS.map((s, k) => {
            const isDone = k < i.step || done; const now = k === i.step && !done;
            return (
              <React.Fragment key={s}>
                <span className="hstack" style={{ gap: 8, flex: '0 0 auto' }}>
                  <span className="tile" style={{ width: 28, height: 28, borderRadius: 14, background: isDone ? 'var(--ok)' : now ? 'var(--primary)' : 'var(--grey-btn)', color: isDone ? '#fff' : now ? 'var(--deep)' : 'var(--muted)', fontSize: 12, fontWeight: 700 }}>{isDone ? <IconCheck size={14} stroke={3} /> : k + 1}</span>
                  <span className="small" style={{ fontWeight: now ? 700 : 500, color: isDone || now ? 'var(--text)' : 'var(--muted)' }}>{s}</span>
                </span>
                {k < 5 && <span style={{ flex: 1, height: 2, borderRadius: 1, background: isDone ? 'var(--ok)' : 'var(--border)' }} />}
              </React.Fragment>
            );
          })}
        </div>
      </Card>
      <div className="row">
        <div className="col grow">
          {done && <Card style={{ alignItems: 'center', textAlign: 'center', padding: 32 }}><IconCircleCheck size={44} color="#1f9d5b" /><b style={{ fontSize: 18 }}>{i.ok.toLocaleString()} rows imported on {i.done}</b><span className="t2">Approved by {i.approvedBy}. {i.errors ? `${i.errors} rows had problems and were left out (see the error report).` : 'No problems.'}</span></Card>}
          {!done && i.step === 1 && (
            <Card className="flush">
              <div style={{ padding: '18px 18px 8px' }}><CardHead title="Match the columns" sub="Tell us where each column from the old file goes" /></div>
              <table className="tbl"><thead><tr><th>Column in the file</th><th>Example</th><th>Goes into</th></tr></thead><tbody>
                {COLUMNS.map(([a]) => <tr key={a}><td className="b">{a}</td><td className="t2">{{ 'Cust Name': 'Mrs J Allen', Addr1: '22 Hill Rise', 'Post Code': 'LE3 9QT', Tel: '0116 496 0101', 'Email Addr': 'j.allen@mail.com', 'Job Ref': 'OLD-2231', Product: 'Windows', Status: 'Ordered', Salesman: 'Mike', Notes: 'Gate code 1234' }[a]}</td>
                  <td><select className="select" aria-label={`${a} goes into`} value={map[a]} onChange={e => setMap({ ...map, [a]: e.target.value })} style={{ width: 220 }}>{[...COLUMNS.map(c => c[1]), 'Leave out'].map(o => <option key={o}>{o}</option>)}</select></td></tr>)}
              </tbody></table>
            </Card>
          )}
          {!done && i.step === 2 && (
            <Card>
              <CardHead title="Check for duplicates" sub="We look for customers already in Jadeite with the same email, phone or address" />
              {[['merge', 'Add to the existing customer', 'Keeps one record per customer (recommended)'], ['skip', 'Skip them', 'Leave the row out and list it in the error report']].map(([v, t, s]) => (
                <label key={v} className="hstack" style={{ gap: 10, padding: 12, border: `1px solid ${dupe === v ? 'var(--primary)' : 'var(--border)'}`, borderRadius: 10, cursor: 'pointer', background: dupe === v ? 'var(--tint)' : '#fff' }}>
                  <input type="radio" name="dupe" checked={dupe === v} onChange={() => setDupe(v)} style={{ accentColor: '#00c7a1' }} /><span className="vstack" style={{ gap: 1 }}><b className="small">{t}</b><span className="tiny muted">{s}</span></span>
                </label>
              ))}
            </Card>
          )}
          {!done && i.step === 3 && (
            <Card>
              <CardHead title="Trial import" sub="We import into a copy of the platform so nothing live changes" />
              <div className="vstack small t2" style={{ gap: 6 }}><span>• {i.rows.toLocaleString()} rows</span><span>• Duplicates: {dupe === 'merge' ? 'added to the existing customer' : 'skipped'}</span><span>• Live customers and jobs are not touched</span></div>
              {busy && <div className="alert info small"><span className="spin" />Running the trial import…</div>}
            </Card>
          )}
          {!done && i.step >= 4 && (
            <Card>
              <CardHead title="Trial import results" right={<button className="btn btn-outline btn-sm" onClick={report} disabled={!i.errors}><IconDownload size={15} />Error report</button>} />
              <div className="grid-3">
                {[['Ready', i.ok, '#1f9d5b'], ['Duplicates found', i.dupes, '#0b6e5c'], ['Problems', i.errors, '#e0a100']].map(([l, n, c]) => <div key={l as string} className="card" style={{ padding: 14, gap: 2, background: 'var(--bg)' }}><b style={{ fontSize: 22, color: c as string }}>{(n as number).toLocaleString()}</b><span className="small t2">{l}</span></div>)}
              </div>
              <table className="tbl" style={{ border: '1px solid var(--border)', borderRadius: 10 }}><thead><tr><th>Row</th><th>Problem</th><th>Customer</th></tr></thead><tbody>{IMPORT_ERRORS.map(r => <tr key={r[0]}><td className="b">{r[0]}</td><td>{r[1]}</td><td className="t2">{r[2]}</td></tr>)}</tbody></table>
              <span className="tiny muted">Rows with problems are left out. Fix them in the file and import them later.</span>
            </Card>
          )}
          {!done && i.step === 4 && (
            <Card>
              <CardHead title="Client approval" sub="Someone from Jadeite Glazing checks the trial before anything goes live" />
              <Field label="Approved by"><select className="select" value={appr.by} onChange={e => setAppr({ ...appr, by: e.target.value })}>{st.users.filter(u => u.role === 'Director' || u.role === 'Office Admin').filter(u => u.status === 'Active').map(u => <option key={u.id}>{u.name}</option>)}</select></Field>
              <Check on={appr.ok} onChange={v => setAppr({ ...appr, ok: v })} label="They have checked the trial results and the error report" />
            </Card>
          )}
          {!done && i.step === 5 && (
            <Card>
              <CardHead title="Import into the live platform" sub={`Approved by ${i.approvedBy}`} />
              <div className="alert warn small"><IconAlertTriangle size={16} />{i.ok.toLocaleString()} rows will be added. A backup is made first, so it can be undone if needed.</div>
              {busy && <div className="alert info small"><span className="spin" />Importing…</div>}
            </Card>
          )}
          {!done && <span className="hstack" style={{ gap: 8 }}><button className="btn btn-primary" disabled={busy || (i.step === 4 && !appr.ok)} onClick={next}>{busy ? <><span className="spin" />Working…</> : <>{nextLabel}<IconArrowRight size={16} /></>}</button></span>}
        </div>
        <div className="col" style={{ width: 320, flex: '0 0 320px' }}>
          <Card>
            <CardHead title="About this import" />
            {[['File', i.file], ['Rows', i.rows.toLocaleString()], ['Started', `${i.started} by ${i.by}`], ['Approved by', i.approvedBy || '—']].map(([k, v]) => <div key={k} className="vstack" style={{ gap: 2 }}><span className="tiny muted">{k}</span><b className="small">{v}</b></div>)}
          </Card>
          <Card style={{ background: 'var(--tint)', borderColor: '#cfeee4' }}><span className="small t2" style={{ lineHeight: 1.5 }}>Old emails and very old records are not brought in. Ask before importing anything that is not customers, jobs, people or suppliers.</span></Card>
        </div>
      </div>
      {cancel && (
        <Modal title="Cancel this import?" onClose={() => setCancel(false)} width={460}
          footer={<><button className="btn btn-grey" onClick={() => setCancel(false)}>Keep it</button><button className="btn btn-danger" onClick={() => { st.set('imports', xs => xs.filter(x => x.id !== i.id)); st.log('Cancelled a data import', i.id, 'Settings'); toast('Import cancelled'); nav('/import'); }}>Cancel import</button></>}>
          <span className="t2">Nothing has been added to the live platform. The trial copy is deleted.</span>
        </Modal>
      )}
    </>
  );
}
