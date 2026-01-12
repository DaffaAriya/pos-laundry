import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth, requireRole } from '@/middleware/auth'
import { handleApiError } from '@/middleware/errorHandler'
import { serviceSchema } from '@/lib/validations'

// GET /api/services - Get all services
export async function GET(request) {
  const { session, error } = await requireAuth(request)
  if (error) return error
  
  try {
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('activeOnly') === 'true'
    
    const where = activeOnly ? { isActive: true } : {}
    
    const services = await prisma.service.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })
    
    return NextResponse.json({
      success: true,
      services,
    })
    
  } catch (error) {
    return handleApiError(error, 'Gagal mengambil data layanan')
  }
}

// POST /api/services - Create new service (OWNER only)
export async function POST(request) {
  const { session, error } = await requireRole(request, ['OWNER'])
  if (error) return error
  
  try {
    const body = await request.json()
    
    // Validate input
    const validated = serviceSchema.parse(body)
    
    // Create service
    const service = await prisma.service.create({
      data: {
        name: validated.name,
        serviceType: validated.serviceType,
        pricePerUnit: validated.pricePerUnit,
        estimatedDuration: validated.estimatedDuration,
        isActive: true,
      },
    })
    
    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.id,
        action: 'CREATE_SERVICE',
        entityType: 'Service',
        entityId: service.id,
        newValue: service,
      },
    })
    
    return NextResponse.json({
      success: true,
      service,
    }, { status: 201 })
    
  } catch (error) {
    return handleApiError(error, 'Gagal membuat layanan')
  }
}