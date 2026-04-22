import { Module } from '@nestjs/common';
import { Encrypter } from '@/domain/application/cryptography/encrypter';
import { HashComparer } from '@/domain/application/cryptography/hash-comparer';
import { HashGenerator } from '@/domain/application/cryptography/hash-generator';
import { BCryptHasher } from './bcrypt-hasher';
import { JwtEncrypter } from './jwt-encrypter';

@Module({
	imports: [],
	controllers: [],
	providers: [
		{
			provide: Encrypter,
			useClass: JwtEncrypter,
		},
		{
			provide: HashGenerator,
			useClass: BCryptHasher,
		},
		{
			provide: HashComparer,
			useClass: BCryptHasher,
		},
	],
	exports: [Encrypter, HashGenerator, HashComparer],
})
export class CryptographyModule {}
