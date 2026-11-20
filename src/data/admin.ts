// Sample data for the Jadeite Systems · System Admin portal.
// Same people, customers and jobs as the Office Admin, Sales, Surveyor, Installer and Customer apps. All invented for the demo.

export const TODAY = '2026-10-16'; // Friday 16 October 2026
export const IMG = { house: 'images/house.jpg', door: 'images/door.jpg', bifold: 'images/bifold.jpg', orangery: 'images/orangery.jpg', window: 'images/window.jpg', roof: 'images/roof.jpg' };
export const me = { id: 'tf', name: 'Tom Fletcher', initials: 'TF', role: 'System Admin', email: 'tom.fletcher@jadeiteglazing.co.uk', phone: '07700 900 010' };

/* ---------- Roles ---------- */
export const ROLES = ['Director', 'Office Admin', 'Sales', 'Surveyor', 'Installer', 'System Admin'] as const;
export type Role = typeof ROLES[number];
export const ROLE_INFO: Record<Role, { apps: string; about: string; color: string }> = {
  Director: { apps: 'Web', about: 'Sees the whole business, reports and approves overrides', color: '#0b1f1b' },
  'Office Admin': { apps: 'Web', about: 'Runs enquiries, jobs, the diary and customers', color: '#0b6e5c' },
  Sales: { apps: 'Web and phone app', about: 'Their own customers, pipeline, quotes and tasks', color: '#00c7a1' },
  Surveyor: { apps: 'Web and phone app', about: 'Only the surveys and inspections booked for them', color: '#2f6fde' },
  Installer: { apps: 'Phone app', about: 'Fitters. Only the jobs booked with them and their job packs', color: '#e0a100' },
  'System Admin': { apps: 'Web', about: 'Users, teams, settings, integrations and audit', color: '#6b7a78' },
};

export type Level = 'Full' | 'View' | 'Own' | 'None';
export const LEVELS: { id: Level; label: string; hint: string }[] = [
  { id: 'Full', label: 'Full', hint: 'See and change everything' },
  { id: 'View', label: 'View only', hint: 'See but not change' },
  { id: 'Own', label: 'Only theirs', hint: 'Only records given to them' },
  { id: 'None', label: 'No access', hint: 'Hidden' },
];
export const AREAS = [
  'Dashboard and reports', 'Enquiries and customers', 'Sales pipeline and quotes', 'Appointments and tasks', 'Surveys', 'Orders and deliveries',
  'Installation diary', 'Snags and aftercare', 'Messages and email', 'Payments (from Xero)', 'Customer portal invites', 'Internal notes',
  'Users and teams', 'Statuses, templates and checklists', 'Integrations and sync errors', 'Audit history',
] as const;
export type Area = typeof AREAS[number];
const M = (s: string): Level[] => s.split('').map(c => ({ F: 'Full', V: 'View', O: 'Own', N: 'None' }[c] as Level));
//                                     Dash Enq Pipe Appt Surv Ord Diary Snag Msg Pay Inv Note Users Stat Integ Audit
export const MATRIX0: Record<Role, Level[]> = {
  Director: M('FFFFVVFVFVVFVVVF'),
  'Office Admin': M('FFFFFFFFFVFFNNVN'),
  Sales: M('OOOONNNNOONONNNN'),
  Surveyor: M('NONOONNONNNONNNN'),
  Installer: M('NNNNNNONONNONNNN'),
  'System Admin': M('VNNNNNNNNNNNFFFF'),
};
export const SCOPE0: Record<Role, string> = {
  Director: 'All customers and jobs', 'Office Admin': 'All customers and jobs', Sales: 'Only their own customers',
  Surveyor: 'Only visits booked for them', Installer: 'Only jobs booked with them', 'System Admin': 'No customer or job data',
};

