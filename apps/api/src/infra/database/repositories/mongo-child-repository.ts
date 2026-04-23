import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter } from 'mongoose';
import { ChildRepository } from '@/domain/application/repositories/child-repository';
import { Child } from '@/domain/enterprise/entities/child';
import { ChildFilters } from '@/domain/enterprise/types/child-filters';
import { ChildSummary } from '@/domain/enterprise/types/child-summary';
import { ChildMapper } from '@/infra/database/mappers/child.mapper';
import {
	ChildDocument,
	ChildModel,
} from '@/infra/database/schemas/child.schema';

export class MongoChildRepository extends ChildRepository {
	constructor(
		@InjectModel(ChildModel.name)
		private readonly childModel: Model<ChildDocument>,
	) {
		super();
	}

	async findById(id: string): Promise<Child | null> {
		const doc = await this.childModel.findById(id).exec();
		return doc ? ChildMapper.toDomain(doc) : null;
	}

	async findAll(
		filters: ChildFilters,
		page = 1,
		pageSize = 20,
	): Promise<Child[]> {
		const query: QueryFilter<ChildDocument> = {};

		if (filters.bairro) {
			query.bairro = { $regex: filters.bairro, $options: 'i' };
		}

		if (filters.revisado !== undefined) {
			query.revisado = filters.revisado;
		}

		if (filters.comAlertas !== undefined) {
			const hasAlertConditions = [
				{ 'saude.alertas.0': { $exists: true } },
				{ 'educacao.alertas.0': { $exists: true } },
				{ 'assistenciaSocial.alertas.0': { $exists: true } },
			];

			if (filters.comAlertas) {
				query.$or = hasAlertConditions;
			} else {
				query.$nor = hasAlertConditions;
			}
		}

		const skip = (page - 1) * pageSize;
		const docs = await this.childModel
			.find(query)
			.skip(skip)
			.limit(pageSize)
			.exec();
		return docs.map(ChildMapper.toDomain);
	}

	async summary(): Promise<ChildSummary> {
		const countWithAlerts = (field: string) => ({
			$sum: {
				$cond: [
					{ $gt: [{ $size: { $ifNull: [`$${field}.alertas`, []] } }, 0] },
					1,
					0,
				],
			},
		});

		const [result] = await this.childModel
			.aggregate([
				{
					$group: {
						_id: null,
						totalChildren: { $sum: 1 },
						reviewed: { $sum: { $cond: ['$revisado', 1, 0] } },
						saude: countWithAlerts('saude'),
						educacao: countWithAlerts('educacao'),
						assistenciaSocial: countWithAlerts('assistenciaSocial'),
					},
				},
			])
			.exec();

		if (!result) {
			return {
				totalChildren: 0,
				reviewed: 0,
				alertsByArea: { saude: 0, educacao: 0, assistenciaSocial: 0 },
				percentageWithAlertsByArea: {
					saude: 0,
					educacao: 0,
					assistenciaSocial: 0,
				},
			};
		}

		const { totalChildren, reviewed, saude, educacao, assistenciaSocial } =
			result;
		const pct = (n: number) =>
			totalChildren > 0 ? Math.round((n / totalChildren) * 100) : 0;

		return {
			totalChildren,
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
		const doc = await this.childModel
			.findByIdAndUpdate(
				id,
				{ revisado: true, revisadoPor: revisor, revisadoEm: new Date() },
				{ new: true },
			)
			.exec();
		return doc ? ChildMapper.toDomain(doc) : null;
	}
}
