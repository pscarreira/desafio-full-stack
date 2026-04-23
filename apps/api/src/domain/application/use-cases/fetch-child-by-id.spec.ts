import { makeChild } from 'test/factories/make-child';
import { InMemoryChildRepository } from 'test/repositories/in-memory-child-repository';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error';
import { FetchChildByIdUseCase } from './fetch-child-by-id';

let childRepository: InMemoryChildRepository;
let sut: FetchChildByIdUseCase;

describe('FetchChildByIdUseCase', () => {
	beforeEach(() => {
		childRepository = new InMemoryChildRepository();
		sut = new FetchChildByIdUseCase(childRepository);
	});

	it('deve retornar a criança quando o id existe', async () => {
		const id = new UniqueEntityID();
		childRepository.items.push(makeChild({}, id));

		const result = await sut.execute({ id: id.toString() });

		expect(result.isRight()).toBe(true);
		expect(result.value).toEqual({ child: expect.objectContaining({ id }) });
	});

	it('deve retornar ResourceNotFoundError quando o id não existe', async () => {
		const result = await sut.execute({ id: 'id-inexistente' });

		expect(result.isLeft()).toBe(true);
		expect(result.value).toBeInstanceOf(ResourceNotFoundError);
	});
});
