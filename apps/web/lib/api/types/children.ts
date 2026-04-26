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