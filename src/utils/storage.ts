import { Invoice, SellerInfo, BuyerInfo } from '../types';

const STORAGE_KEY = 'einvois_sabah_invoices';
const SELLER_KEY = 'einvois_sabah_seller';

export function saveInvoice(invoice: Invoice): void {
  const invoices = getInvoices();
  const existingIndex = invoices.findIndex(i => i.id === invoice.id);
  if (existingIndex >= 0) {
    invoices[existingIndex] = invoice;
  } else {
    invoices.push(invoice);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices));
}

export function getInvoices(): Invoice[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function deleteInvoice(id: string): void {
  const invoices = getInvoices().filter(i => i.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices));
}

/** Replace the entire local invoice list (used by cloud sync merge). */
export function replaceAllInvoices(invoices: Invoice[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices));
}

export function getInvoiceById(id: string): Invoice | undefined {
  return getInvoices().find(i => i.id === id);
}

export function saveSellerInfo(seller: SellerInfo): void {
  localStorage.setItem(SELLER_KEY, JSON.stringify(seller));
}

export function getSellerInfo(): SellerInfo | null {
  try {
    const data = localStorage.getItem(SELLER_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function generateInvoiceNo(): string {
  const date = new Date();
  const prefix = 'INV';
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const invoices = getInvoices();
  const count = invoices.length + 1;
  return `${prefix}-${year}${month}-${count.toString().padStart(4, '0')}`;
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function getDefaultBuyer(): BuyerInfo {
  return {
    name: '',
    idNo: '',
    tinNo: '',
    address: '',
    city: '',
    state: 'Sabah',
    postcode: '',
    phone: '',
    email: '',
  };
}

export function formatCurrency(amount: number): string {
  return `RM ${amount.toFixed(2)}`;
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('ms-MY', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
