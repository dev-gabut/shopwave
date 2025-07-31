import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

// Gunakan secret dari environment variable
const SECRET_KEY = process.env.JWT_SECRET!

async function verifyToken(token: string) {
  const secret = new TextEncoder().encode(SECRET_KEY)

  try {
    const { payload } = await jwtVerify(token, secret)
    return payload
  } catch (err) {
    console.error('Invalid token:', err)
    return null
  }
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('ShopWaveToken')?.value

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const payload = await verifyToken(token)
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-user-id', String(payload?.sub) || '')
  requestHeaders.set('x-user-role', String(payload?.role) || '')
  requestHeaders.set('x-user-email', String(payload?.email) || '')
  requestHeaders.set('x-user-image', String(payload?.imageUrl) || '')

  if (!payload) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  return NextResponse.next(
    {
      request: {
        headers: requestHeaders,
      },
    }
  )
}
export const config = {
  matcher: ['/seller/:path*', '/seller/add_product:path*', '/seller/form_seller:path*', '/checkout/:path*'],
}