'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
	Table,
	TableBody,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { TypographyH2 } from '@/components/ui/typography';
import { type ChildrenFilters, childrenService } from '@/lib/api';
import { ChildRow } from './_components/child-row';
import { ChildrenFiltersBar } from './_components/children-filters';

export default function ChildrenListPage() {
	// Estado visual dos filtros (atualizado imediatamente pelo usuário)
	const [filters, setFilters] = useState<ChildrenFilters>({
		page: 1,
		perPage: 10,
	});
	// Estado debounced enviado à query (bairro aguarda 400ms, restante imediato)
	const [debouncedFilters, setDebouncedFilters] =
		useState<ChildrenFilters>(filters);

	// Debounce apenas para o campo de texto (bairro)
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedFilters((prev) => ({ ...prev, bairro: filters.bairro }));
		}, 400);
		return () => clearTimeout(timer);
	}, [filters.bairro]);

	// Atualização imediata para selects e paginação
	useEffect(() => {
		setDebouncedFilters((prev) => ({
			...prev,
			page: filters.page,
			perPage: filters.perPage,
			revisado: filters.revisado,
			comAlertas: filters.comAlertas,
		}));
	}, [filters.page, filters.perPage, filters.revisado, filters.comAlertas]);

	const { data, isLoading, isError, isFetching } = useQuery({
		queryKey: ['children', debouncedFilters],
		queryFn: () => childrenService.getChildren(debouncedFilters),
		placeholderData: keepPreviousData,
		retry: 1,
	});

	const currentPage = filters.page ?? 1;
	const totalPages = data?.meta.totalPages ?? 1;

	function goToPage(page: number) {
		setFilters((prev) => ({ ...prev, page }));
	}

	return (
		<div className="p-6 space-y-6">
			<TypographyH2>Listagem de Crianças</TypographyH2>

			<ChildrenFiltersBar filters={filters} onFiltersChange={setFilters} />

			{isError && (
				<p className="text-destructive text-sm">
					Erro ao carregar os dados. Tente novamente.
				</p>
			)}

			<Card
				className={
					isFetching && !isLoading ? 'opacity-70 transition-opacity' : undefined
				}
			>
				<CardContent className="p-0">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Nome</TableHead>
								<TableHead>Bairro</TableHead>
								<TableHead>Nascimento</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Alertas</TableHead>
								<TableHead className="w-12" />
							</TableRow>
						</TableHeader>
						<TableBody>
							{isLoading &&
								['sk-1', 'sk-2', 'sk-3', 'sk-4', 'sk-5'].map((key) => (
									<TableRow key={key}>
										{['a', 'b', 'c', 'd', 'e', 'f'].map((col) => (
											<td key={col} className="p-4">
												<div className="h-4 animate-pulse rounded bg-muted" />
											</td>
										))}
									</TableRow>
								))}

							{!isLoading &&
								data?.children.map((child) => (
									<ChildRow key={child.id} child={child} />
								))}

							{!isLoading && !isError && data?.children.length === 0 && (
								<TableRow>
									<td
										colSpan={6}
										className="p-8 text-center text-muted-foreground"
									>
										Nenhuma criança encontrada com os filtros aplicados.
									</td>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</CardContent>
			</Card>

			{data?.meta && (
				<div className="flex items-center justify-between">
					<p className="text-sm text-muted-foreground">
						{data.meta.totalItems} registro
						{data.meta.totalItems !== 1 ? 's' : ''} encontrado
						{data.meta.totalItems !== 1 ? 's' : ''}
					</p>

					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="icon-sm"
							onClick={() => goToPage(currentPage - 1)}
							disabled={currentPage <= 1}
							aria-label="Página anterior"
						>
							<ChevronLeft />
						</Button>

						<span className="text-sm text-muted-foreground">
							Página {currentPage} de {totalPages}
						</span>

						<Button
							variant="outline"
							size="icon-sm"
							onClick={() => goToPage(currentPage + 1)}
							disabled={currentPage >= totalPages}
							aria-label="Próxima página"
						>
							<ChevronRight />
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}