/* ---------- Users ---------- */
export type UStatus = 'Active' | 'Invited' | 'Locked' | 'Deactivated';
export type Fitter = 'Lead fitter' | 'Fitter';
export type User = {
  id: string; name: string; initials: string; role: Role; email: string; phone: string; team: string; status: UStatus; fitter?: Fitter;
  mfa: 'On' | 'Not set up'; mfaWay?: 'Text message' | 'Authenticator app'; last: string; devices: { name: string; where: string; when: string }[];
  since: string; note?: string; work?: string;
};
const dev = (a: string, b = '16 Oct, 08:30') => [{ name: a, where: 'Leicester', when: b }];
export const USERS0: User[] = [
  { id: 'tf', name: 'Tom Fletcher', initials: 'TF', role: 'System Admin', email: 'tom.fletcher@jadeiteglazing.co.uk', phone: '07700 900 010', team: 'System Admin', status: 'Active', mfa: 'On', mfaWay: 'Authenticator app', last: 'Now', devices: dev('Windows · Chrome', 'Now'), since: 'Jan 2026' },
  { id: 'jw', name: 'James Whitfield', initials: 'JW', role: 'Director', email: 'james.whitfield@jadeiteglazing.co.uk', phone: '07700 900 001', team: 'Directors', status: 'Active', mfa: 'On', mfaWay: 'Authenticator app', last: 'Today, 07:55', devices: [{ name: 'MacBook · Safari', where: 'Leicester', when: 'Today, 07:55' }, { name: 'iPhone', where: 'Leicester', when: 'Yesterday' }], since: 'Jan 2026' },
  { id: 'sm', name: 'Sarah Mitchell', initials: 'SM', role: 'Office Admin', email: 'sarah.mitchell@jadeiteglazing.co.uk', phone: '07700 900 011', team: 'Office Admin', status: 'Active', mfa: 'On', mfaWay: 'Text message', last: 'Today, 08:02', devices: dev('Windows · Edge', 'Today, 08:02'), since: 'Jan 2026' },
  { id: 'km', name: 'Kate Morris', initials: 'KM', role: 'Office Admin', email: 'kate.morris@jadeiteglazing.co.uk', phone: '07700 900 012', team: 'Office Admin', status: 'Invited', mfa: 'Not set up', last: 'Never', devices: [], since: 'Invited 14 Oct', note: 'Invite sent 14 Oct · not opened yet' },
  { id: 'mh', name: 'Mike Harris', initials: 'MH', role: 'Sales', email: 'mike.harris@jadeiteglazing.co.uk', phone: '07700 900 101', team: 'Sales', status: 'Active', mfa: 'On', mfaWay: 'Text message', last: 'Today, 08:40', devices: [{ name: 'iPhone · Jadeite app', where: 'Leicester', when: 'Today, 08:40' }, { name: 'Windows · Chrome', where: 'Leicester', when: 'Yesterday' }], since: 'Feb 2026', work: '9 customers, 4 open tasks' },
  { id: 'ec', name: 'Emma Clarke', initials: 'EC', role: 'Sales', email: 'emma.clarke@jadeiteglazing.co.uk', phone: '07700 900 102', team: 'Sales', status: 'Active', mfa: 'On', mfaWay: 'Authenticator app', last: 'Today, 09:10', devices: dev('Android · Jadeite app', 'Today, 09:10'), since: 'Feb 2026', work: '7 customers, 2 open tasks' },
  { id: 'jb', name: 'James Brook', initials: 'JB', role: 'Sales', email: 'james.brook@jadeiteglazing.co.uk', phone: '07700 900 103', team: 'Sales', status: 'Locked', mfa: 'On', mfaWay: 'Text message', last: 'Yesterday, 17:20', devices: dev('iPhone · Jadeite app', 'Yesterday'), since: 'Mar 2026', note: 'Locked today at 08:12 · wrong code 3 times', work: '5 customers, 1 open task' },
  { id: 'ps', name: 'Priya Shah', initials: 'PS', role: 'Surveyor', email: 'priya.shah@jadeiteglazing.co.uk', phone: '07700 900 104', team: 'Surveyors', status: 'Active', mfa: 'On', mfaWay: 'Text message', last: 'Today, 07:40', devices: [{ name: 'iPhone · Jadeite app', where: 'Leicester', when: 'Today, 07:40' }, { name: 'iPad · Safari', where: 'Leicester', when: '14 Oct' }], since: 'Feb 2026', work: '3 visits booked' },
  { id: 'rk', name: 'Rob King', initials: 'RK', role: 'Surveyor', email: 'rob.king@jadeiteglazing.co.uk', phone: '07700 900 105', team: 'Surveyors', status: 'Active', mfa: 'On', mfaWay: 'Text message', last: 'Today, 08:15', devices: dev('Android · Jadeite app', 'Today, 08:15'), since: 'Feb 2026', work: '2 visits booked' },
  { id: 'dh', fitter: 'Lead fitter', name: 'Dan Hughes', initials: 'DH', role: 'Installer', email: 'dan.hughes@jadeiteglazing.co.uk', phone: '07700 900 201', team: 'Installers', status: 'Active', mfa: 'On', mfaWay: 'Text message', last: 'Today, 07:30', devices: dev('iPhone · Jadeite app', 'Today, 07:30'), since: 'Feb 2026' },
  { id: 'lb', fitter: 'Fitter', name: 'Lee Brooks', initials: 'LB', role: 'Installer', email: 'lee.brooks@jadeiteglazing.co.uk', phone: '07700 900 202', team: 'Installers', status: 'Active', mfa: 'On', mfaWay: 'Text message', last: 'Today, 07:31', devices: dev('Android · Jadeite app', 'Today, 07:31'), since: 'Feb 2026' },
  { id: 'cr', fitter: 'Fitter', name: 'Chris Reid', initials: 'CR', role: 'Installer', email: 'chris.reid@jadeiteglazing.co.uk', phone: '07700 900 207', team: 'Installers', status: 'Active', mfa: 'On', mfaWay: 'Text message', last: 'Yesterday', devices: dev('iPhone · Jadeite app', 'Yesterday'), since: 'Mar 2026' },
  { id: 'ak', fitter: 'Lead fitter', name: 'Amir Khan', initials: 'AK', role: 'Installer', email: 'amir.khan@jadeiteglazing.co.uk', phone: '07700 900 203', team: 'Installers', status: 'Active', mfa: 'On', mfaWay: 'Text message', last: 'Today, 07:05', devices: [{ name: 'iPhone · Jadeite app', where: 'Harrogate', when: 'Today, 07:05' }], since: 'Feb 2026', work: '2 jobs booked today' },
  { id: 'jp', fitter: 'Fitter', name: 'Joe Patel', initials: 'JP', role: 'Installer', email: 'joe.patel@jadeiteglazing.co.uk', phone: '07700 900 204', team: 'Installers', status: 'Active', mfa: 'On', mfaWay: 'Text message', last: 'Today, 07:12', devices: [{ name: 'Android · Jadeite app', where: 'Harrogate', when: 'Today, 07:12' }], since: 'Feb 2026' },
  { id: 'tw', fitter: 'Fitter', name: 'Tom Wright', initials: 'TW', role: 'Installer', email: 'tom.wright@jadeiteglazing.co.uk', phone: '07700 900 205', team: 'Installers', status: 'Active', mfa: 'On', mfaWay: 'Text message', last: '14 Oct', devices: [{ name: 'iPhone · Jadeite app', where: 'Leeds', when: '14 Oct' }], since: 'Feb 2026' },
  { id: 'bc', fitter: 'Fitter', name: 'Ben Cole', initials: 'BC', role: 'Installer', email: 'ben.cole@jadeiteglazing.co.uk', phone: '07700 900 206', team: 'Installers', status: 'Active', mfa: 'Not set up', last: '12 Oct', devices: [{ name: 'Android · Jadeite app', where: 'Leeds', when: '12 Oct' }], since: 'Sep 2026', note: 'Has not set up two-step sign-in yet' },
  { id: 'sp', fitter: 'Fitter', name: 'Sam Price', initials: 'SP', role: 'Installer', email: 'sam.price@jadeiteglazing.co.uk', phone: '07700 900 208', team: 'Installers', status: 'Active', mfa: 'On', mfaWay: 'Text message', last: '14 Oct', devices: [{ name: 'iPhone · Jadeite app', where: 'Leeds', when: '14 Oct' }], since: 'Aug 2026' },
  { id: 'gw', name: 'Gary Wells', initials: 'GW', role: 'Sales', email: 'gary.wells@jadeiteglazing.co.uk', phone: '07700 900 106', team: 'Sales', status: 'Deactivated', mfa: 'On', mfaWay: 'Text message', last: '30 Sep', devices: [], since: 'Feb 2026', note: 'Left the company 30 Sep · customers moved to Emma Clarke' },
];

