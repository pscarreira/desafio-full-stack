import { z } from 'zod';

export const envSchema = z.object({
	PORT: z.coerce.number().optional().default(3001),
	JWT_PRIVATE_KEY: z.base64(),
	JWT_PUBLIC_KEY: z.base64(),
	TEST_USER: z.email(),
	TEST_USER_PASSWORD_HASH: z.string(),
});

export type Env = z.infer<typeof envSchema>;
