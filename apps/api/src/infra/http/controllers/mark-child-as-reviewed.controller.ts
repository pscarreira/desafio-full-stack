import {
	Controller,
	HttpCode,
	NotFoundException,
	Param,
	Patch,
} from '@nestjs/common';
import { z } from 'zod';
import { MarkChildAsReviewedUseCase } from '@/domain/application/use-cases/mark-child-as-reviewed';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';
import { ChildPresenter } from '../presenters/children-presenter';

// Parameter schema (/:id)
const markChildAsReviewedParamSchema = z.string().regex(/^[a-f\d]{24}$/i);

type MarkChildAsReviewedParamSchema = z.infer<
	typeof markChildAsReviewedParamSchema
>;

@Controller('/children/:id/review')
export class MarkChildAsReviewedController {
	constructor(private markChildAsReviewedUseCase: MarkChildAsReviewedUseCase) {}

	@Patch()
	@HttpCode(200)
	async handle(
		@Param('id', new ZodValidationPipe(markChildAsReviewedParamSchema))
		id: MarkChildAsReviewedParamSchema,
		@CurrentUser() user: UserPayload,
	) {
		const result = await this.markChildAsReviewedUseCase.execute({
			id,
			revisor: user.preferred_username,
		});

		if (result.isLeft()) {
			throw new NotFoundException('Child not found');
		}

		const { child } = result.value;

		return {
			child: ChildPresenter.toHttp(child),
		};
	}
}
