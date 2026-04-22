import { HashComparer } from '@/domain/application/cryptography/hash-comparer';

export class FakeHasher extends HashComparer {
	async compare(plain: string, hashed: string): Promise<boolean> {
		return plain.concat('-hashed') === hashed;
	}

	async hash(plain: string): Promise<string> {
		return plain.concat('-hashed');
	}
}
