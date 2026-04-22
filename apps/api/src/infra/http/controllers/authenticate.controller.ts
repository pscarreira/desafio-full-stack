import {
	BadRequestException,
	Body,
	Controller,
	HttpCode,
	Post,
	UnauthorizedException,
	UsePipes,
} from '@nestjs/common';
import { z } from 'zod';
import { WrongCredentialsError } from '@/core/errors/errors/wrong-credentials-error';
import { AuthenticateUserUseCase } from '@/domain/application/use-cases/authenticate-user';
import { Public } from '@/infra/auth/public';
import { EnvService } from '@/infra/env/env.service';
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';

const authenticateBodySchema = z.object({
	email: z.email(),
	password: z.string(),
});

type AuthenticateBodySchema = z.infer<typeof authenticateBodySchema>;

@Controller('/auth/token')
@Public()
export class AuthenticateController {
	constructor(
		private authenticateUserUseCase: AuthenticateUserUseCase,
		private envService: EnvService,
	) {}

	@Post()
	@HttpCode(201)
	@UsePipes(new ZodValidationPipe(authenticateBodySchema))
	async handle(@Body() body: AuthenticateBodySchema) {
		const { email, password } = body;
		const result = await this.authenticateUserUseCase.execute({
			email,
			password,
			testUser: this.envService.get('TEST_USER'),
			testUserPassword: this.envService.get('TEST_USER_PASSWORD_HASH'),
		});

		if (result.isLeft()) {
			const error = result.value;
			switch (error.constructor) {
				case WrongCredentialsError: {
					throw new UnauthorizedException(error.message);
				}
				default: {
					throw new BadRequestException(error.message);
				}
			}
		}

		const { accessToken } = result.value;

		return {
			access_token: accessToken,
		};
	}
}
