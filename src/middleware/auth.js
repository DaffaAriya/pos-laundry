import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function requireAuth(request) {
  const cookieStore = cookies()
  const sessionCookie = cookieStore.get('session')
  
  if (!sessionCookie) {
    return {
      error: NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      ),
      session: null,
    }
  }
  
  try {
    const session = JSON.parse(sessionCookie.value)
    return { session, error: null }
  } catch (error) {
    return {
      error: NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      ),
      session: null,
    }
  }
}

export async function requireRole(request, allowedRoles = []) {
  const { session, error } = await requireAuth(request)
  
  if (error) return { session: null, error }
  
  if (!allowedRoles.includes(session.role)) {
    return {
      error: NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      ),
      session: null,
    }
  }
  
  return { session, error: null }
}