import { Child } from '@/domain/enterprise/entities/child';

export class ChildPresenter {
	static toHttp(child: Child) {
		return {
			id: child.id.toString(),
			nome: child.nome,
			dataNascimento: child.dataNascimento.toISOString(),
			bairro: child.bairro,
			responsavel: child.responsavel,
			saude: child.saude,
			educacao: child.educacao,
			assistenciaSocial: child.assistenciaSocial,
			revisado: child.revisado,
			revisadoPor: child.revisadoPor,
			revisadoEm: child.revisadoEm ? child.revisadoEm.toISOString() : null,
		};
	}
}
