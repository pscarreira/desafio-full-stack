import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LoginForm } from './login-form';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
	useRouter: () => ({ push: mockPush }),
}));

vi.mock('@/lib/api', () => ({
	authService: {
		login: vi.fn(),
	},
}));

import { authService } from '@/lib/api';

describe('LoginForm', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('deve renderizar os campos de email e senha', () => {
		render(<LoginForm />);

		expect(screen.getByLabelText('Email')).toBeInTheDocument();
		expect(screen.getByLabelText('Senha')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
	});

	it('deve exibir erro quando email está vazio', async () => {
		render(<LoginForm />);

		fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

		await waitFor(() => {
			expect(screen.getByText('O e-mail é obrigatório')).toBeInTheDocument();
		});
	});

	it('deve exibir erro quando email é inválido', async () => {
		const user = userEvent.setup();
		render(<LoginForm />);

		await user.type(screen.getByLabelText('Email'), 'email-invalido');
		fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

		await waitFor(() => {
			expect(screen.getByText('Digite um e-mail válido')).toBeInTheDocument();
		});
	});

	it('deve aceitar e-mail com TLD não convencional como .rio', async () => {
		const user = userEvent.setup();
		vi.mocked(authService.login).mockResolvedValue({ access_token: 'token' });
		render(<LoginForm />);

		await user.type(screen.getByLabelText('Email'), 'tecnico@prefeitura.rio');
		await user.type(screen.getByLabelText('Senha'), 'senha123');
		fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

		await waitFor(() => {
			expect(
				screen.queryByText('Digite um e-mail válido'),
			).not.toBeInTheDocument();
		});
	});

	it('deve exibir erro quando senha está vazia', async () => {
		const user = userEvent.setup();
		render(<LoginForm />);

		await user.type(screen.getByLabelText('Email'), 'user@example.com');
		fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

		await waitFor(() => {
			expect(screen.getByText('A senha é obrigatória')).toBeInTheDocument();
		});
	});

	it('deve redirecionar para /dashboard após login bem-sucedido', async () => {
		const user = userEvent.setup();
		vi.mocked(authService.login).mockResolvedValue({ access_token: 'token' });
		render(<LoginForm />);

		await user.type(screen.getByLabelText('Email'), 'user@example.com');
		await user.type(screen.getByLabelText('Senha'), 'senha123');
		fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

		await waitFor(() => {
			expect(mockPush).toHaveBeenCalledWith('/dashboard');
		});
	});

	it('deve exibir mensagem de credenciais inválidas quando a API retornar erro', async () => {
		const user = userEvent.setup();
		vi.mocked(authService.login).mockRejectedValue(
			new Error('Credentials are not valid'),
		);
		render(<LoginForm />);

		await user.type(screen.getByLabelText('Email'), 'user@example.com');
		await user.type(screen.getByLabelText('Senha'), 'senha-errada');
		fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

		await waitFor(() => {
			expect(
				screen.getByText('Seu email ou senha estão incorretos.'),
			).toBeInTheDocument();
		});
	});

	it('deve exibir mensagem genérica para erros desconhecidos da API', async () => {
		const user = userEvent.setup();
		vi.mocked(authService.login).mockRejectedValue(new Error('Network Error'));
		render(<LoginForm />);

		await user.type(screen.getByLabelText('Email'), 'user@example.com');
		await user.type(screen.getByLabelText('Senha'), 'senha123');
		fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

		await waitFor(() => {
			expect(
				screen.getByText('Erro ao fazer login. Tente novamente.'),
			).toBeInTheDocument();
		});
	});

	it('deve desabilitar o botão enquanto o submit está em andamento', async () => {
		const user = userEvent.setup();
		vi.mocked(authService.login).mockImplementation(
			() =>
				new Promise((resolve) =>
					setTimeout(() => resolve({ access_token: 'token' }), 100),
				),
		);
		render(<LoginForm />);

		await user.type(screen.getByLabelText('Email'), 'user@example.com');
		await user.type(screen.getByLabelText('Senha'), 'senha123');
		fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

		expect(screen.getByRole('button', { name: /entrando/i })).toBeDisabled();

		await waitFor(() => {
			expect(mockPush).toHaveBeenCalledWith('/dashboard');
		});
	});
});
