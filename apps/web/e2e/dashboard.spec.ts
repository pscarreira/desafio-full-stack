import { expect, test } from '@playwright/test';
import { setAuthCookie } from './helpers';

const mockSummary = {
	summary: {
		totalChildren: 50,
		reviewed: 30,
		alertsByArea: { saude: 10, educacao: 8, assistenciaSocial: 5 },
		percentageWithAlertsByArea: { saude: 20, educacao: 16, assistenciaSocial: 10 },
	},
};

test.describe('Página de Dashboard', () => {
	test.beforeEach(async ({ page }) => {
		await setAuthCookie(page);

		await page.route('**/summary', async (route) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify(mockSummary),
			});
		});

		await page.goto('/dashboard');
	});

	test('deve exibir os cards de resumo com dados', async ({ page }) => {
		await expect(page.getByText('Total de Crianças')).toBeVisible();
		await expect(page.getByText('50')).toBeVisible();

		await expect(page.getByText('Revisadas', { exact: true })).toBeVisible();
		await expect(page.getByText('30')).toBeVisible();
	});

	test('deve exibir os cards de alertas por área', async ({ page }) => {
		await expect(page.getByText('Alertas de Saúde')).toBeVisible();
		await expect(page.getByText('10', { exact: true })).toBeVisible();

		await expect(page.getByText('Alertas de Educação')).toBeVisible();
		await expect(page.getByText('8', { exact: true })).toBeVisible();

		await expect(page.getByText('Alertas de Assistência Social')).toBeVisible();
		await expect(page.getByText('5', { exact: true })).toBeVisible();
	});

	test('deve exibir os gráficos', async ({ page }) => {
		await expect(page.getByText('Alertas por Área')).toBeVisible();
		await expect(page.getByText('Revisadas vs Pendentes')).toBeVisible();

		await expect(page.locator('.recharts-bar-rectangle').first()).toBeVisible();
		await expect(page.locator('.recharts-sector').first()).toBeVisible();
	});

	test('deve exibir mensagem de erro quando a API falha', async ({ page }) => {
		// Sobrescreve a rota para retornar erro
		await page.route('**/summary', async (route) => {
			await route.fulfill({
				status: 500,
				contentType: 'application/json',
				body: JSON.stringify({ message: 'Internal Server Error' }),
			});
		});

		await page.goto('/dashboard');

		await expect(
			page.getByText('Erro ao carregar os dados. Tente novamente.'),
		).toBeVisible();
	});

	test('não autenticado deve ser redirecionado ao acessar /dashboard', async ({ page }) => {
		// Abre contexto limpo sem cookie
		const context = await page.context().browser()!.newContext();
		const cleanPage = await context.newPage();

		await cleanPage.goto('/dashboard');

		await expect(cleanPage).toHaveURL('/unauthorized');
		await context.close();
	});

	test('deve exibir o menu de navegação', async ({ page }) => {
		await expect(page.getByRole('navigation')).toBeVisible();
	});
});
