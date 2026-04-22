import { ExecutionContext } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import type { UserPayload } from './jwt.strategy';

function makeContext(user: unknown): ExecutionContext {
	return {
		switchToHttp: () => ({
			getRequest: () => ({ user }),
		}),
	} as ExecutionContext;
}

describe('CurrentUser decorator', () => {
	it('deve retornar o user do request', () => {
		const user: UserPayload = {
			sub: '00000000-0000-4000-8000-000000000000',
			preferred_username: 'user@example.com',
		};

		const context = makeContext(user);
		const request = context.switchToHttp().getRequest();

		expect(request.user).toEqual(user);
	});

	it('deve retornar undefined quando não há usuário autenticado', () => {
		const context = makeContext(undefined);
		const request = context.switchToHttp().getRequest();

		expect(request.user).toBeUndefined();
	});
});
