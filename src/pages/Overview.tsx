// Overview: what needs the system admin, integration health, sign-in safety, backups and the latest changes.
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IconUsers, IconAlertTriangle, IconLock, IconActivity, IconArrowRight, IconCircleCheck, IconShieldCheck, IconDatabase, IconChevronRight, IconPlugConnected, IconHistory } from '@tabler/icons-react';
import { Card, CardHead, Stat, Tag, Tile, Avatar, Progress } from '../components/ui';
import { useStore } from '../data/store';
import { useAlerts } from '../components/Layout';
import { IMG, HEALTH, ROLE_INFO, TEAMS, me } from '../data/admin';

export function IntegLogo({ logo, color, size = 40 }: { logo: string; color: string; size?: number }) {
  return <span className="tile" style={{ width: size, height: size, borderRadius: 10, background: color, color: '#fff', fontWeight: 700, fontSize: size * 0.34 }}>{logo}</span>;
}

export default function Overview() {
  const st = useStore();
  const a = useAlerts();
  const nav = useNavigate();
  const active = st.users.filter(u => u.status === 'Active');
  const mfaPct = Math.round((active.filter(u => u.mfa === 'On').length / active.length) * 100);
  const hr = new Date().getHours();
  return (
    <>
      <div className="banner" style={{ minHeight: 150 }}>
        <div className="photo" style={{ backgroundImage: `url(${IMG.house})` }} />
        <div className="vstack" style={{ gap: 8, maxWidth: 560 }}>
          <span className="small" style={{ color: '#bfe9dc', fontWeight: 600 }}>{hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening'}, {me.name.split(' ')[0]}</span>
          <h1 style={{ fontSize: 26, letterSpacing: -0.4 }}>{a.list.length ? `${a.errs.length + a.locked.length + a.custLocked.length} things need you today` : 'Everything is running smoothly'}</h1>
          <span style={{ color: '#d3e3de' }}>{a.errs.length} sync error{a.errs.length === 1 ? '' : 's'} · {a.locked.length + a.custLocked.length} {a.locked.length + a.custLocked.length === 1 ? 'person' : 'people'} locked out · platform up {HEALTH.uptime} this month</span>
          <div className="hstack" style={{ gap: 10, marginTop: 6 }}>
            <Link to="/sync-errors" className="btn btn-primary">Fix sync errors<IconArrowRight size={16} /></Link>
            <Link to="/users" className="btn" style={{ background: 'rgba(255,255,255,.12)', color: '#fff' }}>Manage users</Link>
          </div>
        </div>
      </div>

      <div className="grid-4">
        <Link to="/users"><Stat icon={<IconUsers size={24} />} color="#0b6e5c" value={active.length} label="Active users" foot={[['Invited', String(a.invited.length)], ['Off', String(st.users.filter(u => u.status === 'Deactivated').length)]]} /></Link>
        <Link to="/users?status=Locked"><Stat icon={<IconLock size={24} />} color="#e0a100" value={a.locked.length + a.custLocked.length} label="Locked out" foot={[['Staff', String(a.locked.length)], ['Customers', String(a.custLocked.length)]]} /></Link>
        <Link to="/sync-errors"><Stat icon={<IconAlertTriangle size={24} />} color="#d64545" value={a.errs.length} label="Sync errors to fix" foot={[['Fixed this week', String(st.errs.filter(e => e.status === 'Fixed' || e.status === 'Ignored').length)]]} /></Link>
        <Stat icon={<IconActivity size={24} />} color="#1f9d5b" value={HEALTH.uptime} label="Up this month" foot={[['Target', HEALTH.target], ['Speed', HEALTH.speed]]} />
      </div>

      <div className="row">
        <div className="col grow">
          <Card className="flush">
            <div style={{ padding: '18px 18px 6px' }}><CardHead title="Needs your attention" sub={`${a.list.length} item${a.list.length === 1 ? '' : 's'}`} /></div>
            {a.list.length === 0 ? <div className="hstack small t2" style={{ gap: 10, padding: '0 18px 18px' }}><IconCircleCheck size={18} color="#1f9d5b" />Nothing needs you right now.</div> : (
              <div className="list">
                {a.list.map((n, i) => (
                  <button key={i} className="hstack" onClick={() => nav(n.to)} style={{ gap: 12, padding: '12px 18px', width: '100%', border: 0, background: 'none', textAlign: 'left', cursor: 'pointer' }}>
                    <Tile icon={<n.icon size={18} />} color={n.tone} size={38} radius={19} />
                    <span className="vstack" style={{ gap: 2, flex: 1 }}><b style={{ fontSize: 13.5 }}>{n.t}</b><span className="small muted">{n.s}</span></span>
                    <IconChevronRight size={16} color="#6b7a78" />
                  </button>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <CardHead title="Integrations" right={<Link to="/integrations" className="link">Open<IconArrowRight size={14} /></Link>} />
            <div className="grid-3">
              {st.integ.map(g => {
                const n = st.errs.filter(e => e.integ === g.id && e.status === 'Needs attention').length;
                return (
                  <Link key={g.id} to={`/integrations/${g.id}`} className="doc-row" style={{ alignItems: 'flex-start', flexDirection: 'column', gap: 10 }}>
                    <span className="hstack" style={{ gap: 10 }}><IntegLogo logo={g.logo} color={g.color} size={36} /><b className="small">{g.name}</b></span>
                    <Tag tone={g.status === 'Connected' && !n ? 'ok' : g.status === 'Not connected' ? 'err' : 'warn'}>{g.status === 'Connected' && n ? `${n} error${n > 1 ? 's' : ''}` : g.status}</Tag>
                    <span className="tiny muted">Last sync {g.last} · {g.today} today</span>
                  </Link>
                );
              })}
            </div>
          </Card>

          <Card>
            <CardHead title="Latest changes" sub="From every portal and phone app" right={<Link to="/audit" className="link">Audit history<IconArrowRight size={14} /></Link>} />
            <div className="timeline">
              {st.audit.slice(0, 6).map(x => (
                <Link key={x.id} to={`/audit?id=${x.id}`} className="tl-item"><Tile icon={<IconHistory size={15} />} size={30} radius={15} /><span className="vstack" style={{ gap: 2, paddingTop: 4 }}><b style={{ fontSize: 13 }}>{x.who} · {x.action}</b><span className="tiny muted">{x.record} · {x.source} · {x.when}</span></span></Link>
              ))}
            </div>
          </Card>
        </div>

        <div className="col" style={{ width: 360, flex: '0 0 360px' }}>
          <Card>
            <CardHead title="Two-step sign-in" right={<Link to="/security" className="link">Settings</Link>} />
            <div className="between"><span className="small t2">Staff with it switched on</span><b>{mfaPct}%</b></div>
            <Progress value={mfaPct} color={mfaPct === 100 ? '#1f9d5b' : '#e0a100'} height={8} />
            {a.noMfa.map(u => <Link key={u.id} to={`/users/${u.id}`} className="hstack small" style={{ gap: 10 }}><Avatar i={u.initials} size={30} /><span className="grow">{u.name} has not set it up</span><IconChevronRight size={15} color="#6b7a78" /></Link>)}
          </Card>
          <Card>
            <CardHead title="Backups" right={<Link to="/backups" className="link">Open</Link>} />
            <div className="hstack" style={{ gap: 12 }}><Tile icon={<IconDatabase size={20} />} color="#1f9d5b" /><span className="vstack" style={{ gap: 2 }}><b className="small">Last backup {st.backups[0].when.toLowerCase()}</b><span className="tiny muted">Every hour · kept for 35 days</span></span></div>
            <div className="hstack" style={{ gap: 12 }}><Tile icon={<IconShieldCheck size={20} />} color="#1f9d5b" /><span className="vstack" style={{ gap: 2 }}><b className="small">Restore tested {st.lastRestore.when}</b><span className="tiny muted">{st.lastRestore.ok ? 'Passed' : 'Failed'} · took {st.lastRestore.took} (target 4 hours)</span></span></div>
          </Card>
          <Card>
            <CardHead title="People in each team" right={<Link to="/teams" className="link">Teams</Link>} />
            {TEAMS.map(({ role: r, name }) => { const n = active.filter(u => u.role === r).length; return (
              <Link key={r} to={`/teams#team-${r.replace(' ', '-')}`} className="vstack" style={{ gap: 4 }}><span className="between small"><span>{name}</span><b>{n}</b></span><Progress value={(n / active.length) * 100} color={ROLE_INFO[r].color} /></Link>
            ); })}
          </Card>
          <Card style={{ background: 'var(--tint)', borderColor: '#cfeee4' }}>
            <span className="hstack" style={{ gap: 10 }}><IconPlugConnected size={18} color="#0b6e5c" /><b>Platform</b></span>
            <span className="small t2">Version {HEALTH.appVersion} · pages load in {HEALTH.speed} ({HEALTH.speedTarget}) · {st.users.length} accounts</span>
          </Card>
        </div>
      </div>
    </>
  );
}
