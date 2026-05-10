const BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

// ─── Shipments ───────────────────────────────────────────────────────────────

export interface Shipment {
  id: string;
  name: string;
  date: string;
  status: 'open' | 'reviewing' | 'approved';
  period?: string;
}

export interface EntryItem {
  itemName: string;
  count: number;
  unit: string;
  category: string;
}

export interface VolunteerEntry {
  id: string;
  shipmentId: string;
  volunteerName: string;
  items: EntryItem[];
}

export const shipmentsApi = {
  list: () => request<Shipment[]>('/shipments'),
  get: (id: string) => request<Shipment>(`/shipments/${id}`),
  create: (data: { name: string; date: string; period?: string }) =>
    request<Shipment>('/shipments', { method: 'POST', body: JSON.stringify(data) }),
  updateStatus: (id: string, status: string) =>
    request<Shipment>(`/shipments/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  getEntries: (shipmentId: string) =>
    request<VolunteerEntry[]>(`/shipments/${shipmentId}/entries`),
  saveEntry: (shipmentId: string, volunteerName: string, items: EntryItem[]) =>
    request<VolunteerEntry>(`/shipments/${shipmentId}/entries`, {
      method: 'POST',
      body: JSON.stringify({ volunteerName, items }),
    }),
  getSum: (shipmentId: string) =>
    request<EntryItem[]>(`/shipments/${shipmentId}/sum`),
};

// ─── Catalog ─────────────────────────────────────────────────────────────────

export interface CatalogItem {
  id: string;
  name: string;
  unit: string;
  category: string;
  description: string;
  standardized: boolean;
  postedBy: string;
}

export const catalogApi = {
  list: () => request<CatalogItem[]>('/catalog'),
  add: (data: Omit<CatalogItem, 'id' | 'standardized'>) =>
    request<CatalogItem>('/catalog', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<CatalogItem>) =>
    request<CatalogItem>(`/catalog/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id: string) =>
    request<{ success: boolean }>(`/catalog/${id}`, { method: 'DELETE' }),
};

// ─── Pricing ─────────────────────────────────────────────────────────────────

export interface PriceEntry {
  id: string;
  itemName: string;
  unit: string;
  dollarsPerUnit: number;
  updatedBy: string;
}

export const pricingApi = {
  list: () => request<PriceEntry[]>('/pricing'),
  upsert: (itemName: string, data: { unit: string; dollarsPerUnit: number; updatedBy?: string }) =>
    request<PriceEntry>(`/pricing/${encodeURIComponent(itemName)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  remove: (itemName: string) =>
    request<{ success: boolean }>(`/pricing/${encodeURIComponent(itemName)}`, { method: 'DELETE' }),
};
