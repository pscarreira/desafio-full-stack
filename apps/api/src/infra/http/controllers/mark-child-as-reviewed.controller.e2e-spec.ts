import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import { Model } from 'mongoose';
import request from 'supertest';
import { makeChildDoc } from 'test/factories/make-child-doc';
import { AppModule } from '@/app.module';
import {
	ChildDocument,
	ChildModel,
} from '@/infra/database/schemas/child.schema';
import { EnvService } from '@/infra/env/env.service';

describe('MarkChildAsReviewedController (e2e)', () => {
	let app: INestApplication;
	let childModel: Model<ChildDocument>;
	let jwt: JwtService;
	let envService: EnvService;
	let access_token: string;
	let username_revisor: string;

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
		username_revisor = envService.get('TEST_USER');
	});

	afterAll(async () => {
		await app.close();
	});

	beforeEach(async () => {
		await childModel.deleteMany({});
	});

	it('deve retornar 200 e a criança marcada como revisada', async () => {
		const created = await childModel.create(makeChildDoc({ revisado: false }));

		const response = await request(app.getHttpServer())
			.patch(`/children/${created._id.toString()}/review`)
			.set('Authorization', `Bearer ${access_token}`);

		expect(response.status).toBe(200);

		const updated = await childModel.findById(created._id).lean();
		expect(updated?.revisado).toBe(true);
		expect(updated?.revisadoPor).toBe(username_revisor);
		expect(updated?.revisadoEm).toBeInstanceOf(Date);
	});

	it('deve retornar 404 quando o id não existe', async () => {
		const response = await request(app.getHttpServer())
			.patch('/children/000000000000000000000000/review')
			.set('Authorization', `Bearer ${access_token}`);

		expect(response.status).toBe(404);
	});

	it('não deve alterar os dados se a criança já está revisada', async () => {
		const revisadoEm = new Date('2024-01-01');
		const created = await childModel.create(
			makeChildDoc({
				revisado: true,
				revisadoPor: 'outro@prefeitura.rio',
				revisadoEm,
			}),
		);

		await request(app.getHttpServer())
			.patch(`/children/${created._id.toString()}/review`)
			.set('Authorization', `Bearer ${access_token}`);

		const updated = await childModel.findById(created._id).lean();
		expect(updated?.revisadoPor).toBe('outro@prefeitura.rio');
		expect(updated?.revisadoEm).toEqual(revisadoEm);
	});
});
