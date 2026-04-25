'use client';

import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	NativeSelect,
	NativeSelectOption,
} from '@/components/ui/native-select';
import type { ChildrenFilters } from '@/lib/api';

interface ChildrenFiltersProps {
	filters: ChildrenFilters;
	onFiltersChange: (filters: ChildrenFilters) => void;
}

export function ChildrenFiltersBar({
	filters,
	onFiltersChange,
}: ChildrenFiltersProps) {
	const revisadoValue =
		filters.revisado === undefined ? 'all' : String(filters.revisado);
	const comAlertasValue =
		filters.comAlertas === undefined ? 'all' : String(filters.comAlertas);

	const hasFilters =
		filters.bairro ||
		filters.revisado !== undefined ||
		filters.comAlertas !== undefined;

	return (
		<div className="flex flex-wrap items-end gap-3">
			<div className="flex flex-col gap-1.5 min-w-48">
				<Label htmlFor="bairro-filter">Bairro</Label>
				<div className="relative">
					<Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
					<Input
						id="bairro-filter"
						placeholder="Filtrar por bairro..."
						value={filters.bairro ?? ''}
						onChange={(e) =>
							onFiltersChange({
								...filters,
								bairro: e.target.value || undefined,
								page: 1,
							})
						}
						className="pl-8"
					/>
				</div>
			</div>

			<div className="flex flex-col gap-1.5">
				<Label htmlFor="revisado-filter">Revisado</Label>
				<NativeSelect
					id="revisado-filter"
					value={revisadoValue}
					onChange={(e) => {
						const v = e.target.value;
						const revisado = v === 'all' ? undefined : v === 'true';
						onFiltersChange({ ...filters, revisado, page: 1 });
					}}
					className="w-36"
				>
					<NativeSelectOption value="all">Todos</NativeSelectOption>
					<NativeSelectOption value="true">Sim</NativeSelectOption>
					<NativeSelectOption value="false">Não</NativeSelectOption>
				</NativeSelect>
			</div>

			<div className="flex flex-col gap-1.5">
				<Label htmlFor="alertas-filter">Com Alertas</Label>
				<NativeSelect
					id="alertas-filter"
					value={comAlertasValue}
					onChange={(e) => {
						const v = e.target.value;
						const comAlertas = v === 'all' ? undefined : v === 'true';
						onFiltersChange({ ...filters, comAlertas, page: 1 });
					}}
					className="w-36"
				>
					<NativeSelectOption value="all">Todos</NativeSelectOption>
					<NativeSelectOption value="true">Sim</NativeSelectOption>
					<NativeSelectOption value="false">Não</NativeSelectOption>
				</NativeSelect>
			</div>

			{hasFilters && (
				<Button
					variant="ghost"
					size="sm"
					onClick={() => onFiltersChange({ page: 1, perPage: 10 })}
				>
					Limpar filtros
				</Button>
			)}
		</div>
	);
}
