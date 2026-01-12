import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/middleware/auth'
import { handleApiError } from '@/middleware/errorHandler'
import { transactionSchema } from '@/lib/validations'
import { generateTransactionId } from '@/utils/generators'
import Decimal from 'decimal.js'

// GET /api/transactions - List all transactions with filters
export async function GET(request) {
  const { session, error } = await requireAuth(request)
  if (error) return error
  
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse filters
    const status = searchParams.get('status')
    const paymentStatus = searchParams.get('paymentStatus')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    
    // Build where clause
    const where = {}
    
    if (status) where.status = status
    if (paymentStatus) where.paymentStatus = paymentStatus
    
    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) where.createdAt.gte = new Date(dateFrom)
      if (dateTo) where.createdAt.lte = new Date(dateTo)
    }
    
    if (search) {
      where.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
        { customer: { phone: { contains: search, mode: 'insensitive' } } },
      ]
    }
    
    // Count total
    const total = await prisma.transaction.count({ where })
    
    // Fetch transactions
    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        user: {
          select: {
            id: true,
            username: true,
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
      skip: (page - 1) * limit,
      take: limit,
    })
    
    return NextResponse.json({
      success: true,
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
    
  } catch (error) {
    return handleApiError(error, 'Gagal mengambil data transaksi')
  }
}

// POST /api/transactions - Create new transaction
export async function POST(request) {
  const { session, error } = await requireAuth(request)
  if (error) return error
  
  try {
    const body = await request.json()
    
    // Validate input
    const validated = transactionSchema.parse(body)
    
    // Get service details
    const service = await prisma.service.findUnique({
      where: { id: validated.serviceId },
    })
    
    if (!service || !service.isActive) {
      return NextResponse.json(
        { error: 'Layanan tidak ditemukan atau tidak aktif' },
        { status: 404 }
      )
    }
    
    // Calculate total amount
    const quantity = new Decimal(validated.quantity)
    const pricePerUnit = new Decimal(service.pricePerUnit)
    const subtotal = quantity.mul(pricePerUnit)
    
    // Get or create customer
    let customer = null
    
    if (validated.customerId) {
      customer = await prisma.customer.findUnique({
        where: { id: validated.customerId },
      })
    } else {
      // Check if customer exists by phone
      customer = await prisma.customer.findUnique({
        where: { phone: validated.customerPhone },
      })
      
      // Create new customer if not exists
      if (!customer) {
        customer = await prisma.customer.create({
          data: {
            name: validated.customerName,
            phone: validated.customerPhone,
            address: validated.customerAddress || null,
          },
        })
      }
    }
    
    // Generate transaction ID
    const count = await prisma.transaction.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    })
    const transactionId = generateTransactionId(count + 1)
    
    // Create transaction with details
    const transaction = await prisma.transaction.create({
      data: {
        id: transactionId,
        customerId: customer.id,
        userId: session.id,
        status: 'DITERIMA',
        paymentStatus: validated.paymentStatus,
        paymentMethod: validated.paymentMethod || null,
        totalAmount: subtotal,
        estimatedFinishDate: validated.estimatedFinishDate,
        estimatedFinishTime: validated.estimatedFinishTime,
        notes: validated.notes || null,
        details: {
          create: {
            serviceId: service.id,
            serviceName: service.name,
            servicePricePerUnit: service.pricePerUnit,
            quantity: validated.quantity,
            subtotal: subtotal,
          },
        },
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
    
    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.id,
        action: 'CREATE_TRANSACTION',
        entityType: 'Transaction',
        entityId: transaction.id,
        newValue: { transactionId: transaction.id },
      },
    })
    
    return NextResponse.json({
      success: true,
      transaction,
    }, { status: 201 })
    
  } catch (error) {
    return handleApiError(error, 'Gagal membuat transaksi')
  }
}