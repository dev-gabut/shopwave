import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Gunakan secret dari environment variable
const SECRET_KEY = process.env.JWT_SECRET!;

async function verifyToken(token: string) {
	const secret = new TextEncoder().encode(SECRET_KEY);

	try {
		const { payload } = await jwtVerify(token, secret);
		return payload;
	} catch (err) {
		console.error('Invalid token:', err);
		return null;
	}
}

export async function middleware(request: NextRequest) {
	const token = request.cookies.get('ShopWaveToken')?.value;
	const protectedRoutes = ['/checkout', '/seller', '/account', '/admin'];
	const isProtectedRoute = protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route));
	if (!token && isProtectedRoute) {
		return NextResponse.redirect(new URL('/signin', request.url));
	}
	if (token && request.nextUrl.pathname === '/signin') {
		return NextResponse.redirect(new URL('/', request.url));
	}
	if (token) {
		const payload = await verifyToken(token);
		const requestHeaders = new Headers(request.headers);
		requestHeaders.set('x-user-id', String(payload?.sub) || '');
		requestHeaders.set('x-user-name', String(payload?.name) || '');
		requestHeaders.set('x-user-role', String(payload?.role) || '');
		requestHeaders.set('x-user-email', String(payload?.email) || '');
		requestHeaders.set('x-user-image', String(payload?.imageUrl) || '');

		if (!payload) {
			return NextResponse.redirect(new URL('/signin', request.url));
		}
		return NextResponse.next({
			request: {
				headers: requestHeaders,
			},
		});
	}
	return NextResponse.next();
}
export const config = {
	matcher: ['/:path*'],
};
