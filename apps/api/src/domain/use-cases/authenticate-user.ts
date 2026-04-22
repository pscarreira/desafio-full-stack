import { Injectable } from '@nestjs/common';
import { type Either, left, right } from '@/core/either';
import { WrongCredentialsError } from '@/core/errors/errors/wrong-credentials-error';
import { Encrypter } from '../application/cryptography/encrypter';
import { HashComparer } from '../application/cryptography/hash-comparer';

interface AuthenticateUserUseCaseRequest {
	email: string;
	password: string;
	testUser: string;
	testUserPassword: string;
}

type AuthenticateUserUseCaseResponse = Either<
	WrongCredentialsError,
	{ accessToken: string }
>;

@Injectable()
export class AuthenticateUserUseCase {
	constructor(
		private hashComparer: HashComparer,
		private encrypter: Encrypter,
	) {}

	async execute({
		email,
		password,
		testUser,
		testUserPassword,
	}: AuthenticateUserUseCaseRequest): Promise<AuthenticateUserUseCaseResponse> {
		if (email !== testUser) {
			return left(new WrongCredentialsError());
		}

		const passwordMatch = await this.hashComparer.compare(
			password,
			testUserPassword,
		);

		if (!passwordMatch) {
			return left(new WrongCredentialsError());
		}

		const accessToken = await this.encrypter.encrypt({ sub: email });

		return right({ accessToken });
	}
}
