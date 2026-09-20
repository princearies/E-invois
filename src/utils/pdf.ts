import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Invoice } from '../types';
import { formatCurrency, formatDate } from './storage';

export function generatePDF(invoice: Invoice): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('e-INVOIS', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.type === 'consolidated' ? 'Consolidated e-Invoice (LHDN)' : 'Standard Invoice', pageWidth / 2, 28, { align: 'center' });

  // Invoice details
  doc.setFontSize(9);
  doc.text(`No. Invois: ${invoice.invoiceNo}`, 14, 42);
  doc.text(`Tarikh: ${formatDate(invoice.date)}`, 14, 48);
  doc.text(`Tarikh Due: ${formatDate(invoice.dueDate)}`, 14, 54);

  // Seller info
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('PENJUAL:', 14, 68);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(invoice.seller.name, 14, 75);
  if (invoice.seller.ssmNo) doc.text(`SSM: ${invoice.seller.ssmNo}`, 14, 81);
  if (invoice.seller.tinNo) doc.text(`TIN: ${invoice.seller.tinNo}`, 14, 87);
  const sellerAddr = [invoice.seller.address, `${invoice.seller.postcode} ${invoice.seller.city}`, invoice.seller.state].filter(Boolean).join(', ');
  doc.text(sellerAddr || '-', 14, 93);

  // Buyer info
  doc.setFont('helvetica', 'bold');
  doc.text('PEMBELI:', 110, 68);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(invoice.buyer.name || '-', 110, 75);
  if (invoice.buyer.idNo) doc.text(`No. ID: ${invoice.buyer.idNo}`, 110, 81);
  if (invoice.buyer.tinNo) doc.text(`TIN: ${invoice.buyer.tinNo}`, 110, 87);
  const buyerAddr = [invoice.buyer.address, `${invoice.buyer.postcode} ${invoice.buyer.city}`, invoice.buyer.state].filter(Boolean).join(', ');
  doc.text(buyerAddr || '-', 110, 93);

  // Items table
  const tableData = invoice.items.map((item, idx) => [
    (idx + 1).toString(),
    item.description,
    item.quantity.toString(),
    formatCurrency(item.unitPrice),
    formatCurrency(item.amount),
  ]);

  autoTable(doc, {
    startY: 105,
    head: [['#', 'Keterangan', 'Kuantiti', 'Harga Seunit', 'Jumlah']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [14, 165, 233], fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 12 },
      2: { cellWidth: 22, halign: 'center' },
      3: { cellWidth: 35, halign: 'right' },
      4: { cellWidth: 35, halign: 'right' },
    },
  });

  // Totals
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(10);
  doc.text('Subtotal:', 130, finalY);
  doc.text(formatCurrency(invoice.subtotal), pageWidth - 14, finalY, { align: 'right' });
  
  doc.text('SST (8%):', 130, finalY + 7);
  doc.text(formatCurrency(invoice.sst), pageWidth - 14, finalY + 7, { align: 'right' });
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('JUMLAH:', 130, finalY + 16);
  doc.text(formatCurrency(invoice.total), pageWidth - 14, finalY + 16, { align: 'right' });

  // Notes
  if (invoice.notes) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`Nota: ${invoice.notes}`, 14, finalY + 30);
  }

  // Footer
  doc.setFontSize(7);
  doc.setTextColor(100);
  doc.text('Dijana oleh e-Invois Sabah | Patuh LHDN Malaysia', pageWidth / 2, 285, { align: 'center' });

  // Save
  doc.save(`${invoice.invoiceNo}.pdf`);
}

export function getShareURL(invoice: Invoice): string {
  const message = `📄 Invois ${invoice.invoiceNo}\n\nPenjual: ${invoice.seller.name}\nPembeli: ${invoice.buyer.name}\nJumlah: ${formatCurrency(invoice.total)}\nTarikh: ${formatDate(invoice.date)}\n\nDijana melalui e-Invois Sabah`;
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}
