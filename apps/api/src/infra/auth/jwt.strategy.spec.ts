import { describe, expect, it, vi } from 'vitest';
import { EnvService } from '../env/env.service';
import { JwtStrategy, UserPayload } from './jwt.strategy';

const fakePrivateKey = Buffer.from('fake-private-key').toString('base64');
const fakePublicKey = Buffer.from('fake-public-key').toString('base64');

function makeStrategy() {
	const envService = {
		get: vi.fn((key: string) => {
			if (key === 'JWT_PUBLIC_KEY') return fakePublicKey;
			if (key === 'JWT_PRIVATE_KEY') return fakePrivateKey;
		}),
	} as unknown as EnvService;

	return new JwtStrategy(envService);
}

describe('JwtStrategy', () => {
	describe('validate()', () => {
		it('deve retornar o payload quando válido', async () => {
			const strategy = makeStrategy();
			const payload = {
				sub: '00000000-0000-4000-8000-000000000000',
				preferred_username: 'user@example.com',
			};

			const result = await strategy.validate(payload);

			expect(result).toEqual(payload);
		});

		it('deve lançar erro quando sub não é um UUID', async () => {
			const strategy = makeStrategy();
			const payload = {
				sub: 'not-a-uuid',
				preferred_username: 'user@example.com',
			};

			await expect(strategy.validate(payload)).rejects.toThrow();
		});

		it('deve lançar erro quando preferred_username não é um e-mail', async () => {
			const strategy = makeStrategy();
			const payload = {
				sub: '00000000-0000-4000-8000-000000000000',
				preferred_username: 'not-an-email',
			};

			await expect(strategy.validate(payload)).rejects.toThrow();
		});

		it('deve lançar erro quando o payload está vazio', async () => {
			const strategy = makeStrategy();

			await expect(strategy.validate({} as UserPayload)).rejects.toThrow();
		});
	});
});
