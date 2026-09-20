import React, { useState, useEffect } from 'react';
import { Invoice, InvoiceItem, SellerInfo, BuyerInfo } from '../types';
import {
  saveInvoice,
  saveSellerInfo,
  getSellerInfo,
  generateInvoiceNo,
  generateId,
  getDefaultBuyer,
  formatCurrency,
} from '../utils/storage';

interface Props {
  onPreview: (invoice: Invoice) => void;
  editInvoice?: Invoice | null;
}

const defaultSeller: SellerInfo = {
  name: '',
  ssmNo: '',
  tinNo: '',
  address: '',
  city: '',
  state: 'Sabah',
  postcode: '',
  phone: '',
  email: '',
};

export default function InvoiceForm({ onPreview, editInvoice }: Props) {
  const [seller, setSeller] = useState<SellerInfo>(defaultSeller);
  const [buyer, setBuyer] = useState<BuyerInfo>(getDefaultBuyer());
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: generateId(), description: '', quantity: 1, unitPrice: 0, amount: 0 },
  ]);
  const [invoiceNo, setInvoiceNo] = useState(generateInvoiceNo());
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [invoiceType, setInvoiceType] = useState<'standard' | 'consolidated'>('standard');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedSeller = getSellerInfo();
    if (savedSeller) setSeller(savedSeller);
    if (editInvoice) {
      setSeller(editInvoice.seller);
      setBuyer(editInvoice.buyer);
      setItems(editInvoice.items);
      setInvoiceNo(editInvoice.invoiceNo);
      setDate(editInvoice.date);
      setDueDate(editInvoice.dueDate);
      setNotes(editInvoice.notes);
      setInvoiceType(editInvoice.type);
    }
  }, [editInvoice]);

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const sst = subtotal * 0.08;
  const total = subtotal + sst;

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(prev =>
      prev.map(item => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        updated.amount = updated.quantity * updated.unitPrice;
        return updated;
      })
    );
  };

  const addItem = () => {
    setItems(prev => [...prev, { id: generateId(), description: '', quantity: 1, unitPrice: 0, amount: 0 }]);
  };

  const removeItem = (id: string) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const handleSaveSeller = () => {
    saveSellerInfo(seller);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSubmit = (preview: boolean) => {
    const invoice: Invoice = {
      id: editInvoice?.id || generateId(),
      invoiceNo,
      date,
      dueDate,
      seller,
      buyer,
      items,
      subtotal,
      sst,
      total,
      notes,
      type: invoiceType,
      status: 'draft',
      createdAt: new Date().toISOString(),
    };
    saveInvoice(invoice);
    saveSellerInfo(seller);
    if (preview) {
      onPreview(invoice);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Invoice Type */}
      <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50">
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Jenis Invois</h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setInvoiceType('standard')}
            className={`p-3 rounded-xl text-sm font-medium border-2 transition-all ${
              invoiceType === 'standard'
                ? 'border-sky-500 bg-sky-900/30 text-sky-300'
                : 'border-slate-700 text-slate-400 hover:border-slate-600'
            }`}
          >
            📄 Standard
          </button>
          <button
            onClick={() => setInvoiceType('consolidated')}
            className={`p-3 rounded-xl text-sm font-medium border-2 transition-all ${
              invoiceType === 'consolidated'
                ? 'border-sky-500 bg-sky-900/30 text-sky-300'
                : 'border-slate-700 text-slate-400 hover:border-slate-600'
            }`}
          >
            📋 Consolidated
          </button>
        </div>
      </div>

      {/* Invoice Details */}
      <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50">
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Butiran Invois</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">No. Invois</label>
            <input
              type="text"
              value={invoiceNo}
              onChange={e => setInvoiceNo(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900/50 border border-slate-700 text-slate-200 text-sm placeholder:text-slate-500 focus:border-sky-500 focus:ring-2 focus:ring-sky-900/50 transition-all"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Tarikh</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900/50 border border-slate-700 text-slate-200 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-900/50 transition-all"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Tarikh Due</label>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900/50 border border-slate-700 text-slate-200 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-900/50 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Seller Info */}
      <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-300">👤 Maklumat Penjual (Anda)</h3>
          <button
            onClick={handleSaveSeller}
            className="text-xs bg-emerald-900/30 text-emerald-300 px-3 py-1.5 rounded-lg font-medium hover:bg-emerald-900/50 transition-all"
          >
            {saved ? '✓ Disimpan' : '💾 Simpan'}
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className="text-xs text-slate-400 mb-1 block">Nama Perniagaan / Anda</label>
            <input
              type="text"
              value={seller.name}
              onChange={e => setSeller({ ...seller, name: e.target.value })}
              placeholder="cth: Kedai Runcit Sabah Maju"
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900/50 border border-slate-700 text-slate-200 text-sm placeholder:text-slate-500 focus:border-sky-500 focus:ring-2 focus:ring-sky-900/50 transition-all"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">No. SSM / IC</label>
            <input
              type="text"
              value={seller.ssmNo}
              onChange={e => setSeller({ ...seller, ssmNo: e.target.value })}
              placeholder="cth: 1234567-X"
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900/50 border border-slate-700 text-slate-200 text-sm placeholder:text-slate-500 focus:border-sky-500 focus:ring-2 focus:ring-sky-900/50 transition-all"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">No. TIN (LHDN)</label>
            <input
              type="text"
              value={seller.tinNo}
              onChange={e => setSeller({ ...seller, tinNo: e.target.value })}
              placeholder="cth: C1234567890"
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900/50 border border-slate-700 text-slate-200 text-sm placeholder:text-slate-500 focus:border-sky-500 focus:ring-2 focus:ring-sky-900/50 transition-all"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs text-slate-400 mb-1 block">Alamat</label>
            <textarea
              value={seller.address}
              onChange={e => setSeller({ ...seller, address: e.target.value })}
              placeholder="Alamat penuh di Sabah"
              rows={2}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900/50 border border-slate-700 text-slate-200 text-sm placeholder:text-slate-500 focus:border-sky-500 focus:ring-2 focus:ring-sky-900/50 transition-all resize-none"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Bandar</label>
            <input
              type="text"
              value={seller.city}
              onChange={e => setSeller({ ...seller, city: e.target.value })}
              placeholder="cth: Kota Kinabalu"
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900/50 border border-slate-700 text-slate-200 text-sm placeholder:text-slate-500 focus:border-sky-500 focus:ring-2 focus:ring-sky-900/50 transition-all"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Poskod</label>
            <input
              type="text"
              value={seller.postcode}
              onChange={e => setSeller({ ...seller, postcode: e.target.value })}
              placeholder="cth: 88000"
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900/50 border border-slate-700 text-slate-200 text-sm placeholder:text-slate-500 focus:border-sky-500 focus:ring-2 focus:ring-sky-900/50 transition-all"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">No. Telefon</label>
            <input
              type="tel"
              value={seller.phone}
              onChange={e => setSeller({ ...seller, phone: e.target.value })}
              placeholder="cth: 088-123456"
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900/50 border border-slate-700 text-slate-200 text-sm placeholder:text-slate-500 focus:border-sky-500 focus:ring-2 focus:ring-sky-900/50 transition-all"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">E-mel</label>
            <input
              type="email"
              value={seller.email}
              onChange={e => setSeller({ ...seller, email: e.target.value })}
              placeholder="cth: kedai@email.com"
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900/50 border border-slate-700 text-slate-200 text-sm placeholder:text-slate-500 focus:border-sky-500 focus:ring-2 focus:ring-sky-900/50 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Buyer Info */}
      <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50">
        <h3 className="text-sm font-semibold text-slate-300 mb-3">🛒 Maklumat Pembeli</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className="text-xs text-slate-400 mb-1 block">Nama Pembeli / Syarikat</label>
            <input
              type="text"
              value={buyer.name}
              onChange={e => setBuyer({ ...buyer, name: e.target.value })}
              placeholder="Nama pelanggan"
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900/50 border border-slate-700 text-slate-200 text-sm placeholder:text-slate-500 focus:border-sky-500 focus:ring-2 focus:ring-sky-900/50 transition-all"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">No. IC / SSM Pembeli</label>
            <input
              type="text"
              value={buyer.idNo}
              onChange={e => setBuyer({ ...buyer, idNo: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900/50 border border-slate-700 text-slate-200 text-sm placeholder:text-slate-500 focus:border-sky-500 focus:ring-2 focus:ring-sky-900/50 transition-all"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">No. TIN Pembeli</label>
            <input
              type="text"
              value={buyer.tinNo}
              onChange={e => setBuyer({ ...buyer, tinNo: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900/50 border border-slate-700 text-slate-200 text-sm placeholder:text-slate-500 focus:border-sky-500 focus:ring-2 focus:ring-sky-900/50 transition-all"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs text-slate-400 mb-1 block">Alamat Pembeli</label>
            <textarea
              value={buyer.address}
              onChange={e => setBuyer({ ...buyer, address: e.target.value })}
              placeholder="Alamat pembeli"
              rows={2}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900/50 border border-slate-700 text-slate-200 text-sm placeholder:text-slate-500 focus:border-sky-500 focus:ring-2 focus:ring-sky-900/50 transition-all resize-none"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Bandar</label>
            <input
              type="text"
              value={buyer.city}
              onChange={e => setBuyer({ ...buyer, city: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900/50 border border-slate-700 text-slate-200 text-sm placeholder:text-slate-500 focus:border-sky-500 focus:ring-2 focus:ring-sky-900/50 transition-all"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Poskod</label>
            <input
              type="text"
              value={buyer.postcode}
              onChange={e => setBuyer({ ...buyer, postcode: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900/50 border border-slate-700 text-slate-200 text-sm placeholder:text-slate-500 focus:border-sky-500 focus:ring-2 focus:ring-sky-900/50 transition-all"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">No. Telefon</label>
            <input
              type="tel"
              value={buyer.phone}
              onChange={e => setBuyer({ ...buyer, phone: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900/50 border border-slate-700 text-slate-200 text-sm placeholder:text-slate-500 focus:border-sky-500 focus:ring-2 focus:ring-sky-900/50 transition-all"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">E-mel</label>
            <input
              type="email"
              value={buyer.email}
              onChange={e => setBuyer({ ...buyer, email: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900/50 border border-slate-700 text-slate-200 text-sm placeholder:text-slate-500 focus:border-sky-500 focus:ring-2 focus:ring-sky-900/50 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50">
        <h3 className="text-sm font-semibold text-slate-300 mb-3">📦 Senarai Item / Servis</h3>
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div key={item.id} className="p-3 bg-slate-900/30 rounded-xl border border-slate-700/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-500">Item #{idx + 1}</span>
                {items.length > 1 && (
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-400 hover:text-red-300 text-xs font-medium transition-all"
                  >
                    ✕ Buang
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 gap-2">
                <input
                  type="text"
                  value={item.description}
                  onChange={e => updateItem(item.id, 'description', e.target.value)}
                  placeholder="Keterangan item / servis"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900/50 border border-slate-700 text-slate-200 text-sm placeholder:text-slate-500 focus:border-sky-500 focus:ring-2 focus:ring-sky-900/50 transition-all"
                />
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 mb-0.5 block">Kuantiti</label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={e => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-2 rounded-lg bg-slate-900/50 border border-slate-700 text-slate-200 text-sm text-center focus:border-sky-500 focus:ring-2 focus:ring-sky-900/50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 mb-0.5 block">Harga (RM)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice || ''}
                      onChange={e => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-2 rounded-lg bg-slate-900/50 border border-slate-700 text-slate-200 text-sm text-center focus:border-sky-500 focus:ring-2 focus:ring-sky-900/50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 mb-0.5 block">Jumlah</label>
                    <div className="w-full px-2 py-2 rounded-lg bg-sky-900/30 border border-sky-800/50 text-sm text-center font-semibold text-sky-300">
                      {formatCurrency(item.amount)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={addItem}
          className="mt-3 w-full py-2.5 border-2 border-dashed border-slate-700 rounded-xl text-sm text-slate-400 font-medium hover:border-sky-700 hover:text-sky-300 transition-all"
        >
          + Tambah Item
        </button>
      </div>

      {/* Notes */}
      <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50">
        <h3 className="text-sm font-semibold text-slate-300 mb-3">📝 Nota Tambahan</h3>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Terma pembayaran, arahan penghantaran, dll."
          rows={3}
          className="w-full px-3 py-2.5 rounded-xl bg-slate-900/50 border border-slate-700 text-slate-200 text-sm placeholder:text-slate-500 focus:border-sky-500 focus:ring-2 focus:ring-sky-900/50 transition-all resize-none"
        />
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-br from-sky-950/30 to-blue-950/30 rounded-2xl p-5 border border-sky-800/30">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Subtotal</span>
            <span className="font-medium text-slate-200">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">SST (8%)</span>
            <span className="font-medium text-slate-200">{formatCurrency(sst)}</span>
          </div>
          <div className="border-t border-sky-800/30 pt-2 flex justify-between">
            <span className="font-semibold text-slate-200">JUMLAH</span>
            <span className="font-bold text-lg text-sky-300">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3 pb-6">
        <button
          onClick={() => handleSubmit(false)}
          className="py-3.5 bg-slate-700 text-slate-200 rounded-xl font-semibold text-sm hover:bg-slate-600 transition-all active:scale-[0.98]"
        >
          💾 Simpan
        </button>
        <button
          onClick={() => handleSubmit(true)}
          className="py-3.5 bg-sky-500 text-white rounded-xl font-semibold text-sm hover:bg-sky-400 transition-all active:scale-[0.98]"
        >
          👁 Pratinjau & PDF
        </button>
      </div>
    </div>
  );
}
