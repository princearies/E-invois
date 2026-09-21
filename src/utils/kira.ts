import { Invoice } from '../types';

/**
 * Kira Enterprise v5.3 integration.
 *
 * When an invoice is created, a sales journal is automatically posted to
 * Kira Enterprise (double-entry):
 *   Dr 1003 Akaun Belum Terima (AR)  = invoice total
 *   Cr 4001 Jualan                   = subtotal
 *   Cr 2005 SST                      = sst (if any)
 *
 * When an invoice is marked paid, a receipt journal is posted:
 *   Dr 1002 Bank                     = invoice total
 *   Cr 1003 Akaun Belum Terima (AR)  = invoice total
 *
 * The target company (company_code) is selected once in the invoice form and
 * stored on the device. Journal creation is idempotent per invoice.
 */

const KIRA_API = 'https://kiraenterprisev5-3.mykira.workers.dev';
const COMPANY_KEY = 'einvois_kira_company';
const JOURNAL_KEY = 'einvois_kira_journals';

export interface KiraCompany {
  client_id: string;
  entity_name: string;
  entity_type: string;
  status: string;
}

interface JournalLine {
  account: string;
  accountName: string;
  debit: number;
  credit: number;
}

interface JournalState {
  sale?: boolean;
  receipt?: boolean;
}

export function getKiraCompany(): string {
  try {
    return localStorage.getItem(COMPANY_KEY) || '';
  } catch {
    return '';
  }
}

export function setKiraCompany(code: string): void {
  localStorage.setItem(COMPANY_KEY, code);
}

export async function fetchKiraCompanies(): Promise<KiraCompany[]> {
  try {
    const res = await fetch(`${KIRA_API}/api/clients`);
    if (!res.ok) return [];
    const json = await res.json();
    return json.success ? (json.data as KiraCompany[]) : [];
  } catch {
    return [];
  }
}

function getJournalMap(): Record<string, JournalState> {
  try {
    return JSON.parse(localStorage.getItem(JOURNAL_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveJournalMap(map: Record<string, JournalState>): void {
  localStorage.setItem(JOURNAL_KEY, JSON.stringify(map));
}

/** Whether journals were already posted for this invoice (per device). */
export function journalState(invoiceId: string): JournalState {
  return getJournalMap()[invoiceId] || {};
}

async function postJournal(
  companyCode: string,
  date: string,
  description: string,
  lines: JournalLine[]
): Promise<void> {
  const res = await fetch(`${KIRA_API}/api/journal-entries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ company_code: companyCode, date, description, lines }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Jurnal gagal disimpan');
}

/**
 * Sales journal for a newly issued invoice (credit sale):
 *   Dr 1003 Akaun Belum Terima (AR)  = total
 *   Cr 4001 Jualan                   = subtotal
 *   Cr 2005 SST                      = sst
 * Idempotent: skips if already posted. Returns true if posted (or already was).
 */
export async function createSaleJournal(invoice: Invoice): Promise<boolean> {
  const company = getKiraCompany();
  if (!company) return false;
  const map = getJournalMap();
  if (map[invoice.id]?.sale) return true;
  try {
    const lines: JournalLine[] = [
      { account: '1003', accountName: 'Akaun Belum Terima (Debtor)', debit: invoice.total, credit: 0 },
      { account: '4001', accountName: 'Jualan', debit: 0, credit: invoice.subtotal },
    ];
    if (invoice.sst > 0) {
      lines.push({ account: '2005', accountName: 'SST', debit: 0, credit: invoice.sst });
    }
    await postJournal(
      company,
      invoice.date,
      `Invois ${invoice.invoiceNo} - ${invoice.buyer.name || 'Pelanggan'}`,
      lines
    );
    map[invoice.id] = { ...map[invoice.id], sale: true };
    saveJournalMap(map);
    return true;
  } catch (err) {
    console.warn('[e-invois] Kira journal (jualan) failed:', err);
    return false;
  }
}

/**
 * Receipt journal when an invoice is marked paid:
 *   Dr 1002 Bank                     = total
 *   Cr 1003 Akaun Belum Terima (AR)  = total
 * Idempotent: skips if already posted. Returns true if posted (or already was).
 */
export async function createReceiptJournal(invoice: Invoice): Promise<boolean> {
  const company = getKiraCompany();
  if (!company) return false;
  const map = getJournalMap();
  if (map[invoice.id]?.receipt) return true;
  try {
    await postJournal(
      company,
      invoice.date,
      `Bayaran Invois ${invoice.invoiceNo} - ${invoice.buyer.name || 'Pelanggan'}`,
      [
        { account: '1002', accountName: 'Bank', debit: invoice.total, credit: 0 },
        { account: '1003', accountName: 'Akaun Belum Terima (Debtor)', debit: 0, credit: invoice.total },
      ]
    );
    map[invoice.id] = { ...map[invoice.id], receipt: true };
    saveJournalMap(map);
    return true;
  } catch (err) {
    console.warn('[e-invois] Kira journal (bayaran) failed:', err);
    return false;
  }
}

