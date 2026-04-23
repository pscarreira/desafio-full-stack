import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import { Model } from 'mongoose';
import request from 'supertest';
import { makeChildDoc } from 'test/factories/make-child-doc';
import { AppModule } from '@/app.module';
import { AlertaEducacao } from '@/core/enums/alerta-educacao';
import { AlertaSaude } from '@/core/enums/alerta-saude';
import {
	ChildDocument,
	ChildModel,
} from '@/infra/database/schemas/child.schema';
import { EnvService } from '@/infra/env/env.service';

describe('FetchSummaryController (e2e)', () => {
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

	it('deve retornar 200 e summary com zeros quando não há crianças', async () => {
		const response = await request(app.getHttpServer())
			.get('/summary')
			.set('Authorization', `Bearer ${access_token}`);

		expect(response.status).toBe(200);
		expect(response.body.summary).toEqual({
			totalChildren: 0,
			reviewed: 0,
			alertsByArea: { saude: 0, educacao: 0, assistenciaSocial: 0 },
			percentageWithAlertsByArea: {
				saude: 0,
				educacao: 0,
				assistenciaSocial: 0,
			},
		});
	});

	it('deve retornar total e revisadas corretamente', async () => {
		await childModel.create([
			makeChildDoc({ revisado: true }),
			makeChildDoc({ revisado: true }),
			makeChildDoc({ revisado: false }),
		]);

		const response = await request(app.getHttpServer())
			.get('/summary')
			.set('Authorization', `Bearer ${access_token}`);

		expect(response.status).toBe(200);
		expect(response.body.summary.totalChildren).toBe(3);
		expect(response.body.summary.reviewed).toBe(2);
	});

	it('deve contar alertas por área corretamente', async () => {
		await childModel.create([
			makeChildDoc({
				saude: {
					ultimaConsulta: null,
					vacinasEmDia: false,
					alertas: [AlertaSaude.VacinasAtrasadas],
				},
			}),
			makeChildDoc({
				educacao: {
					escola: 'Escola A',
					frequenciaPercent: 50,
					alertas: [AlertaEducacao.FrequenciaBaixa],
				},
			}),
			makeChildDoc(),
		]);

		const response = await request(app.getHttpServer())
			.get('/summary')
			.set('Authorization', `Bearer ${access_token}`);

		expect(response.status).toBe(200);
		expect(response.body.summary.alertsByArea.saude).toBe(1);
		expect(response.body.summary.alertsByArea.educacao).toBe(1);
		expect(response.body.summary.alertsByArea.assistenciaSocial).toBe(0);
	});

	it('deve calcular percentuais por área corretamente', async () => {
		await childModel.create([
			makeChildDoc({
				saude: {
					ultimaConsulta: null,
					vacinasEmDia: false,
					alertas: [AlertaSaude.ConsultaAtrasada],
				},
			}),
			makeChildDoc({
				saude: {
					ultimaConsulta: null,
					vacinasEmDia: false,
					alertas: [AlertaSaude.VacinasAtrasadas],
				},
			}),
			makeChildDoc(),
			makeChildDoc(),
		]);

		const response = await request(app.getHttpServer())
			.get('/summary')
			.set('Authorization', `Bearer ${access_token}`);

		expect(response.status).toBe(200);
		expect(response.body.summary.percentageWithAlertsByArea.saude).toBe(50);
		expect(response.body.summary.percentageWithAlertsByArea.educacao).toBe(0);
	});
});
