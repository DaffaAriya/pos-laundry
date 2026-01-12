import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/middleware/auth'
import { handleApiError } from '@/middleware/errorHandler'

// GET /api/customers/[id] - Get customer by ID
export async function GET(request, { params }) {
  const { session, error } = await requireAuth(request)
  if (error) return error
  
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { transactions: true },
        },
      },
    })
    
    if (!customer) {
      return NextResponse.json(
        { error: 'Customer tidak ditemukan' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      customer,
    })
    
  } catch (error) {
    return handleApiError(error, 'Gagal mengambil data customer')
  }
}