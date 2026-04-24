'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { TypographyH1, TypographyP } from '@/components/ui/typography';

export default function UnauthorizedPage() {
	const router = useRouter();

	return (
		<main className="flex items-center justify-center min-h-screen bg-background">
			<div className="text-center space-y-6 max-w-md">
				<TypographyH1>403 - Acesso Negado</TypographyH1>
				<TypographyP>
					Desculpe, você não tem permissão para acessar este recurso. Volte ao
					login para autenticar ou contate o suporte se achar que isso é um
					erro.
				</TypographyP>
				<div className="flex gap-3 justify-center">
					<Button onClick={() => router.push('/login')} variant="outline">
						Ir para login
					</Button>
				</div>
			</div>
		</main>
	);
}
