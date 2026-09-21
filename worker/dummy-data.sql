-- ============================================
-- e-Invois Sabah - Dummy / Demo Data
-- 4 contoh invois untuk syarikat contoh:
--   Buyuk Enterprise, Jujur Enterprise,
--   Untung Enterprise, Rugi Enterprise
--
-- Jalankan: wrangler d1 execute einvois-db --remote --file=worker/dummy-data.sql
-- ============================================

INSERT OR REPLACE INTO invoices (id, invoice_no, date, due_date, seller, buyer, items, subtotal, sst, total, notes, type, status, created_at) VALUES
(
  'demo-inv-001', 'INV-2609-0001', '2026-09-15', '2026-09-30',
  '{"name":"Koperasi Sabah Maju","ssmNo":"SA0123456-K","tinNo":"C1234567890","address":"Lot 12, Jalan Gaya","city":"Kota Kinabalu","state":"Sabah","postcode":"88000","phone":"088-123456","email":"sabahmaju@example.com"}',
  '{"name":"Buyuk Enterprise","idNo":"","tinNo":"C2100000031","address":"Lot 45, Jalan Pantai","city":"Kota Kinabalu","state":"Sabah","postcode":"88000","phone":"088-210001","email":"buyuk@example.com"}',
  '[{"id":"i1","description":"Bekalan Kertas A4 (Kotak)","quantity":10,"unitPrice":12.50,"amount":125.00},{"id":"i2","description":"Toner Printer HP 12A","quantity":2,"unitPrice":85.00,"amount":170.00},{"id":"i3","description":"Fail Arkib Besar","quantity":5,"unitPrice":9.00,"amount":45.00}]',
  340.00, 27.20, 367.20,
  'Data contoh untuk demo', 'standard', 'issued', '2026-09-15T09:00:00.000Z'
),
(
  'demo-inv-002', 'INV-2609-0002', '2026-09-16', '2026-10-01',
  '{"name":"Koperasi Sabah Maju","ssmNo":"SA0123456-K","tinNo":"C1234567890","address":"Lot 12, Jalan Gaya","city":"Kota Kinabalu","state":"Sabah","postcode":"88000","phone":"088-123456","email":"sabahmaju@example.com"}',
  '{"name":"Jujur Enterprise","idNo":"","tinNo":"C2100000032","address":"No. 8, Jalan Tawau","city":"Tawau","state":"Sabah","postcode":"91000","phone":"089-210002","email":"jujur@example.com"}',
  '[{"id":"i1","description":"Servis Penyelenggaraan Bulanan","quantity":1,"unitPrice":450.00,"amount":450.00},{"id":"i4","description":"Tukar Filter Air Cond","quantity":3,"unitPrice":60.00,"amount":180.00}]',
  630.00, 50.40, 680.40,
  'Data contoh untuk demo', 'standard', 'issued', '2026-09-16T10:30:00.000Z'
),
(
  'demo-inv-003', 'INV-2609-0003', '2026-09-17', '2026-10-02',
  '{"name":"Koperasi Sabah Maju","ssmNo":"SA0123456-K","tinNo":"C1234567890","address":"Lot 12, Jalan Gaya","city":"Kota Kinabalu","state":"Sabah","postcode":"88000","phone":"088-123456","email":"sabahmaju@example.com"}',
  '{"name":"Untung Enterprise","idNo":"","tinNo":"C2100000033","address":"Lot 21, Jalan Sandakan","city":"Sandakan","state":"Sabah","postcode":"90000","phone":"089-210003","email":"untung@example.com"}',
  '[{"id":"i1","description":"Beras Super Tempatan 25kg","quantity":20,"unitPrice":85.00,"amount":1700.00},{"id":"i2","description":"Minyak Masak 5kg","quantity":15,"unitPrice":42.00,"amount":630.00}]',
  2330.00, 186.40, 2516.40,
  'Data contoh untuk demo', 'standard', 'paid', '2026-09-17T14:00:00.000Z'
),
(
  'demo-inv-004', 'INV-2609-0004', '2026-09-18', '2026-10-03',
  '{"name":"Koperasi Sabah Maju","ssmNo":"SA0123456-K","tinNo":"C1234567890","address":"Lot 12, Jalan Gaya","city":"Kota Kinabalu","state":"Sabah","postcode":"88000","phone":"088-123456","email":"sabahmaju@example.com"}',
  '{"name":"Rugi Enterprise","idNo":"","tinNo":"C2100000034","address":"Lot 7, Jalan Keningau","city":"Keningau","state":"Sabah","postcode":"89000","phone":"087-210004","email":"rugi@example.com"}',
  '[{"id":"i1","description":"Khidmat Pembersihan Pejabat","quantity":2,"unitPrice":300.00,"amount":600.00}]',
  600.00, 48.00, 648.00,
  'Data contoh untuk demo', 'consolidated', 'draft', '2026-09-18T16:20:00.000Z'
);

-- Demo seller info (auto-fill dalam borang)
INSERT OR REPLACE INTO seller_info (id, name, ssm_no, tin_no, address, city, state, postcode, phone, email) VALUES
(
  'default',
  'Koperasi Sabah Maju',
  'SA0123456-K',
  'C1234567890',
  'Lot 12, Jalan Gaya',
  'Kota Kinabalu',
  'Sabah',
  '88000',
  '088-123456',
  'sabahmaju@example.com'
);
