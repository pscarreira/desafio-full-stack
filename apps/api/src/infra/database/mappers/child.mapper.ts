import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Child } from '@/domain/enterprise/entities/child';
import { ChildDocument } from '@/infra/database/schemas/child.schema';

export class ChildMapper {
	static toDomain(raw: ChildDocument): Child {
		return Child.create(
			{
				nome: raw.nome,
				dataNascimento: raw.dataNascimento,
				bairro: raw.bairro,
				responsavel: raw.responsavel,
				saude: raw.saude,
				educacao: raw.educacao,
				assistenciaSocial: raw.assistenciaSocial,
				revisado: raw.revisado,
				revisadoPor: raw.revisadoPor,
				revisadoEm: raw.revisadoEm,
			},
			new UniqueEntityID(raw._id.toString()),
		);
	}
}
