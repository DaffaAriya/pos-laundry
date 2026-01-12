import { NextResponse } from 'next/server'
import { requireRole } from '@/middleware/auth'
import { handleApiError } from '@/middleware/errorHandler'
import { generateExcelReport } from '@/utils/exportExcel'

// POST /api/reports/export/excel - Export report to Excel (OWNER only)
export async function POST(request) {
  const { session, error } = await requireRole(request, ['OWNER'])
  if (error) return error
  
  try {
    const body = await request.json()
    
    const { transactions, summary, period, type } = body
    
    // Generate Excel
    const excelBuffer = await generateExcelReport({
      transactions,
      summary,
      period,
      type,
    })
    
    // Return Excel as blob
    return new NextResponse(excelBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename=Data_Transaksi_${type}_${Date.now()}.xlsx`,
      },
    })
    
  } catch (error) {
    return handleApiError(error, 'Gagal export Excel')
  }
}