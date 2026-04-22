import { compare, hash } from 'bcryptjs';
import { HashComparer } from '@/domain/application/cryptography/hash-comparer';
import { HashGenerator } from '@/domain/application/cryptography/hash-generator';

export class BCryptHasher implements HashGenerator, HashComparer {
	private HASH_SALT_LENGTH = 8;

	compare(plain: string, hash: string): Promise<boolean> {
		return compare(plain, hash);
	}

	hash(plain: string): Promise<string> {
		return hash(plain, this.HASH_SALT_LENGTH);
	}
}
