import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Child, ChildProps } from '@/domain/enterprise/entities/child';

export function makeChild(
	overrides: Partial<ChildProps> = {},
	id?: UniqueEntityID,
): Child {
	return Child.create(
		{
			nome: 'João Silva',
			dataNascimento: new Date('2020-01-01'),
			bairro: 'Rocinha',
			responsavel: 'Maria Silva',
			saude: { ultimaConsulta: null, vacinasEmDia: true, alertas: [] },
			educacao: null,
			assistenciaSocial: null,
			revisado: false,
			revisadoPor: null,
			revisadoEm: null,
			...overrides,
		},
		id ?? new UniqueEntityID(),
	);
}
