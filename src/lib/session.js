import { cookies } from 'next/headers'

export async function getSession() {
  try {
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get('session')
    
    if (!sessionCookie) {
      return null
    }
    
    return JSON.parse(sessionCookie.value)
  } catch (error) {
    console.error('Get session error:', error)
    return null
  }
}

export async function setSession(userData) {
  const sessionData = {
    id: userData.id,
    username: userData.username,
    role: userData.role,
  }
  
  const cookieStore = cookies()
  cookieStore.set('session', JSON.stringify(sessionData), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 6, // 6 hours
    path: '/',
  })
  
  return sessionData
}

export async function clearSession() {
  const cookieStore = cookies()
  cookieStore.delete('session')
}

export function isAuthenticated(session) {
  return session !== null && session.id !== undefined
}

export function hasRole(session, roles = []) {
  if (!session) return false
  return roles.includes(session.role)
}