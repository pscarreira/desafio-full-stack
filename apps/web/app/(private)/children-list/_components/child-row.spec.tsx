import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Child } from '@/lib/api';
import { ChildRow } from './child-row';

function makeChild(overrides: Partial<Child> = {}): Child {
	return {
		id: 'child-1',
		nome: 'Ana Silva',
		dataNascimento: '2018-05-10T12:00:00.000Z',
		bairro: 'Centro',
		responsavel: 'Maria Silva',
		revisado: false,
		revisadoPor: null,
		revisadoEm: null,
		saude: null,
		educacao: null,
		assistenciaSocial: null,
		...overrides,
	};
}

function renderRow(child: Child) {
	return render(
		<table>
			<tbody>
				<ChildRow child={child} />
			</tbody>
		</table>,
	);
}

describe('ChildRow', () => {
	it('deve renderizar o nome e o bairro', () => {
		renderRow(makeChild());

		expect(screen.getByText('Ana Silva')).toBeInTheDocument();
		expect(screen.getByText('Centro')).toBeInTheDocument();
	});

	it('deve formatar a data de nascimento em pt-BR', () => {
		renderRow(makeChild({ dataNascimento: '2018-05-10T12:00:00.000Z' }));

		expect(screen.getByText('10/05/2018')).toBeInTheDocument();
	});

	it('deve exibir badge "Revisado" quando revisado é true', () => {
		renderRow(makeChild({ revisado: true }));

		expect(screen.getByText('Revisado')).toBeInTheDocument();
	});

	it('deve exibir badge "Pendente" quando revisado é false', () => {
		renderRow(makeChild({ revisado: false }));

		expect(screen.getByText('Pendente')).toBeInTheDocument();
	});

	it('deve exibir "Nenhum" quando não há alertas', () => {
		renderRow(makeChild());

		expect(screen.getByText('Nenhum')).toBeInTheDocument();
	});

	it('deve exibir "1 alerta" no singular', () => {
		renderRow(
			makeChild({
				saude: {
					ultimaConsulta: null,
					vacinasEmDia: false,
					alertas: ['Vacina atrasada'],
				},
			}),
		);

		expect(screen.getByText('1 alerta')).toBeInTheDocument();
	});

	it('deve exibir contagem no plural quando há múltiplos alertas', () => {
		renderRow(
			makeChild({
				saude: {
					ultimaConsulta: null,
					vacinasEmDia: false,
					alertas: ['A1', 'A2'],
				},
				educacao: { escola: null, frequenciaPercent: null, alertas: ['A3'] },
			}),
		);

		expect(screen.getByText('3 alertas')).toBeInTheDocument();
	});

	it('deve ter link para a página de detalhes da criança', () => {
		renderRow(makeChild({ id: 'abc-123', nome: 'João' }));

		const link = screen.getByRole('link', { name: /ver detalhes de joão/i });
		expect(link).toHaveAttribute('href', '/child/abc-123');
	});
});
