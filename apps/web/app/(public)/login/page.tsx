import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { LoginForm } from './login-form';

export default function LoginPage() {
	return (
		<main className="flex items-center justify-center min-h-screen bg-background p-5">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<CardTitle className="text-2xl">Login</CardTitle>
					<CardDescription>
						Entre com suas credenciais para continuar
					</CardDescription>
				</CardHeader>
				<CardContent>
					<LoginForm />
				</CardContent>
			</Card>
		</main>
	);
}
