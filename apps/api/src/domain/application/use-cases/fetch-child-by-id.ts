import { Injectable } from '@nestjs/common';
import { type Either, left, right } from '@/core/either';
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error';
import { Child } from '@/domain/enterprise/entities/child';
import { ChildRepository } from '../repositories/child-repository';

interface FetchChildByIdUseCaseRequest {
	id: string;
}

type FetchChildByIdUseCaseResponse = Either<
	ResourceNotFoundError,
	{
		child: Child;
	}
>;

@Injectable()
export class FetchChildByIdUseCase {
	constructor(private readonly childRepository: ChildRepository) {}

	async execute({
		id,
	}: FetchChildByIdUseCaseRequest): Promise<FetchChildByIdUseCaseResponse> {
		const child = await this.childRepository.findById(id);

		if (!child) {
			return left(new ResourceNotFoundError());
		}

		return right({ child });
	}
}
