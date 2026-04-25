import { expect, test } from '@playwright/test';
import { setAuthCookie } from './helpers';

const mockChildren = {
	children: [
		{
			id: 'child-1',
			nome: 'Ana Beatriz',
			dataNascimento: '2016-08-15T00:00:00.000Z',
			bairro: 'Rocinha',
			responsavel: 'Carla Lima',
			revisado: true,
			revisadoPor: null,
			revisadoEm: null,
			saude: { ultimaConsulta: null, vacinasEmDia: true, alertas: [] },
			educacao: null,
			assistenciaSocial: null,
		},
		{
			id: 'child-2',
			nome: 'Pedro Oliveira',
			dataNascimento: '2017-11-03T00:00:00.000Z',
			bairro: 'Complexo do Alemão',
			responsavel: 'José Oliveira',
			revisado: false,
			revisadoPor: null,
			revisadoEm: null,
			saude: { ultimaConsulta: null, vacinasEmDia: false, alertas: ['Vacina atrasada'] },
			educacao: { escola: null, frequenciaPercent: null, alertas: ['Baixa frequência'] },
			assistenciaSocial: null,
		},
	],
	meta: {
		totalItems: 2,
		itemCount: 2,
		itemsPerPage: 10,
		totalPages: 1,
		currentPage: 1,
	},
};

const emptyResponse = {
	children: [],
	meta: {
		totalItems: 0,
		itemCount: 0,
		itemsPerPage: 10,
		totalPages: 1,
		currentPage: 1,
	},
};

const API_CHILDREN = 'http://localhost:3001/children**';

test.describe('Página de Listagem de Crianças', () => {
	test.beforeEach(async ({ page }) => {
		await setAuthCookie(page);

		await page.route(API_CHILDREN, async (route) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify(mockChildren),
			});
		});

		const responsePromise = page.waitForResponse(API_CHILDREN);
		await page.goto('/children-list');
		await responsePromise;
	});

	test('deve exibir o título da página', async ({ page }) => {
		await expect(page.getByRole('heading', { name: 'Listagem de Crianças' })).toBeVisible();
	});

	test('deve exibir os campos de filtro', async ({ page }) => {
		await expect(page.getByLabel('Bairro')).toBeVisible();
		await expect(page.getByLabel('Revisado')).toBeVisible();
		await expect(page.getByLabel('Com Alertas')).toBeVisible();
	});

	test('deve exibir os cabeçalhos da tabela', async ({ page }) => {
		await expect(page.getByRole('columnheader', { name: 'Nome' })).toBeVisible();
		await expect(page.getByRole('columnheader', { name: 'Bairro' })).toBeVisible();
		await expect(page.getByRole('columnheader', { name: 'Nascimento' })).toBeVisible();
		await expect(page.getByRole('columnheader', { name: 'Status' })).toBeVisible();
		await expect(page.getByRole('columnheader', { name: 'Alertas' })).toBeVisible();
	});

	test('deve exibir a lista de crianças com dados da API', async ({ page }) => {
		await expect(page.getByText('Ana Beatriz')).toBeVisible();
		await expect(page.getByText('Pedro Oliveira')).toBeVisible();
		await expect(page.getByText('Rocinha')).toBeVisible();
		await expect(page.getByText('Complexo do Alemão')).toBeVisible();
	});

	test('deve exibir badge "Revisado" e "Pendente" corretamente', async ({ page }) => {
		await expect(page.locator('[data-slot="badge"]', { hasText: 'Revisado' })).toBeVisible();
		await expect(page.locator('[data-slot="badge"]', { hasText: 'Pendente' })).toBeVisible();
	});

	test('deve exibir contagem de alertas', async ({ page }) => {
		await expect(page.getByText('2 alertas')).toBeVisible();
		await expect(page.getByText('Nenhum')).toBeVisible();
	});

	test('deve exibir total de registros encontrados', async ({ page }) => {
		await expect(page.getByText('2 registros encontrados')).toBeVisible();
	});

	test('deve exibir mensagem de nenhum resultado quando lista está vazia', async ({ page }) => {
		await page.route(API_CHILDREN, async (route) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify(emptyResponse),
			});
		});

		const responsePromise = page.waitForResponse(API_CHILDREN);
		await page.goto('/children-list');
		await responsePromise;

		await expect(
			page.getByText('Nenhuma criança encontrada com os filtros aplicados.'),
		).toBeVisible();
	});

	test('deve exibir mensagem de erro quando a API falha', async ({ page }) => {
		await page.route(API_CHILDREN, async (route) => {
			await route.fulfill({
				status: 500,
				contentType: 'application/json',
				body: JSON.stringify({ message: 'Internal Server Error' }),
			});
		});

		const responsePromise = page.waitForResponse(API_CHILDREN);
		await page.goto('/children-list');
		await responsePromise;

		await expect(page.getByText('Erro ao carregar os dados')).toBeVisible();
	});

	test('não autenticado deve ser redirecionado ao acessar /children-list', async ({ page }) => {
		const context = await page.context().browser()!.newContext();
		const cleanPage = await context.newPage();

		await cleanPage.goto('/children-list');

		await expect(cleanPage).toHaveURL('/unauthorized');
		await context.close();
	});

	test('deve chamar a API com filtro de bairro ao digitar', async ({ page }) => {
		const requests: string[] = [];

		await page.route(API_CHILDREN, async (route) => {
			requests.push(route.request().url());
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify(emptyResponse),
			});
		});

		await page.getByLabel('Bairro').fill('Centro');

		await page.waitForTimeout(500); // aguarda debounce de 400ms

		const lastRequest = requests[requests.length - 1];
		expect(lastRequest).toContain('bairro=Centro');
	});

	test('deve exibir controles de paginação', async ({ page }) => {
		await expect(page.getByRole('button', { name: 'Página anterior' })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Próxima página' })).toBeVisible();
		await expect(page.getByText('Página 1 de 1')).toBeVisible();
	});
});