/* ---------- Teams ---------- */
// Teams are fixed: one team per role. Adding someone with a role puts them in that team. Nobody moves outside their role's team.
export type Team = { role: Role; name: string; about: string; add: string };
export const TEAMS: Team[] = [
  { role: 'Office Admin', name: 'Office Admin', about: 'Run enquiries, jobs, the diary and customers', add: 'Add office admin' },
  { role: 'Sales', name: 'Sales', about: 'Visit customers, quote and follow up', add: 'Add salesperson' },
  { role: 'Surveyor', name: 'Surveyors', about: 'Final surveys and inspections', add: 'Add surveyor' },
  { role: 'Installer', name: 'Installers', about: 'The fitters who fit the jobs. Each one is a lead fitter or a fitter.', add: 'Add installer' },
  { role: 'Director', name: 'Directors', about: 'See the whole business and approve exceptions', add: 'Add director' },
  { role: 'System Admin', name: 'System Admin', about: 'Look after users, settings and connections', add: 'Add system admin' },
];
export const teamOf = (r: Role) => TEAMS.find(t => t.role === r)!.name;
export const roleLabel = (u: { role: Role; fitter?: Fitter }) => (u.role === 'Installer' ? `Installer · ${u.fitter || 'Fitter'}` : u.role);

/* ---------- Customer portal sign-in ---------- */
export type Cust = { id: string; name: string; job: string; email: string; status: 'Active' | 'Invited' | 'Locked' | 'Turned off'; last: string; note?: string };
export const CUSTS0: Cust[] = [
  { id: 'c1', name: 'Sarah & David Smith', job: 'JG-10482', email: 'smiths@email.co.uk', status: 'Active', last: 'Today, 10:42' },
  { id: 'c2', name: 'Mrs Patel', job: 'JG-10471', email: 'patel.r@email.co.uk', status: 'Active', last: 'Today, 09:45' },
  { id: 'c3', name: 'Mr Khan', job: 'JG-10455', email: 'a.khan@email.co.uk', status: 'Active', last: 'Yesterday' },
  { id: 'c4', name: 'The Bakers', job: 'JG-10477', email: 'bakers@email.co.uk', status: 'Locked', last: 'Today, 07:58', note: 'Wrong code 3 times this morning · called the office' },
  { id: 'c5', name: 'Mr & Mrs Lees', job: 'JG-10490', email: 'the.lees@email.co.uk', status: 'Invited', last: 'Never', note: 'Invite sent 15 Oct by Sarah' },
  { id: 'c6', name: 'Hartley Dental', job: 'JG-10466', email: 'office@hartleydental.co.uk', status: 'Active', last: '14 Oct' },
];

