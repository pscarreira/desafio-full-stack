export { apiClient, type ApiResponse, type ApiError } from './client'
export { authService } from './auth'
export { summaryService } from './summary'
export { childrenService } from './children'
export type {
	Child,
	ChildAlertaAssistenciaSocial,
	ChildAlertaEducacao,
	ChildAlertaSaude,
	ChildSummary,
	ChildrenFilters,
	ChildrenMeta,
	ChildrenResponse,
	LoginRequest,
	LoginResponse,
	RegisterRequest,
	RegisterResponse,
} from './types'
