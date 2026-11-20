import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/Layout';
import { Login, Welcome } from './pages/Auth';
import Overview from './pages/Overview';
import Users, { UserDetail } from './pages/Users';
import Teams from './pages/Teams';
import Statuses from './pages/Statuses';
import Checklists from './pages/Checklists';
import Integrations, { IntegrationDetail, SyncErrors } from './pages/Integrations';
import Audit from './pages/Audit';
import Imports, { ImportDetail } from './pages/Import';
import { Security, Backups, MySettings } from './pages/Protection';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/welcome/:step" element={<Welcome />} />
      <Route element={<AppLayout />}>
        <Route path="/" element={<Overview />} />
        <Route path="/users" element={<Users />} />
        <Route path="/users/:id" element={<UserDetail />} />
        <Route path="/roles" element={<Navigate to="/teams" replace />} />
        <Route path="/teams" element={<Teams />} />
        <Route path="/statuses" element={<Statuses />} />
        <Route path="/checklists" element={<Checklists />} />
        <Route path="/integrations" element={<Integrations />} />
        <Route path="/integrations/:id" element={<IntegrationDetail />} />
        <Route path="/sync-errors" element={<SyncErrors />} />
        <Route path="/audit" element={<Audit />} />
        <Route path="/import" element={<Imports />} />
        <Route path="/import/:id" element={<ImportDetail />} />
        <Route path="/security" element={<Security />} />
        <Route path="/backups" element={<Backups />} />
        <Route path="/settings" element={<MySettings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
