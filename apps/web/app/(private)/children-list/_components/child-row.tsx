import { Eye } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import type { Child } from '@/lib/api';

function totalAlerts(child: Child): number {
	return (
		(child.saude?.alertas.length ?? 0) +
		(child.educacao?.alertas.length ?? 0) +
		(child.assistenciaSocial?.alertas.length ?? 0)
	);
}

function formatDate(iso: string): string {
	return new Date(iso).toLocaleDateString('pt-BR');
}

interface ChildRowProps {
	child: Child;
}

export function ChildRow({ child }: ChildRowProps) {
	const alerts = totalAlerts(child);

	return (
		<TableRow>
			<TableCell className="font-medium">{child.nome}</TableCell>
			<TableCell>{child.bairro}</TableCell>
			<TableCell>{formatDate(child.dataNascimento)}</TableCell>
			<TableCell>
				{child.revisado ? (
					<Badge variant="default">Revisado</Badge>
				) : (
					<Badge variant="outline">Pendente</Badge>
				)}
			</TableCell>
			<TableCell>
				{alerts > 0 ? (
					<Badge variant="destructive">
						{alerts} alerta{alerts > 1 ? 's' : ''}
					</Badge>
				) : (
					<span className="text-muted-foreground text-xs">Nenhum</span>
				)}
			</TableCell>
			<TableCell>
				<Button variant="ghost" size="icon-sm">
					<Link
						href={`/children-details/${child.id}`}
						aria-label={`Ver detalhes de ${child.nome}`}
					>
						<Eye />
					</Link>
				</Button>
			</TableCell>
		</TableRow>
	);
}
