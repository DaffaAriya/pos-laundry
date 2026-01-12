import { NextResponse } from 'next/server'

export function handleApiError(error, customMessage = 'Terjadi kesalahan') {
  console.error('API Error:', error)
  
  // Prisma errors
  if (error.code === 'P2002') {
    return NextResponse.json(
      { error: 'Data sudah ada' },
      { status: 409 }
    )
  }
  
  if (error.code === 'P2025') {
    return NextResponse.json(
      { error: 'Data tidak ditemukan' },
      { status: 404 }
    )
  }
  
  // Validation errors (Zod)
  if (error.name === 'ZodError') {
    return NextResponse.json(
      { 
        error: 'Data tidak valid',
        details: error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
        }))
      },
      { status: 400 }
    )
  }
  
  // Default error
  return NextResponse.json(
    { error: customMessage },
    { status: 500 }
  )
}