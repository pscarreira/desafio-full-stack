import { ConfigService } from '@nestjs/config';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Env } from './env';
import { EnvService } from './env.service';

describe('EnvService', () => {
	let envService: EnvService;
	let configService: ConfigService<Env, true>;

	beforeEach(() => {
		configService = {
			get: vi.fn(),
		} as unknown as ConfigService<Env, true>;

		envService = new EnvService(configService);
	});

	it('deve retornar o valor correto para uma chave existente', () => {
		vi.mocked(configService.get).mockReturnValue(3001);

		const result = envService.get('PORT');

		expect(configService.get).toHaveBeenCalledWith('PORT', { infer: true });
		expect(result).toBe(3001);
	});

	it('deve delegar ao ConfigService para JWT_PUBLIC_KEY', () => {
		const fakeKey = 'c2VjcmV0';
		vi.mocked(configService.get).mockReturnValue(fakeKey);

		const result = envService.get('JWT_PUBLIC_KEY');

		expect(configService.get).toHaveBeenCalledWith('JWT_PUBLIC_KEY', {
			infer: true,
		});
		expect(result).toBe(fakeKey);
	});
});
