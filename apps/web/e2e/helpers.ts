import { type Page } from '@playwright/test';

export function makeFakeToken(): string {
	const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }));
	return `header.${payload}.signature`;
}

export async function setAuthCookie(page: Page) {
	await page.context().addCookies([
		{
			name: 'auth-token',
			value: makeFakeToken(),
			domain: 'localhost',
			path: '/',
		},
	]);
}
