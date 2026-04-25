import { apiClient } from './client';

export interface ChildAlertaSaude {
	ultimaConsulta: string | null;
	vacinasEmDia: boolean;
	alertas: string[];
}

export interface ChildAlertaEducacao {
	escola: string | null;
	frequenciaPercent: number | null;
	alertas: string[];
}

export interface ChildAlertaAssistenciaSocial {
	cadUnico: boolean;
	beneficioAtivo: boolean;
	alertas: string[];
}

export interface Child {
	id: string;
	nome: string;
	dataNascimento: string;
	bairro: string;
	responsavel: string;
	saude: ChildAlertaSaude | null;
	educacao: ChildAlertaEducacao | null;
	assistenciaSocial: ChildAlertaAssistenciaSocial | null;
	revisado: boolean;
	revisadoPor: string | null;
	revisadoEm: string | null;
}

export interface ChildrenMeta {
	totalItems: number;
	itemCount: number;
	itemsPerPage: number;
	totalPages: number;
	currentPage: number;
}

export interface ChildrenResponse {
	children: Child[];
	meta: ChildrenMeta;
}

export interface ChildrenFilters {
	bairro?: string;
	revisado?: boolean;
	comAlertas?: boolean;
	page?: number;
	perPage?: number;
}

async function getChildren(filters: ChildrenFilters = {}): Promise<ChildrenResponse> {
	const params: Record<string, string> = {};

	if (filters.bairro) params.bairro = filters.bairro;
	if (filters.revisado !== undefined) params.revisado = String(filters.revisado);
	if (filters.comAlertas !== undefined) params.comAlertas = String(filters.comAlertas);
	if (filters.page !== undefined) params.page = String(filters.page);
	if (filters.perPage !== undefined) params.perPage = String(filters.perPage);

	return apiClient.get<ChildrenResponse>('/children', { params });
}

async function getChildById(id: string): Promise<Child> {
	const response = await apiClient.get<{ child: Child }>(`/children/${id}`);
	return response.child;
}

async function reviewChild(id: string): Promise<Child> {
	const response = await apiClient.patch<{ child: Child }>(`/children/${id}/review`);
	return response.child;
}

export const childrenService = { getChildren, getChildById, reviewChild };
