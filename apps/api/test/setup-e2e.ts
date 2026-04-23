import { config } from 'dotenv';
import { generateKeyPairSync, randomBytes } from 'crypto';
import { hashSync } from 'bcryptjs';
import { MongoClient } from 'mongodb';

// Carrega .env.test com override para garantir que sobrescreve variáveis do .env
config({ path: '.env.test', override: true });

// Cria chaves RSA e credenciais para testes
function setupTestCredentials() {
	// Remove variáveis JWT existentes para evitar valores inválidos
	delete process.env.JWT_PRIVATE_KEY;
	delete process.env.JWT_PUBLIC_KEY;

	// Gera chaves RSA novas a cada teste
	const { privateKey, publicKey } = generateKeyPairSync('rsa', {
		modulusLength: 2048,
	});

	const privateKeyPem = privateKey.export({
		type: 'pkcs1',
		format: 'pem',
	}) as string;

	const publicKeyPem = publicKey.export({
		type: 'spki',
		format: 'pem',
	}) as string;

	// Converte para base64
	process.env.JWT_PRIVATE_KEY = Buffer.from(privateKeyPem).toString('base64');
	process.env.JWT_PUBLIC_KEY = Buffer.from(publicKeyPem).toString('base64');

	// Define usuário de teste
	process.env.TEST_USER = 'test@example.com';

	// Gera hash da senha de teste
	const testPassword = 'password123';
	process.env.TEST_USER_PASSWORD_HASH = hashSync(testPassword, 10);
}

function setupDatabase() {
	const host = process.env.MONGO_HOST ?? 'localhost';
	const port = process.env.MONGO_PORT ?? '27017';
	const dbName = `test_${randomBytes(6).toString('hex')}`;
	process.env.MONGO_URI = `mongodb://${host}:${port}/${dbName}`;
}

async function dropDatabase() {
	const client = new MongoClient(process.env.MONGO_URI!);
	await client.connect();
	await client.db().dropDatabase();
	await client.close();
}

// Setup das credenciais e banco
setupTestCredentials();
setupDatabase();

afterAll(async () => {
	await dropDatabase();
});