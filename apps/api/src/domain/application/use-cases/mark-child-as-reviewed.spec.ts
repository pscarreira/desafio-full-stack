import { makeChild } from 'test/factories/make-child';
import { InMemoryChildRepository } from 'test/repositories/in-memory-child-repository';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error';
import { MarkChildAsReviewedUseCase } from './mark-child-as-reviewed';

let childRepository: InMemoryChildRepository;
let sut: MarkChildAsReviewedUseCase;

describe('MarkChildAsReviewedUseCase', () => {
	beforeEach(() => {
		childRepository = new InMemoryChildRepository();
		sut = new MarkChildAsReviewedUseCase(childRepository);
	});

	it('deve marcar a criança como revisada', async () => {
		const id = new UniqueEntityID();
		childRepository.items.push(makeChild({ revisado: false }, id));

		const result = await sut.execute({
			id: id.toString(),
			revisor: 'tecnico@prefeitura.rio',
		});

		expect(result.isRight()).toBe(true);
		if (result.isRight()) {
			expect(result.value?.child.revisado).toBe(true);
			expect(result.value?.child.revisadoPor).toBe('tecnico@prefeitura.rio');
			expect(result.value?.child.revisadoEm).toBeInstanceOf(Date);
		}
	});

	it('não deve chamar reviewChild se a criança já está revisada', async () => {
		const id = new UniqueEntityID();
		const reviewDate = new Date('2024-01-01');
		childRepository.items.push(
			makeChild(
				{
					revisado: true,
					revisadoPor: 'outro@prefeitura.rio',
					revisadoEm: reviewDate,
				},
				id,
			),
		);

		const reviewChildSpy = vi.spyOn(childRepository, 'reviewChild');

		const result = await sut.execute({
			id: id.toString(),
			revisor: 'tecnico@prefeitura.rio',
		});

		expect(result.isRight()).toBe(true);
		expect(reviewChildSpy).not.toHaveBeenCalled();
		if (result.isRight()) {
			expect(result.value.child.revisadoPor).toBe('outro@prefeitura.rio');
			expect(result.value.child.revisadoEm).toEqual(reviewDate);
		}
	});

	it('deve retornar ResourceNotFoundError quando o id não existe', async () => {
		const result = await sut.execute({
			id: 'id-inexistente',
			revisor: 'tecnico@prefeitura.rio',
		});

		expect(result.isLeft()).toBe(true);
		expect(result.value).toBeInstanceOf(ResourceNotFoundError);
	});
});
