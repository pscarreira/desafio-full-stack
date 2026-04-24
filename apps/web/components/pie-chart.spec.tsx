import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PieChart } from './pie-chart';

vi.mock('recharts', () => ({
	PieChart: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="recharts-pie-chart">{children}</div>
	),
	Pie: () => null,
}));

vi.mock('@/components/ui/chart', () => ({
	ChartContainer: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="chart-container">{children}</div>
	),
	ChartTooltip: () => null,
	ChartTooltipContent: () => null,
}));

const mockData = [
	{ name: 'Revisadas', value: 30, fill: 'var(--chart-2)' },
	{ name: 'Pendentes', value: 20, fill: 'var(--chart-5)' },
];

describe('PieChart', () => {
	it('deve renderizar o título', () => {
		render(<PieChart title="Revisadas vs Pendentes" data={mockData} isLoading={false} />);

		expect(screen.getByText('Revisadas vs Pendentes')).toBeInTheDocument();
	});

	it('deve exibir skeleton quando isLoading é true', () => {
		const { container } = render(
			<PieChart title="Revisadas vs Pendentes" data={mockData} isLoading={true} />,
		);

		expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
	});

	it('não deve exibir skeleton quando isLoading é false', () => {
		const { container } = render(
			<PieChart title="Revisadas vs Pendentes" data={mockData} isLoading={false} />,
		);

		expect(container.querySelector('.animate-pulse')).not.toBeInTheDocument();
	});

	it('deve renderizar o gráfico quando isLoading é false', () => {
		const { container } = render(
			<PieChart title="Revisadas vs Pendentes" data={mockData} isLoading={false} />,
		);

		expect(screen.getByTestId('chart-container')).toBeInTheDocument();
	});

	it('não deve renderizar o gráfico quando isLoading é true', () => {
		render(<PieChart title="Revisadas vs Pendentes" data={mockData} isLoading={true} />);

		expect(screen.queryByTestId('chart-container')).not.toBeInTheDocument();
	});
});