/* ---------- Statuses and lists ---------- */
export type StageRow = { id: string; name: string; late: number; customer: string; show: boolean; fixed?: boolean };
export const SALES_STAGES0: StageRow[] = [
  { id: 's1', name: 'New Enquiry', late: 1, customer: 'We have your enquiry', show: false, fixed: true },
  { id: 's2', name: 'Qualification', late: 2, customer: 'We are in touch', show: false },
  { id: 's3', name: 'Appointment', late: 7, customer: 'Visit booked', show: false },
  { id: 's4', name: 'Quote Preparation', late: 3, customer: 'Preparing your quote', show: false },
  { id: 's5', name: 'Quote Sent', late: 3, customer: 'Quote sent', show: false },
  { id: 's6', name: 'Follow-up', late: 5, customer: 'Quote sent', show: false },
  { id: 's7', name: 'Won', late: 0, customer: 'Order agreed', show: true, fixed: true },
  { id: 's8', name: 'Lost', late: 0, customer: '—', show: false, fixed: true },
];
export const JOURNEY0: StageRow[] = [
  { id: 'j1', name: 'Won, checks and deposit', late: 2, customer: 'Order agreed', show: true, fixed: true },
  { id: 'j2', name: 'Final survey', late: 7, customer: 'Final survey', show: true },
  { id: 'j3', name: 'Ordered from supplier', late: 2, customer: 'Being made', show: true },
  { id: 'j4', name: 'Delivery', late: 1, customer: 'Delivery', show: true },
  { id: 'j5', name: 'Installation', late: 0, customer: 'Fitting', show: true },
  { id: 'j6', name: 'Snags and final checks', late: 14, customer: 'Final checks', show: true },
  { id: 'j7', name: 'Closed · in guarantee', late: 0, customer: 'All done', show: true, fixed: true },
];
export type ListDef = { id: string; name: string; used: string; items: string[] };
export const LISTS0: ListDef[] = [
  { id: 'lost', name: 'Reasons a deal is lost', used: 'Sales portal and Office Admin · Mark as Lost', items: ['Price — chose a cheaper quote', 'Went with another company', 'Not going ahead for now', 'No reply after follow-ups', 'Other'] },
  { id: 'aftercare', name: 'Aftercare request steps', used: 'Customer portal and Office Admin · Aftercare', items: ['Received', 'Looking into it', 'Visit booked', 'Fixed'] },
  { id: 'cust-problem', name: 'Problems a customer can report', used: 'Customer portal and app · Report a problem', items: ['Draught or leak', 'Hard to open or close', 'Lock or handle', 'Glass misted or cracked', 'Damage or scratch', 'Something else'] },
  { id: 'change', name: 'Reasons to change a fitting date', used: 'Customer portal and app · Ask to change the date', items: ['We will be away', 'Work or family commitment', 'Not ready yet', 'Something else'] },
];
export type DocVis = { id: string; name: string; show: boolean; when: string; fixed?: boolean };
export const DOCVIS0: DocVis[] = [
  { id: 'quote', name: 'Quote', show: true, when: 'When it is sent' },
  { id: 'terms', name: 'Terms and conditions', show: true, when: 'With the quote' },
  { id: 'survey', name: 'Survey report', show: true, when: 'After the survey' },
  { id: 'final', name: 'Final survey report', show: true, when: 'After the final survey' },
  { id: 'order', name: 'Order confirmation', show: true, when: 'When ordered' },
  { id: 'invoices', name: 'Invoices and receipts (from Xero)', show: true, when: 'When sent or paid' },
  { id: 'ready', name: 'Getting ready for fitting day', show: true, when: 'When fitting is booked' },
  { id: 'complete', name: 'Completion certificate', show: true, when: 'After the handover' },
  { id: 'guarantee', name: '10-year guarantee', show: true, when: 'When the job is closed' },
  { id: 'fensa', name: 'FENSA certificate', show: true, when: 'When the job is closed' },
  { id: 'care', name: 'Care guide', show: true, when: 'After the handover' },
  { id: 'jobpack', name: 'Installer job pack', show: false, when: 'Never · staff only', fixed: true },
  { id: 'supplier', name: 'Supplier orders and delivery notes', show: false, when: 'Never · staff only', fixed: true },
  { id: 'notes', name: 'Internal notes', show: false, when: 'Never · staff only', fixed: true },
];

/* ---------- Message templates ---------- */
export type Tpl = { id: string; name: string; channel: 'Email' | 'Text' | 'Email and text'; to: 'Customer' | 'Staff'; when: string; subject?: string; body: string; on: boolean; required?: boolean; edited: string };
export const TPL0: Tpl[] = [
  { id: 't1', name: 'Customer portal invite', channel: 'Email', to: 'Customer', when: 'Office invites the customer after the deposit is checked', subject: 'Welcome to Jadeite · follow your job online', body: 'Dear {customer},\n\nEverything is agreed and we are getting your order ready. You can now follow every step of your job ({job}) in your Jadeite portal.\n\nSign in with this email address. We will send you a one-time code, so there is no password to remember.\n\nAny questions, call {office_name} on {office_phone}.\nKind regards, the Jadeite Glazing team', on: true, required: true, edited: '02 Oct · Tom Fletcher' },
  { id: 't2', name: 'Sign-in code', channel: 'Email', to: 'Customer', when: 'A customer signs in', subject: 'Your Jadeite sign-in code: {code}', body: 'Your 6-digit code is {code}. It works for 10 minutes.\n\nIf you did not ask for this, you can ignore this email.', on: true, required: true, edited: '20 Sep · Tom Fletcher' },
  { id: 't3', name: 'Sales visit booked', channel: 'Email', to: 'Customer', when: 'A salesperson books an appointment', subject: 'Your Jadeite visit on {date}', body: 'Dear {customer},\n\n{salesperson} will visit you on {date} at {time} at {address}.\n\nIf you need to change it, just reply to this email.', on: true, edited: '20 Sep · Tom Fletcher' },
  { id: 't4', name: 'Final survey booked', channel: 'Email and text', to: 'Customer', when: 'The office books the final survey', subject: 'Your final survey on {date}', body: 'Dear {customer}, {surveyor} will check every size on {date}, arriving {time}. It takes about an hour.', on: true, edited: '20 Sep · Tom Fletcher' },
  { id: 't5', name: 'On my way', channel: 'Text', to: 'Customer', when: 'A surveyor or fitter taps On my way', body: 'Hi {customer}, it is {staff} from Jadeite. I am on my way and will be with you at about {arrival}.', on: true, required: true, edited: '01 Oct · Tom Fletcher' },
  { id: 't6', name: 'Fitting booked', channel: 'Email', to: 'Customer', when: 'The office books the installation', subject: 'Your fitting dates: {date}', body: 'Dear {customer},\n\nGood news: your fitting is booked for {date}. {team} will arrive between {time}.\n\nPlease confirm the dates in your portal, and have a look at the getting-ready list.', on: true, edited: '13 Oct · Tom Fletcher' },
  { id: 't7', name: 'Payment reminder', channel: 'Email', to: 'Customer', when: '3 days before an invoice is due', subject: 'A reminder: {invoice} is due {due}', body: 'Dear {customer},\n\nA friendly reminder that {invoice} for {amount} is due on {due}. You can pay by card or bank transfer in your portal.', on: true, edited: '20 Sep · Tom Fletcher' },
  { id: 't8', name: 'Job finished · guarantee ready', channel: 'Email', to: 'Customer', when: 'The office closes the job', subject: 'Your guarantee is ready', body: 'Dear {customer},\n\nYour job is finished. Your 10-year guarantee, FENSA certificate and care guide are now in your portal.\n\nThank you for choosing Jadeite.', on: true, edited: '20 Sep · Tom Fletcher' },
  { id: 't9', name: 'Aftercare request received', channel: 'Email', to: 'Customer', when: 'A customer reports a problem, or the office logs one', subject: 'We have your request {request}', body: 'Dear {customer},\n\nThank you for letting us know. Your request number is {request}. {office_name} will be in touch to arrange a visit.', on: true, edited: '20 Sep · Tom Fletcher' },
  { id: 't10', name: 'Staff invite', channel: 'Email', to: 'Staff', when: 'A system admin adds a new user', subject: 'You have been added to Jadeite Systems', body: 'Hi {staff},\n\n{admin} has added you to Jadeite Systems as {role}. Open the link below to set your password and two-step sign-in.\n\n{link}\n\nThe link works for 7 days.', on: true, required: true, edited: '20 Sep · Tom Fletcher' },
];
export const FIELDS = ['{customer}', '{job}', '{date}', '{time}', '{address}', '{salesperson}', '{surveyor}', '{team}', '{staff}', '{arrival}', '{invoice}', '{amount}', '{due}', '{request}', '{office_name}', '{office_phone}', '{code}', '{role}', '{admin}', '{link}'];
export const SAMPLE: Record<string, string> = { '{customer}': 'Sarah and David', '{job}': 'JG-10482', '{date}': 'Thu 22 – Fri 23 Oct', '{time}': '08:00 and 09:00', '{address}': '14 Ashby Road, Leicester', '{salesperson}': 'Mike Harris', '{surveyor}': 'Priya Shah', '{team}': 'Dan, Lee and Chris', '{staff}': 'Dan', '{arrival}': '08:30', '{invoice}': 'INV-3392', '{amount}': '£2,512', '{due}': 'Tue 20 Oct', '{request}': 'AC-130', '{office_name}': 'Sarah', '{office_phone}': '0116 496 0000', '{code}': '482193', '{role}': 'Office Admin', '{admin}': 'Tom Fletcher', '{link}': 'https://app.jadeiteglazing.co.uk/join/…' };

