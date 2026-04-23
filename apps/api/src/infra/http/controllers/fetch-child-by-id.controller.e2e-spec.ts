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

describe('FetchChildByIdController (e2e)', () => {
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

	it('deve retornar 200 e a criança quando o id existe', async () => {
		const created = await childModel.create(makeChildDoc({ nome: 'Ana Lima' }));

		const response = await request(app.getHttpServer())
			.get(`/children/${created._id.toString()}`)
			.set('Authorization', `Bearer ${access_token}`);

		expect(response.status).toBe(200);
		expect(response.body.child).toMatchObject({
			id: created._id.toString(),
			nome: 'Ana Lima',
		});
	});

	it('deve retornar 404 quando o id não existe', async () => {
		const response = await request(app.getHttpServer())
			.get(`/children/000000000000000000000000`)
			.set('Authorization', `Bearer ${access_token}`);

		expect(response.status).toBe(404);
	});
});
