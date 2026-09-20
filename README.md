# e-Invois Sabah 📄

> Aplikasi Micro-SaaS e-Invois ringkas untuk peniaga kecil, usahawan mikro, dan freelancer di Sabah, Malaysia.

## 🎯 Objektif

Membantu peniaga kecil di Sabah untuk:
- Jana invois profesional dengan pantas (kurang dari 2 minit)
- Patuh dengan keperluan e-Invois LHDN Malaysia
- Kongsi invois melalui WhatsApp atau muat turun PDF
- Guna dari telefon bimbit (mobile-first)

## 🏗️ Struktur Projek

```
├── src/                          # Frontend (React + Vite + Tailwind CSS)
│   ├── App.tsx                   # Komponen utama + navigasi
│   ├── types.ts                  # Type definitions
│   ├── index.css                 # Tailwind CSS + custom styles
│   ├── main.tsx                  # Entry point
│   ├── components/
│   │   ├── HomePage.tsx          # Landing page
│   │   ├── InvoiceForm.tsx       # Borang jana invois
│   │   ├── InvoicePreview.tsx    # Paparan & kongsi invois
│   │   └── InvoiceList.tsx       # Senarai invois tersimpan
│   └── utils/
│       ├── storage.ts            # LocalStorage helpers
│       └── pdf.ts                # PDF generation (jsPDF)
│
├── worker/                       # Backend (Cloudflare Workers + D1)
│   ├── src/
│   │   └── index.ts              # Worker script (API endpoints)
│   ├── schema.sql                # D1 database schema
│   └── wrangler.toml             # Cloudflare config
│
├── index.html                    # HTML entry
├── vite.config.js                # Vite configuration
└── package.json                  # Dependencies
```

## 🚀 Cara Guna (Frontend MVP)

### Development
```bash
npm install
npm run dev
```

### Build
```bash
npm run build
```

### Deploy Frontend
Fail dalam `dist/` boleh di-deploy ke mana-mana static hosting (Cloudflare Pages, Netlify, Vercel, dll.)

## 🔧 Deploy Backend (Cloudflare Workers + D1)

### Prasyarat
```bash
npm install -g wrangler
wrangler login
```

### Setup D1 Database
```bash
# Database sudah dicipta dengan ID: 36e6ad4d-a715-4f2b-8b4a-70ecc5c05fde
# Apply schema:
wrangler d1 execute einvois-db --file=worker/schema.sql
```

### Deploy Worker
```bash
cd worker
wrangler deploy
```

### API Endpoints
| Method | Endpoint | Keterangan |
|--------|----------|------------|
| GET | `/api/invoices` | Senarai semua invois |
| POST | `/api/invoices` | Cipta invois baru |
| GET | `/api/invoices/:id` | Dapatkan invois |
| PUT | `/api/invoices/:id` | Kemas kini invois |
| DELETE | `/api/invoices/:id` | Padam invois |
| GET | `/api/seller` | Dapatkan info penjual |
| POST | `/api/seller` | Simpan info penjual |

## 📋 Ciri-ciri Utama

### ✅ MVP (Sedia Guna)
- [x] Borang pengisian pantas (penjual + pembeli)
- [x] Sokongan medan item/produk dengan pengiraan automatik
- [x] Mata wang MYR (Ringgit Malaysia)
- [x] Sokongan Standard & Consolidated e-Invoice
- [x] Penjanaan PDF
- [x] Perkongsian WhatsApp
- [x] UI mobile-first, minimalis
- [x] Simpan invois ke localStorage
- [x] Simpan maklumat penjual (auto-fill)

### 🔜 Fasa Seterusnya
- [ ] Integrasi penuh dengan Cloudflare D1 API
- [ ] Pengesahan pengguna (authentication)
- [ ] QR code pada invois
- [ ] Sokongan multi-bahasa (BM, English, Cina)
- [ ] Template invois kustom
- [ ] Dashboard analitik ringkas
- [ ] PWA (Progressive Web App)
- [ ] Integrasi e-Invois LHDN (MyInvois API)

## 🗄️ Skema Pangkalan Data (D1/SQLite)

### Table: invoices
```sql
- id (TEXT, PRIMARY KEY)
- invoice_no (TEXT)
- date (TEXT)
- due_date (TEXT)
- seller (TEXT - JSON)
- buyer (TEXT - JSON)
- items (TEXT - JSON array)
- subtotal (REAL)
- sst (REAL)
- total (REAL)
- notes (TEXT)
- type (TEXT: 'standard' | 'consolidated')
- status (TEXT: 'draft' | 'issued' | 'paid')
- created_at (TEXT)
```

### Table: seller_info
```sql
- id (TEXT, PRIMARY KEY)
- name, ssm_no, tin_no, address, city, state, postcode, phone, email
```

## 💰 Kos Operasi

| Komponen | Kos |
|----------|-----|
| Cloudflare Workers | PERCUMA (100K requests/hari) |
| Cloudflare D1 | PERCUMA (5GB storage, 5M reads/hari) |
| Cloudflare Pages | PERCUMA (unlimited bandwidth) |
| **Jumlah** | **RM 0/bulan** |

## 📱 Reka Bentuk UI

- Mobile-first responsive design
- Minimalis & bersih (kurang distraction)
- Font Inter untuk keterbacaan
- Warna utama: Sky blue (#0ea5e9)
- Rounded corners untuk sentuhan mesra
- Touch-friendly buttons (min 44px)
- Fast loading (< 200KB gzipped)

## 📜 Pematuhan LHDN

Format invois ini menyokong keperluan asas e-Invois LHDN:
- Nombor invois unik
- Maklumat TIN (Tax Identification Number)
- Maklumat SSM (Suruhanjaya Syarikat Malaysia)
- Tarikh invois & tarikh due
- Butiran penjual & pembeli yang lengkap
- Sokongan Consolidated e-Invoice untuk transaksi B2C

---

**Dibina dengan ❤️ untuk peniaga kecil Sabah** 🌴
