import { apiClient } from './client';
import type { Child, ChildrenFilters, ChildrenResponse } from './types';

export type {
	Child,
	ChildAlertaAssistenciaSocial,
	ChildAlertaEducacao,
	ChildAlertaSaude,
	ChildrenFilters,
	ChildrenMeta,
	ChildrenResponse,
} from './types';

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
