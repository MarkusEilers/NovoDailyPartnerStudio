import { kv } from '@vercel/kv';

/* ============================================
   Type Definitions
   ============================================ */

export interface Partner {
  id: string;
  partnerId: string; // Format: NPXX0000
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  phone?: string;
  photoUrl?: string;
  bio?: string;
  title?: string;
  company?: string;
  approved: boolean;
  isAdmin?: boolean;
  createdAt: string; // ISO date string
}

export interface Prospect {
  id: string;
  partnerId: string;
  name: string;
  matchPercent?: number;
  status: 'informiert' | 'interessiert' | 'kunde' | 'reseller-wunsch' | 'reseller' | 'partner-wunsch' | 'partner';
  notes?: string;
  erfolg?: 1 | 2 | 3 | 4 | 5;
  createdAt: string;
  updatedAt: string;
}

export interface PartnerLink {
  id: string;
  partnerId: string;
  type: 'masterclass' | 'shop' | 'product' | 'custom';
  label: string;
  baseUrl: string;
  clickCount: number;
  createdAt: string;
}

export interface PlanTask {
  id: string;
  partnerId: string;
  week: number;
  day: 'montag' | 'dienstag' | 'mittwoch' | 'donnerstag' | 'freitag';
  text: string;
  completed: boolean;
  cycleStart: string; // ISO date string
}

/* ============================================
   Partner Functions
   ============================================ */

export async function getPartners(): Promise<Partner[]> {
  const partners = await kv.get('partners') as Partner[] | null;
  return partners || [];
}

export async function savePartners(partners: Partner[]): Promise<void> {
  await kv.set('partners', partners);
}

export async function getPartnerById(id: string): Promise<Partner | null> {
  const partners = await getPartners();
  return partners.find((p) => p.id === id) || null;
}

export async function getPartnerByEmail(email: string): Promise<Partner | null> {
  const partners = await getPartners();
  return partners.find((p) => p.email === email) || null;
}

export async function getPartnerByPartnerId(partnerId: string): Promise<Partner | null> {
  const partners = await getPartners();
  return partners.find((p) => p.partnerId === partnerId) || null;
}

export async function createPartner(partner: Partner): Promise<Partner> {
  const partners = await getPartners();
  partners.push(partner);
  await savePartners(partners);
  return partner;
}

export async function updatePartner(id: string, updates: Partial<Partner>): Promise<Partner | null> {
  const partners = await getPartners();
  const index = partners.findIndex((p) => p.id === id);
  if (index === -1) return null;

  partners[index] = { ...partners[index], ...updates };
  await savePartners(partners);
  return partners[index];
}

export async function deletePartner(id: string): Promise<boolean> {
  const partners = await getPartners();
  const filtered = partners.filter((p) => p.id !== id);
  if (filtered.length === partners.length) return false;
  await savePartners(filtered);
  return true;
}

/* ============================================
   Prospect Functions
   ============================================ */

export async function getProspects(): Promise<Prospect[]> {
  const prospects = await kv.get('prospects') as Prospect[] | null;
  return prospects || [];
}

export async function saveProspects(prospects: Prospect[]): Promise<void> {
  await kv.set('prospects', prospects);
}

export async function getProspectById(id: string): Promise<Prospect | null> {
  const prospects = await getProspects();
  return prospects.find((p) => p.id === id) || null;
}

export async function getProspectsByPartnerId(partnerId: string): Promise<Prospect[]> {
  const prospects = await getProspects();
  return prospects.filter((p) => p.partnerId === partnerId);
}

export async function createProspect(prospect: Prospect): Promise<Prospect> {
  const prospects = await getProspects();
  prospects.push(prospect);
  await saveProspects(prospects);
  return prospect;
}

export async function updateProspect(id: string, updates: Partial<Prospect>): Promise<Prospect | null> {
  const prospects = await getProspects();
  const index = prospects.findIndex((p) => p.id === id);
  if (index === -1) return null;

  prospects[index] = { ...prospects[index], ...updates, updatedAt: new Date().toISOString() };
  await saveProspects(prospects);
  return prospects[index];
}

