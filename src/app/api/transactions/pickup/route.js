import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/middleware/auth'
import { handleApiError } from '@/middleware/errorHandler'
import { pickupSchema } from '@/lib/validations'

// POST /api/transactions/pickup - Process pickup
export async function POST(request) {
  const { session, error } = await requireAuth(request)
  if (error) return error
  
  try {
    const body = await request.json()
    
    // Validate input
    const validated = pickupSchema.parse(body)
    
    // Get transaction
    const currentTransaction = await prisma.transaction.findUnique({
      where: { id: validated.transactionId },
    })
    
    if (!currentTransaction) {
      return NextResponse.json(
        { error: 'Transaksi tidak ditemukan' },
        { status: 404 }
      )
    }
    
    // Check if transaction is ready for pickup
    if (currentTransaction.status !== 'SELESAI') {
      return NextResponse.json(
        { error: 'Laundry belum selesai' },
        { status: 400 }
      )
    }
    
    // Check payment status
    if (currentTransaction.paymentStatus === 'BELUM_LUNAS' && !validated.paymentMethod) {
      return NextResponse.json(
        { error: 'Metode pembayaran harus dipilih' },
        { status: 400 }
      )
    }
    
    // Update transaction
    const updateData = {
      status: 'DIAMBIL',
      pickupDate: new Date(),
      updatedAt: new Date(),
    }
    
    // Update payment if needed
    if (currentTransaction.paymentStatus === 'BELUM_LUNAS') {
      updateData.paymentStatus = 'LUNAS'
      updateData.paymentMethod = validated.paymentMethod
    }
    
    const transaction = await prisma.transaction.update({
      where: { id: validated.transactionId },
      data: updateData,
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
    
    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.id,
        action: 'UPDATE_STATUS',
        entityType: 'Transaction',
        entityId: transaction.id,
        oldValue: currentTransaction,
        newValue: updateData,
      },
    })
    
    return NextResponse.json({
      success: true,
      transaction,
    })
    
  } catch (error) {
    return handleApiError(error, 'Gagal memproses pengambilan')
  }
}