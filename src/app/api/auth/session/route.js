import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get('session')
    
    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'No active session' },
        { status: 401 }
      )
    }
    
    const session = JSON.parse(sessionCookie.value)
    
    return NextResponse.json({
      success: true,
      user: session,
    })
    
  } catch (error) {
    console.error('Session check error:', error)
    return NextResponse.json(
      { error: 'Invalid session' },
      { status: 401 }
    )
  }
}