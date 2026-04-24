import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import DashboardPage from './page';

// Mocka os componentes de gráfico para isolar o teste da página
vi.mock('@/components/bar-chart', () => ({
	BarChart: ({ title }: { title: string }) => (
		<div data-testid="bar-chart">{title}</div>
	),
}));

vi.mock('@/components/pie-chart', () => ({
	PieChart: ({ title }: { title: string }) => (
		<div data-testid="pie-chart">{title}</div>
	),
}));

vi.mock('@/lib/api', () => ({
	summaryService: {
		getSummary: vi.fn(),
	},
}));

import { summaryService } from '@/lib/api';

const mockSummary = {
	totalChildren: 50,
	reviewed: 30,
	alertsByArea: { saude: 10, educacao: 8, assistenciaSocial: 5 },
	percentageWithAlertsByArea: {
		saude: 20,
		educacao: 16,
		assistenciaSocial: 10,
	},
};

function renderWithQuery(ui: React.ReactElement) {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false, retryDelay: 0 } },
	});
	return render(
		<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
	);
}

describe('DashboardPage', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('deve exibir skeletons durante o carregamento', () => {
		vi.mocked(summaryService.getSummary).mockReturnValue(new Promise(() => {}));

		const { container } = renderWithQuery(<DashboardPage />);

		expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(
			0,
		);
	});

	it('deve exibir os dados ao carregar com sucesso', async () => {
		vi.mocked(summaryService.getSummary).mockResolvedValue(mockSummary);

		renderWithQuery(<DashboardPage />);

		await waitFor(() => {
			expect(screen.getByText('50')).toBeInTheDocument();
		});

		expect(screen.getByText('30')).toBeInTheDocument();
	});

	it('deve exibir mensagem de erro quando a requisição falha', async () => {
		vi.mocked(summaryService.getSummary).mockRejectedValue(
			new Error('Erro de rede'),
		);

		renderWithQuery(<DashboardPage />);

		await waitFor(() => {
			expect(
				screen.getByText('Erro ao carregar os dados. Tente novamente.'),
			).toBeInTheDocument();
		});
	});

	it('deve renderizar os dois gráficos', async () => {
		vi.mocked(summaryService.getSummary).mockResolvedValue(mockSummary);

		renderWithQuery(<DashboardPage />);

		await waitFor(() => {
			expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
			expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
		});
	});

	it('deve exibir os títulos dos cards de alerta', async () => {
		vi.mocked(summaryService.getSummary).mockResolvedValue(mockSummary);

		renderWithQuery(<DashboardPage />);

		await waitFor(() => {
			expect(screen.getByText('Alertas de Saúde')).toBeInTheDocument();
			expect(screen.getByText('Alertas de Educação')).toBeInTheDocument();
			expect(
				screen.getByText('Alertas de Assistência Social'),
			).toBeInTheDocument();
		});
	});
});
