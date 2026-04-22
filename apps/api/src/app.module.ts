import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './infra/auth/auth.module';
import { envSchema } from './infra/env/env';
import { EnvModule } from './infra/env/env.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			validate: (env) => envSchema.parse(env),
			isGlobal: true,
		}),
		AuthModule,
		EnvModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
