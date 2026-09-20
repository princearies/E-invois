/**
 * Cloudflare Worker - e-Invois Sabah Backend API
 * 
 * Fail ini adalah rujukan untuk deployment ke Cloudflare Workers.
 * Gunakan wrangler.toml di bawah untuk konfigurasi.
 * 
 * ARKITEKTUR:
 * - Cloudflare Workers (serverless runtime)
 * - Cloudflare D1 (SQLite database)
 * - Binding: DB -> einvois-db
 * 
 * ENDPOINTS:
 * - GET  /api/invoices      - Senarai semua invois
 * - POST /api/invoices      - Cipta invois baru
 * - GET  /api/invoices/:id  - Dapatkan invois tertentu
 * - PUT  /api/invoices/:id  - Kemas kini invois
 * - DELETE /api/invoices/:id - Padam invois
 * - GET  /api/seller        - Dapatkan maklumat penjual tersimpan
 * - POST /api/seller        - Simpan maklumat penjual
 * - GET  /api/invoices/:id/pdf - Jana PDF
 */

export interface Env {
  DB: D1Database;
}

interface InvoicePayload {
  invoiceNo: string;
  date: string;
  dueDate: string;
  seller: {
    name: string;
    ssmNo: string;
    tinNo: string;
    address: string;
    city: string;
    state: string;
    postcode: string;
    phone: string;
    email: string;
  };
  buyer: {
    name: string;
    idNo: string;
    tinNo: string;
    address: string;
    city: string;
    state: string;
    postcode: string;
    phone: string;
    email: string;
  };
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }>;
  subtotal: number;
  sst: number;
  total: number;
  notes: string;
  type: 'standard' | 'consolidated';
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Router
      if (path === '/api/invoices' && method === 'GET') {
        return await handleListInvoices(env, corsHeaders);
      }
      if (path === '/api/invoices' && method === 'POST') {
        return await handleCreateInvoice(request, env, corsHeaders);
      }
      if (path.match(/^\/api\/invoices\/[\w-]+$/) && method === 'GET') {
        const id = path.split('/').pop()!;
        return await handleGetInvoice(id, env, corsHeaders);
      }
      if (path.match(/^\/api\/invoices\/[\w-]+$/) && method === 'PUT') {
        const id = path.split('/').pop()!;
        return await handleUpdateInvoice(id, request, env, corsHeaders);
      }
      if (path.match(/^\/api\/invoices\/[\w-]+$/) && method === 'DELETE') {
        const id = path.split('/').pop()!;
        return await handleDeleteInvoice(id, env, corsHeaders);
      }
      if (path === '/api/seller' && method === 'GET') {
        return await handleGetSeller(env, corsHeaders);
      }
      if (path === '/api/seller' && method === 'POST') {
        return await handleSaveSeller(request, env, corsHeaders);
      }

      return new Response(JSON.stringify({ error: 'Not Found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};

// === HANDLERS ===

async function handleListInvoices(env: Env, headers: Record<string, string>): Promise<Response> {
  const { results } = await env.DB.prepare(
    'SELECT * FROM invoices ORDER BY created_at DESC'
  ).all();
  return Response.json({ data: results }, { headers });
}

async function handleCreateInvoice(request: Request, env: Env, headers: Record<string, string>): Promise<Response> {
  const payload: InvoicePayload = await request.json();
  const id = generateId();
  const now = new Date().toISOString();

  await env.DB.prepare(`
    INSERT INTO invoices (id, invoice_no, date, due_date, seller, buyer, items, subtotal, sst, total, notes, type, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id,
    payload.invoiceNo,
    payload.date,
    payload.dueDate,
    JSON.stringify(payload.seller),
    JSON.stringify(payload.buyer),
    JSON.stringify(payload.items),
    payload.subtotal,
    payload.sst,
    payload.total,
    payload.notes,
    payload.type,
    'draft',
    now
  ).run();

  return Response.json({ data: { id, ...payload, createdAt: now } }, { headers });
}

async function handleGetInvoice(id: string, env: Env, headers: Record<string, string>): Promise<Response> {
  const result = await env.DB.prepare('SELECT * FROM invoices WHERE id = ?').bind(id).first();
  if (!result) {
    return Response.json({ error: 'Invoice not found' }, { status: 404, headers });
  }
  return Response.json({ data: result }, { headers });
}

async function handleUpdateInvoice(id: string, request: Request, env: Env, headers: Record<string, string>): Promise<Response> {
  const payload: InvoicePayload = await request.json();

  await env.DB.prepare(`
    UPDATE invoices SET
      invoice_no = ?, date = ?, due_date = ?, seller = ?, buyer = ?,
      items = ?, subtotal = ?, sst = ?, total = ?, notes = ?, type = ?
    WHERE id = ?
  `).bind(
    payload.invoiceNo,
    payload.date,
    payload.dueDate,
    JSON.stringify(payload.seller),
    JSON.stringify(payload.buyer),
    JSON.stringify(payload.items),
    payload.subtotal,
    payload.sst,
    payload.total,
    payload.notes,
    payload.type,
    id
  ).run();

  return Response.json({ data: { id, ...payload } }, { headers });
}

async function handleDeleteInvoice(id: string, env: Env, headers: Record<string, string>): Promise<Response> {
  await env.DB.prepare('DELETE FROM invoices WHERE id = ?').bind(id).run();
  return Response.json({ success: true }, { headers });
}

async function handleGetSeller(env: Env, headers: Record<string, string>): Promise<Response> {
  const result = await env.DB.prepare('SELECT * FROM seller_info LIMIT 1').first();
  return Response.json({ data: result }, { headers });
}

async function handleSaveSeller(request: Request, env: Env, headers: Record<string, string>): Promise<Response> {
  const seller = await request.json();
  
  // Upsert
  await env.DB.prepare(`
    INSERT INTO seller_info (id, name, ssm_no, tin_no, address, city, state, postcode, phone, email)
    VALUES ('default', ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name, ssm_no = excluded.ssm_no, tin_no = excluded.tin_no,
      address = excluded.address, city = excluded.city, state = excluded.state,
      postcode = excluded.postcode, phone = excluded.phone, email = excluded.email
  `).bind(
    seller.name, seller.ssmNo, seller.tinNo,
    seller.address, seller.city, seller.state, seller.postcode,
    seller.phone, seller.email
  ).run();

  return Response.json({ success: true }, { headers });
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}
