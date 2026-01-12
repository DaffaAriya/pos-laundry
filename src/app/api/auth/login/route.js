import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import prisma from '@/lib/prisma'
import { comparePassword } from '@/lib/auth'
import { loginSchema } from '@/lib/validations'

export async function POST(request) {
  try {
    const body = await request.json()
    
    // Validate input
    const validated = loginSchema.parse(body)
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { username: validated.username },
      select: {
        id: true,
        username: true,
        password: true,
        role: true,
        isActive: true,
      },
    })
    
    // Check if user exists
    if (!user) {
      return NextResponse.json(
        { error: 'Username atau password salah' },
        { status: 401 }
      )
    }
    
    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Akun tidak aktif' },
        { status: 403 }
      )
    }
    
    // Verify password
    const isValidPassword = await comparePassword(validated.password, user.password)
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Username atau password salah' },
        { status: 401 }
      )
    }
    
    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    })
    
    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        entityType: 'User',
        entityId: user.id,
        timestamp: new Date(),
      },
    })
    
    // Create session
    const sessionData = {
      id: user.id,
      username: user.username,
      role: user.role,
    }
    
    // Set cookie (expires in 6 hours)
    const cookieStore = cookies()
    cookieStore.set('session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 6, // 6 hours
      path: '/',
    })
    
    // Return user data (without password)
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    })
    
  } catch (error) {
    console.error('Login error:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Data tidak valid', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}