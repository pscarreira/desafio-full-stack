import { Bar, BarChart as RechartsBarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from './ui/chart';

export interface BarChartItem {
	label: string;
	value: number;
	fill?: string;
}

interface BarChartProps {
	title: string;
	data: BarChartItem[];
	valueLabel?: string;
	isLoading: boolean;
}

export function BarChart({ title, data, valueLabel = 'Valor', isLoading }: BarChartProps) {
	const chartConfig: ChartConfig = {
		value: { label: valueLabel },
		...Object.fromEntries(
			data.map((item) => [item.label, { label: item.label, color: item.fill }]),
		),
	};

	const chartData = data.map((item) => ({
		area: item.label,
		value: item.value,
		fill: item.fill ?? 'var(--chart-1)',
	}));

	return (
		<Card>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<div className="h-48 animate-pulse rounded bg-muted" />
				) : (
					<ChartContainer config={chartConfig} className="h-48 w-full">
						<RechartsBarChart data={chartData} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
							<CartesianGrid vertical={false} />
							<XAxis dataKey="area" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
							<YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
							<ChartTooltip content={<ChartTooltipContent />} />
						<Bar dataKey="value" radius={4} />
						</RechartsBarChart>
					</ChartContainer>
				)}
			</CardContent>
		</Card>
	);
}