/* ---------- Checklists ---------- */
export type CItem = { id: string; text: string; required: boolean };
export type Checklist = { id: string; name: string; app: string; who: string; items: CItem[]; extra?: { label: string; value: string; options: string[] }[] };
const ci = (p: string, list: string[], req = true): CItem[] => list.map((t, i) => ({ id: `${p}${i}`, text: t, required: req }));
export const CHECKLISTS0: Checklist[] = [
  { id: 'site', name: 'Final survey · site checks', app: 'Surveyor web and app', who: 'Surveyor', items: ci('s', ['Every opening can be reached easily', 'A van can park close by', 'Lintels and brickwork above the openings are sound', 'Reveals are square and in good condition', 'Old frames can come out without damage', 'Nothing that could be asbestos (old soffits, panels)', 'Can be fitted without scaffolding', 'Bedroom windows are big enough for a fire escape', 'Safety glass is planned where it is needed (doors, low glass)']),
    extra: [{ label: 'A size counts as the same when it is within', value: '5mm', options: ['3mm', '5mm', '10mm'] }, { label: 'Photos needed before submitting', value: 'At least 1 per item', options: ['None', 'At least 1 per item', 'At least 3 in total'] }] },
  { id: 'start', name: 'Installation · before you start', app: 'Installer app', who: 'Installer', items: ci('b', ['Walked round with the customer and agreed the order of work', 'Dust sheets and floor protection down', 'Frames and glass checked against the job pack — nothing damaged', 'Work area safe: ladders, tools, cables and pets']),
    extra: [{ label: 'Photos of the old frames', value: 'Required', options: ['Required', 'Optional'] }] },
  { id: 'final', name: 'Installation · final checks', app: 'Installer app', who: 'Installer', items: ci('f', ['Every frame fitted, level and fixed', 'Every window and door opens, closes and locks', 'Glass is clean and has no marks or chips', 'Sealed inside and out', 'Trims, cills and boards fitted', 'Keys and handles handed over', 'Old frames and waste taken away', 'House left clean and tidy']),
    extra: [{ label: 'Photos of the finished work', value: 'At least 1 per frame', options: ['At least 1 per frame', 'At least 3 in total', 'Optional'] }, { label: 'Customer signature', value: 'Required (or a reason)', options: ['Required (or a reason)', 'Optional'] }] },
  { id: 'ready', name: 'Customer · getting ready for fitting day', app: 'Customer portal and app', who: 'Customer', items: ci('r', ['Clear about 1 metre inside each window and the front door', 'Take down curtains, blinds and poles', 'Clear the window sills', 'Keep the driveway clear for the van', 'Keep pets in another room', 'Make sure someone over 18 is home on both days'], false) },
  { id: 'problem', name: 'Installer · problem types', app: 'Installer app', who: 'Installer', items: ci('p', ['Wrong size', 'Damaged frame or glass', 'Missing part', 'Opening is not as surveyed', 'Customer is not happy', 'Something else'], false) },
  { id: 'notfixed', name: 'Return visit · reasons not fixed', app: 'Installer app', who: 'Installer', items: ci('n', ['Needs a part', 'Needs another visit', 'Not a fault — advice given', 'Customer not happy yet'], false) },
];

