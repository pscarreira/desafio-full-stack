import { apiClient } from './client'

export interface LoginRequest {
	email: string
	password: string
}

export interface LoginResponse {
	access_token: string
}

export interface RegisterRequest {
	email: string
	password: string
	name?: string
}

export interface RegisterResponse {
	access_token: string
	user: {
		id: string
		email: string
		name?: string
	}
}

class AuthService {
	async login(credentials: LoginRequest): Promise<LoginResponse> {
		const response = await apiClient.post<LoginResponse>('/auth/token', credentials)
		if (response.access_token) {
			apiClient.setToken(response.access_token)
		}
		return response
	}

	logout(): void {
		apiClient.clearToken()
	}

	getToken(): string | null {
		if (typeof window === 'undefined') return null
		const cookies = document.cookie.split('; ')
		const authCookie = cookies.find(cookie => cookie.startsWith('auth-token='))
		return authCookie ? authCookie.split('=')[1] : null
	}

	isAuthenticated(): boolean {
		return !!this.getToken()
	}
}

export const authService = new AuthService()
