import { makeChild } from 'test/factories/make-child';
import { InMemoryChildRepository } from 'test/repositories/in-memory-child-repository';
import { AlertaSaude } from '@/core/enums/alerta-saude';
import { ListChildrenUseCase } from './list-children';

let childRepository: InMemoryChildRepository;
let sut: ListChildrenUseCase;

describe('ListChildrenUseCase', () => {
	beforeEach(() => {
		childRepository = new InMemoryChildRepository();
		sut = new ListChildrenUseCase(childRepository);
	});

	it('deve retornar todas as crianças sem filtros', async () => {
		childRepository.items.push(makeChild(), makeChild(), makeChild());

		const result = await sut.execute({});

		expect(result.isRight()).toBe(true);
		expect(result.value?.children).toHaveLength(3);
	});

	it('deve filtrar por bairro', async () => {
		childRepository.items.push(
			makeChild({ bairro: 'Rocinha' }),
			makeChild({ bairro: 'Maré' }),
			makeChild({ bairro: 'Rocinha' }),
		);

		const result = await sut.execute({ bairro: 'Rocinha' });

		expect(result.isRight()).toBe(true);
		expect(result.value?.children).toHaveLength(2);
	});

	it('deve filtrar por revisado', async () => {
		childRepository.items.push(
			makeChild({ revisado: true }),
			makeChild({ revisado: false }),
			makeChild({ revisado: false }),
		);

		const result = await sut.execute({ revisado: false });

		expect(result.isRight()).toBe(true);
		expect(result.value?.children).toHaveLength(2);
	});

	it('deve filtrar crianças com alertas', async () => {
		childRepository.items.push(
			makeChild({
				saude: {
					ultimaConsulta: null,
					vacinasEmDia: false,
					alertas: [AlertaSaude.VacinasAtrasadas],
				},
			}),
			makeChild(),
			makeChild({
				saude: {
					ultimaConsulta: null,
					vacinasEmDia: false,
					alertas: [AlertaSaude.ConsultaAtrasada],
				},
			}),
		);

		const result = await sut.execute({ comAlertas: true });

		expect(result.isRight()).toBe(true);
		expect(result.value?.children).toHaveLength(2);
	});

	it('deve paginar os resultados', async () => {
		for (let i = 0; i < 25; i++) {
			childRepository.items.push(makeChild());
		}

		const result = await sut.execute({ page: 2, perPage: 20 });

		expect(result.isRight()).toBe(true);
		expect(result.value?.children).toHaveLength(5);
		expect(result.value?.meta.currentPage).toBe(2);
	});

	it('deve retornar meta correta', async () => {
		childRepository.items.push(makeChild(), makeChild());

		const result = await sut.execute({ perPage: 10 });

		expect(result.isRight()).toBe(true);
		expect(result.value?.meta).toEqual({
			totalItems: 2,
			itemCount: 2,
			itemsPerPage: 10,
			totalPages: 1,
			currentPage: 1,
		});
	});

	describe('filtros combinados', () => {
		const comAlerta = {
			saude: {
				ultimaConsulta: null,
				vacinasEmDia: false,
				alertas: [AlertaSaude.VacinasAtrasadas],
			},
		};

		it('deve filtrar por bairro + comAlertas', async () => {
			childRepository.items.push(
				makeChild({ bairro: 'Rocinha', ...comAlerta }),
				makeChild({ bairro: 'Rocinha' }),
				makeChild({ bairro: 'Maré', ...comAlerta }),
				makeChild({ bairro: 'Maré' }),
			);

			const result = await sut.execute({ bairro: 'Rocinha', comAlertas: true });

			expect(result.isRight()).toBe(true);
			expect(result.value?.children).toHaveLength(1);
			expect(result.value?.children[0].bairro).toBe('Rocinha');
		});

		it('deve filtrar por bairro + revisado', async () => {
			childRepository.items.push(
				makeChild({ bairro: 'Rocinha', revisado: true }),
				makeChild({ bairro: 'Rocinha', revisado: false }),
				makeChild({ bairro: 'Maré', revisado: true }),
			);

			const result = await sut.execute({ bairro: 'Rocinha', revisado: true });

			expect(result.isRight()).toBe(true);
			expect(result.value?.children).toHaveLength(1);
		});

		it('deve filtrar por revisado + comAlertas', async () => {
			childRepository.items.push(
				makeChild({ revisado: true, ...comAlerta }),
				makeChild({ revisado: true }),
				makeChild({ revisado: false, ...comAlerta }),
			);

			const result = await sut.execute({ revisado: true, comAlertas: true });

			expect(result.isRight()).toBe(true);
			expect(result.value?.children).toHaveLength(1);
		});

		it('deve filtrar por bairro + revisado + comAlertas', async () => {
			childRepository.items.push(
				makeChild({ bairro: 'Rocinha', revisado: true, ...comAlerta }),
				makeChild({ bairro: 'Rocinha', revisado: false, ...comAlerta }),
				makeChild({ bairro: 'Rocinha', revisado: true }),
				makeChild({ bairro: 'Maré', revisado: true, ...comAlerta }),
			);

			const result = await sut.execute({
				bairro: 'Rocinha',
				revisado: true,
				comAlertas: true,
			});

			expect(result.isRight()).toBe(true);
			expect(result.value?.children).toHaveLength(1);
		});

		it('deve retornar vazio quando nenhuma criança satisfaz todos os filtros', async () => {
			childRepository.items.push(
				makeChild({ bairro: 'Rocinha', revisado: false }),
				makeChild({ bairro: 'Maré', revisado: true }),
			);

			const result = await sut.execute({ bairro: 'Rocinha', revisado: true });

			expect(result.isRight()).toBe(true);
			expect(result.value?.children).toHaveLength(0);
		});
	});
});
