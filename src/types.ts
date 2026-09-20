export interface SellerInfo {
  name: string;
  ssmNo: string;
  tinNo: string;
  address: string;
  city: string;
  state: string;
  postcode: string;
  phone: string;
  email: string;
}

export interface BuyerInfo {
  name: string;
  idNo: string;
  tinNo: string;
  address: string;
  city: string;
  state: string;
  postcode: string;
  phone: string;
  email: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  date: string;
  dueDate: string;
  seller: SellerInfo;
  buyer: BuyerInfo;
  items: InvoiceItem[];
  subtotal: number;
  sst: number;
  total: number;
  notes: string;
  type: 'standard' | 'consolidated';
  status: 'draft' | 'issued' | 'paid';
  createdAt: string;
}

export type Page = 'home' | 'create' | 'preview' | 'list';
