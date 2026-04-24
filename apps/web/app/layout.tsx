import type { Metadata } from 'next';
import { Roboto } from 'next/font/google';
import { ThemeProvider } from './components/theme-provider';
import { ThemeToggle } from './components/theme-toggle';
import './index.css';

const roboto = Roboto({
	subsets: ['latin'],
	weight: ['400', '500', '700'],
	variable: '--font-roboto',
});

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
		<html lang="pt-BR" className={roboto.variable} suppressHydrationWarning>
			<body>
				<ThemeProvider
					attribute="class"
					defaultTheme="light"
					enableSystem={false}
					disableTransitionOnChange
				>
					<div className="fixed top-4 right-4 z-50">
						<ThemeToggle />
					</div>
					{children}
				</ThemeProvider>
			</body>
		</html>
	);
}
