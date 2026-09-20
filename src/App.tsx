import React, { useState } from 'react';
import { Invoice, Page } from './types';
import HomePage from './components/HomePage';
import InvoiceForm from './components/InvoiceForm';
import InvoicePreview from './components/InvoicePreview';
import InvoiceList from './components/InvoiceList';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [editInvoice, setEditInvoice] = useState<Invoice | null>(null);

  const handlePreview = (invoice: Invoice) => {
    setPreviewInvoice(invoice);
    setCurrentPage('preview');
  };

  const handleEdit = (invoice: Invoice) => {
    setEditInvoice(invoice);
    setCurrentPage('create');
  };

  const handleNavigate = (page: Page) => {
    if (page !== 'create') {
      setEditInvoice(null);
    }
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation Bar */}
      <nav className="no-print sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-100">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => handleNavigate('home')}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-sky-400 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-sm">📄</span>
            </div>
            <span className="font-bold text-sm text-slate-800">e-Invois</span>
            <span className="text-[10px] bg-sky-100 text-sky-700 px-1.5 py-0.5 rounded-full font-medium">
              Sabah
            </span>
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleNavigate('home')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentPage === 'home' ? 'bg-sky-100 text-sky-700' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              🏠
            </button>
            <button
              onClick={() => { setEditInvoice(null); handleNavigate('create'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentPage === 'create' ? 'bg-sky-100 text-sky-700' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              ➕
            </button>
            <button
              onClick={() => handleNavigate('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentPage === 'list' ? 'bg-sky-100 text-sky-700' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              📋
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        {currentPage === 'home' && (
          <HomePage currentPage={currentPage} onNavigate={handleNavigate} />
        )}
        {currentPage === 'create' && (
          <InvoiceForm onPreview={handlePreview} editInvoice={editInvoice} />
        )}
        {currentPage === 'preview' && previewInvoice && (
          <InvoicePreview
            invoice={previewInvoice}
            onBack={() => handleNavigate('list')}
          />
        )}
        {currentPage === 'list' && (
          <InvoiceList onPreview={handlePreview} onEdit={handleEdit} />
        )}
      </main>
    </div>
  );
}
