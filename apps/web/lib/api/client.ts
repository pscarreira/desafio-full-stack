import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios'

export interface ApiResponse<T> {
	data?: T
	error?: {
		message: string
		code?: string
	}
}

export interface ApiError extends Error {
	status?: number
	data?: unknown
}

class ApiClient {
	private axiosInstance: AxiosInstance
	private baseUrl: string

	constructor(baseUrl: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001') {
		this.baseUrl = baseUrl
		this.axiosInstance = axios.create({
			baseURL: baseUrl,
			timeout: 10000,
			headers: {
				'Content-Type': 'application/json',
			},
		})

		// Interceptor para adicionar token automaticamente
		this.axiosInstance.interceptors.request.use(
			config => {
				const token = this.getToken()
				if (token) {
					config.headers.Authorization = `Bearer ${token}`
				}
				return config
			},
			error => Promise.reject(error),
		)

		// Interceptor para tratar erros
		this.axiosInstance.interceptors.response.use(
			response => response,
			error => this.handleError(error),
		)
	}

	private handleError(error: AxiosError): never {
		const apiError: ApiError = new Error(
			this.getErrorMessage(error.response?.data) || error.message || 'Erro desconhecido',
		)
		apiError.status = error.response?.status
		apiError.data = error.response?.data
		throw apiError
	}

	private getErrorMessage(data: unknown): string | null {
		if (typeof data === 'object' && data !== null && 'message' in data) {
			return (data as Record<string, unknown>).message as string
		}
		return null
	}

	async get<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
		const response = await this.axiosInstance.get<T>(endpoint, config)
		return response.data
	}

	async post<T>(endpoint: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
		const response = await this.axiosInstance.post<T>(endpoint, body, config)
		return response.data
	}

	async put<T>(endpoint: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
		const response = await this.axiosInstance.put<T>(endpoint, body, config)
		return response.data
	}

	async patch<T>(endpoint: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
		const response = await this.axiosInstance.patch<T>(endpoint, body, config)
		return response.data
	}

	async delete<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
		const response = await this.axiosInstance.delete<T>(endpoint, config)
		return response.data
	}

	private getToken(): string | null {
		if (typeof window === 'undefined') return null
		const cookies = document.cookie.split('; ')
		const authCookie = cookies.find(cookie => cookie.startsWith('auth-token='))
		return authCookie ? authCookie.split('=')[1] : null
	}

	setToken(token: string): void {
		if (typeof window === 'undefined') return
		document.cookie = `auth-token=${token}; path=/; max-age=86400; samesite=strict`
	}

	clearToken(): void {
		if (typeof window === 'undefined') return
		document.cookie = 'auth-token=; path=/; max-age=0'
	}
}

export const apiClient = new ApiClient()
