import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/middleware/auth'
import { handleApiError } from '@/middleware/errorHandler'

// GET /api/transactions/[id] - Get transaction by ID
export async function GET(request, { params }) {
  const { session, error } = await requireAuth(request)
  if (error) return error
  
  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id: params.id },
      include: {
        customer: true,
        user: {
          select: {
            id: true,
            username: true,
          },
        },
        details: {
          include: {
            service: true,
          },
        },
      },
    })
    
    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaksi tidak ditemukan' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      transaction,
    })
    
  } catch (error) {
    return handleApiError(error, 'Gagal mengambil data transaksi')
  }
}

// PATCH /api/transactions/[id] - Update transaction
export async function PATCH(request, { params }) {
  const { session, error } = await requireAuth(request)
  if (error) return error
  
  try {
    const body = await request.json()
    
    // Get current transaction
    const currentTransaction = await prisma.transaction.findUnique({
      where: { id: params.id },
    })
    
    if (!currentTransaction) {
      return NextResponse.json(
        { error: 'Transaksi tidak ditemukan' },
        { status: 404 }
      )
    }
    
    // Update transaction
    const transaction = await prisma.transaction.update({
      where: { id: params.id },
      data: {
        status: body.status,
        paymentStatus: body.paymentStatus,
        paymentMethod: body.paymentMethod,
        actualFinishDate: body.actualFinishDate,
        pickupDate: body.pickupDate,
        notes: body.notes,
        updatedAt: new Date(),
      },
      include: {
        customer: true,
        user: {
          select: {
            id: true,
            username: true,
          },
        },
        details: {
          include: {
            service: true,
          },
        },
      },
    })
    
    // Determine action type for audit log
    let action = 'UPDATE_STATUS'
    if (body.paymentStatus && body.paymentStatus !== currentTransaction.paymentStatus) {
      action = 'UPDATE_PAYMENT'
    }
    
    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.id,
        action,
        entityType: 'Transaction',
        entityId: transaction.id,
        oldValue: currentTransaction,
        newValue: body,
      },
    })
    
    return NextResponse.json({
      success: true,
      transaction,
    })
    
  } catch (error) {
    return handleApiError(error, 'Gagal mengupdate transaksi')
  }
}