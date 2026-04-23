import { Injectable } from '@nestjs/common';
import { type Either, right } from '@/core/either';
import { ChildSummary } from '@/domain/enterprise/types/child-summary';
import { ChildRepository } from '../repositories/child-repository';

type FetchSummaryUseCaseResponse = Either<
	null,
	{
		summary: ChildSummary;
	}
>;

@Injectable()
export class FetchSummaryUseCase {
	constructor(private readonly childRepository: ChildRepository) {}

	async execute(): Promise<FetchSummaryUseCaseResponse> {
		const summary = await this.childRepository.summary();
		return right({ summary });
	}
}