/* ---------- Integrations ---------- */
export type Integ = {
  id: 'framepoint' | 'microsoft' | 'xero'; name: string; logo: string; color: string; about: string; status: 'Connected' | 'Needs attention' | 'Not connected';
  account: string; since: string; last: string; every: string; today: number; brings: { id: string; label: string; on: boolean; dir: string }[]; note: string;
};
export const INTEG0: Integ[] = [
  { id: 'framepoint', name: 'Framepoint', logo: 'FP', color: '#2f6fde', about: 'Quotes, survey reports and window designs', status: 'Connected', account: 'Jadeite Glazing · account 40817', since: '20 Sep', last: '2 min ago', every: 'Every 15 minutes', today: 46,
    brings: [{ id: 'q', label: 'Quotes and quote versions', on: true, dir: 'Framepoint → Jadeite' }, { id: 'r', label: 'Survey report PDFs', on: true, dir: 'Framepoint → Jadeite' }, { id: 'c', label: 'Customer and quote references', on: true, dir: 'Both ways' }, { id: 'p', label: 'Prices and window designs', on: false, dir: 'Stays in Framepoint' }],
    note: 'Framepoint stays the place where quotes are designed and priced.' },
  { id: 'microsoft', name: 'Microsoft 365 · Outlook', logo: 'M', color: '#0b6e5c', about: 'Email and calendars for every member of staff', status: 'Needs attention', account: 'jadeiteglazing.co.uk', since: '18 Sep', last: '1 min ago', every: 'Live', today: 312,
    brings: [{ id: 'e', label: 'Customer emails linked to jobs', on: true, dir: 'Both ways' }, { id: 'cal', label: 'Appointments, surveys and fittings in calendars', on: true, dir: 'Jadeite → Outlook' }, { id: 'att', label: 'Email attachments', on: true, dir: 'Outlook → Jadeite' }, { id: 'old', label: 'Emails from before 1 Sep 2026', on: false, dir: 'Not brought in' }],
    note: 'Rob King’s calendar cannot be updated (see sync errors).' },
  { id: 'xero', name: 'Xero', logo: 'X', color: '#13b5ea', about: 'Invoices, payments and balances (read only)', status: 'Connected', account: 'Jadeite Glazing Ltd', since: '22 Sep', last: '6 min ago', every: 'Every 15 minutes', today: 28,
    brings: [{ id: 'inv', label: 'Invoices and their status', on: true, dir: 'Xero → Jadeite' }, { id: 'pay', label: 'Payments, deposits and balances', on: true, dir: 'Xero → Jadeite' }, { id: 'pdf', label: 'Invoice PDFs for the customer portal', on: true, dir: 'Xero → Jadeite' }, { id: 'make', label: 'Creating invoices', on: false, dir: 'Stays in Xero' }],
    note: 'Xero stays the accounting system. Jadeite only reads from it.' },
];
export const MAILBOXES0 = [
  { id: 'mb1', box: 'office@jadeiteglazing.co.uk', who: 'Office (shared)', on: true },
  { id: 'mb2', box: 'sarah.mitchell@jadeiteglazing.co.uk', who: 'Sarah Mitchell', on: true },
  { id: 'mb3', box: 'mike.harris@jadeiteglazing.co.uk', who: 'Mike Harris', on: true },
  { id: 'mb4', box: 'emma.clarke@jadeiteglazing.co.uk', who: 'Emma Clarke', on: true },
  { id: 'mb5', box: 'james.brook@jadeiteglazing.co.uk', who: 'James Brook', on: true },
  { id: 'mb6', box: 'accounts@jadeiteglazing.co.uk', who: 'Accounts (shared)', on: false },
];

/* ---------- Sync errors ---------- */
export type SyncErr = {
  id: string; integ: Integ['id']; what: string; record: string; when: string; tries: number; status: 'Needs attention' | 'Retrying' | 'Fixed' | 'Ignored';
  why: string; fix: string; tech: string; canMatch?: boolean; fixedBy?: string; log: string[];
};
export const ERRS0: SyncErr[] = [
  { id: 'SE-221', integ: 'xero', what: 'Payment of £1,250 has no job number', record: 'Xero payment · D Shaw', when: 'Today, 09:20', tries: 3, status: 'Needs attention', why: 'The bank reference says "SHAW WINDOWS", so we cannot tell which job it belongs to.', fix: 'Match it to the right job. We will remember it next time.', tech: 'XERO 404: no tracking match for reference "SHAW WINDOWS"', canMatch: true, log: ['09:20 · Tried 3 times · no match'] },
  { id: 'SE-220', integ: 'microsoft', what: 'Could not update Rob King’s calendar', record: 'Survey · Mr & Mrs Lees · Mon 19 Oct', when: 'Today, 08:47', tries: 4, status: 'Needs attention', why: 'Outlook said we are not allowed to write to Rob’s calendar. His calendar sharing may have changed.', fix: 'Ask Rob to share his calendar again (or allow it in Microsoft 365), then try again.', tech: 'Graph 403 ErrorAccessDenied: calendar rob.king@ (ErrorItemNotFound)', log: ['08:47 · Tried 4 times · access denied'] },
  { id: 'SE-219', integ: 'framepoint', what: 'Quote FP-55140 could not be read', record: 'Quote FP-55140 · Mr Shaw', when: 'Today, 08:10', tries: 2, status: 'Needs attention', why: 'Framepoint took too long to reply. This is usually a short outage.', fix: 'Try again. If it keeps failing, contact Framepoint support.', tech: 'Framepoint API timeout after 30s · GET /quotes/55140', log: ['08:10 · Tried 2 times · timed out'] },
  { id: 'SE-218', integ: 'xero', what: 'Customer appears twice in Xero', record: 'Xero contact · Mrs Patel', when: 'Yesterday, 16:05', tries: 1, status: 'Needs attention', why: 'There are two Xero contacts called "Mrs Patel", so invoices could go to the wrong job.', fix: 'Match the Xero contact to the right job.', tech: 'XERO duplicate ContactID 7f3a… and 91be…', canMatch: true, log: ['Yesterday 16:05 · duplicate found'] },
  { id: 'SE-217', integ: 'microsoft', what: 'Email too large to bring in', record: 'Email · Emplas · delivery photos', when: '14 Oct, 11:30', tries: 3, status: 'Fixed', why: 'The attachments were bigger than 25MB.', fix: 'Fixed by bringing in the email without its attachments.', tech: 'Graph 413 RequestEntityTooLarge', fixedBy: 'Tom Fletcher · 14 Oct', log: ['14 Oct 11:30 · failed', '14 Oct 12:02 · fixed by Tom Fletcher'] },
  { id: 'SE-216', integ: 'framepoint', what: 'Quote version 3 skipped', record: 'Quote FP-55061 · Mrs Patel', when: '12 Oct, 15:12', tries: 1, status: 'Ignored', why: 'A test version was made in Framepoint by mistake.', fix: 'Ignored: not a real quote.', tech: 'Framepoint quote 55061 v3 flagged draft', fixedBy: 'Tom Fletcher · 12 Oct', log: ['12 Oct 15:12 · failed', '12 Oct 15:30 · ignored by Tom Fletcher: test version'] },
];
export const JOBS = ['JG-10490 · Mr & Mrs Lees', 'JG-10482 · Sarah & David Smith', 'JG-10477 · The Bakers', 'JG-10475 · Mr Shaw', 'JG-10471 · Mrs Patel', 'JG-10466 · Hartley Dental', 'JG-10455 · Mr Khan'];

