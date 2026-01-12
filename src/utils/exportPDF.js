import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { formatCurrency } from './formatters'

export async function generatePDFReport({ transactions, summary, period, type }) {
  const doc = new jsPDF()
  
  // Header
  doc.setFontSize(18)
  doc.text('LAPORAN LAUNDRY POS', 105, 15, { align: 'center' })
  
  doc.setFontSize(12)
  doc.text(`Laporan ${type.toUpperCase()}`, 105, 22, { align: 'center' })
  
  if (period) {
    const periodText = `Periode: ${format(new Date(period.start), 'dd MMM yyyy', { locale: idLocale })} - ${format(new Date(period.end), 'dd MMM yyyy', { locale: idLocale })}`
    doc.setFontSize(10)
    doc.text(periodText, 105, 28, { align: 'center' })
  }
  
  doc.setFontSize(9)
  doc.text(`Dicetak: ${format(new Date(), 'dd MMM yyyy HH:mm', { locale: idLocale })}`, 105, 33, { align: 'center' })
  
  // Summary
  doc.setFontSize(11)
  doc.text('RINGKASAN', 14, 42)
  
  const summaryData = [
    ['Total Transaksi', `${summary.totalTransactions} transaksi`],
    ['Total Pemasukan', formatCurrency(summary.totalRevenue)],
    ['  - Tunai', formatCurrency(summary.revenueTunai)],
    ['  - QRIS', formatCurrency(summary.revenueQRIS)],
  ]
  
  autoTable(doc, {
    startY: 45,
    head: [],
    body: summaryData,
    theme: 'plain',
    styles: { fontSize: 9 },
  })
  
  // Transactions table
  doc.setFontSize(11)
  doc.text('DETAIL TRANSAKSI', 14, doc.lastAutoTable.finalY + 10)
  
  const tableData = transactions.map((tx, index) => [
    index + 1,
    tx.id,
    format(new Date(tx.createdAt), 'dd MMM yyyy', { locale: idLocale }),
    tx.customer.name,
    tx.customer.phone,
    tx.details[0]?.service.name || '-',
    `${tx.details[0]?.quantity || 0} ${tx.details[0]?.service.serviceType === 'PER_KG' ? 'kg' : 'item'}`,
    formatCurrency(tx.totalAmount),
    tx.paymentStatus,
    tx.paymentMethod || '-',
    tx.status,
  ])
  
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 13,
    head: [['No', 'ID', 'Tanggal', 'Customer', 'HP', 'Layanan', 'Qty', 'Total', 'Status Bayar', 'Metode', 'Status']],
    body: tableData,
    theme: 'grid',
    styles: { fontSize: 8 },
    headStyles: { fillColor: [14, 165, 233] },
  })
  
  // Footer
  const finalY = doc.lastAutoTable.finalY + 10
  doc.setFontSize(11)
  doc.text(`TOTAL KESELURUHAN: ${formatCurrency(summary.totalRevenue)}`, 14, finalY)
  
  return doc.output('arraybuffer')
}