export async function deleteProspect(id: string): Promise<boolean> {
  const prospects = await getProspects();
  const filtered = prospects.filter((p) => p.id !== id);
  if (filtered.length === prospects.length) return false;
  await saveProspects(filtered);
  return true;
}

/* ============================================
   PartnerLink Functions
   ============================================ */

export async function getPartnerLinks(): Promise<PartnerLink[]> {
  const links = await kv.get('partner_links') as PartnerLink[] | null;
  return links || [];
}

export async function savePartnerLinks(links: PartnerLink[]): Promise<void> {
  await kv.set('partner_links', links);
}

export async function getPartnerLinkById(id: string): Promise<PartnerLink | null> {
  const links = await getPartnerLinks();
  return links.find((l) => l.id === id) || null;
}

export async function getPartnerLinksByPartnerId(partnerId: string): Promise<PartnerLink[]> {
  const links = await getPartnerLinks();
  return links.filter((l) => l.partnerId === partnerId);
}

export async function createPartnerLink(link: PartnerLink): Promise<PartnerLink> {
  const links = await getPartnerLinks();
  links.push(link);
  await savePartnerLinks(links);
  return link;
}

export async function updatePartnerLink(id: string, updates: Partial<PartnerLink>): Promise<PartnerLink | null> {
  const links = await getPartnerLinks();
  const index = links.findIndex((l) => l.id === id);
  if (index === -1) return null;

  links[index] = { ...links[index], ...updates };
  await savePartnerLinks(links);
  return links[index];
}

export async function deletePartnerLink(id: string): Promise<boolean> {
  const links = await getPartnerLinks();
  const filtered = links.filter((l) => l.id !== id);
  if (filtered.length === links.length) return false;
  await savePartnerLinks(filtered);
  return true;
}

export async function incrementLinkClickCount(id: string): Promise<boolean> {
  const link = await getPartnerLinkById(id);
  if (!link) return false;
  await updatePartnerLink(id, { clickCount: (link.clickCount || 0) + 1 });
  return true;
}

/* ============================================
   PlanTask Functions
   ============================================ */

export async function getPlanTasks(): Promise<PlanTask[]> {
  const tasks = await kv.get('plan_tasks') as PlanTask[] | null;
  return tasks || [];
}

export async function savePlanTasks(tasks: PlanTask[]): Promise<void> {
  await kv.set('plan_tasks', tasks);
}

export async function getPlanTaskById(id: string): Promise<PlanTask | null> {
  const tasks = await getPlanTasks();
  return tasks.find((t) => t.id === id) || null;
}

export async function getPlanTasksByPartnerId(partnerId: string): Promise<PlanTask[]> {
  const tasks = await getPlanTasks();
  return tasks.filter((t) => t.partnerId === partnerId);
}

export async function getPlanTasksByPartnerIdAndCycle(partnerId: string, cycleStart: string): Promise<PlanTask[]> {
  const tasks = await getPlanTasksByPartnerId(partnerId);
  return tasks.filter((t) => t.cycleStart === cycleStart);
}

export async function createPlanTask(task: PlanTask): Promise<PlanTask> {
  const tasks = await getPlanTasks();
  tasks.push(task);
  await savePlanTasks(tasks);
  return task;
}

export async function updatePlanTask(id: string, updates: Partial<PlanTask>): Promise<PlanTask | null> {
  const tasks = await getPlanTasks();
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) return null;

  tasks[index] = { ...tasks[index], ...updates };
  await savePlanTasks(tasks);
  return tasks[index];
}

export async function deletePlanTask(id: string): Promise<boolean> {
  const tasks = await getPlanTasks();
  const filtered = tasks.filter((t) => t.id !== id);
  if (filtered.length === tasks.length) return false;
  await savePlanTasks(filtered);
  return true;
}

export async function togglePlanTaskCompletion(id: string): Promise<PlanTask | null> {
  const task = await getPlanTaskById(id);
  if (!task) return null;
  return updatePlanTask(id, { completed: !task.completed });
}