/* ---------- Audit history ---------- */
export type Audit = { id: string; when: string; day: number; who: string; action: string; record: string; area: string; source: string; before?: [string, string][]; reason?: string };
// day: 0 = today, 1 = yesterday …
export const AUDIT0: Audit[] = [
  { id: 'a30', when: 'Today, 10:42', day: 0, who: 'Sarah & David Smith', action: 'Sent a message in the customer portal', record: 'JG-10482', area: 'Jobs', source: 'Customer portal' },
  { id: 'a29', when: 'Today, 09:20', day: 0, who: 'Xero', action: 'Payment could not be matched to a job', record: 'SE-221', area: 'Integrations', source: 'Xero' },
  { id: 'a28', when: 'Today, 09:05', day: 0, who: 'Amir Khan', action: 'Fixed 2 snags on a return visit', record: 'JG-10471 · SN-117, SN-118', area: 'Jobs', source: 'Installer app', before: [['SN-117 status', 'Open → Fixed'], ['SN-118 status', 'Open → Fixed']] },
  { id: 'a27', when: 'Today, 08:47', day: 0, who: 'Microsoft 365', action: 'Calendar update failed', record: 'SE-220 · Rob King', area: 'Integrations', source: 'Outlook' },
  { id: 'a26', when: 'Today, 08:12', day: 0, who: 'James Brook', action: 'Account locked after 3 wrong codes', record: 'James Brook', area: 'Sign-in', source: 'Phone app' },
  { id: 'a25', when: 'Today, 07:58', day: 0, who: 'The Bakers', action: 'Customer sign-in paused after 3 wrong codes', record: 'JG-10477', area: 'Sign-in', source: 'Customer portal' },
  { id: 'a24', when: 'Yesterday, 16:30', day: 1, who: 'Sarah Mitchell', action: 'Booked a return visit', record: 'JG-10471', area: 'Jobs', source: 'Office Admin', before: [['Visit', '— → Fri 16 Oct, 08:00 · Amir Khan']] },
  { id: 'a23', when: 'Yesterday, 14:10', day: 1, who: 'Sarah Mitchell', action: 'Overrode a diary clash', record: 'JG-10490 · installation', area: 'Jobs', source: 'Office Admin', before: [['Installer', 'Lee Brooks (booked elsewhere) → Lee Brooks']], reason: 'Lee finishes the other job by 11am' },
  { id: 'a22', when: '15 Oct, 15:10', day: 1, who: 'Sarah Mitchell', action: 'Invited a customer to the portal', record: 'JG-10490 · Mr & Mrs Lees', area: 'Customers', source: 'Office Admin' },
  { id: 'a21', when: '14 Oct, 12:02', day: 2, who: 'Tom Fletcher', action: 'Fixed a sync error', record: 'SE-217', area: 'Integrations', source: 'System Admin' },
  { id: 'a20', when: '14 Oct, 10:20', day: 2, who: 'Tom Fletcher', action: 'Invited a new user', record: 'Kate Morris', area: 'Users', source: 'System Admin', before: [['Role', '— → Office Admin'], ['Team', '— → Office Admin']] },
  { id: 'a19', when: '14 Oct, 17:45', day: 2, who: 'Sarah Mitchell', action: 'Closed a job and published the guarantee', record: 'JG-10455 · Mr Khan', area: 'Jobs', source: 'Office Admin' },
  { id: 'a18', when: '13 Oct, 15:10', day: 3, who: 'Sarah Mitchell', action: 'Changed a fitting date', record: 'JG-10482', area: 'Jobs', source: 'Office Admin', before: [['Fitting', 'Wed 21 Oct → Thu 22 – Fri 23 Oct']], reason: 'Frames arrive 20 Oct' },
  { id: 'a17', when: '13 Oct, 11:00', day: 3, who: 'Tom Fletcher', action: 'Edited a message template', record: 'Fitting booked', area: 'Settings', source: 'System Admin', before: [['Wording', 'Added "confirm the dates in your portal"']] },
  { id: 'a16', when: '12 Oct, 15:30', day: 4, who: 'Tom Fletcher', action: 'Ignored a sync error', record: 'SE-216', area: 'Integrations', source: 'System Admin', reason: 'Test version made in Framepoint by mistake' },
  { id: 'a15', when: '06 Oct, 11:00', day: 10, who: 'Sarah Mitchell', action: 'Recorded a supplier order', record: 'JG-10482 · SO-48238', area: 'Jobs', source: 'Office Admin' },
  { id: 'a14', when: '01 Oct, 09:30', day: 15, who: 'Tom Fletcher', action: 'Added a user', record: 'Sam Price', area: 'Users', source: 'System Admin', before: [['Role', '— → Installer · Fitter'], ['Team', '— → Installers']] },
  { id: 'a13', when: '30 Sep, 17:10', day: 16, who: 'Tom Fletcher', action: 'Deactivated a user', record: 'Gary Wells', area: 'Users', source: 'System Admin', before: [['Status', 'Active → Deactivated'], ['Customers', 'Gary Wells → Emma Clarke']], reason: 'Left the company' },
  { id: 'a12', when: '30 Sep, 16:40', day: 16, who: 'Mike Harris', action: 'Marked a deal as Won', record: 'EN-2283 · Sarah & David Smith', area: 'Jobs', source: 'Sales portal', before: [['Stage', 'Quote Sent → Won']] },
];

