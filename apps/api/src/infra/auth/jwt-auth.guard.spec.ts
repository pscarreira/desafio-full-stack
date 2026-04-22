import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { JwtAuthGuard } from './jwt-auth.guard';
import { IS_PUBLIC_KEY } from './public';

function makeContext(handler = () => {}, cls = class {}): ExecutionContext {
	return {
		getHandler: () => handler,
		getClass: () => cls,
		switchToHttp: vi.fn(),
	} as unknown as ExecutionContext;
}

describe('JwtAuthGuard', () => {
	let reflector: Reflector;
	let guard: JwtAuthGuard;

	beforeEach(() => {
		reflector = { getAllAndOverride: vi.fn() } as unknown as Reflector;
		guard = new JwtAuthGuard(reflector);
	});

	it('deve retornar true para rotas marcadas como públicas', () => {
		vi.mocked(reflector.getAllAndOverride).mockReturnValue(true);

		const context = makeContext();
		const result = guard.canActivate(context);

		expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
			expect.any(Function),
			expect.any(Function),
		]);
		expect(result).toBe(true);
	});

	it('deve delegar ao AuthGuard para rotas privadas', () => {
		vi.mocked(reflector.getAllAndOverride).mockReturnValue(false);

		const superCanActivate = vi
			.spyOn(Object.getPrototypeOf(JwtAuthGuard.prototype), 'canActivate')
			.mockReturnValue(true);

		const context = makeContext();
		const result = guard.canActivate(context);

		expect(superCanActivate).toHaveBeenCalledWith(context);
		expect(result).toBe(true);

		superCanActivate.mockRestore();
	});
});
