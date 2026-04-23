import { Controller, Get, HttpCode, Query, UsePipes } from '@nestjs/common';
import { z } from 'zod';
import { ListChildrenUseCase } from '@/domain/application/use-cases/list-children';
import { Public } from '@/infra/auth/public';
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';
import { ChildPresenter } from '../presenters/children-presenter';

const booleanQueryParam = z
	.enum(['true', 'false'])
	.transform((v) => v === 'true')
	.optional();

const listChildrenQuerySchema = z
	.object({
		bairro: z.string().optional(),
		comAlertas: booleanQueryParam,
		revisado: booleanQueryParam,
		page: z.coerce.number().int().positive().default(1),
		perPage: z.coerce.number().int().positive().default(20),
	})
	.strict();

type ListChildrenQuerySchema = z.infer<typeof listChildrenQuerySchema>;

@Controller('/children')
export class ListChildrenController {
	constructor(private listChildrenUseCase: ListChildrenUseCase) {}

	@Get()
	@HttpCode(200)
	async handle(
		@Query(new ZodValidationPipe(listChildrenQuerySchema))
		query: ListChildrenQuerySchema,
	) {
		const { bairro, comAlertas, revisado, page, perPage } = query;

		const result = await this.listChildrenUseCase.execute({
			bairro,
			comAlertas,
			revisado,
			page,
			perPage,
		});

		const { children, meta } = result.value;

		return {
			children: children.map(ChildPresenter.toHttp),
			meta,
		};
	}
}
