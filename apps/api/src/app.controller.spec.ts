import { Test } from '@nestjs/testing';
import { describe, expect, it } from 'vitest';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
	let appController: AppController;

	beforeEach(async () => {
		const module = await Test.createTestingModule({
			controllers: [AppController],
			providers: [AppService],
		}).compile();

		appController = module.get(AppController);
	});

	it('deve retornar "Hello World!"', () => {
		expect(appController.getHello()).toBe('Hello World!');
	});
});
