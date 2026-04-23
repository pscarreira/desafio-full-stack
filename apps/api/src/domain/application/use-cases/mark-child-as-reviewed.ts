import { Injectable } from '@nestjs/common';
import { type Either, left, right } from '@/core/either';
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error';
import { Child } from '@/domain/enterprise/entities/child';
import { ChildRepository } from '../repositories/child-repository';

interface MarkChildAsReviewedUseCaseRequest {
	id: string;
	revisor: string;
}

type MarkChildAsReviewedUseCaseResponse = Either<
	ResourceNotFoundError,
	{
		child: Child;
	}
>;

@Injectable()
export class MarkChildAsReviewedUseCase {
	constructor(private readonly childRepository: ChildRepository) {}

	async execute({
		id,
		revisor,
	}: MarkChildAsReviewedUseCaseRequest): Promise<MarkChildAsReviewedUseCaseResponse> {
		const childToBeReviewed = await this.childRepository.findById(id);

		if (!childToBeReviewed) {
			return left(new ResourceNotFoundError());
		}

		if (childToBeReviewed.revisado) {
			return right({ child: childToBeReviewed });
		}

		const child = await this.childRepository.reviewChild(id, revisor);

		return right({ child });
	}
}
