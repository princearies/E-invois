-- ============================================
-- e-Invois Sabah - Cloudflare D1 Schema
-- Database: einvois-db
-- ============================================

-- Table: invoices
-- Menyimpan semua invois yang dijana
CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY,
  invoice_no TEXT NOT NULL,
  date TEXT NOT NULL,
  due_date TEXT,
  seller TEXT NOT NULL,          -- JSON: SellerInfo object
  buyer TEXT NOT NULL,           -- JSON: BuyerInfo object
  items TEXT NOT NULL,           -- JSON: Array of InvoiceItem
  subtotal REAL NOT NULL DEFAULT 0,
  sst REAL NOT NULL DEFAULT 0,
  total REAL NOT NULL DEFAULT 0,
  notes TEXT DEFAULT '',
  type TEXT NOT NULL DEFAULT 'standard',  -- 'standard' or 'consolidated'
  status TEXT NOT NULL DEFAULT 'draft',   -- 'draft', 'issued', 'paid'
  created_at TEXT NOT NULL,
  updated_at TEXT
);

-- Table: seller_info
-- Menyimpan maklumat penjual (satu rekod sahaja, di-upsert)
CREATE TABLE IF NOT EXISTS seller_info (
  id TEXT PRIMARY KEY DEFAULT 'default',
  name TEXT NOT NULL DEFAULT '',
  ssm_no TEXT DEFAULT '',
  tin_no TEXT DEFAULT '',
  address TEXT DEFAULT '',
  city TEXT DEFAULT '',
  state TEXT DEFAULT 'Sabah',
  postcode TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  email TEXT DEFAULT ''
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(date);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_type ON invoices(type);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at);
