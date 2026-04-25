import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/login', '/register', '/unauthorized']
const PRIVATE_ROUTES = ['/dashboard', '/profile', '/children-list', '/children-details']

function isTokenExpired(token: string): boolean {
	try {
		const base64Payload = token.split('.')[1]
		if (!base64Payload) return true
		const base64 = base64Payload.replace(/-/g, '+').replace(/_/g, '/')
		const payload = JSON.parse(atob(base64))
		if (!payload.exp) return false
		return Date.now() >= payload.exp * 1000
	} catch {
		return true
	}
}

export function middleware(request: NextRequest) {
	const pathname = request.nextUrl.pathname
	const token = request.cookies.get('auth-token')?.value

	const isPrivateRoute = PRIVATE_ROUTES.some(route => pathname.startsWith(route))

	const isAuthenticated = !!token && !isTokenExpired(token)

	if (!isAuthenticated) {
		if (isPrivateRoute) {
			return NextResponse.redirect(new URL('/unauthorized', request.url))
		}
		if(pathname === '/') {
			return NextResponse.redirect(new URL('/login', request.url))
		}
		return NextResponse.next()
	}

	if (pathname === '/' || pathname === '/login' || pathname === '/register') {
		return NextResponse.redirect(new URL('/dashboard', request.url))
	}
	return NextResponse.next()
}

export const config = {
	matcher: [
		// Matcher para rotas privadas e públicas, ignorando rotas de API, assets estáticos e favicon
		'/((?!api|_next/static|_next/image|favicon.ico).*)',
	],
}
