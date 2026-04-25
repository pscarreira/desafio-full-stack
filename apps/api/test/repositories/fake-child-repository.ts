import { ChildRepository } from '@/domain/application/repositories/child-repository';
import { Child } from '@/domain/enterprise/entities/child';
import { ChildFilters } from '@/domain/enterprise/types/child-filters';
import { ChildSummary } from '@/domain/enterprise/types/child-summary';

export class FakeChildRepository extends ChildRepository {
	public items: Child[] = [];

	async findById(id: string): Promise<Child | null> {
		return this.items.find((c) => c.id.toString() === id) ?? null;
	}

	async findAll(
		filters: ChildFilters,
		page = 1,
		pageSize = 20,
	): Promise<{ children: Child[]; total: number }> {
		let result = this.items;

		if (filters.bairro) {
			const bairroLower = filters.bairro.toLowerCase();
			result = result.filter((c) =>
				c.bairro.toLowerCase().includes(bairroLower),
			);
		}

		if (filters.revisado !== undefined) {
			result = result.filter((c) => c.revisado === filters.revisado);
		}

		if (filters.comAlertas !== undefined) {
			result = result.filter((c) => {
				const hasAlerts =
					(c.saude?.alertas.length ?? 0) > 0 ||
					(c.educacao?.alertas.length ?? 0) > 0 ||
					(c.assistenciaSocial?.alertas.length ?? 0) > 0;
				return filters.comAlertas ? hasAlerts : !hasAlerts;
			});
		}

		const total = result.length;
		const skip = (page - 1) * pageSize;
		return { children: result.slice(skip, skip + pageSize), total };
	}

	async summary(): Promise<ChildSummary> {
		const total = this.items.length;
		const reviewed = this.items.filter((c) => c.revisado).length;
		const saude = this.items.filter(
			(c) => (c.saude?.alertas.length ?? 0) > 0,
		).length;
		const educacao = this.items.filter(
			(c) => (c.educacao?.alertas.length ?? 0) > 0,
		).length;
		const assistenciaSocial = this.items.filter(
			(c) => (c.assistenciaSocial?.alertas.length ?? 0) > 0,
		).length;
		const pct = (n: number) =>
			total > 0 ? Math.round((n / total) * 100) : 0;

		return {
			totalChildren: total,
			reviewed,
			alertsByArea: { saude, educacao, assistenciaSocial },
			percentageWithAlertsByArea: {
				saude: pct(saude),
				educacao: pct(educacao),
				assistenciaSocial: pct(assistenciaSocial),
			},
		};
	}

	async reviewChild(id: string, revisor: string): Promise<Child | null> {
		const index = this.items.findIndex((c) => c.id.toString() === id);
		if (index === -1) return null;

		const child = this.items[index];
		child.revisado = true;
		child.revisadoPor = revisor;
		child.revisadoEm = new Date();

		this.items[index] = child;
		return child;
	}
}
