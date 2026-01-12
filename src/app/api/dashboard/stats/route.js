import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireRole } from '@/middleware/auth'
import { handleApiError } from '@/middleware/errorHandler'
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'

// GET /api/dashboard/stats - Get dashboard statistics (OWNER only)
export async function GET(request) {
  const { session, error } = await requireRole(request, ['OWNER'])
  if (error) return error
  
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'today'
    const customStart = searchParams.get('startDate')
    const customEnd = searchParams.get('endDate')
    
    // Determine date range
    let dateFilter = {}
    const now = new Date()
    
    switch (period) {
      case 'today':
        dateFilter = {
          gte: startOfDay(now),
          lte: endOfDay(now),
        }
        break
      case 'week':
        dateFilter = {
          gte: startOfWeek(now),
          lte: endOfWeek(now),
        }
        break
      case 'month':
        dateFilter = {
          gte: startOfMonth(now),
          lte: endOfMonth(now),
        }
        break
      case 'custom':
        if (customStart && customEnd) {
          dateFilter = {
            gte: new Date(customStart),
            lte: new Date(customEnd),
          }
        }
        break
    }
    
    const where = dateFilter.gte ? { createdAt: dateFilter } : {}
    
    // Total transactions
    const totalTransactions = await prisma.transaction.count({ where })
    
    // Total revenue (only LUNAS)
    const revenueData = await prisma.transaction.aggregate({
      where: {
        ...where,
        paymentStatus: 'LUNAS',
      },
      _sum: {
        totalAmount: true,
      },
    })
    
    const totalRevenue = revenueData._sum.totalAmount || 0
    
    // Revenue by payment method
    const revenueTunai = await prisma.transaction.aggregate({
      where: {
        ...where,
        paymentStatus: 'LUNAS',
        paymentMethod: 'TUNAI',
      },
      _sum: {
        totalAmount: true,
      },
    })
    
    const revenueQRIS = await prisma.transaction.aggregate({
      where: {
        ...where,
        paymentStatus: 'LUNAS',
        paymentMethod: 'QRIS',
      },
      _sum: {
        totalAmount: true,
      },
    })
    
    // Active transactions (not DIAMBIL)
    const activeTransactions = await prisma.transaction.count({
      where: {
        status: {
          in: ['DITERIMA', 'SELESAI'],
        },
      },
    })
    
    // Pending payments
    const pendingPayments = await prisma.transaction.count({
      where: {
        paymentStatus: 'BELUM_LUNAS',
        status: {
          not: 'DIAMBIL',
        },
      },
    })
    
    // Transaction status breakdown
    const statusDiterima = await prisma.transaction.count({
      where: { ...where, status: 'DITERIMA' },
    })
    
    const statusSelesai = await prisma.transaction.count({
      where: { ...where, status: 'SELESAI' },
    })
    
    const statusDiambil = await prisma.transaction.count({
      where: { ...where, status: 'DIAMBIL' },
    })
    
    return NextResponse.json({
      success: true,
      stats: {
        totalTransactions,
        totalRevenue: Number(totalRevenue),
        revenueTunai: Number(revenueTunai._sum.totalAmount || 0),
        revenueQRIS: Number(revenueQRIS._sum.totalAmount || 0),
        activeTransactions,
        pendingPayments,
        statusBreakdown: {
          DITERIMA: statusDiterima,
          SELESAI: statusSelesai,
          DIAMBIL: statusDiambil,
        },
      },
    })
    
  } catch (error) {
    return handleApiError(error, 'Gagal mengambil statistik dashboard')
  }
}