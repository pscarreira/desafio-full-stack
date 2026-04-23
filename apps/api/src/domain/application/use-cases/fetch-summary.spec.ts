import { makeChild } from 'test/factories/make-child';
import { InMemoryChildRepository } from 'test/repositories/in-memory-child-repository';
import { AlertaAssistenciaSocial } from '@/core/enums/alerta-assistencia-social';
import { AlertaEducacao } from '@/core/enums/alerta-educacao';
import { AlertaSaude } from '@/core/enums/alerta-saude';
import { FetchSummaryUseCase } from './fetch-summary';

let childRepository: InMemoryChildRepository;
let sut: FetchSummaryUseCase;

describe('FetchSummaryUseCase', () => {
	beforeEach(() => {
		childRepository = new InMemoryChildRepository();
		sut = new FetchSummaryUseCase(childRepository);
	});

	it('deve retornar zeros quando não há crianças', async () => {
		const result = await sut.execute();

		expect(result.isRight()).toBe(true);
		expect(result.value?.summary).toEqual({
			totalChildren: 0,
			reviewed: 0,
			alertsByArea: { saude: 0, educacao: 0, assistenciaSocial: 0 },
			percentageWithAlertsByArea: {
				saude: 0,
				educacao: 0,
				assistenciaSocial: 0,
			},
		});
	});

	it('deve contar o total de crianças e revisadas corretamente', async () => {
		childRepository.items.push(
			makeChild({ revisado: true }),
			makeChild({ revisado: true }),
			makeChild({ revisado: false }),
		);

		const result = await sut.execute();

		expect(result.isRight()).toBe(true);
		expect(result.value?.summary.totalChildren).toBe(3);
		expect(result.value?.summary.reviewed).toBe(2);
	});

	it('deve contar alertas por área corretamente', async () => {
		childRepository.items.push(
			makeChild({
				saude: {
					ultimaConsulta: null,
					vacinasEmDia: false,
					alertas: [AlertaSaude.VacinasAtrasadas],
				},
			}),
			makeChild({
				educacao: {
					escola: 'Escola A',
					frequenciaPercent: 50,
					alertas: [AlertaEducacao.FrequenciaBaixa],
				},
			}),
			makeChild({
				assistenciaSocial: {
					cadUnico: false,
					beneficioAtivo: false,
					alertas: [AlertaAssistenciaSocial.CadastroAusente],
				},
			}),
			makeChild(),
		);

		const result = await sut.execute();

		expect(result.isRight()).toBe(true);
		expect(result.value?.summary.alertsByArea).toEqual({
			saude: 1,
			educacao: 1,
			assistenciaSocial: 1,
		});
	});

	it('deve calcular percentuais por área corretamente', async () => {
		childRepository.items.push(
			makeChild({
				saude: {
					ultimaConsulta: null,
					vacinasEmDia: false,
					alertas: [AlertaSaude.VacinasAtrasadas],
				},
			}),
			makeChild({
				saude: {
					ultimaConsulta: null,
					vacinasEmDia: false,
					alertas: [AlertaSaude.ConsultaAtrasada],
				},
			}),
			makeChild(),
			makeChild(),
		);

		const result = await sut.execute();

		expect(result.isRight()).toBe(true);
		expect(result.value?.summary.percentageWithAlertsByArea.saude).toBe(50);
		expect(result.value?.summary.percentageWithAlertsByArea.educacao).toBe(0);
		expect(
			result.value?.summary.percentageWithAlertsByArea.assistenciaSocial,
		).toBe(0);
	});
});
