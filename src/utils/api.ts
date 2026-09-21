import { Invoice, SellerInfo, BuyerInfo } from '../types';
import {
  getInvoices,
  getInvoiceById,
  replaceAllInvoices,
  updateInvoiceStatus,
  getSellerInfo,
  saveSellerInfo as saveSellerLocal,
} from './storage';
import { createReceiptJournal } from './kira';

/**
 * Cloud sync layer (offline-first).
 *
 * - localStorage remains the primary store for immediate reads
 * - The D1 database (/api/*) acts as a mirror so invoices survive device
 *   changes and browser resets
 * - On sync, both sides are merged by invoice id; the copy with the newer
 *   `createdAt` wins; local-only invoices are pushed to the cloud
 * - If the API is unreachable (offline, D1 not yet set up), everything
 *   still works from localStorage
 */

interface InvoiceRow {
  id: string;
  invoice_no: string;
  date: string;
  due_date: string | null;
  seller: string;
  buyer: string;
  items: string;
  subtotal: number;
  sst: number;
  total: number;
  notes: string | null;
  type: string;
  status: string;
  created_at: string;
}

function rowToInvoice(row: InvoiceRow): Invoice {
  return {
    id: row.id,
    invoiceNo: row.invoice_no,
    date: row.date,
    dueDate: row.due_date || '',
    seller: safeParse<SellerInfo>(row.seller, {} as SellerInfo),
    buyer: safeParse<BuyerInfo>(row.buyer, {} as BuyerInfo),
    items: safeParse(row.items, []),
    subtotal: row.subtotal,
    sst: row.sst,
    total: row.total,
    notes: row.notes || '',
    type: row.type === 'consolidated' ? 'consolidated' : 'standard',
    status: (row.status as Invoice['status']) || 'draft',
    createdAt: row.created_at,
  };
}

function safeParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

function toPayload(invoice: Invoice) {
  return {
    id: invoice.id,
    createdAt: invoice.createdAt,
    status: invoice.status,
    invoiceNo: invoice.invoiceNo,
    date: invoice.date,
    dueDate: invoice.dueDate,
    seller: invoice.seller,
    buyer: invoice.buyer,
    items: invoice.items,
    subtotal: invoice.subtotal,
    sst: invoice.sst,
    total: invoice.total,
    notes: invoice.notes,
    type: invoice.type,
  };
}

async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
  });
  if (!res.ok) throw new Error(`API ${path} failed: ${res.status}`);
  return res;
}

/** Push a single invoice to the cloud (create or update). Never throws. */
export async function pushInvoice(invoice: Invoice): Promise<boolean> {
  try {
    const res = await fetch(`/api/invoices/${invoice.id}`);
    if (!res.ok && res.status !== 404) throw new Error(`API check failed: ${res.status}`);
    const exists = res.ok;
    await apiFetch(`/api/invoices/${invoice.id}`, {
      method: exists ? 'PUT' : 'POST',
      body: JSON.stringify(toPayload(invoice)),
    });
    return true;
  } catch (err) {
    console.warn('[e-invois] Cloud sync (push) failed, invoice kept locally:', err);
    return false;
  }
}

/** Delete an invoice from the cloud. Never throws. */
export async function deleteInvoiceRemote(id: string): Promise<boolean> {
  try {
    await apiFetch(`/api/invoices/${id}`, { method: 'DELETE' });
    return true;
  } catch (err) {
    console.warn('[e-invois] Cloud sync (delete) failed:', err);
    return false;
  }
}

/**
 * Mark an invoice's status (e.g. 'paid') locally and mirror to the cloud.
 * Returns the updated invoice, or undefined if not found.
 */
export function setInvoiceStatus(id: string, status: Invoice['status']): Invoice | undefined {
  const updated = updateInvoiceStatus(id, status);
  if (updated) {
    void pushInvoice(updated);
    // Auto-journal to Kira Enterprise on payment (Dr Bank / Cr AR)
    if (status === 'paid') void createReceiptJournal(updated);
  }
  return updated;
}

/** Display helpers for invoice status. */
export function statusLabel(status: Invoice['status']): string {
  switch (status) {
    case 'paid':
      return 'Sudah Bayar';
    case 'issued':
      return 'Dihantar';
    default:
      return 'Draf';
  }
}

export function statusClasses(status: Invoice['status']): string {
  switch (status) {
    case 'paid':
      return 'bg-emerald-900/30 text-emerald-300';
    case 'issued':
      return 'bg-sky-900/30 text-sky-300';
    default:
      return 'bg-amber-900/30 text-amber-300';
  }
}

/**
 * Merge cloud invoices into the local store and push local-only invoices up.
 * Returns the merged list (newest first). Falls back to local-only on failure.
 */
export async function syncInvoices(): Promise<{ invoices: Invoice[]; synced: boolean }> {
  const local = getInvoices();
  try {
    const res = await apiFetch('/api/invoices');
    const json = await res.json();
    const remote: Invoice[] = ((json.data || []) as InvoiceRow[]).map(rowToInvoice);

    // Merge by id, newest createdAt wins
    const map = new Map<string, Invoice>();
    for (const inv of [...local, ...remote]) {
      const existing = map.get(inv.id);
      if (!existing || new Date(inv.createdAt).getTime() > new Date(existing.createdAt).getTime()) {
        map.set(inv.id, inv);
      }
    }
    const merged = [...map.values()].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Persist merged view locally so reads stay fast and offline-proof
    replaceAllInvoices(merged);

    // Push local-only invoices to the cloud
    const remoteIds = new Set(remote.map(r => r.id));
    const localOnly = local.filter(inv => !remoteIds.has(inv.id));
    await Promise.all(localOnly.map(inv => pushInvoice(inv)));

    return { invoices: merged, synced: true };
  } catch (err) {
    console.warn('[e-invois] Cloud sync unavailable, using device data:', err);
    return { invoices: local, synced: false };
  }
}

/** Load seller info from the cloud when the device has none stored yet. */
export async function fetchSellerInfo(): Promise<SellerInfo | null> {
  const local = getSellerInfo();
  if (local) return local;
  try {
    const res = await apiFetch('/api/seller');
    const json = await res.json();
    if (!json.data) return null;
    const row = json.data as Record<string, string>;
    const seller: SellerInfo = {
      name: row.name || '',
      ssmNo: row.ssm_no || '',
      tinNo: row.tin_no || '',
      address: row.address || '',
      city: row.city || '',
      state: row.state || 'Sabah',
      postcode: row.postcode || '',
      phone: row.phone || '',
      email: row.email || '',
    };
    saveSellerLocal(seller);
    return seller;
  } catch {
    return local;
  }
}

/** Save seller info locally and mirror to the cloud. */
export async function syncSellerInfo(seller: SellerInfo): Promise<void> {
  saveSellerLocal(seller);
  try {
    await apiFetch('/api/seller', { method: 'POST', body: JSON.stringify(seller) });
  } catch (err) {
    console.warn('[e-invois] Seller cloud sync failed, saved locally:', err);
  }
}

