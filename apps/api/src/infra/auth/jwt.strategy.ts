import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { z } from 'zod';
import { EnvService } from '../env/env.service';

const tokenSchema = z.object({
	sub: z.uuid(),
	preferred_username: z.email(),
});

export type UserPayload = z.infer<typeof tokenSchema>;

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(env: EnvService) {
		const publicKey = env.get('JWT_PUBLIC_KEY');
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: Buffer.from(publicKey, 'base64'),
			algorithms: ['RS256'],
		});
	}

	async validate(payload: UserPayload) {
		try {
			return tokenSchema.parse(payload);
		} catch (_error) {
			throw new UnauthorizedException('Unauthorized');
		}
	}
}
