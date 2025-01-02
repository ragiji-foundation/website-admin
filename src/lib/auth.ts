import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

interface JWTPayload {
  email: string;
  role: string;
  [key: string]: unknown;
}

const secretKey = process.env.JWT_SECRET || 'your-secret-key'
const key = new TextEncoder().encode(secretKey)

export async function encrypt(payload: JWTPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(key)
}

export async function decrypt(token: string) {
  const { payload } = await jwtVerify(token, key)
  return payload
}

export async function login(formData: FormData) {
  const token = await encrypt({
    email: formData.get('email') as string,
    role: 'admin'
  })

  const response = NextResponse.next()
  response.cookies.set({
    name: 'token',
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24
  })
}

export async function logout() {
  const response = NextResponse.next()
  response.cookies.delete('token')
}
export async function getSession() {
  const token = (await cookies()).get('token')?.value
  if (!token) return null
  try {
    return await decrypt(token)
  } catch (_error) {
    return null
  }
}

export async function updateSession(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  if (!token) return null

  try {
    const parsed = await decrypt(token)
    const newToken = await encrypt({
      email: parsed.email as string,
      role: parsed.role as string
    })

    const response = NextResponse.next()
    response.cookies.set({
      name: 'token',
      value: newToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24
    })

    return parsed
  } catch (_error) {
    return null
  }
} 