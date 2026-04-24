import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SummaryCard } from './summary-card';

describe('SummaryCard', () => {
	it('deve renderizar o título', () => {
		render(
			<SummaryCard
				title="Total de Crianças"
				icon={<span />}
				value={42}
				isLoading={false}
			/>,
		);

		expect(screen.getByText('Total de Crianças')).toBeInTheDocument();
	});

	it('deve exibir o valor quando carregado', () => {
		render(
			<SummaryCard
				title="Total"
				icon={<span />}
				value={100}
				isLoading={false}
			/>,
		);

		expect(screen.getByText('100')).toBeInTheDocument();
	});

	it('deve exibir "—" quando o valor é undefined', () => {
		render(
			<SummaryCard
				title="Total"
				icon={<span />}
				value={undefined}
				isLoading={false}
			/>,
		);

		expect(screen.getByText('—')).toBeInTheDocument();
	});

	it('deve exibir a descrição quando fornecida', () => {
		render(
			<SummaryCard
				title="Total"
				icon={<span />}
				value={10}
				description="crianças cadastradas"
				isLoading={false}
			/>,
		);

		expect(screen.getByText('crianças cadastradas')).toBeInTheDocument();
	});

	it('não deve exibir a descrição quando não fornecida', () => {
		render(
			<SummaryCard
				title="Total"
				icon={<span />}
				value={10}
				isLoading={false}
			/>,
		);

		expect(screen.queryByRole('paragraph')).not.toBeInTheDocument();
	});

	it('deve exibir skeleton quando isLoading é true', () => {
		const { container } = render(
			<SummaryCard
				title="Total"
				icon={<span />}
				isLoading={true}
			/>,
		);

		expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
	});

	it('não deve exibir skeleton quando isLoading é false', () => {
		const { container } = render(
			<SummaryCard
				title="Total"
				icon={<span />}
				value={5}
				isLoading={false}
			/>,
		);

		expect(container.querySelector('.animate-pulse')).not.toBeInTheDocument();
	});

	it('deve renderizar o ícone fornecido', () => {
		render(
			<SummaryCard
				title="Total"
				icon={<span data-testid="meu-icone" />}
				value={5}
				isLoading={false}
			/>,
		);

		expect(screen.getByTestId('meu-icone')).toBeInTheDocument();
	});
});
