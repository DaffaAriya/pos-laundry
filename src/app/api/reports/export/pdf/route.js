import { NextResponse } from 'next/server'
import { requireRole } from '@/middleware/auth'
import { handleApiError } from '@/middleware/errorHandler'
import { generatePDFReport } from '@/utils/exportPDF'

// POST /api/reports/export/pdf - Export report to PDF (OWNER only)
export async function POST(request) {
  const { session, error } = await requireRole(request, ['OWNER'])
  if (error) return error
  
  try {
    const body = await request.json()
    
    const { transactions, summary, period, type } = body
    
    // Generate PDF
    const pdfBuffer = await generatePDFReport({
      transactions,
      summary,
      period,
      type,
    })
    
    // Return PDF as blob
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=Laporan_Laundry_${type}_${Date.now()}.pdf`,
      },
    })
    
  } catch (error) {
    return handleApiError(error, 'Gagal export PDF')
  }
}