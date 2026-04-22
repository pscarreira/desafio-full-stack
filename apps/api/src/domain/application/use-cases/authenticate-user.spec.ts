import { FakeEncrypter } from 'test/cryptography/fake-encrypter';
import { FakeHasher } from 'test/cryptography/fake-hasher';
import { WrongCredentialsError } from '@/core/errors/errors/wrong-credentials-error';
import { AuthenticateUserUseCase } from './authenticate-user';

const TEST_USER = 'tecnico@prefeitura.rio';

let fakeHasher: FakeHasher;
let fakeEncrypter: FakeEncrypter;
let sut: AuthenticateUserUseCase;

describe('AuthenticateUserUseCase', () => {
	beforeEach(() => {
		fakeHasher = new FakeHasher();
		fakeEncrypter = new FakeEncrypter();
		sut = new AuthenticateUserUseCase(fakeHasher, fakeEncrypter);
	});

	it('deve retornar accessToken quando credenciais são válidas', async () => {
		const testUserPasswordHash = await fakeHasher.hash('painel@2024');

		const result = await sut.execute({
			email: TEST_USER,
			password: 'painel@2024',
			testUser: TEST_USER,
			testUserPassword: testUserPasswordHash,
		});

		expect(result.isRight()).toBe(true);
		expect(result.value).toEqual({ accessToken: expect.any(String) });
	});

	it('deve retornar WrongCredentialsError quando o email não confere', async () => {
		const testUserPasswordHash = await fakeHasher.hash('painel@2024');

		const result = await sut.execute({
			email: 'outro@email.com',
			password: 'painel@2024',
			testUser: TEST_USER,
			testUserPassword: testUserPasswordHash,
		});

		expect(result.isLeft()).toBe(true);
		expect(result.value).toBeInstanceOf(WrongCredentialsError);
	});

	it('deve retornar WrongCredentialsError quando a senha não confere', async () => {
		const testUserPasswordHash = await fakeHasher.hash('painel@2024');

		const result = await sut.execute({
			email: TEST_USER,
			password: 'senha-errada',
			testUser: TEST_USER,
			testUserPassword: testUserPasswordHash,
		});

		expect(result.isLeft()).toBe(true);
		expect(result.value).toBeInstanceOf(WrongCredentialsError);
	});
});
