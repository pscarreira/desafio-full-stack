import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ChildrenResponse } from '@/lib/api';
import ChildrenListPage from './page';

vi.mock('@/lib/api', async (importOriginal) => {
	const actual = await importOriginal<typeof import('@/lib/api')>();
	return {
		...actual,
		childrenService: {
			getChildren: vi.fn(),
		},
	};
});

function makeResponse(
	overrides: Partial<ChildrenResponse> = {},
): ChildrenResponse {
	return {
		children: [],
		meta: {
			totalItems: 0,
			itemCount: 0,
			itemsPerPage: 10,
			totalPages: 1,
			currentPage: 1,
		},
		...overrides,
	};
}

function makeQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				retryDelay: 100,
				retry: 1,
			},
		},
	});
}

function renderPage() {
	const queryClient = makeQueryClient();
	render(
		<QueryClientProvider client={queryClient}>
			<ChildrenListPage />
		</QueryClientProvider>,
	);
}

describe('ChildrenListPage', () => {
	let getChildren: ReturnType<typeof vi.fn>;

	beforeEach(async () => {
		const { childrenService } = await import('@/lib/api');
		getChildren = childrenService.getChildren as ReturnType<typeof vi.fn>;
		getChildren.mockReset();
	});

	it('deve exibir o título da página', async () => {
		getChildren.mockResolvedValue(makeResponse());
		renderPage();

		expect(screen.getByText('Listagem de Crianças')).toBeInTheDocument();
	});

	it('deve exibir os cabeçalhos da tabela', async () => {
		getChildren.mockResolvedValue(makeResponse());
		renderPage();

		expect(
			screen.getByRole('columnheader', { name: 'Nome' }),
		).toBeInTheDocument();
		expect(
			screen.getByRole('columnheader', { name: 'Bairro' }),
		).toBeInTheDocument();
		expect(
			screen.getByRole('columnheader', { name: 'Nascimento' }),
		).toBeInTheDocument();
		expect(
			screen.getByRole('columnheader', { name: 'Status' }),
		).toBeInTheDocument();
		expect(
			screen.getByRole('columnheader', { name: 'Alertas' }),
		).toBeInTheDocument();
	});

	it('deve exibir skeletons durante o carregamento', () => {
		// nao resolve, simulando loading
		getChildren.mockImplementation(() => new Promise(() => {}));
		renderPage();

		const pulseElements = document.querySelectorAll('.animate-pulse');
		expect(pulseElements.length).toBeGreaterThan(0);
	});

	it('deve exibir lista de crianças após carregar', async () => {
		getChildren.mockResolvedValue(
			makeResponse({
				children: [
					{
						id: '1',
						nome: 'João Souza',
						dataNascimento: '2015-03-20T00:00:00.000Z',
						bairro: 'Jardim América',
						responsavel: 'Carlos Souza',
						revisado: true,
						revisadoPor: null,
						revisadoEm: null,
						saude: null,
						educacao: null,
						assistenciaSocial: null,
					},
				],
				meta: {
					totalItems: 1,
					itemCount: 1,
					itemsPerPage: 10,
					totalPages: 1,
					currentPage: 1,
				},
			}),
		);

		renderPage();

		await waitFor(() => {
			expect(screen.getByText('João Souza')).toBeInTheDocument();
		});

		expect(screen.getByText('Jardim América')).toBeInTheDocument();
		expect(screen.getAllByText('Revisado').length).toBeGreaterThanOrEqual(1);
		expect(screen.getByText('1 registro encontrado')).toBeInTheDocument();
	});

	it('deve exibir mensagem quando nenhuma criança é encontrada', async () => {
		getChildren.mockResolvedValue(makeResponse());
		renderPage();

		await waitFor(() => {
			expect(
				screen.getByText(
					'Nenhuma criança encontrada com os filtros aplicados.',
				),
			).toBeInTheDocument();
		});
	});

	it('deve exibir mensagem de erro quando a API falha', async () => {
		getChildren.mockRejectedValue(new Error('Network error'));
		renderPage();

		// retry: 1 no useQuery causa ~1s de delay antes do estado de erro aparecer
		await waitFor(() => {
			expect(
				screen.getByText('Erro ao carregar os dados. Tente novamente.'),
			).toBeInTheDocument();
		});
	});

	it('deve desabilitar o botão "Página anterior" na primeira página', async () => {
		getChildren.mockResolvedValue(
			makeResponse({
				meta: {
					totalItems: 25,
					itemCount: 10,
					itemsPerPage: 10,
					totalPages: 3,
					currentPage: 1,
				},
			}),
		);

		renderPage();

		await waitFor(() => {
			expect(screen.getByText('Página 1 de 3')).toBeInTheDocument();
		});

		const prevButton = screen.getByRole('button', { name: /página anterior/i });
		expect(prevButton).toBeDisabled();
	});

	it('deve avançar para a próxima página ao clicar', async () => {
		getChildren.mockResolvedValue(
			makeResponse({
				children: [],
				meta: {
					totalItems: 25,
					itemCount: 10,
					itemsPerPage: 10,
					totalPages: 3,
					currentPage: 1,
				},
			}),
		);

		renderPage();

		await waitFor(() => {
			expect(screen.getByText('Página 1 de 3')).toBeInTheDocument();
		});

		await userEvent.click(
			screen.getByRole('button', { name: /próxima página/i }),
		);

		expect(screen.getByText('Página 2 de 3')).toBeInTheDocument();
	});
});
