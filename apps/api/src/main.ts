import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

const DEV_ORIGINS = ['http://localhost:3000', 'http://127.0.0.1:3000'];

const corsOptions: CorsOptions = {
	origin:
		process.env.NODE_ENV === 'production'
			? process.env.CORS_ORIGIN?.split(',')
			: DEV_ORIGINS,
	credentials: true,
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
	allowedHeaders: ['Content-Type', 'Authorization'],
};

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.enableCors(corsOptions);
	await app.listen(process.env.PORT ?? 3001);
}

bootstrap();
