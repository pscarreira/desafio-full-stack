import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { NextRequest } from 'next/server'

vi.mock('next/server', () => ({
	NextResponse: {
		redirect: vi.fn((url: URL) => ({ type: 'redirect', destination: url.pathname })),
		next: vi.fn(() => ({ type: 'next' })),
	},
}))

import { NextResponse } from 'next/server'
import { middleware } from './middleware'

function makeRequest(pathname: string, token?: string): NextRequest {
	return {
		nextUrl: new URL(`http://localhost${pathname}`),
		url: `http://localhost${pathname}`,
		cookies: {
			get: (name: string) =>
				name === 'auth-token' && token !== undefined ? { value: token } : undefined,
		},
	} as unknown as NextRequest
}

function makeToken(exp: number): string {
	const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
	const payload = btoa(JSON.stringify({ sub: 'user-id', exp }))
	return `${header}.${payload}.fake-signature`
}

const validToken = makeToken(Math.floor(Date.now() / 1000) + 3600)
const expiredToken = makeToken(Math.floor(Date.now() / 1000) - 3600)

describe('middleware', () => {
	beforeEach(() => {
		vi.mocked(NextResponse.redirect).mockClear()
		vi.mocked(NextResponse.next).mockClear()
	})

	describe('sem token', () => {
		it('deve redirecionar para /unauthorized ao acessar rota privada', () => {
			middleware(makeRequest('/dashboard'))
			expect(NextResponse.redirect).toHaveBeenCalledWith(
				new URL('/unauthorized', 'http://localhost/dashboard'),
			)
		})

		it('deve redirecionar para /login ao acessar a raiz /', () => {
			middleware(makeRequest('/'))
			expect(NextResponse.redirect).toHaveBeenCalledWith(
				new URL('/login', 'http://localhost/'),
			)
		})

		it('deve permitir acesso à rota pública', () => {
			middleware(makeRequest('/unauthorized'))
			expect(NextResponse.next).toHaveBeenCalled()
			expect(NextResponse.redirect).not.toHaveBeenCalled()
		})
	})

	describe('token expirado', () => {
		it('deve redirecionar para /unauthorized ao acessar rota privada', () => {
			middleware(makeRequest('/dashboard', expiredToken))
			expect(NextResponse.redirect).toHaveBeenCalledWith(
				new URL('/unauthorized', 'http://localhost/dashboard'),
			)
		})

		it('deve redirecionar para /login ao acessar a raiz /', () => {
			middleware(makeRequest('/', expiredToken))
			expect(NextResponse.redirect).toHaveBeenCalledWith(
				new URL('/login', 'http://localhost/'),
			)
		})

		it('não deve redirecionar para /dashboard ao acessar /login com token expirado', () => {
			middleware(makeRequest('/login', expiredToken))
			expect(NextResponse.next).toHaveBeenCalled()
			expect(NextResponse.redirect).not.toHaveBeenCalled()
		})
	})

	describe('token válido', () => {
		it('deve redirecionar para /dashboard ao acessar /login', () => {
			middleware(makeRequest('/login', validToken))
			expect(NextResponse.redirect).toHaveBeenCalledWith(
				new URL('/dashboard', 'http://localhost/login'),
			)
		})

		it('deve permitir acesso à rota privada', () => {
			middleware(makeRequest('/dashboard', validToken))
			expect(NextResponse.next).toHaveBeenCalled()
			expect(NextResponse.redirect).not.toHaveBeenCalled()
		})
	})
})
