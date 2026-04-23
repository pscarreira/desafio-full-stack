import { describe, expect, it } from 'vitest';
import { envSchema } from './env';

describe('envSchema', () => {
	const validBase64 = Buffer.from('secret').toString('base64');

	const validEnv = {
		JWT_PRIVATE_KEY: validBase64,
		JWT_PUBLIC_KEY: validBase64,
		TEST_USER: 'teste@teste.com',
		TEST_USER_PASSWORD_HASH: 'hashed-password',
		MONGO_URI: 'mongodb://localhost:27017/testdb',
	};

	it('deve validar variáveis válidas', () => {
		const result = envSchema.safeParse(validEnv);
		expect(result.success).toBe(true);
	});

	it('deve usar o valor padrão 3001 para PORT quando não fornecido', () => {
		const result = envSchema.safeParse(validEnv);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.PORT).toBe(3001);
		}
	});

	it('deve converter PORT de string para número', () => {
		const result = envSchema.safeParse({ ...validEnv, PORT: '4000' });
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.PORT).toBe(4000);
		}
	});

	it('deve falhar quando JWT_PRIVATE_KEY está ausente', () => {
		const result = envSchema.safeParse({ JWT_PUBLIC_KEY: validBase64 });
		expect(result.success).toBe(false);
	});

	it('deve falhar quando JWT_PUBLIC_KEY está ausente', () => {
		const result = envSchema.safeParse({ JWT_PRIVATE_KEY: validBase64 });
		expect(result.success).toBe(false);
	});

	it('deve falhar quando JWT_PRIVATE_KEY não é base64 válido', () => {
		const result = envSchema.safeParse({
			...validEnv,
			JWT_PRIVATE_KEY: 'não é base64!!',
		});
		expect(result.success).toBe(false);
	});
});
