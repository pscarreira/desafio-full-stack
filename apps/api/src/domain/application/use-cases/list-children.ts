import { Injectable } from '@nestjs/common';
import { type Either, right } from '@/core/either';
import { Child } from '@/domain/enterprise/entities/child';
import { ChildRepository } from '../repositories/child-repository';

interface ListChildrenUseCaseRequest {
	bairro?: string;
	comAlertas?: boolean;
	revisado?: boolean;
	page?: number;
	perPage?: number;
}

type ListChildrenUseCaseResponse = Either<
	null,
	{
		children: Child[];
		meta: {
			totalItems: number;
			itemCount: number;
			itemsPerPage: number;
			totalPages: number;
			currentPage: number;
		};
	}
>;

@Injectable()
export class ListChildrenUseCase {
	constructor(private readonly childRepository: ChildRepository) {}

	async execute({
		bairro,
		comAlertas,
		revisado,
		page = 1,
		perPage = 20,
	}: ListChildrenUseCaseRequest): Promise<ListChildrenUseCaseResponse> {
		const { children, total } = await this.childRepository.findAll(
			{ bairro, comAlertas, revisado },
			page,
			perPage,
		);

		return right({
			children,
			meta: {
				totalItems: total,
				itemCount: children.length,
				itemsPerPage: perPage,
				totalPages: Math.ceil(total / perPage),
				currentPage: page,
			},
		});
	}
}
