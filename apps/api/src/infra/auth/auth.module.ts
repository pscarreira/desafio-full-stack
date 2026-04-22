import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { EnvModule } from '../env/env.module';
import { EnvService } from '../env/env.service';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';

@Module({
	imports: [
		PassportModule,
		JwtModule.registerAsync({
			imports: [EnvModule],
			inject: [EnvService],
			global: true,
			useFactory: (envService: EnvService) => {
				const private_key = envService.get('JWT_PRIVATE_KEY');
				const public_key = envService.get('JWT_PUBLIC_KEY');
				return {
					signOptions: {
						expiresIn: '1d',
						algorithm: 'RS256',
					},
					privateKey: Buffer.from(private_key, 'base64'),
					publicKey: Buffer.from(public_key, 'base64'),
				};
			},
		}),
	],
	providers: [
		{
			provide: APP_GUARD,
			useClass: JwtAuthGuard,
		},
		JwtStrategy,
		EnvService,
	],
})
export class AuthModule {}
