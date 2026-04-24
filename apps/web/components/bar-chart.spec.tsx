import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { BarChart } from './bar-chart';

vi.mock('recharts', () => ({
	BarChart: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="recharts-bar-chart">{children}</div>
	),
	Bar: () => null,
	CartesianGrid: () => null,
	XAxis: () => null,
	YAxis: () => null,
}));

vi.mock('@/components/ui/chart', () => ({
	ChartContainer: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="chart-container">{children}</div>
	),
	ChartTooltip: () => null,
	ChartTooltipContent: () => null,
}));

const mockData = [
	{ label: 'Saúde', value: 10, fill: 'var(--chart-1)' },
	{ label: 'Educação', value: 20, fill: 'var(--chart-2)' },
	{ label: 'Assist. Social', value: 5, fill: 'var(--chart-3)' },
];

describe('BarChart', () => {
	it('deve renderizar o título', () => {
		render(<BarChart title="Alertas por Área" data={mockData} isLoading={false} />);

		expect(screen.getByText('Alertas por Área')).toBeInTheDocument();
	});

	it('deve exibir skeleton quando isLoading é true', () => {
		const { container } = render(
			<BarChart title="Alertas por Área" data={mockData} isLoading={true} />,
		);

		expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
	});

	it('não deve exibir skeleton quando isLoading é false', () => {
		const { container } = render(
			<BarChart title="Alertas por Área" data={mockData} isLoading={false} />,
		);

		expect(container.querySelector('.animate-pulse')).not.toBeInTheDocument();
	});

	it('deve renderizar o gráfico quando isLoading é false', () => {
		const { container } = render(
			<BarChart title="Alertas por Área" data={mockData} isLoading={false} />,
		);

		expect(screen.getByTestId('chart-container')).toBeInTheDocument();
	});

	it('não deve renderizar o gráfico quando isLoading é true', () => {
		render(<BarChart title="Alertas por Área" data={mockData} isLoading={true} />);

		expect(screen.queryByTestId('chart-container')).not.toBeInTheDocument();
	});
});
