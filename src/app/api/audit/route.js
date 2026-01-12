import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireRole } from '@/middleware/auth'
import { handleApiError } from '@/middleware/errorHandler'

// GET /api/audit - Get audit logs (OWNER only)
export async function GET(request) {
  const { session, error } = await requireRole(request, ['OWNER'])
  if (error) return error
  
  try {
    const { searchParams } = new URL(request.url)
    
    const action = searchParams.get('action')
    const userId = searchParams.get('userId')
    const entityType = searchParams.get('entityType')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    
    // Build where clause
    const where = {}
    
    if (action) where.action = action
    if (userId) where.userId = userId
    if (entityType) where.entityType = entityType
    
    if (dateFrom || dateTo) {
      where.timestamp = {}
      if (dateFrom) where.timestamp.gte = new Date(dateFrom)
      if (dateTo) where.timestamp.lte = new Date(dateTo)
    }
    
    // Count total
    const total = await prisma.auditLog.count({ where })
    
    // Fetch audit logs
    const logs = await prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            role: true,
          },
        },
      },
      orderBy: { timestamp: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    })
    
    return NextResponse.json({
      success: true,
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
    
  } catch (error) {
    return handleApiError(error, 'Gagal mengambil audit log')
  }
}