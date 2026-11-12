// Shared demo state for the System Admin portal (saved in sessionStorage; "Reset demo data" in the profile menu clears it).
import React, { createContext, useContext, useEffect, useState } from 'react';
import * as D from './admin';

const fresh = () => ({
  users: D.USERS0, teams: D.TEAMS0, custs: D.CUSTS0,
  matrix: D.MATRIX0, scope: D.SCOPE0, sysData: false,
  stages: D.SALES_STAGES0, journey: D.JOURNEY0, lists: D.LISTS0, docvis: D.DOCVIS0, tpls: D.TPL0, checklists: D.CHECKLISTS0,
  integ: D.INTEG0, mailboxes: D.MAILBOXES0, calOwner: 'Jadeite', errs: D.ERRS0,
  audit: D.AUDIT0, imports: D.IMPORTS0, security: D.SECURITY0,
  backups: D.BACKUPS0, lastRestore: { when: '01 Oct', took: '2 h 10 min', ok: true }, retention: D.RETENTION0, reqs: D.REQS0,
  notifsRead: false, myPrefs: { errors: true, locked: true, backups: true, weekly: false },
});
export type State = ReturnType<typeof fresh>;
const KEY = 'jadeite-system-admin-v1';
const load = (): State => { try { const s = sessionStorage.getItem(KEY); if (s) return { ...fresh(), ...JSON.parse(s) }; } catch { /* ignore */ } return structuredClone(fresh()); };

type Ctx = State & {
  set: <K extends keyof State>(k: K, fn: (v: State[K]) => State[K]) => void;
  log: (action: string, record: string, area: string, before?: [string, string][], reason?: string) => void;
  reset: () => void;
};
const C = createContext<Ctx>(null as any);

const stamp = () => { const t = new Date(); return `Today, ${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`; };

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [st, setSt] = useState<State>(load);
  useEffect(() => { try { sessionStorage.setItem(KEY, JSON.stringify(st)); } catch { /* ignore */ } }, [st]);
  const set: Ctx['set'] = (k, fn) => setSt(s => ({ ...s, [k]: fn(s[k]) }));
  const log: Ctx['log'] = (action, record, area, before, reason) =>
    setSt(s => ({ ...s, audit: [{ id: 'a' + Date.now() + Math.random().toString(36).slice(2, 5), when: stamp(), day: 0, who: D.me.name, action, record, area, source: 'System Admin', before, reason }, ...s.audit] }));
  const reset = () => setSt(structuredClone(fresh()));
  return <C.Provider value={{ ...st, set, log, reset }}>{children}</C.Provider>;
}
export const useStore = () => useContext(C);
export const userById = (users: D.User[], id?: string) => users.find(u => u.id === id);
