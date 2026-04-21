import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Desafio Full Stack',
	description: 'Monorepo com NestJS e Next.js',
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="pt-BR">
			<body>{children}</body>
		</html>
	);
}
