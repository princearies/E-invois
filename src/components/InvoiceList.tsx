import React from 'react';
import { Invoice } from '../types';
import { deleteInvoice, formatCurrency, formatDate } from '../utils/storage';
import { syncInvoices, deleteInvoiceRemote } from '../utils/api';

interface Props {
  onPreview: (invoice: Invoice) => void;
  onEdit: (invoice: Invoice) => void;
}

export default function InvoiceList({ onPreview, onEdit }: Props) {
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [synced, setSynced] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    syncInvoices().then(({ invoices: merged, synced: ok }) => {
      if (cancelled) return;
      setInvoices(merged);
      setSynced(ok);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleDelete = (id: string) => {
    if (confirm('Padam invois ini?')) {
      deleteInvoice(id);
      void deleteInvoiceRemote(id);
      setInvoices(prev => prev.filter(i => i.id !== id));
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="text-5xl mb-4 animate-pulse">📋</div>
        <p className="text-sm text-slate-500">Memuatkan invois…</p>
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="text-5xl mb-4">📋</div>
        <h2 className="text-lg font-semibold text-slate-300 mb-2">Tiada Invois Lagi</h2>
        <p className="text-sm text-slate-500">Mula jana invois pertama anda!</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-200">
          Senarai Invois ({invoices.length})
        </h2>
        <span
          className={`text-[10px] px-2 py-1 rounded-full font-medium ${
            synced
              ? 'bg-emerald-900/30 text-emerald-300'
              : 'bg-amber-900/30 text-amber-300'
          }`}
          title={
            synced
              ? 'Invois disegerakkan dengan awan (D1)'
              : 'Mod luar talian — invois disimpan pada peranti sahaja'
          }
        >
          {synced ? '☁️ Disegerak' : '⚠️ Peranti sahaja'}
        </span>
      </div>
      <div className="space-y-3">
        {invoices.map(invoice => (
          <div
            key={invoice.id}
            className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50 hover:border-slate-600 transition-all"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-semibold text-sm text-slate-200">{invoice.invoiceNo}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {invoice.buyer.name || 'Tanpa nama pembeli'}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-sm text-sky-300">{formatCurrency(invoice.total)}</p>
                <p className="text-[10px] text-slate-500">{formatDate(invoice.date)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                invoice.type === 'consolidated'
                  ? 'bg-purple-900/30 text-purple-300'
                  : 'bg-sky-900/30 text-sky-300'
              }`}>
                {invoice.type === 'consolidated' ? 'Consolidated' : 'Standard'}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-900/30 text-amber-300">
                Draf
              </span>
              <div className="flex-1" />
              <button
                onClick={() => onPreview(invoice)}
                className="px-3 py-1.5 bg-sky-900/30 text-sky-300 rounded-lg text-xs font-medium hover:bg-sky-900/50 transition-all"
              >
                👁 Lihat
              </button>
              <button
                onClick={() => onEdit(invoice)}
                className="px-3 py-1.5 bg-slate-700/50 text-slate-300 rounded-lg text-xs font-medium hover:bg-slate-700 transition-all"
              >
                ✏️ Edit
              </button>
              <button
                onClick={() => handleDelete(invoice.id)}
                className="px-3 py-1.5 bg-red-900/30 text-red-300 rounded-lg text-xs font-medium hover:bg-red-900/50 transition-all"
              >
                🗑
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
