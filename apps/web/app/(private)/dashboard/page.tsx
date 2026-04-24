'use client';
import { useQuery } from '@tanstack/react-query';
import {
	CheckCircle,
	GraduationCap,
	HandHeart,
	Heart,
	Users,
} from 'lucide-react';
import { BarChart } from '@/components/bar-chart';
import { PieChart } from '@/components/pie-chart';
import { SummaryCard } from '@/components/summary-card';
import { TypographyH2 } from '@/components/ui/typography';
import { summaryService } from '@/lib/api';

export default function DashboardPage() {
	const { data, isLoading, isError } = useQuery({
		queryKey: ['summary'],
		queryFn: summaryService.getSummary,
		retry: 1,
	});

	return (
		<div className="p-6 space-y-6">
			<TypographyH2>Informações Gerais</TypographyH2>

			{isError && (
				<p className="text-destructive text-sm">
					Erro ao carregar os dados. Tente novamente.
				</p>
			)}

			<div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
				<BarChart
					title="Alertas por Área"
					valueLabel="Alertas"
					data={[
						{
							label: 'Saúde',
							value: data?.alertsByArea.saude ?? 0,
							fill: 'var(--chart-1)',
						},
						{
							label: 'Educação',
							value: data?.alertsByArea.educacao ?? 0,
							fill: 'var(--chart-2)',
						},
						{
							label: 'Assist. Social',
							value: data?.alertsByArea.assistenciaSocial ?? 0,
							fill: 'var(--chart-3)',
						},
					]}
					isLoading={isLoading}
				/>
				<PieChart
					title="Revisadas vs Pendentes"
					valueLabel="Crianças"
					data={[
						{
							name: 'Revisadas',
							value: data?.reviewed ?? 0,
							fill: 'var(--chart-2)',
						},
						{
							name: 'Pendentes',
							value: (data?.totalChildren ?? 0) - (data?.reviewed ?? 0),
							fill: 'var(--chart-5)',
						},
					]}
					isLoading={isLoading}
				/>
			</div>

			<div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
				<SummaryCard
					title="Total de Crianças"
					icon={<Users className="size-5 text-muted-foreground" />}
					value={data?.totalChildren}
					description="crianças cadastradas"
					isLoading={isLoading}
				/>
				<SummaryCard
					title="Revisadas"
					icon={<CheckCircle className="size-5 text-muted-foreground" />}
					value={data?.reviewed}
					description={
						data
							? `${Math.round((data.reviewed / (data.totalChildren || 1)) * 100)}% do total`
							: undefined
					}
					isLoading={isLoading}
				/>
				<SummaryCard
					title="Alertas de Saúde"
					icon={<Heart className="size-5 text-muted-foreground" />}
					value={data?.alertsByArea.saude}
					description={
						data
							? `${data.percentageWithAlertsByArea.saude}% das crianças`
							: undefined
					}
					isLoading={isLoading}
				/>
				<SummaryCard
					title="Alertas de Educação"
					icon={<GraduationCap className="size-5 text-muted-foreground" />}
					value={data?.alertsByArea.educacao}
					description={
						data
							? `${data.percentageWithAlertsByArea.educacao}% das crianças`
							: undefined
					}
					isLoading={isLoading}
				/>
				<SummaryCard
					title="Alertas de Assistência Social"
					icon={<HandHeart className="size-5 text-muted-foreground" />}
					value={data?.alertsByArea.assistenciaSocial}
					description={
						data
							? `${data.percentageWithAlertsByArea.assistenciaSocial}% das crianças`
							: undefined
					}
					isLoading={isLoading}
				/>
			</div>
		</div>
	);
}
