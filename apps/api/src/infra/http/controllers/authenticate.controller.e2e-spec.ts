import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '@/app.module';

describe('AuthenticateController (e2e)', () => {
	let app: INestApplication;

	beforeAll(async () => {
		const moduleRef = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleRef.createNestApplication();
		await app.init();
	});

	afterAll(async () => {
		await app.close();
	});

	it('deve autenticar um usuário com credenciais válidas', async () => {
		const response = await request(app.getHttpServer())
			.post('/auth/token')
			.send({
				email: 'test@example.com',
				password: 'password123',
			});

		expect(response.status).toBe(201);
		expect(response.body).toHaveProperty('access_token');
		expect(typeof response.body.access_token).toBe('string');
	});

	it('deve retornar 401 com email inválido', async () => {
		const response = await request(app.getHttpServer())
			.post('/auth/token')
			.send({
				email: 'wrong@example.com',
				password: 'password123',
			});

		expect(response.status).toBe(401);
	});

	it('deve retornar 401 com senha inválida', async () => {
		const response = await request(app.getHttpServer())
			.post('/auth/token')
			.send({
				email: 'test@example.com',
				password: 'wrongpassword',
			});

		expect(response.status).toBe(401);
	});
});
