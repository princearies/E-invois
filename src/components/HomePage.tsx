import React from 'react';
import { Page } from '../types';

interface Props {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export default function HomePage({ onNavigate }: Props) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-sky-400 to-blue-600 rounded-2xl shadow-lg shadow-sky-900/30 mb-4">
          <span className="text-2xl">📄</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-100 mb-2">e-Invois Sabah</h1>
        <p className="text-sm text-slate-400 max-w-sm mx-auto">
          Jana invois profesional dengan pantas. Ringkas, percuma, dan patuh LHDN Malaysia.
        </p>
      </div>

      {/* Features */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
          <div className="text-2xl mb-2">⚡</div>
          <h3 className="text-sm font-semibold text-slate-200">Pantas</h3>
          <p className="text-xs text-slate-400 mt-1">Jana invois dalam 2 minit</p>
        </div>
        <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
          <div className="text-2xl mb-2">📱</div>
          <h3 className="text-sm font-semibold text-slate-200">Mesra Mobile</h3>
          <p className="text-xs text-slate-400 mt-1">Guna dari telefon bimbit</p>
        </div>
        <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
          <div className="text-2xl mb-2">✅</div>
          <h3 className="text-sm font-semibold text-slate-200">Patuh LHDN</h3>
          <p className="text-xs text-slate-400 mt-1">Sedia untuk e-Invois</p>
        </div>
        <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
          <div className="text-2xl mb-2">💬</div>
          <h3 className="text-sm font-semibold text-slate-200">Kongsi WhatsApp</h3>
          <p className="text-xs text-slate-400 mt-1">Hantar terus ke pelanggan</p>
        </div>
      </div>

      {/* CTA */}
      <div className="space-y-3 mb-8">
        <button
          onClick={() => onNavigate('create')}
          className="w-full py-4 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-2xl font-bold text-base shadow-lg shadow-sky-900/30 hover:shadow-xl hover:shadow-sky-900/40 transition-all active:scale-[0.98]"
        >
          ➕ Jana Invois Baru
        </button>
        <button
          onClick={() => onNavigate('list')}
          className="w-full py-3.5 bg-slate-800 border border-slate-700 text-slate-200 rounded-2xl font-semibold text-sm hover:bg-slate-700 transition-all active:scale-[0.98]"
        >
          📋 Lihat Invois Tersimpan
        </button>
      </div>

      {/* Info */}
      <div className="bg-sky-950/30 rounded-2xl p-5 border border-sky-800/30">
        <h3 className="text-sm font-semibold text-sky-300 mb-2">🏷 Tentang e-Invois LHDN</h3>
        <p className="text-xs text-sky-200/70 leading-relaxed">
          Bermula 1 Julai 2025, semua perniagaan di Malaysia diwajibkan mengeluarkan e-Invois. 
          Aplikasi ini membantu anda bersedia dengan format yang selaras dengan keperluan asas 
          LHDN Malaysia — termasuk nombor TIN, maklumat SSM, dan sokongan untuk 
          <strong className="text-sky-200"> Consolidated e-Invoice</strong> bagi peniaga kecil.
        </p>
      </div>

      {/* Footer */}
      <div className="text-center mt-8 pb-4">
        <p className="text-[10px] text-slate-500">
          Dibina untuk peniaga kecil Sabah 🌴 • v1.0 MVP
        </p>
      </div>
    </div>
  );
}
