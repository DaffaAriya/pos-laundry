import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth, requireRole } from '@/middleware/auth'
import { handleApiError } from '@/middleware/errorHandler'
import { serviceSchema } from '@/lib/validations'

// GET /api/services/[id] - Get service by ID
export async function GET(request, { params }) {
  const { session, error } = await requireAuth(request)
  if (error) return error
  
  try {
    const service = await prisma.service.findUnique({
      where: { id: params.id },
    })
    
    if (!service) {
      return NextResponse.json(
        { error: 'Layanan tidak ditemukan' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      service,
    })
    
  } catch (error) {
    return handleApiError(error, 'Gagal mengambil data layanan')
  }
}

// PATCH /api/services/[id] - Update service (OWNER only)
export async function PATCH(request, { params }) {
  const { session, error } = await requireRole(request, ['OWNER'])
  if (error) return error
  
  try {
    const body = await request.json()
    
    // Get current service
    const currentService = await prisma.service.findUnique({
      where: { id: params.id },
    })
    
    if (!currentService) {
      return NextResponse.json(
        { error: 'Layanan tidak ditemukan' },
        { status: 404 }
      )
    }
    
    // Validate if full update
    let updateData = body
    if (body.name || body.serviceType || body.pricePerUnit) {
      const validated = serviceSchema.parse(body)
      updateData = validated
    }
    
    // Update service
    const service = await prisma.service.update({
      where: { id: params.id },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
    })
    
    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.id,
        action: 'UPDATE_SERVICE',
        entityType: 'Service',
        entityId: service.id,
        oldValue: currentService,
        newValue: service,
      },
    })
    
    return NextResponse.json({
      success: true,
      service,
    })
    
  } catch (error) {
    return handleApiError(error, 'Gagal mengupdate layanan')
  }
}