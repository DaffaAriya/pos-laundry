import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireRole } from '@/middleware/auth'
import { handleApiError } from '@/middleware/errorHandler'
import { format, subDays } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'

// GET /api/dashboard/charts - Get chart data (OWNER only)
export async function GET(request) {
  const { session, error } = await requireRole(request, ['OWNER'])
  if (error) return error
  
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'revenue'
    const period = searchParams.get('period') || 'week'
    
    // Get last 7 days revenue
    if (type === 'revenue') {
      const days = period === 'week' ? 7 : 30
      const chartData = []
      
      for (let i = days - 1; i >= 0; i--) {
        const date = subDays(new Date(), i)
        const startDate = new Date(date.setHours(0, 0, 0, 0))
        const endDate = new Date(date.setHours(23, 59, 59, 999))
        
        const revenue = await prisma.transaction.aggregate({
          where: {
            paymentStatus: 'LUNAS',
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
          _sum: {
            totalAmount: true,
          },
        })
        
        chartData.push({
          date: format(startDate, 'dd MMM', { locale: idLocale }),
          revenue: Number(revenue._sum.totalAmount || 0),
        })
      }
      
      return NextResponse.json({
        success: true,
        data: chartData,
      })
    }
    
    return NextResponse.json({
      success: true,
      data: [],
    })
    
  } catch (error) {
    return handleApiError(error, 'Gagal mengambil data chart')
  }
}