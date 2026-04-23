import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import { Model } from 'mongoose';
import request from 'supertest';
import { makeChildDoc } from 'test/factories/make-child-doc';
import { AppModule } from '@/app.module';
import { AlertaSaude } from '@/core/enums/alerta-saude';
import {
	ChildDocument,
	ChildModel,
} from '@/infra/database/schemas/child.schema';
import { EnvService } from '@/infra/env/env.service';

describe('ListChildrenController (e2e)', () => {
	let app: INestApplication;
	let childModel: Model<ChildDocument>;
	let jwt: JwtService;
	let envService: EnvService;
	let access_token: string;

	beforeAll(async () => {
		const moduleRef = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleRef.createNestApplication();
		await app.init();

		childModel = moduleRef.get<Model<ChildDocument>>(
			getModelToken(ChildModel.name),
		);
		jwt = moduleRef.get<JwtService>(JwtService);
		envService = moduleRef.get<EnvService>(EnvService);
		access_token = jwt.sign({
			sub: randomUUID(),
			preferred_username: envService.get('TEST_USER'),
		});
	});

	afterAll(async () => {
		await app.close();
	});

	beforeEach(async () => {
		await childModel.deleteMany({});
	});

	it('deve retornar 200 e todas as crianças sem filtros', async () => {
		await childModel.create([makeChildDoc(), makeChildDoc(), makeChildDoc()]);

		const response = await request(app.getHttpServer())
			.get('/children')
			.set('Authorization', `Bearer ${access_token}`);

		expect(response.status).toBe(200);
		expect(response.body.children).toHaveLength(3);
	});

	it('deve filtrar por bairro', async () => {
		await childModel.create([
			makeChildDoc({ bairro: 'Rocinha' }),
			makeChildDoc({ bairro: 'Maré' }),
			makeChildDoc({ bairro: 'Rocinha' }),
		]);

		const response = await request(app.getHttpServer())
			.get('/children?bairro=Rocinha')
			.set('Authorization', `Bearer ${access_token}`);

		expect(response.status).toBe(200);
		expect(response.body.children).toHaveLength(2);
	});

	it('deve filtrar por revisado=false', async () => {
		await childModel.create([
			makeChildDoc({ revisado: true }),
			makeChildDoc({ revisado: false }),
			makeChildDoc({ revisado: false }),
		]);

		const response = await request(app.getHttpServer())
			.get('/children?revisado=false')
			.set('Authorization', `Bearer ${access_token}`);

		expect(response.status).toBe(200);
		expect(response.body.children).toHaveLength(2);
	});

	it('deve filtrar crianças com alertas', async () => {
		await childModel.create([
			makeChildDoc({
				saude: {
					ultimaConsulta: null,
					vacinasEmDia: false,
					alertas: [AlertaSaude.VacinasAtrasadas],
				},
			}),
			makeChildDoc(),
			makeChildDoc({
				saude: {
					ultimaConsulta: null,
					vacinasEmDia: false,
					alertas: [AlertaSaude.ConsultaAtrasada],
				},
			}),
		]);

		const response = await request(app.getHttpServer())
			.get('/children?comAlertas=true')
			.set('Authorization', `Bearer ${access_token}`);

		expect(response.status).toBe(200);
		expect(response.body.children).toHaveLength(2);
	});

	it('deve paginar os resultados', async () => {
		await childModel.create(Array.from({ length: 25 }, () => makeChildDoc()));

		const response = await request(app.getHttpServer())
			.get('/children?page=2&perPage=20')
			.set('Authorization', `Bearer ${access_token}`);

		expect(response.status).toBe(200);
		expect(response.body.children).toHaveLength(5);
		expect(response.body.meta.currentPage).toBe(2);
	});

	it('deve retornar meta correta', async () => {
		await childModel.create([makeChildDoc(), makeChildDoc()]);

		const response = await request(app.getHttpServer())
			.get('/children?perPage=10')
			.set('Authorization', `Bearer ${access_token}`);

		expect(response.status).toBe(200);
		expect(response.body.meta).toEqual({
			totalItems: 2,
			itemCount: 2,
			itemsPerPage: 10,
			totalPages: 1,
			currentPage: 1,
		});
	});

	it('deve retornar 400 com query string desconhecida', async () => {
		const response = await request(app.getHttpServer())
			.get('/children?foo=bar')
			.set('Authorization', `Bearer ${access_token}`);

		expect(response.status).toBe(400);
	});

	describe('filtros combinados', () => {
		const comAlerta = {
			saude: {
				ultimaConsulta: null,
				vacinasEmDia: false,
				alertas: [AlertaSaude.VacinasAtrasadas],
			},
		};

		it('deve filtrar por bairro + comAlertas', async () => {
			await childModel.create([
				makeChildDoc({ bairro: 'Rocinha', ...comAlerta }),
				makeChildDoc({ bairro: 'Rocinha' }),
				makeChildDoc({ bairro: 'Maré', ...comAlerta }),
				makeChildDoc({ bairro: 'Maré' }),
			]);

			const response = await request(app.getHttpServer())
				.get('/children?bairro=Rocinha&comAlertas=true')
				.set('Authorization', `Bearer ${access_token}`);

			expect(response.status).toBe(200);
			expect(response.body.children).toHaveLength(1);
			expect(response.body.children[0].bairro).toBe('Rocinha');
		});

		it('deve filtrar por bairro + revisado', async () => {
			await childModel.create([
				makeChildDoc({ bairro: 'Rocinha', revisado: true }),
				makeChildDoc({ bairro: 'Rocinha', revisado: false }),
				makeChildDoc({ bairro: 'Maré', revisado: true }),
			]);

			const response = await request(app.getHttpServer())
				.get('/children?bairro=Rocinha&revisado=true')
				.set('Authorization', `Bearer ${access_token}`);

			expect(response.status).toBe(200);
			expect(response.body.children).toHaveLength(1);
		});

		it('deve filtrar por revisado + comAlertas', async () => {
			await childModel.create([
				makeChildDoc({ revisado: true, ...comAlerta }),
				makeChildDoc({ revisado: true }),
				makeChildDoc({ revisado: false, ...comAlerta }),
			]);

			const response = await request(app.getHttpServer())
				.get('/children?revisado=true&comAlertas=true')
				.set('Authorization', `Bearer ${access_token}`);

			expect(response.status).toBe(200);
			expect(response.body.children).toHaveLength(1);
		});

		it('deve filtrar por bairro + revisado + comAlertas', async () => {
			await childModel.create([
				makeChildDoc({ bairro: 'Rocinha', revisado: true, ...comAlerta }),
				makeChildDoc({ bairro: 'Rocinha', revisado: false, ...comAlerta }),
				makeChildDoc({ bairro: 'Rocinha', revisado: true }),
				makeChildDoc({ bairro: 'Maré', revisado: true, ...comAlerta }),
			]);

			const response = await request(app.getHttpServer())
				.get('/children?bairro=Rocinha&revisado=true&comAlertas=true')
				.set('Authorization', `Bearer ${access_token}`);

			expect(response.status).toBe(200);
			expect(response.body.children).toHaveLength(1);
		});

		it('deve retornar vazio quando nenhuma criança satisfaz todos os filtros', async () => {
			await childModel.create([
				makeChildDoc({ bairro: 'Rocinha', revisado: false }),
				makeChildDoc({ bairro: 'Maré', revisado: true }),
			]);

			const response = await request(app.getHttpServer())
				.get('/children?bairro=Rocinha&revisado=true')
				.set('Authorization', `Bearer ${access_token}`);

			expect(response.status).toBe(200);
			expect(response.body.children).toHaveLength(0);
		});
	});
});
