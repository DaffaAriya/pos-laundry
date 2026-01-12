import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireRole } from '@/middleware/auth'
import { handleApiError } from '@/middleware/errorHandler'
import { startOfWeek, endOfWeek } from 'date-fns'

// GET /api/reports/weekly - Get weekly report (OWNER only)
export async function GET(request) {
  const { session, error } = await requireRole(request, ['OWNER'])
  if (error) return error
  
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]
    
    const targetDate = new Date(date)
    const startDate = startOfWeek(targetDate)
    const endDate = endOfWeek(targetDate)
    
    // Get transactions
    const transactions = await prisma.transaction.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        customer: {
          select: {
            name: true,
            phone: true,
          },
        },
        details: {
          include: {
            service: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    
    // Calculate summary
    const summary = {
      totalTransactions: transactions.length,
      totalRevenue: 0,
      revenueTunai: 0,
      revenueQRIS: 0,
      pendingPayments: 0,
    }
    
    transactions.forEach((tx) => {
      if (tx.paymentStatus === 'LUNAS') {
        summary.totalRevenue += Number(tx.totalAmount)
        if (tx.paymentMethod === 'TUNAI') {
          summary.revenueTunai += Number(tx.totalAmount)
        } else if (tx.paymentMethod === 'QRIS') {
          summary.revenueQRIS += Number(tx.totalAmount)
        }
      } else {
        summary.pendingPayments += Number(tx.totalAmount)
      }
    })
    
    return NextResponse.json({
      success: true,
      period: {
        start: startDate,
        end: endDate,
      },
      summary,
      transactions,
    })
    
  } catch (error) {
    return handleApiError(error, 'Gagal mengambil laporan mingguan')
  }
}