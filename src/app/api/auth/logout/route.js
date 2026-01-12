import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import prisma from '@/lib/prisma'

export async function POST(request) {
  try {
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get('session')
    
    if (sessionCookie) {
      const session = JSON.parse(sessionCookie.value)
      
      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: session.id,
          action: 'LOGOUT',
          entityType: 'User',
          entityId: session.id,
          timestamp: new Date(),
        },
      })
    }
    
    // Clear session cookie
    cookieStore.delete('session')
    
    return NextResponse.json({
      success: true,
      message: 'Logout berhasil',
    })
    
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
