import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/middleware/auth'
import { handleApiError } from '@/middleware/errorHandler'

// GET /api/customers/[id]/history - Get customer transaction history
export async function GET(request, { params }) {
  const { session, error } = await requireAuth(request)
  if (error) return error
  
  try {
    const transactions = await prisma.transaction.findMany({
      where: { customerId: params.id },
      include: {
        details: {
          include: {
            service: true,
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
    return handleApiError(error, 'Gagal mengambil riwayat customer')
  }
}