import { z } from 'zod';

export const envSchema = z.object({
	PORT: z.coerce.number().optional().default(3001),
	JWT_PRIVATE_KEY: z.base64(),
	JWT_PUBLIC_KEY: z.base64(),
});

export type Env = z.infer<typeof envSchema>;
