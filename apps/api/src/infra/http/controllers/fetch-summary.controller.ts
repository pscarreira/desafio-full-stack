import { Controller, Get, HttpCode, NotFoundException } from '@nestjs/common';
import { FetchSummaryUseCase } from '@/domain/application/use-cases/fetch-summary';

@Controller('/summary')
export class FetchSummaryController {
	constructor(private fetchSummaryUseCase: FetchSummaryUseCase) {}

	@Get()
	@HttpCode(200)
	async handle() {
		const result = await this.fetchSummaryUseCase.execute();

		if (result.isLeft()) {
			throw new NotFoundException('Child not found');
		}

		const { summary } = result.value;

		return {
			summary,
		};
	}
}
