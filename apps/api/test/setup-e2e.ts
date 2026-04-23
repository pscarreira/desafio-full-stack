import { config } from 'dotenv';
import { generateKeyPairSync } from 'crypto';
import { hashSync } from 'bcryptjs';
import { MongoMemoryServer } from 'mongodb-memory-server';

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

// Carrega .env.test com override para garantir que sobrescreve variáveis do .env
config({ path: '.env.test', override: true });

// Setup das credenciais 
setupTestCredentials();

// Sobe o banco em memória
let mongod: MongoMemoryServer;

beforeAll(async () => {
	mongod = await MongoMemoryServer.create();
	process.env.MONGO_URI = mongod.getUri();
});

afterAll(async () => {
	await mongod.stop();
});