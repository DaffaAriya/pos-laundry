import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/middleware/auth'
import { handleApiError } from '@/middleware/errorHandler'

// GET /api/customers - Get all customers
export async function GET(request) {
  const { session, error } = await requireAuth(request)
  if (error) return error
  
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    
    // Build where clause
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {}
    
    // Count total
    const total = await prisma.customer.count({ where })
    
    // Fetch customers with transaction count
    const customers = await prisma.customer.findMany({
      where,
      include: {
        _count: {
          select: { transactions: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    })
    
    return NextResponse.json({
      success: true,
      customers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
    
  } catch (error) {
    return handleApiError(error, 'Gagal mengambil data customer')
  }
}