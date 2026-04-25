import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Child } from '@/lib/api';
import ChildrenDetailsPage from './page';

vi.mock('@/lib/api', async (importOriginal) => {
	const actual = await importOriginal<typeof import('@/lib/api')>();
	return {
		...actual,
		childrenService: {
			getChildById: vi.fn(),
			reviewChild: vi.fn(),
		},
	};
});

function makeChild(overrides: Partial<Child> = {}): Child {
	return {
		id: 'child-1',
		nome: 'Ana Beatriz',
		dataNascimento: '2016-08-15T12:00:00.000Z',
		bairro: 'Rocinha',
		responsavel: 'Carla Lima',
		revisado: false,
		revisadoPor: null,
		revisadoEm: null,
		saude: {
			ultimaConsulta: null,
			vacinasEmDia: false,
			alertas: ['vacinas_atrasadas', 'consulta_atrasada'],
		},
		educacao: {
			escola: 'Escola Municipal',
			frequenciaPercent: 72,
			alertas: ['frequencia_baixa'],
		},
		assistenciaSocial: {
			cadUnico: true,
			beneficioAtivo: false,
			alertas: ['cadastro_desatualizado'],
		},
		...overrides,
	};
}

function makeQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: { retry: false },
			mutations: { retry: false },
		},
	});
}

function renderPage(queryClient = makeQueryClient(), id = 'child-1') {
	render(
		<QueryClientProvider client={queryClient}>
			<ChildrenDetailsPage params={{ id }} />
		</QueryClientProvider>,
	);

	return { queryClient };
}

describe('ChildrenDetailsPage', () => {
	let getChildById: ReturnType<typeof vi.fn>;
	let reviewChild: ReturnType<typeof vi.fn>;

	beforeEach(async () => {
		const { childrenService } = await import('@/lib/api');
		getChildById = childrenService.getChildById as ReturnType<typeof vi.fn>;
		reviewChild = childrenService.reviewChild as ReturnType<typeof vi.fn>;
		getChildById.mockReset();
		reviewChild.mockReset();
	});

	it('deve exibir os dados da criança e traduzir alertas', async () => {
		getChildById.mockResolvedValue(makeChild());

		renderPage();

		await waitFor(() => {
			expect(screen.getByText('Ana Beatriz')).toBeInTheDocument();
		});

		expect(screen.getByText('15/08/2016')).toBeInTheDocument();
		expect(screen.getByText('Carla Lima')).toBeInTheDocument();
		expect(screen.getByText('Vacinas atrasadas')).toBeInTheDocument();
		expect(screen.getByText('Consulta atrasada')).toBeInTheDocument();
		expect(screen.getByText('Frequência escolar baixa')).toBeInTheDocument();
		expect(
			screen.getByText('Cadastro CadÚnico desatualizado'),
		).toBeInTheDocument();
	});

	it('deve exibir erro quando a API falha', async () => {
		getChildById.mockRejectedValue(new Error('Network error'));

		renderPage();

		await waitFor(
			() => {
				expect(
					screen.getByText('Erro ao carregar os dados.'),
				).toBeInTheDocument();
			},
			{ timeout: 5000 },
		);
	});

	it('deve exibir botão para marcar como revisado quando a criança está pendente', async () => {
		getChildById.mockResolvedValue(makeChild({ revisado: false }));

		renderPage();

		await waitFor(() => {
			expect(
				screen.getByRole('button', { name: 'Marcar como revisado' }),
			).toBeInTheDocument();
		});
	});

	it('deve atualizar a tela e invalidar a listagem ao marcar como revisado', async () => {
		const queryClient = makeQueryClient();
		const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');
		getChildById.mockResolvedValue(makeChild({ revisado: false }));
		reviewChild.mockResolvedValue(
			makeChild({
				revisado: true,
				revisadoPor: 'agente.social',
				revisadoEm: '2026-04-25T12:00:00.000Z',
			}),
		);

		renderPage(queryClient);

		await userEvent.click(
			await screen.findByRole('button', { name: 'Marcar como revisado' }),
		);

		await waitFor(() => {
			expect(reviewChild).toHaveBeenCalledWith('child-1');
		});

		await waitFor(() => {
			expect(screen.getByRole('button', { name: 'Revisado' })).toBeDisabled();
		});

		expect(
			screen.queryByRole('button', { name: 'Marcar como revisado' }),
		).not.toBeInTheDocument();
		expect(screen.getByText('agente.social')).toBeInTheDocument();
		expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['children'] });
	});
});
