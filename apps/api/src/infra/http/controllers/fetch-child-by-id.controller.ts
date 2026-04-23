import {
	Controller,
	Get,
	HttpCode,
	NotFoundException,
	Param,
} from '@nestjs/common';
import { z } from 'zod';
import { FetchChildByIdUseCase } from '@/domain/application/use-cases/fetch-child-by-id';
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';
import { ChildPresenter } from '../presenters/children-presenter';

const fetchChildByIdSchema = z.string().regex(/^[a-f\d]{24}$/i);

type FetchChildByIdSchema = z.infer<typeof fetchChildByIdSchema>;

@Controller('/children/:id')
export class FetchChildByIdController {
	constructor(private fetchChildByIdUseCase: FetchChildByIdUseCase) {}

	@Get()
	@HttpCode(200)
	async handle(
		@Param('id', new ZodValidationPipe(fetchChildByIdSchema))
		id: FetchChildByIdSchema,
	) {
		const result = await this.fetchChildByIdUseCase.execute({ id });

		if (result.isLeft()) {
			throw new NotFoundException('Child not found');
		}

		const { child } = result.value;

		return {
			child: ChildPresenter.toHttp(child),
		};
	}
}
