import React from 'react';
import { Invoice } from '../types';
import { formatCurrency, formatDate } from '../utils/storage';
import { generatePDF, getShareURL } from '../utils/pdf';
import { setInvoiceStatus, statusLabel, statusClasses } from '../utils/api';

interface Props {
  invoice: Invoice;
  onBack: () => void;
}

export default function InvoicePreview({ invoice, onBack }: Props) {
  const [status, setStatus] = React.useState<Invoice['status']>(invoice.status);

  const handleMarkPaid = () => {
    const updated = setInvoiceStatus(invoice.id, 'paid');
    if (updated) setStatus('paid');
  };

  const handleDownloadPDF = () => {
    generatePDF(invoice);
  };

  const handleShareWhatsApp = () => {
    const url = getShareURL(invoice);
    window.open(url, '_blank');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Action Buttons */}
      <div className="no-print flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-slate-400 font-medium hover:text-slate-200 transition-all"
        >
          ← Kembali
        </button>
        <div className="flex gap-2">
          <button
            onClick={handleShareWhatsApp}
            className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-500 transition-all active:scale-[0.98]"
          >
            💬 WhatsApp
          </button>
          <button
            onClick={handleDownloadPDF}
            className="px-4 py-2 bg-sky-500 text-white rounded-xl text-sm font-medium hover:bg-sky-400 transition-all active:scale-[0.98]"
          >
            📥 PDF
          </button>
        </div>
      </div>

      {/* Invoice Document */}
      <div className="bg-white rounded-2xl shadow-xl shadow-black/20 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-600 to-blue-600 px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">e-INVOIS</h1>
              <p className="text-sky-100 text-xs mt-0.5">
                {invoice.type === 'consolidated' ? 'Consolidated e-Invoice' : 'Standard Invoice'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sky-100 text-xs">No. Invois</p>
              <p className="font-bold text-sm">{invoice.invoiceNo}</p>
            </div>
          </div>
        </div>

        {/* Date & Status */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex gap-6">
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wide">Tarikh</p>
                <p className="text-sm font-medium text-slate-700">{formatDate(invoice.date)}</p>
              </div>
              {invoice.dueDate && (
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide">Tarikh Due</p>
                  <p className="text-sm font-medium text-slate-700">{formatDate(invoice.dueDate)}</p>
                </div>
              )}
            </div>
            <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${statusClasses(status)}`}>
              {statusLabel(status)}
            </span>
          </div>
        </div>

        {/* Seller & Buyer */}
        <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1.5 font-semibold">Penjual</p>
            <p className="text-sm font-semibold text-slate-800">{invoice.seller.name || '-'}</p>
            {invoice.seller.ssmNo && (
              <p className="text-xs text-slate-500 mt-0.5">SSM: {invoice.seller.ssmNo}</p>
            )}
            {invoice.seller.tinNo && (
              <p className="text-xs text-slate-500">TIN: {invoice.seller.tinNo}</p>
            )}
            <p className="text-xs text-slate-500 mt-1">
              {[invoice.seller.address, invoice.seller.postcode && `${invoice.seller.postcode} ${invoice.seller.city}`, invoice.seller.state].filter(Boolean).join(', ') || '-'}
            </p>
            {invoice.seller.phone && (
              <p className="text-xs text-slate-500 mt-0.5">📞 {invoice.seller.phone}</p>
            )}
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1.5 font-semibold">Pembeli</p>
            <p className="text-sm font-semibold text-slate-800">{invoice.buyer.name || '-'}</p>
            {invoice.buyer.idNo && (
              <p className="text-xs text-slate-500 mt-0.5">No. ID: {invoice.buyer.idNo}</p>
            )}
            {invoice.buyer.tinNo && (
              <p className="text-xs text-slate-500">TIN: {invoice.buyer.tinNo}</p>
            )}
            <p className="text-xs text-slate-500 mt-1">
              {[invoice.buyer.address, invoice.buyer.postcode && `${invoice.buyer.postcode} ${invoice.buyer.city}`, invoice.buyer.state].filter(Boolean).join(', ') || '-'}
            </p>
            {invoice.buyer.phone && (
              <p className="text-xs text-slate-500 mt-0.5">📞 {invoice.buyer.phone}</p>
            )}
          </div>
        </div>

        {/* Items Table */}
        <div className="px-6 pb-5">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-slate-200">
                  <th className="text-left py-2.5 text-xs font-semibold text-slate-500 uppercase">#</th>
                  <th className="text-left py-2.5 text-xs font-semibold text-slate-500 uppercase">Keterangan</th>
                  <th className="text-center py-2.5 text-xs font-semibold text-slate-500 uppercase">Kuantiti</th>
                  <th className="text-right py-2.5 text-xs font-semibold text-slate-500 uppercase">Harga</th>
                  <th className="text-right py-2.5 text-xs font-semibold text-slate-500 uppercase">Jumlah</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, idx) => (
                  <tr key={item.id} className="border-b border-slate-100">
                    <td className="py-3 text-slate-500">{idx + 1}</td>
                    <td className="py-3 text-slate-700">{item.description || '-'}</td>
                    <td className="py-3 text-center text-slate-600">{item.quantity}</td>
                    <td className="py-3 text-right text-slate-600">{formatCurrency(item.unitPrice)}</td>
                    <td className="py-3 text-right font-medium text-slate-800">{formatCurrency(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="mt-4 flex justify-end">
            <div className="w-full sm:w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-medium text-slate-700">{formatCurrency(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">SST (8%)</span>
                <span className="font-medium text-slate-700">{formatCurrency(invoice.sst)}</span>
              </div>
              <div className="border-t-2 border-slate-200 pt-2 flex justify-between">
                <span className="font-bold text-slate-800">JUMLAH</span>
                <span className="font-bold text-lg text-sky-700">{formatCurrency(invoice.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
            <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1 font-semibold">Nota</p>
            <p className="text-xs text-slate-600">{invoice.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-[10px] text-slate-400">
            Dijana oleh e-Invois Sabah • Patuh LHDN Malaysia
          </p>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="no-print grid grid-cols-2 gap-3 mt-4 pb-6">
        <button
          onClick={() => window.print()}
          className="py-3 bg-slate-800 border border-slate-700 text-slate-200 rounded-xl font-semibold text-sm hover:bg-slate-700 transition-all active:scale-[0.98]"
        >
          🖨 Cetak
        </button>
        <button
          onClick={handleShareWhatsApp}
          className="py-3 bg-green-600 text-white rounded-xl font-semibold text-sm hover:bg-green-500 transition-all active:scale-[0.98]"
        >
          💬 Kongsi WhatsApp
        </button>
        {status !== 'paid' && (
          <button
            onClick={handleMarkPaid}
            className="col-span-2 py-3 bg-emerald-600 text-white rounded-xl font-semibold text-sm hover:bg-emerald-500 transition-all active:scale-[0.98]"
          >
            💰 Tanda Sudah Bayar
          </button>
        )}
      </div>
    </div>
  );
}
