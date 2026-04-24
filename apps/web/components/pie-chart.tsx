import { Pie, PieChart as RechartsPieChart } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from './ui/chart';

export interface PieChartItem {
	name: string;
	value: number;
	fill?: string;
}

interface PieChartProps {
	title: string;
	data: PieChartItem[];
	valueLabel?: string;
	isLoading: boolean;
}

export function PieChart({ title, data, valueLabel = 'Valor', isLoading }: PieChartProps) {
	const chartConfig: ChartConfig = {
		value: { label: valueLabel },
		...Object.fromEntries(
			data.map((item) => [item.name, { label: item.name, color: item.fill }]),
		),
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
			</CardHeader>
			<CardContent className="flex items-center justify-center">
				{isLoading ? (
					<div className="h-48 w-48 animate-pulse rounded-full bg-muted" />
				) : (
					<ChartContainer config={chartConfig} className="h-48 w-full">
						<RechartsPieChart>
							<ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
							<Pie
								data={data}
								dataKey="value"
								nameKey="name"
								cx="50%"
								cy="50%"
								innerRadius={50}
								outerRadius={80}
								label={({ name, value }) => `${name}: ${value}`}
								labelLine={false}
							/>
						</RechartsPieChart>
					</ChartContainer>
				)}
			</CardContent>
		</Card>
	);
}
