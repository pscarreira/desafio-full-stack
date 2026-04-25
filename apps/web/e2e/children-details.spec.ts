import { expect, test } from '@playwright/test';
import { setAuthCookie } from './helpers';

const API_CHILDREN_LIST = 'http://localhost:3001/children**';
const API_CHILD_DETAILS = 'http://localhost:3001/children/child-2';
const API_CHILD_REVIEW = 'http://localhost:3001/children/child-2/review';

const listResponse = {
	children: [
		{
			id: 'child-2',
			nome: 'Pedro Oliveira',
			dataNascimento: '2017-11-03T00:00:00.000Z',
			bairro: 'Complexo do Alemão',
			responsavel: 'José Oliveira',
			revisado: false,
			revisadoPor: null,
			revisadoEm: null,
			saude: { ultimaConsulta: null, vacinasEmDia: false, alertas: ['vacinas_atrasadas'] },
			educacao: { escola: null, frequenciaPercent: null, alertas: ['frequencia_baixa'] },
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
};

const pendingChildResponse = {
	child: {
		id: 'child-2',
		nome: 'Pedro Oliveira',
		dataNascimento: '2017-11-03T00:00:00.000Z',
		bairro: 'Complexo do Alemão',
		responsavel: 'José Oliveira',
		revisado: false,
		revisadoPor: null,
		revisadoEm: null,
		saude: { ultimaConsulta: null, vacinasEmDia: false, alertas: ['vacinas_atrasadas'] },
		educacao: { escola: null, frequenciaPercent: null, alertas: ['frequencia_baixa'] },
		assistenciaSocial: {
			cadUnico: true,
			beneficioAtivo: false,
			alertas: ['cadastro_desatualizado'],
		},
	},
};

const reviewedChildResponse = {
	child: {
		...pendingChildResponse.child,
		revisado: true,
		revisadoPor: 'agente.social',
		revisadoEm: '2026-04-25T12:00:00.000Z',
	},
};

test.describe('Página de Detalhes da Criança', () => {
	test.beforeEach(async ({ page }) => {
		await setAuthCookie(page);
	});

	test('deve navegar da listagem para a página de detalhes e exibir os dados da API', async ({
		page,
	}) => {
		await page.route(API_CHILDREN_LIST, async (route) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify(listResponse),
			});
		});

		await page.route(API_CHILD_DETAILS, async (route) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify(pendingChildResponse),
			});
		});

		await page.goto('/children-list');
		await page.getByRole('link', { name: /ver detalhes de pedro oliveira/i }).click();

		await expect(page).toHaveURL('/children-details/child-2');
		await expect(page.getByRole('heading', { name: 'Detalhes da Criança' })).toBeVisible();
		await expect(page.getByText('Pedro Oliveira')).toBeVisible();
		await expect(page.getByText('Complexo do Alemão')).toBeVisible();
		await expect(page.getByText('Vacinas atrasadas')).toBeVisible();
		await expect(page.getByText('Frequência escolar baixa')).toBeVisible();
		await expect(page.getByText('Cadastro CadÚnico desatualizado')).toBeVisible();
	});

	test('deve marcar a criança como revisada', async ({ page }) => {
		await page.route(API_CHILD_DETAILS, async (route) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify(pendingChildResponse),
			});
		});

		await page.route(API_CHILD_REVIEW, async (route) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify(reviewedChildResponse),
			});
		});

		await page.goto('/children-details/child-2');
		await page.getByRole('button', { name: 'Marcar como revisado' }).click();

		await expect(page.getByRole('button', { name: 'Revisado' })).toBeVisible();
		await expect(page.getByText('agente.social')).toBeVisible();
		await expect(page.getByText('25/04/2026')).toBeVisible();
	});
});