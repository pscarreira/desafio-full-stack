import { expect, test } from '@playwright/test';

function makeFakeToken(): string {
	const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }));
	return `header.${payload}.signature`;
}

test.describe('Página de Login', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/login');
	});

	test('deve exibir o formulário de login', async ({ page }) => {
		await expect(page.getByLabel('Email')).toBeVisible();
		await expect(page.getByLabel('Senha')).toBeVisible();
		await expect(page.getByRole('button', { name: /entrar/i })).toBeVisible();
	});

	test('deve exibir erro quando email está vazio', async ({ page }) => {
		await page.getByRole('button', { name: /entrar/i }).click();

		await expect(page.getByText('O e-mail é obrigatório')).toBeVisible();
	});

	test('deve exibir erro quando email é inválido', async ({ page }) => {
		await page.getByLabel('Email').fill('email-invalido');
		await page.getByRole('button', { name: /entrar/i }).click();

		await expect(page.getByText('Digite um e-mail válido')).toBeVisible();
	});

	test('deve exibir erro quando senha está vazia', async ({ page }) => {
		await page.getByLabel('Email').fill('user@example.com');
		await page.getByRole('button', { name: /entrar/i }).click();

		await expect(page.getByText('A senha é obrigatória')).toBeVisible();
	});

	test('deve redirecionar para /dashboard após login bem-sucedido', async ({ page }) => {
		await page.route('**/auth/token', async (route) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({ access_token: makeFakeToken() }),
			});
		});

		await page.getByLabel('Email').fill('user@example.com');
		await page.getByLabel('Senha').fill('senha123');
		await page.getByRole('button', { name: /entrar/i }).click();

		await expect(page).toHaveURL('/dashboard');
	});

	test('deve exibir mensagem de credenciais inválidas', async ({ page }) => {
		await page.route('**/auth/token', async (route) => {
			await route.fulfill({
				status: 401,
				contentType: 'application/json',
				body: JSON.stringify({ message: 'Credentials are not valid' }),
			});
		});

		await page.getByLabel('Email').fill('user@example.com');
		await page.getByLabel('Senha').fill('senha-errada');
		await page.getByRole('button', { name: /entrar/i }).click();

		await expect(page.getByText('Seu email ou senha estão incorretos.')).toBeVisible();
	});

	test('deve exibir mensagem genérica para erros desconhecidos', async ({ page }) => {
		await page.route('**/auth/token', async (route) => {
			await route.fulfill({
				status: 500,
				contentType: 'application/json',
				body: JSON.stringify({ message: 'Internal Server Error' }),
			});
		});

		await page.getByLabel('Email').fill('user@example.com');
		await page.getByLabel('Senha').fill('senha123');
		await page.getByRole('button', { name: /entrar/i }).click();

		await expect(page.getByText('Erro ao fazer login. Tente novamente.')).toBeVisible();
	});

	test('deve desabilitar o botão durante o submit', async ({ page }) => {
		// Intercepta e atrasa a resposta para capturar o estado de loading
		await page.route('**/auth/token', async (route) => {
			await new Promise((resolve) => setTimeout(resolve, 500));
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({ access_token: makeFakeToken() }),
			});
		});

		await page.getByLabel('Email').fill('user@example.com');
		await page.getByLabel('Senha').fill('senha123');
		await page.getByRole('button', { name: /entrar/i }).click();

		await expect(page.getByRole('button', { name: /entrando/i })).toBeDisabled();
	});

	test('não autenticado deve ser redirecionado ao acessar /dashboard', async ({ page }) => {
		await page.goto('/dashboard');

		await expect(page).toHaveURL('/unauthorized');
	});

	test('autenticado deve ser redirecionado ao acessar /login', async ({ page }) => {
		await page.context().addCookies([
			{
				name: 'auth-token',
				value: makeFakeToken(),
				domain: 'localhost',
				path: '/',
			},
		]);

		await page.goto('/login');

		await expect(page).toHaveURL('/dashboard');
	});
});
