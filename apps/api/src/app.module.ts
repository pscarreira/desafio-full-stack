import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './infra/auth/auth.module';
import { DatabaseModule } from './infra/database/database.module';
import { envSchema } from './infra/env/env';
import { EnvModule } from './infra/env/env.module';
import { EnvService } from './infra/env/env.service';
import { HttpModule } from './infra/http/http.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			validate: (env) => envSchema.parse(env),
			isGlobal: true,
		}),
		AuthModule,
		EnvModule,
		HttpModule,
		MongooseModule.forRootAsync({
			imports: [EnvModule],
			inject: [EnvService],
			useFactory: (envService: EnvService) => ({
				uri: envService.get('MONGO_URI'),
			}),
		}),
		DatabaseModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
