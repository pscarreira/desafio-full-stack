import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { ChildrenFilters } from '@/lib/api';
import { ChildrenFiltersBar } from './children-filters';

const defaultFilters: ChildrenFilters = { page: 1, perPage: 10 };

describe('ChildrenFiltersBar', () => {
	it('deve renderizar todos os campos de filtro', () => {
		render(
			<ChildrenFiltersBar filters={defaultFilters} onFiltersChange={vi.fn()} />,
		);

		expect(screen.getByLabelText('Bairro')).toBeInTheDocument();
		expect(screen.getByLabelText('Revisado')).toBeInTheDocument();
		expect(screen.getByLabelText('Com Alertas')).toBeInTheDocument();
	});

	it('não deve exibir o botão "Limpar filtros" sem filtros ativos', () => {
		render(
			<ChildrenFiltersBar filters={defaultFilters} onFiltersChange={vi.fn()} />,
		);

		expect(
			screen.queryByRole('button', { name: /limpar filtros/i }),
		).not.toBeInTheDocument();
	});

	it('deve exibir o botão "Limpar filtros" quando há filtro de bairro', () => {
		render(
			<ChildrenFiltersBar
				filters={{ ...defaultFilters, bairro: 'Centro' }}
				onFiltersChange={vi.fn()}
			/>,
		);

		expect(
			screen.getByRole('button', { name: /limpar filtros/i }),
		).toBeInTheDocument();
	});

	it('deve exibir o botão "Limpar filtros" quando revisado está definido', () => {
		render(
			<ChildrenFiltersBar
				filters={{ ...defaultFilters, revisado: true }}
				onFiltersChange={vi.fn()}
			/>,
		);

		expect(
			screen.getByRole('button', { name: /limpar filtros/i }),
		).toBeInTheDocument();
	});

	it('deve chamar onFiltersChange ao digitar no campo bairro', async () => {
		const onFiltersChange = vi.fn();
		render(
			<ChildrenFiltersBar
				filters={defaultFilters}
				onFiltersChange={onFiltersChange}
			/>,
		);

		await userEvent.type(screen.getByLabelText('Bairro'), 'C');

		expect(onFiltersChange).toHaveBeenCalledWith({
			...defaultFilters,
			bairro: 'C',
			page: 1,
		});
	});

	it('deve chamar onFiltersChange com undefined quando bairro é apagado', async () => {
		const onFiltersChange = vi.fn();
		render(
			<ChildrenFiltersBar
				filters={{ ...defaultFilters, bairro: 'Centro' }}
				onFiltersChange={onFiltersChange}
			/>,
		);

		await userEvent.clear(screen.getByLabelText('Bairro'));

		expect(onFiltersChange).toHaveBeenLastCalledWith({
			...defaultFilters,
			bairro: undefined,
			page: 1,
		});
	});

	it('deve chamar onFiltersChange com revisado=true ao selecionar "Sim"', async () => {
		const onFiltersChange = vi.fn();
		render(
			<ChildrenFiltersBar
				filters={defaultFilters}
				onFiltersChange={onFiltersChange}
			/>,
		);

		await userEvent.selectOptions(screen.getByLabelText('Revisado'), 'true');

		expect(onFiltersChange).toHaveBeenCalledWith({
			...defaultFilters,
			revisado: true,
			page: 1,
		});
	});

	it('deve chamar onFiltersChange com revisado=false ao selecionar "Não"', async () => {
		const onFiltersChange = vi.fn();
		render(
			<ChildrenFiltersBar
				filters={defaultFilters}
				onFiltersChange={onFiltersChange}
			/>,
		);

		await userEvent.selectOptions(screen.getByLabelText('Revisado'), 'false');

		expect(onFiltersChange).toHaveBeenCalledWith({
			...defaultFilters,
			revisado: false,
			page: 1,
		});
	});

	it('deve chamar onFiltersChange com comAlertas=true ao selecionar "Sim"', async () => {
		const onFiltersChange = vi.fn();
		render(
			<ChildrenFiltersBar
				filters={defaultFilters}
				onFiltersChange={onFiltersChange}
			/>,
		);

		await userEvent.selectOptions(screen.getByLabelText('Com Alertas'), 'true');

		expect(onFiltersChange).toHaveBeenCalledWith({
			...defaultFilters,
			comAlertas: true,
			page: 1,
		});
	});

	it('deve resetar os filtros ao clicar em "Limpar filtros"', async () => {
		const onFiltersChange = vi.fn();
		render(
			<ChildrenFiltersBar
				filters={{ ...defaultFilters, bairro: 'Centro', revisado: true }}
				onFiltersChange={onFiltersChange}
			/>,
		);

		await userEvent.click(
			screen.getByRole('button', { name: /limpar filtros/i }),
		);

		expect(onFiltersChange).toHaveBeenCalledWith({ page: 1, perPage: 10 });
	});
});
