import { Child } from '@/domain/enterprise/entities/child';
import { ChildFilters } from '@/domain/enterprise/types/child-filters';
import { ChildSummary } from '@/domain/enterprise/types/child-summary';

export abstract class ChildRepository {
	abstract findById(id: string): Promise<Child | null>;
	abstract findAll(
		filters: ChildFilters,
		page?: number,
		pageSize?: number,
	): Promise<Child[]>;
	abstract summary(): Promise<ChildSummary>;
	abstract reviewChild(id: string, revisor: string): Promise<Child | null>;
}
