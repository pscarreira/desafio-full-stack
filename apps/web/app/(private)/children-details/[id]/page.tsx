'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TypographyH2 } from '@/components/ui/typography';
import { childrenService } from '@/lib/api';

function formatDate(dataEmFormatoIso: string | null): string {
	if (!dataEmFormatoIso) return '—';
	return new Date(dataEmFormatoIso).toLocaleDateString('pt-BR');
}

const ALERTA_LABELS: Record<string, string> = {
	vacinas_atrasadas: 'Vacinas atrasadas',
	consulta_atrasada: 'Consulta atrasada',
	frequencia_baixa: 'Frequência escolar baixa',
	matricula_pendente: 'Matrícula pendente',
	beneficio_suspenso: 'Benefício suspenso',
	cadastro_ausente: 'Cadastro CadÚnico ausente',
	cadastro_desatualizado: 'Cadastro CadÚnico desatualizado',
};

function formatAlerta(alerta: string): string {
	return ALERTA_LABELS[alerta] ?? alerta;
}

interface PageProps {
	params: { id: string };
}

export default function ChildrenDetailsPage({ params }: PageProps) {
	const { id } = params;
	const queryClient = useQueryClient();

	const {
		data: child,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ['child', id],
		queryFn: () => childrenService.getChildById(id),
		retry: 1,
	});

	const { mutate: markAsReviewed, isPending: isReviewing } = useMutation({
		mutationFn: () => childrenService.reviewChild(id),
		onSuccess: (updated) => {
			queryClient.setQueryData(['child', id], updated);
			queryClient.invalidateQueries({ queryKey: ['children'] });
		},
	});

	return (
		<div className="p-6 space-y-6">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Button variant="ghost" size="icon-lg" aria-label="Voltar">
						<Link href="/children-list">
							<ChevronLeft className="size-4" />
						</Link>
					</Button>
					<TypographyH2>Detalhes da Criança</TypographyH2>
				</div>
				{child && !child.revisado && (
					<Button onClick={() => markAsReviewed()} disabled={isReviewing}>
						{isReviewing ? 'Salvando...' : 'Marcar como revisado'}
					</Button>
				)}
				{child?.revisado && (
					<Button variant="secondary" disabled>
						Revisado
					</Button>
				)}
			</div>

			{isLoading && (
				<p className="text-muted-foreground text-sm">Carregando...</p>
			)}

			{isError && (
				<p className="text-destructive text-sm">Erro ao carregar os dados.</p>
			)}

			{child && (
				<div className="grid gap-6 md:grid-cols-2">
					<Card>
						<CardHeader>
							<CardTitle>Dados Pessoais</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2 text-sm">
							<div className="flex justify-between">
								<span className="text-muted-foreground">Nome</span>
								<span className="font-medium">{child.nome}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">Nascimento</span>
								<span>{formatDate(child.dataNascimento)}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">Bairro</span>
								<span>{child.bairro}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">Responsável</span>
								<span>{child.responsavel}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">Status</span>
								{child.revisado ? (
									<Badge variant="default">Revisado</Badge>
								) : (
									<Badge variant="outline">Pendente</Badge>
								)}
							</div>
							{child.revisadoPor && (
								<div className="flex justify-between">
									<span className="text-muted-foreground">Revisado por</span>
									<span>{child.revisadoPor}</span>
								</div>
							)}
							{child.revisadoEm && (
								<div className="flex justify-between">
									<span className="text-muted-foreground">Revisado em</span>
									<span>{formatDate(child.revisadoEm)}</span>
								</div>
							)}
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Saúde</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2 text-sm">
							{child.saude ? (
								<>
									<div className="flex justify-between">
										<span className="text-muted-foreground">
											Última consulta
										</span>
										<span>{formatDate(child.saude.ultimaConsulta)}</span>
									</div>
									<div className="flex justify-between">
										<span className="text-muted-foreground">
											Vacinas em dia
										</span>
										<span>{child.saude.vacinasEmDia ? 'Sim' : 'Não'}</span>
									</div>
									{child.saude.alertas.length > 0 && (
										<div className="space-y-1">
											<span className="text-muted-foreground">Alertas</span>
											<ul className="list-disc list-inside">
												{child.saude.alertas.map((alerta) => (
													<li key={alerta} className="text-destructive">
														{formatAlerta(alerta)}
													</li>
												))}
											</ul>
										</div>
									)}
								</>
							) : (
								<p className="text-muted-foreground">Sem dados de saúde.</p>
							)}
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Educação</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2 text-sm">
							{child.educacao ? (
								<>
									<div className="flex justify-between">
										<span className="text-muted-foreground">Escola</span>
										<span>{child.educacao.escola ?? '—'}</span>
									</div>
									<div className="flex justify-between">
										<span className="text-muted-foreground">Frequência</span>
										<span>
											{child.educacao.frequenciaPercent != null
												? `${child.educacao.frequenciaPercent}%`
												: '—'}
										</span>
									</div>
									{child.educacao.alertas.length > 0 && (
										<div className="space-y-1">
											<span className="text-muted-foreground">Alertas</span>
											<ul className="list-disc list-inside">
												{child.educacao.alertas.map((alerta) => (
													<li key={alerta} className="text-destructive">
														{formatAlerta(alerta)}
													</li>
												))}
											</ul>
										</div>
									)}
								</>
							) : (
								<p className="text-muted-foreground">Sem dados de educação.</p>
							)}
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Assistência Social</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2 text-sm">
							{child.assistenciaSocial ? (
								<>
									<div className="flex justify-between">
										<span className="text-muted-foreground">CadÚnico</span>
										<span>
											{child.assistenciaSocial.cadUnico ? 'Sim' : 'Não'}
										</span>
									</div>
									<div className="flex justify-between">
										<span className="text-muted-foreground">
											Benefício ativo
										</span>
										<span>
											{child.assistenciaSocial.beneficioAtivo ? 'Sim' : 'Não'}
										</span>
									</div>
									{child.assistenciaSocial.alertas.length > 0 && (
										<div className="space-y-1">
											<span className="text-muted-foreground">Alertas</span>
											<ul className="list-disc list-inside">
												{child.assistenciaSocial.alertas.map((alerta) => (
													<li key={alerta} className="text-destructive">
														{formatAlerta(alerta)}
													</li>
												))}
											</ul>
										</div>
									)}
								</>
							) : (
								<p className="text-muted-foreground">
									Sem dados de assistência social.
								</p>
							)}
						</CardContent>
					</Card>
				</div>
			)}
		</div>
	);
}
