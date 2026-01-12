import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/middleware/auth'
import { handleApiError } from '@/middleware/errorHandler'

// GET /api/transactions/active - Get active transactions
export async function GET(request) {
  const { session, error } = await requireAuth(request)
  if (error) return error
  
  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        status: {
          in: ['DITERIMA', 'SELESAI'],
        },
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        details: {
          include: {
            service: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    
    return NextResponse.json({
      success: true,
      transactions,
    })
    
  } catch (error) {
    return handleApiError(error, 'Gagal mengambil transaksi aktif')
  }
}