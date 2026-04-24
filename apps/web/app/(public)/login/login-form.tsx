'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authService } from '@/lib/api';

const loginSchema = z.object({
	email: z
		.string({ message: 'O e-mail é obrigatório' })
		.min(1, 'O e-mail é obrigatório')
		.regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Digite um e-mail válido'),
	password: z.string().min(1, 'A senha é obrigatória'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
	const router = useRouter();
	const [serverError, setServerError] = useState('');

	const {
		control,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema),
		defaultValues: { email: '', password: '' },
	});

	async function onSubmit(data: LoginFormData) {
		setServerError('');
		try {
			await authService.login(data);
			router.push('/dashboard');
		} catch (err) {
			if (err instanceof Error && err.message === 'Credentials are not valid') {
				setServerError('Seu email ou senha estão incorretos.');
			} else {
				setServerError('Erro ao fazer login. Tente novamente.');
			}
		}
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
			<div className="space-y-2">
				<Label htmlFor="email">Email</Label>
				<Controller
					name="email"
					control={control}
					render={({ field }) => (
						<Input
							id="email"
							type="email"
							placeholder="seu@email.com"
							disabled={isSubmitting}
							{...field}
						/>
					)}
				/>
				{errors.email && (
					<p className="text-sm text-destructive">{errors.email.message}</p>
				)}
			</div>

			<div className="space-y-2">
				<Label htmlFor="password">Senha</Label>
				<Controller
					name="password"
					control={control}
					render={({ field }) => (
						<Input
							id="password"
							type="password"
							placeholder="••••••••"
							disabled={isSubmitting}
							{...field}
						/>
					)}
				/>
				{errors.password && (
					<p className="text-sm text-destructive">{errors.password.message}</p>
				)}
			</div>

			{serverError && <p className="text-sm text-destructive">{serverError}</p>}

			<Button type="submit" disabled={isSubmitting} className="w-full">
				{isSubmitting ? 'Entrando...' : 'Entrar'}
			</Button>
		</form>
	);
}
