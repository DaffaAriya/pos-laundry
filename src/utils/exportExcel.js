import * as XLSX from 'xlsx'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { formatCurrency } from './formatters'

export async function generateExcelReport({ transactions, summary, period, type }) {
  // Create workbook
  const wb = XLSX.utils.book_new()
  
  // Summary sheet
  const summaryData = [
    ['LAPORAN LAUNDRY POS'],
    [`Laporan ${type.toUpperCase()}`],
    period ? [`Periode: ${format(new Date(period.start), 'dd MMM yyyy', { locale: idLocale })} - ${format(new Date(period.end), 'dd MMM yyyy', { locale: idLocale })}`] : [],
    [`Dicetak: ${format(new Date(), 'dd MMM yyyy HH:mm', { locale: idLocale })}`],
    [],
    ['RINGKASAN'],
    ['Total Transaksi', `${summary.totalTransactions} transaksi`],
    ['Total Pemasukan', formatCurrency(summary.totalRevenue)],
    ['  - Tunai', formatCurrency(summary.revenueTunai)],
    ['  - QRIS', formatCurrency(summary.revenueQRIS)],
  ]
  
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData)
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan')
  
  // Transactions sheet
  const transactionsData = [
    ['No', 'Transaction ID', 'Tanggal', 'Customer', 'No. HP', 'Layanan', 'Berat/Qty', 'Harga/Unit', 'Total', 'Status Bayar', 'Metode Bayar', 'Status Transaksi', 'Estimasi Selesai'],
    ...transactions.map((tx, index) => [
      index + 1,
      tx.id,
      format(new Date(tx.createdAt), 'dd MMM yyyy', { locale: idLocale }),
      tx.customer.name,
      tx.customer.phone,
      tx.details[0]?.service.name || '-',
      `${tx.details[0]?.quantity || 0}`,
      formatCurrency(tx.details[0]?.servicePricePerUnit || 0),
      formatCurrency(tx.totalAmount),
      tx.paymentStatus,
      tx.paymentMethod || '-',
      tx.status,
      `${format(new Date(tx.estimatedFinishDate), 'dd MMM yyyy', { locale: idLocale })} / ${tx.estimatedFinishTime}`,
    ]),
  ]
  
  const wsTransactions = XLSX.utils.aoa_to_sheet(transactionsData)
  XLSX.utils.book_append_sheet(wb, wsTransactions, 'Data Transaksi')
  
  // Generate buffer
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
}