/* ---------- Data import (moving data in from the old system) ---------- */
export type Import = { id: string; name: string; file: string; rows: number; step: number; by: string; started: string; ok: number; dupes: number; errors: number; approvedBy?: string; done?: string };
export const IMPORT_STEPS = ['Upload the file', 'Match the columns', 'Check for duplicates', 'Trial import', 'Client approval', 'Import'];
export const IMPORTS0: Import[] = [
  { id: 'IM-03', name: 'Customers and active jobs', file: 'old-system-customers.xlsx', rows: 1284, step: 4, by: 'Tom Fletcher', started: '12 Oct', ok: 1251, dupes: 21, errors: 12 },
  { id: 'IM-02', name: 'Installers and fitting teams', file: 'fitters.csv', rows: 9, step: 6, by: 'Tom Fletcher', started: '20 Sep', ok: 9, dupes: 0, errors: 0, approvedBy: 'James Whitfield', done: '21 Sep' },
  { id: 'IM-01', name: 'Suppliers', file: 'suppliers.csv', rows: 6, step: 6, by: 'Tom Fletcher', started: '18 Sep', ok: 6, dupes: 0, errors: 0, approvedBy: 'James Whitfield', done: '18 Sep' },
];
export const COLUMNS = [
  ['Cust Name', 'Customer name'], ['Addr1', 'Address'], ['Post Code', 'Postcode'], ['Tel', 'Phone'], ['Email Addr', 'Email'], ['Job Ref', 'Job number'], ['Product', 'Products'], ['Status', 'Job stage'], ['Salesman', 'Salesperson'], ['Notes', 'Internal notes'],
];
export const IMPORT_ERRORS = [
  ['Row 88', 'Postcode missing', 'Mrs J Allen'], ['Row 141', 'Email is not valid ("j.ward@@mail")', 'Mr Ward'], ['Row 203', 'Salesperson "Gary" has left', 'The Fosters'], ['Row 377', 'Job stage "Pending?" not recognised', 'Mr & Mrs Lowe'],
];

/* ---------- Security ---------- */
export const SECURITY0 = {
  mfa: true, ways: { text: true, app: true }, tries: '3', session: '8 hours', phoneApp: '30 days', newDevice: true,
  custCode: '10 minutes', custTries: '3', invite: '7 days',
};

/* ---------- Backups and data ---------- */
export const BACKUPS0 = [
  { id: 'b1', when: 'Today, 10:00', kind: 'Automatic', size: '4.2 GB', ok: true },
  { id: 'b2', when: 'Today, 09:00', kind: 'Automatic', size: '4.2 GB', ok: true },
  { id: 'b3', when: 'Today, 08:00', kind: 'Automatic', size: '4.1 GB', ok: true },
  { id: 'b4', when: 'Today, 07:00', kind: 'Automatic', size: '4.1 GB', ok: true },
  { id: 'b5', when: 'Yesterday, 18:30', kind: 'Made by Tom Fletcher', size: '4.1 GB', ok: true },
];
export const RETENTION0 = [
  { id: 'r1', what: 'Closed jobs, documents and photos', keep: '7 years', note: 'Guarantees last 10 years, so guarantee papers are kept for 10' },
  { id: 'r2', what: 'Messages and emails on a job', keep: '7 years' },
  { id: 'r3', what: 'Lost enquiries', keep: '2 years' },
  { id: 'r4', what: 'Audit history', keep: '7 years' },
  { id: 'r5', what: 'Sign-in records', keep: '1 year' },
];
export type Req = { id: string; who: string; kind: 'Copy of their data' | 'Delete their data'; asked: string; status: 'New' | 'Ready to download' | 'Done' | 'Cannot delete yet'; note?: string };
export const REQS0: Req[] = [
  { id: 'DR-07', who: 'Mr Shaw · EN-2275 (lost)', kind: 'Copy of their data', asked: '15 Oct', status: 'New' },
  { id: 'DR-06', who: 'Mrs Green · EN-1904 (lost 2024)', kind: 'Delete their data', asked: '13 Oct', status: 'New' },
  { id: 'DR-05', who: 'Mr Khan · JG-10455', kind: 'Delete their data', asked: '10 Oct', status: 'Cannot delete yet', note: 'Has a live guarantee until 2036 · explained by phone' },
];

/* ---------- System health ---------- */
export const HEALTH = { uptime: '99.98%', target: '99.9%', speed: '0.8 s', speedTarget: 'under 2 s', users: 17, appVersion: '1.0.4' };
